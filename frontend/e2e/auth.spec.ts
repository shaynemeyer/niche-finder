import { expect, test } from '@playwright/test';

// Seeded by e2e/global-setup.ts from .env.test.
const adminEmail = process.env.ADMIN_EMAIL!;
const adminPassword = process.env.ADMIN_PASSWORD!;
const userEmail = process.env.DEFAULT_USER_EMAIL!;
const userPassword = process.env.DEFAULT_USER_PASSWORD!;

/**
 * Signs in and waits for the credentials POST to complete. Without that
 * wait, a following navigation aborts the request in flight and no session
 * cookie is ever set.
 */
async function signIn(page: import('@playwright/test').Page, email: string, password: string) {
  await page.goto('/signin');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);

  const callback = page.waitForResponse(
    (response) => response.url().includes('/api/auth/callback/credentials'),
  );
  await page.getByRole('button', { name: 'Login' }).click();
  await callback;
}

test.describe('sign-in', () => {
  test('signs a user in and lands on the dashboard', async ({ page }) => {
    await signIn(page, userEmail, userPassword);

    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
  });

  test('signs an admin in and lands on /admin', async ({ page }) => {
    await signIn(page, adminEmail, adminPassword);

    await expect(page).toHaveURL(/\/admin/);
  });

  test('honours an explicit callbackUrl over the role default', async ({ page }) => {
    // A deep link must survive sign-in rather than being replaced by /admin.
    await page.goto('/signin?callbackUrl=%2Fdashboard');
    await page.getByLabel('Email').fill(adminEmail);
    await page.getByLabel('Password', { exact: true }).fill(adminPassword);

    const callback = page.waitForResponse((response) =>
      response.url().includes('/api/auth/callback/credentials'),
    );
    await page.getByRole('button', { name: 'Login' }).click();
    await callback;

    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('shows the same error for a wrong password as for an unknown email', async ({ page }) => {
    // The UI must not reveal whether an email is registered.
    await signIn(page, userEmail, 'definitely-the-wrong-password');
    const wrongPasswordError = await page.getByText(/invalid email or password/i).textContent();
    await expect(page).toHaveURL(/\/signin/);

    await signIn(page, 'nobody-here@example.com', 'definitely-the-wrong-password');
    const unknownEmailError = await page.getByText(/invalid email or password/i).textContent();

    expect(unknownEmailError).toBe(wrongPasswordError);
  });
});

test.describe('route protection', () => {
  test('redirects anonymous visitors from /dashboard to /signin', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(page).toHaveURL(/\/signin/);
  });

  test('redirects a non-admin away from /admin', async ({ page }) => {
    await signIn(page, userEmail, userPassword);
    await expect(page).toHaveURL(/\/dashboard/);

    await page.goto('/admin');

    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('lets an admin reach /admin', async ({ page }) => {
    await signIn(page, adminEmail, adminPassword);

    await page.goto('/admin');

    await expect(page).toHaveURL(/\/admin/);
    // The admin sidebar is rendered by the layout, so it is stable while the
    // page itself is still a placeholder.
    await expect(page.getByRole('link', { name: 'Payment Requests' })).toBeVisible();
  });
});

test.describe('registration', () => {
  test('registers a new account and signs it in', async ({ page }) => {
    // Unique per run so repeated runs do not collide on the email unique
    // constraint. Rows land in the test schema, not development data.
    const email = `e2e-${Date.now()}@example.com`;

    await page.goto('/register');
    await page.getByLabel('Name').fill('E2E User');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password', { exact: true }).fill('password123');
    await page.getByLabel('Confirm password').fill('password123');
    await page.getByRole('button', { name: 'Create account' }).click();

    // Registration signs the new account in and redirects.
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText(email)).toBeVisible();
  });

  test('rejects a duplicate email', async ({ page }) => {
    await page.goto('/register');
    await page.getByLabel('Name').fill('Duplicate');
    await page.getByLabel('Email').fill(userEmail);
    await page.getByLabel('Password', { exact: true }).fill('password123');
    await page.getByLabel('Confirm password').fill('password123');
    await page.getByRole('button', { name: 'Create account' }).click();

    await expect(page.getByText(/already exists/i)).toBeVisible();
  });
});
