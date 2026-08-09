import { expect, test, type Page } from '@playwright/test';
import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '../lib/generated/prisma/client';

// Seeded by e2e/global-setup.ts from .env.test.
const userEmail = process.env.DEFAULT_USER_EMAIL!;
const userPassword = process.env.DEFAULT_USER_PASSWORD!;

/** Above the 5 the dashboard lists, so a capped count is visibly wrong. */
const TOTAL_REPORTS = 8;
const COMPLETED_REPORTS = 6;

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

/** The number rendered beneath a stat card's label. */
function statValue(page: Page, label: string) {
  return page
    .locator('div')
    .filter({ has: page.getByText(label, { exact: true }) })
    .last()
    .getByText(/^\d+$/);
}

test.describe('dashboard stats', () => {
  const prisma = testClient();
  const createdIds: string[] = [];

  test.beforeAll(async () => {
    const user = await prisma.user.findUniqueOrThrow({
      where: { email: userEmail },
      select: { id: true },
    });

    // Clear anything a previous run left so the counts are exact.
    await prisma.report.deleteMany({ where: { userId: user.id } });

    for (let i = 0; i < TOTAL_REPORTS; i++) {
      const report = await prisma.report.create({
        data: {
          userId: user.id,
          niche: `Stats fixture ${i}`,
          keyword: `fixture-${i}`,
          status: i < COMPLETED_REPORTS ? 'COMPLETED' : 'FAILED',
        },
        select: { id: true },
      });
      createdIds.push(report.id);
    }
  });

  test.afterAll(async () => {
    await prisma.report.deleteMany({ where: { id: { in: createdIds } } });
    await prisma.$disconnect();
  });

  test('counts every report, not just the listed ones', async ({ page }) => {
    await signIn(page, userEmail, userPassword);
    await expect(page).toHaveURL(/\/dashboard/);

    // The list below shows 5. Deriving the totals from it — which the page
    // used to do — pins both figures at 5 for anyone past the cap.
    await expect(statValue(page, 'Total Validations')).toHaveText(
      String(TOTAL_REPORTS),
    );
    await expect(statValue(page, 'Completed')).toHaveText(
      String(COMPLETED_REPORTS),
    );
  });

  test('still lists only the five most recent reports', async ({ page }) => {
    await signIn(page, userEmail, userPassword);

    // The count fix must not turn the list into an unbounded query.
    await expect(
      page.locator('a[href^="/dashboard/reports/"]'),
    ).toHaveCount(5);
  });
});
