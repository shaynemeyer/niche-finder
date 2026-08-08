import { defineConfig, devices } from '@playwright/test';
import { config as loadEnv } from 'dotenv';

// Test credentials and the test-schema DATABASE_URL. Loaded before the
// config is evaluated so webServer inherits them.
loadEnv({ path: '.env.test', override: true });

const baseURL = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';

export default defineConfig({
  testDir: './e2e',
  globalSetup: './e2e/global-setup.ts',
  // Auth specs share seeded accounts and a session cookie per worker;
  // running them in parallel makes sign-in state ambiguous.
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'html',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    // Production build, per the Next.js testing guide: it matches
    // deployed behavior more closely than `next dev`.
    command: 'bun run build && bun run start',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    // The app under test must use the test schema, not the dev database.
    env: {
      DATABASE_URL: process.env.DATABASE_URL!,
      AUTH_SECRET: process.env.AUTH_SECRET!,
      NEXTAUTH_URL: baseURL,
    },
  },
});
