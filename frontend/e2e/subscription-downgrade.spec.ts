import { expect, test, type Page } from '@playwright/test';
import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '../lib/generated/prisma/client';

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

test.describe('subscription downgrade', () => {
  const prisma = testClient();
  // Own account per run, registered fresh rather than reusing the shared
  // admin/user fixtures — those are PRO/FREE respectively for other specs,
  // and downgrading them here would leave those specs in the wrong state.
  const email = `e2e-downgrade-${Date.now()}@example.com`;
  const password = 'password123';

  async function setPlan(planType: 'PRO' | 'FREE') {
    const user = await prisma.user.findUniqueOrThrow({
      where: { email },
      select: { id: true },
    });
    await prisma.subscription.update({
      where: { userId: user.id },
      data: { planType, isActive: true, endDate: null },
    });
  }

  test.beforeAll(async ({ browser }) => {
    // Register through the real UI so the password hash comes from the
    // app's own bcrypt call, then flip the freshly-created FREE
    // subscription to PRO directly — the bank-transfer/admin-approval
    // upgrade flow isn't what this spec covers.
    const page = await browser.newPage();
    await page.goto('/register');
    await page.getByLabel('Name').fill('Downgrade Test User');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password', { exact: true }).fill(password);
    await page.getByLabel('Confirm password').fill(password);
    await page.getByRole('button', { name: 'Create account' }).click();
    await expect(page).toHaveURL(/\/dashboard/);
    await page.close();

    await setPlan('PRO');
  });

  test.afterAll(async () => {
    await prisma.user.delete({ where: { email } });
    await prisma.$disconnect();
  });

  test('downgrades a pro account to free after confirming', async ({
    page,
  }) => {
    await signIn(page, email, password);
    await page.goto('/dashboard/settings');

    await expect(page.getByText('PRO', { exact: true })).toBeVisible();

    page.once('dialog', (dialog) => dialog.accept());
    const cancelResponse = page.waitForResponse((response) =>
      response.url().includes('/api/subscription/cancel'),
    );
    await page.getByRole('button', { name: 'Downgrade to Free' }).click();
    await cancelResponse;

    await expect(page.getByText('FREE', { exact: true })).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Downgrade to Free' }),
    ).toHaveCount(0);
  });

  test('keeps the pro plan when the confirmation is dismissed', async ({
    page,
  }) => {
    // The previous test downgraded this account — restore PRO for this one.
    await setPlan('PRO');

    await signIn(page, email, password);
    await page.goto('/dashboard/settings');
    await expect(page.getByText('PRO', { exact: true })).toBeVisible();

    page.once('dialog', (dialog) => dialog.dismiss());
    await page.getByRole('button', { name: 'Downgrade to Free' }).click();

    // No confirmation, so no request should have gone out and the plan
    // stays PRO.
    await expect(page.getByText('PRO', { exact: true })).toBeVisible();
  });
});
