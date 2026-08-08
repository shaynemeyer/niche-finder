# Testing

Two runners, split by what they can reach:

- **Vitest** — unit tests for schemas, route handlers, and credential logic. Node environment,
  Prisma mocked, no database. Milliseconds.
- **Playwright** — E2E tests that drive a real browser against a production build and a real
  Postgres schema.

All commands run from `frontend/`.

| Command | Description |
| --- | --- |
| `bun run test` | Vitest in watch mode |
| `bun run test:run` | Vitest once — use this in the workflow |
| `bun run test:e2e` | Playwright (builds the app first) |
| `bun run test:e2e:ui` | Playwright UI mode, for debugging a failing spec |

Plus the checks that must pass before any commit:

```bash
bun run build      # production build
bunx tsc --noEmit  # typecheck
bun run lint       # eslint
```

## E2E database

E2E tests write real rows, so they run against a **separate Postgres schema** in the same
database. `.env.test` (gitignored; copy `.env.example.test`) holds a `DATABASE_URL` ending in
`?schema=test`. `e2e/global-setup.ts` runs `prisma migrate deploy` and `prisma db seed`
against it before the suite starts, and refuses to run if the URL has no `schema` parameter.

**`@prisma/adapter-pg` ignores `?schema=` in the connection string** — node-postgres does not
understand that parameter, so it silently falls back to `public`. The schema must be passed as
the adapter's second argument. `lib/prisma.ts` and `prisma/seed.ts` both parse it out of the
URL and do this. If you construct a `PrismaClient` anywhere else, it needs the same treatment
or it will write to the wrong schema.

Seeded accounts come from `ADMIN_EMAIL` / `ADMIN_PASSWORD` and `DEFAULT_USER_EMAIL` /
`DEFAULT_USER_PASSWORD`. Specs read these from `process.env` rather than hardcoding, so
changing the values in `.env.test` does not break them. All four are required —
`prisma/seed.ts` throws if any is missing.

## What to test

Only write tests with a real failure mode.

**Vitest** — currently covers, and the pattern to follow:

- `lib/validations/auth.test.ts` — schema boundaries: the 8/72 character password limits, the
  `confirmPassword` refine and the path it reports on, email rejection
- `app/api/register/route.test.ts` — every status branch (201/400/409/500), that the password
  is hashed and never selected back out, that a 500 does not leak internal detail. Prisma is
  mocked with `vi.mock('@/lib/prisma', ...)`
- `lib/auth.test.ts` — `verifyCredentials()` returning null identically for unknown email,
  passwordless account, and wrong password
- `lib/validations/report.test.ts` — the niche/keyword length boundaries, which mirror the
  `VarChar(255)` columns on `Report`
- `lib/googleTrends.test.ts` — response mapping, the null-on-failure contract that keeps an
  outage distinguishable from genuine low demand, trend thresholds, and region sorting.
  `google-trends-api` and `sleep` are both mocked, so it needs no network and stays fast

**Mock `sleep` when testing anything that rate-limits.** `lib/googleTrends.ts` pauses two
seconds after every upstream call; without the mock its suite takes eighteen.

The scoring and analysis logic in the rest of the report pipeline, once built, is the
highest-value target left: deterministic inputs, deterministic outputs, no I/O.

**Playwright** — `e2e/auth.spec.ts` covers sign-in, the account-enumeration guarantee at the UI
level, route protection by session and role, and registration including the duplicate-email
path. Add specs here for flows that cross a request boundary or depend on a real session
cookie.

## What not to test

- shadcn/ui primitives in `components/ui/` — third-party, added via the CLI
- Prisma itself, or that a query returns rows
- Trivial presentational components with no branching
- Anything already covered end-to-end, re-asserted as a unit test

Don't add tests to raise a coverage number. A test that would never fail is noise.

## Conventions

- Unit tests are colocated: `auth.ts` → `auth.test.ts`. Vitest only picks up
  `{app,lib}/**/*.test.ts`.
- E2E specs live in `e2e/*.spec.ts`.
- Mock `@/lib/prisma`, never hit a database from a unit test.
- `lib/auth.ts` calls `NextAuth()` at module scope, so a unit test importing it must stub
  `next-auth`, `next-auth/providers/credentials`, and `@auth/prisma-adapter` — see
  `lib/auth.test.ts`.
- **Wait for the credentials POST after clicking Login.** A following `page.goto()` aborts the
  request in flight and no session cookie is set — the `signIn()` helper in `e2e/auth.spec.ts`
  handles this with `page.waitForResponse`. Reuse the helper rather than re-rolling sign-in.
- Playwright runs `workers: 1` and `fullyParallel: false`: the specs share seeded accounts and
  a per-worker session, so parallel runs make sign-in state ambiguous.
- Registration specs use `e2e-${Date.now()}@example.com` so repeat runs don't collide on the
  email unique constraint.
