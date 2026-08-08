import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Vite resolves the @/* alias from tsconfig.json natively as of Vite 7 /
  // Vitest 4 — the vite-tsconfig-paths plugin is no longer needed.
  resolve: { tsconfigPaths: true },
  test: {
    // Node, not jsdom: these tests cover schemas, route handlers, and
    // credential logic. Component rendering is covered by Playwright.
    environment: 'node',
    include: ['{app,lib}/**/*.test.ts'],
    // e2e/ belongs to Playwright; running its specs under Vitest hangs.
    exclude: ['e2e/**', 'node_modules/**', 'lib/generated/**'],
  },
});
