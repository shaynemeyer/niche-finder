import { expect, test, type Page } from '@playwright/test';

// Seeded by e2e/global-setup.ts from .env.test.
const userEmail = process.env.DEFAULT_USER_EMAIL!;
const userPassword = process.env.DEFAULT_USER_PASSWORD!;

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

const niche = 'AI productivity tools for writers';

async function fillForm(page: Page) {
  await page.getByLabel('Niche Description').fill(niche);
  await page.getByLabel('Primary Keyword').fill('ai writing assistant');
}

test.beforeEach(async ({ page }) => {
  await signIn(page, userEmail, userPassword);
  await expect(page).toHaveURL(/\/dashboard/);
});

test.describe('validation form', () => {
  test('rejects a too-short niche without posting', async ({ page }) => {
    let posted = false;
    await page.route('**/api/validate', async (route) => {
      posted = true;
      await route.abort();
    });

    await page.getByLabel('Niche Description').fill('ab');
    await page.getByLabel('Primary Keyword').fill('ai writing assistant');
    await page.getByRole('button', { name: /validate niche/i }).click();

    await expect(
      page.getByText(/at least 3 characters/i),
    ).toBeVisible();
    expect(posted).toBe(false);
  });

  test('disables both inputs and the button while submitting', async ({
    page,
  }) => {
    // Hold the response open so the in-flight state is observable.
    let release: () => void = () => {};
    const held = new Promise<void>((resolve) => {
      release = resolve;
    });

    await page.route('**/api/validate', async (route) => {
      await held;
      await route.fulfill({
        status: 202,
        contentType: 'application/json',
        body: JSON.stringify({ id: 'report-1', status: 'PENDING' }),
      });
    });

    await fillForm(page);
    await page.getByRole('button', { name: /validate niche/i }).click();

    await expect(page.getByLabel('Niche Description')).toBeDisabled();
    await expect(page.getByLabel('Primary Keyword')).toBeDisabled();
    await expect(
      page.getByRole('button', { name: /starting validation/i }),
    ).toBeDisabled();

    release();
  });

  test('posts the niche and keyword as JSON', async ({ page }) => {
    let payload: unknown;
    await page.route('**/api/validate', async (route) => {
      payload = route.request().postDataJSON();
      await route.fulfill({
        status: 202,
        contentType: 'application/json',
        body: JSON.stringify({ id: 'report-1', status: 'PENDING' }),
      });
    });

    await fillForm(page);
    await page.getByRole('button', { name: /validate niche/i }).click();

    await expect
      .poll(() => payload)
      .toEqual({ niche, keyword: 'ai writing assistant' });
  });

  test('clears the form and stays on the dashboard after a 202', async ({
    page,
  }) => {
    await page.route('**/api/validate', (route) =>
      route.fulfill({
        status: 202,
        contentType: 'application/json',
        body: JSON.stringify({ id: 'report-1', status: 'PENDING' }),
      }),
    );

    await fillForm(page);
    await page.getByRole('button', { name: /validate niche/i }).click();

    // Results appear in Recent Validations below, so the form must not navigate.
    await expect(page.getByLabel('Niche Description')).toHaveValue('');
    await expect(page.getByLabel('Primary Keyword')).toHaveValue('');
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test('surfaces the server error message and keeps the values', async ({
    page,
  }) => {
    await page.route('**/api/validate', (route) =>
      route.fulfill({
        status: 403,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Free plan allows 3 validations per month.',
        }),
      }),
    );

    await fillForm(page);
    await page.getByRole('button', { name: /validate niche/i }).click();

    await expect(
      page.getByText(/free plan allows 3 validations per month/i),
    ).toBeVisible();
    // The input is not thrown away on a rejected submit.
    await expect(page.getByLabel('Niche Description')).toHaveValue(niche);
    await expect(page.getByLabel('Niche Description')).toBeEnabled();
  });

  test('falls back to a generic message when the request fails outright', async ({
    page,
  }) => {
    await page.route('**/api/validate', (route) => route.abort('failed'));

    await fillForm(page);
    await page.getByRole('button', { name: /validate niche/i }).click();

    await expect(page.getByText(/something went wrong/i)).toBeVisible();
    await expect(page.getByLabel('Niche Description')).toBeEnabled();
  });

  test('re-enables the form so a failed submit can be retried', async ({
    page,
  }) => {
    let calls = 0;
    await page.route('**/api/validate', async (route) => {
      calls += 1;
      if (calls === 1) {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Analysis failed.' }),
        });
        return;
      }
      await route.fulfill({
        status: 202,
        contentType: 'application/json',
        body: JSON.stringify({ id: 'report-2', status: 'PENDING' }),
      });
    });

    await fillForm(page);
    await page.getByRole('button', { name: /validate niche/i }).click();
    await expect(page.getByText(/analysis failed/i)).toBeVisible();

    await page.getByRole('button', { name: /validate niche/i }).click();
    await expect.poll(() => calls).toBe(2);
    await expect(page.getByLabel('Niche Description')).toHaveValue('');
  });
});
