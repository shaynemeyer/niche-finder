# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

Repo-wide context (project spec, coding standards, workflow, testing) lives in `../context/`
and is loaded via the root `CLAUDE.md`. This file covers only what is specific to the
frontend app.

## Project state

NicheFinder is an AI-powered niche/market validation product: Reddit analysis, Google Trends
data, competition insights, and AI-generated reports, on a free tier (3 validations/month) and
a Pro tier. See `app/page.tsx` — the landing page is the fullest statement of intended scope.

**Auth and the data model are built. The product itself is not.** Registration, credentials
sign-in, JWT sessions, and role-based route protection all work end to end and are covered by
tests.

The user and admin dashboards exist as presentational shells: components under
`components/dashboard/` and `components/admin/` take typed props, but every value passed to
them is a placeholder because there is no data layer yet.

The report pipeline is barely started. `lib/googleTrends.ts` wraps the Google Trends API
with typed responses and is unit tested, but **nothing calls it**. `openai`, `axios`,
`recharts`, `jspdf`, and `node-cron` are installed and unused.

Expect to create files rather than edit them for anything report-related, and don't assume a
helper exists because its dependency is in `package.json`.

## Commands

Package manager is **bun** (`packageManager: bun@1.3.8`, `bun.lock`).

```bash
bun dev             # dev server (Next.js 16, http://localhost:3000)
bun run build       # production build
bun run lint        # eslint (bare `eslint`, no next lint)
bunx tsc --noEmit   # typecheck; no package.json script for this
bun run test:run    # vitest unit tests (once)
bun run test        # vitest watch mode
bun run test:e2e    # playwright E2E — builds the app, needs .env.test
bun run test:e2e:ui # playwright UI mode for debugging a spec
```

Note `bun run build` / `bun run lint`, not `bun build` / `bun lint` — the latter hit bun's own
builtins instead of the package scripts.

## Testing

Vitest for units (node environment, Prisma mocked), Playwright for E2E. Full conventions are
in `../context/testing-instructions.md`. Two things that will cost you an hour if you miss
them:

- **E2E runs against a separate Postgres schema**, configured by `?schema=test` in `.env.test`
  (copy `.env.example.test`). `e2e/global-setup.ts` migrates and seeds it and refuses to run
  if the URL names no schema.
- **After clicking Login in a spec, wait for the credentials POST.** A following `page.goto()`
  aborts the in-flight request and no session cookie is set — the failure looks like bad
  credentials. Use the `signIn()` helper in `e2e/auth.spec.ts`, which handles this.

## Stack specifics that will bite you

**Next.js 16 + React 19.** See `@AGENTS.md` above: read `node_modules/next/dist/docs/` before
writing Next-specific code — this version's APIs differ from training data. `app/layout.tsx`
uses the generated `LayoutProps<"/">` type, not a hand-written props interface.

**Middleware is called Proxy in Next 16.** The file is `proxy.ts`, not `middleware.ts`
(`node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md`). Functionality is
unchanged. `proxy.ts` guards `/dashboard/:path*` and `/admin/:path*`; the pages also check
`auth()` themselves, so the guard is defence in depth rather than the only check.

**Tailwind v4.** No `tailwind.config.*` and none should be created — v4 is CSS-first. The
theme lives in the `@theme inline` block in `app/globals.css`, wired through the
`@tailwindcss/postcss` plugin. Content paths are auto-detected; there is no `content` array.

**shadcn/ui**, style `radix-nova`, base color neutral, CSS variables on. `components.json` has
`tailwind.config: ""` — correct for v4, not a missing value. Add components via the shadcn CLI
rather than hand-writing them into `components/ui/`. Icons are lucide-react; primitives come
from the unified `radix-ui` package.

**Prisma 7** — several v6 patterns are hard errors now:

- The datasource block holds `provider` only. Connection URLs live in `prisma.config.ts`;
  `url = env(...)` in the schema fails validation.
- Generator is `prisma-client` (not the legacy `prisma-client-js`) and `output` is required.
  It resolves relative to the *schema file*, hence `../lib/generated/prisma`. Import from
  `@/lib/generated/prisma/client`; the directory is gitignored.
- SQL providers require a driver adapter passed explicitly. There is no zero-arg constructor.
- **`@prisma/adapter-pg` ignores `?schema=` in the connection string.** node-postgres does not
  read that parameter and falls back to `public`, while the Prisma CLI *does* honour it — so
  `migrate deploy` and the client can silently target different schemas, surfacing as
  `P2021 TableDoesNotExist`. Pass it as the adapter's second argument:
  `new PrismaPg({ connectionString }, { schema })`. `lib/prisma.ts` and `prisma/seed.ts` both
  parse it out of `DATABASE_URL`; any new client construction must too.
- `prisma.config.ts` needs `import "dotenv/config"`; v7 does not auto-load `.env`.

Validate with `bunx prisma validate` after schema edits, but note it only checks syntax — see
the README's "When the client falls out of sync" section for what each command actually
verifies.

## Data model

9 models in `prisma/schema.prisma`, 2 migrations applied. NextAuth adapter shapes (`User`,
`Account`, `Session`, `VerificationToken`, `Authenticator`) plus domain models
(`Subscription`, `UsageLog`, `Report`, `PaymentRequest`). UUIDv7 primary keys, cascade delete
from `User`.

`Report` stores analysis in JSONB columns (`trendsData`, `aiInsights`, `competitionData`,
`monetizationIdeas`, `gtmStrategy`) — read `docs/jsonb-indexing.md` before querying into them.

## Known gaps

Real, currently-unresolved issues — not aspirational cleanups:

- **No report pipeline.** `lib/googleTrends.ts` is the only piece that exists and nothing
  calls it. There is no route handler, no persistence to `Report`, and no UI wiring.
- **The dashboards show placeholder data.** Every metric on `/dashboard` and `/admin` is a
  hardcoded zero passed as a prop. The components are real; the numbers are not.
- **The free-tier limit is not enforced anywhere.** `UsageLog` rows are created with
  `validationCount: 0` at registration and seeding, then never incremented or read.
  `FREE_TIER_MONTHLY_LIMIT` in `lib/constants.ts` is read only for display.
- **No rate limiting on authentication.** See `docs/auth-hardening-plan.md`; it is the
  highest-value item there.
- `lib/auth.ts` points NextAuth at `/signout` and `/error`, neither of which exists. Both
  404. See `docs/todo.md`.
- Formatting is not enforced by tooling. Hand-written code is single-quoted with semicolons;
  `lib/prisma.ts` still uses double quotes without semicolons. No Prettier config exists.
  Match the file you're editing.

## Conventions

Path alias is `@/*` → this directory (`@/components`, `@/lib/utils`). Use `cn()` from
`lib/utils.ts` (clsx + tailwind-merge) for conditional class composition.

Fuller conventions — forms, error handling, auth patterns, file organization — are in
`../context/coding-standards.md`.
