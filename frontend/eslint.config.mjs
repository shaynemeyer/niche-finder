import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

/**
 * Keeps database access behind a seam so a backend move rewrites one layer
 * rather than every call site — and so the ownership scope on a query cannot
 * be forgotten in a page.
 *
 * lib/data owns every query. Nothing under app/ or components/ imports prisma
 * — route handlers included, since they are the seam that would proxy to
 * another backend.
 */
const noPrismaOutsideDataLayer = {
  files: ["app/**/*.{ts,tsx}", "components/**/*.{ts,tsx}"],
  rules: {
    "no-restricted-imports": [
      "error",
      {
        paths: [
          {
            name: "@/lib/prisma",
            message:
              "Query through lib/data instead. Nothing under app/ or components/ talks to Prisma directly.",
          },
        ],
        patterns: [
          {
            group: ["**/lib/generated/prisma/client"],
            importNames: ["PrismaClient"],
            message:
              "Import the singleton from lib/data, not a fresh client. See lib/prisma.ts for why.",
          },
        ],
      },
    ],
  },
};

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  noPrismaOutsideDataLayer,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
