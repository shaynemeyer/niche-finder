import { expect, test, type Page } from '@playwright/test';
import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '../lib/generated/prisma/client';

// Seeded by e2e/global-setup.ts from .env.test.
const adminEmail = process.env.ADMIN_EMAIL!;
const userEmail = process.env.DEFAULT_USER_EMAIL!;
const userPassword = process.env.DEFAULT_USER_PASSWORD!;

/**
 * @prisma/adapter-pg ignores ?schema= in the connection string — node-postgres
 * does not read it — so the schema must be passed as the adapter's second
 * argument or fixtures land in `public` instead of the test schema.
 */
function testClient() {
  const connectionString = process.env.DATABASE_URL;
  const schema = connectionString
    ? (new URL(connectionString).searchParams.get('schema') ?? undefined)
    : undefined;

  return new PrismaClient({
    adapter: new PrismaPg({ connectionString }, { schema }),
  });
}

/**
 * Signs in and waits for the credentials POST to complete. Without that wait,
 * a following navigation aborts the request in flight and no session cookie
 * is ever set.
 */
async function signIn(page: Page, email: string, password: string) {
  await page.goto('/signin');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);

  const callback = page.waitForResponse((response) =>
    response.url().includes('/api/auth/callback/credentials'),
  );
  await page.getByRole('button', { name: 'Login' }).click();
  await callback;
}

test.describe('report detail access', () => {
  const prisma = testClient();
  let adminReportId: string;
  let ownReportId: string;

  async function seedReport(email: string, niche: string, keyword: string) {
    const user = await prisma.user.findUniqueOrThrow({
      where: { email },
      select: { id: true },
    });
    const report = await prisma.report.create({
      data: { userId: user.id, niche, keyword, status: 'COMPLETED' },
      select: { id: true },
    });
    return report.id;
  }

  test.beforeAll(async () => {
    adminReportId = await seedReport(
      adminEmail,
      'Admin private niche',
      'admin only',
    );
    ownReportId = await seedReport(userEmail, 'User own niche', 'user owned');
  });

  test.afterAll(async () => {
    await prisma.report.deleteMany({
      where: { id: { in: [adminReportId, ownReportId] } },
    });
    await prisma.$disconnect();
  });

  test('shows a report to the user who owns it', async ({ page }) => {
    await signIn(page, userEmail, userPassword);

    await page.goto(`/dashboard/reports/${ownReportId}`);

    await expect(
      page.getByRole('heading', { name: 'User own niche' }),
    ).toBeVisible();
    await expect(page.getByText(ownReportId)).toBeVisible();
  });

  test("404s on another account's report rather than exposing it", async ({
    page,
  }) => {
    await signIn(page, userEmail, userPassword);

    // The id is real and the row exists — only ownership keeps it hidden. A
    // findUnique on id alone would render it and leak another user's report.
    await page.goto(`/dashboard/reports/${adminReportId}`);

    // Not asserting a 404 status: notFound() in a streamed dynamic route
    // responds 200 and renders the not-found body. What matters is that no
    // part of the other account's report reaches the page.
    await expect(
      page.getByRole('heading', { name: /this niche does not exist/i }),
    ).toBeVisible();
    await expect(page.getByText('Admin private niche')).toHaveCount(0);
    await expect(page.getByText(adminReportId)).toHaveCount(0);
  });

  test('404s on a well-formed id that does not exist', async ({ page }) => {
    await signIn(page, userEmail, userPassword);

    await page.goto('/dashboard/reports/01931f3e-0000-7000-8000-000000000000');

    // Identical to the foreign-report case, so the response never reveals
    // whether an id exists.
    await expect(
      page.getByRole('heading', { name: /this niche does not exist/i }),
    ).toBeVisible();
  });

  test('redirects an anonymous visitor to sign-in', async ({ page }) => {
    await page.context().clearCookies();

    await page.goto(`/dashboard/reports/${ownReportId}`);

    await expect(page).toHaveURL(/\/signin/);
  });
});
