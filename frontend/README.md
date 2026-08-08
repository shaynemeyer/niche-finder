# NicheFinder — Frontend

AI-powered niche and market validation: Reddit analysis, Google Trends data, competition
insights, and generated market reports.

> **Status: authentication complete, product unbuilt.** Registration, sign-in, sessions, and
> role-based route protection work and are covered by tests. The report pipeline — Reddit,
> Trends, AI insights, PDF export — does not exist yet.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui · Prisma 7 +
PostgreSQL · NextAuth v5

## Getting started

Requires [Bun](https://bun.sh) (this project pins `bun@1.3.8`).

```bash
bun install
```

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `AUTH_SECRET` | NextAuth signing secret |
| `NEXTAUTH_URL` | Base URL, `http://localhost:3000` in development |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Seeded admin user — **required by the seed** |
| `DEFAULT_USER_EMAIL` / `DEFAULT_USER_PASSWORD` | Seeded non-admin user — **required by the seed** |
| `SESSION_MAX_AGE` | Optional. Session lifetime in seconds; defaults to 30 days |
| `OPENAI_API_KEY` | AI report generation (not yet used by any code) |

`prisma/seed.ts` throws if any of the four seed credentials is missing — all four are
required, not just the admin pair.

Apply migrations and seed the database:

```bash
bunx prisma migrate dev
bunx prisma db seed
```

`migrate dev` regenerates the Prisma client as part of the run. There is no `postinstall`
hook, so after a fresh clone the client does not exist until you run this (or
`bunx prisma generate`).

Run the dev server:

```bash
bun dev
```

Open http://localhost:3000.

## Commands

| Command | Description |
| --- | --- |
| `bun dev` | Start the dev server |
| `bun run build` | Production build |
| `bun run lint` | Run ESLint |
| `bunx tsc --noEmit` | Typecheck |
| `bun run test` | Vitest unit tests, watch mode |
| `bun run test:run` | Vitest unit tests, single run |
| `bun run test:e2e` | Playwright E2E tests |
| `bun run test:e2e:ui` | Playwright UI mode |

Use `bun run build` / `bun run lint`, not `bun build` / `bun lint` — the shorter forms invoke
Bun's own builtins instead of these package scripts.

## Testing

**Vitest** covers validation schemas, the register route handler, and credential verification.
It mocks Prisma and needs no database:

```bash
bun run test:run
```

**Playwright** covers sign-in, route protection, and registration in a real browser against a
production build. It needs its own environment file:

```bash
cp .env.example.test .env.test   # then set DATABASE_URL
bun run test:e2e
```

E2E tests write real rows, so they run against a **separate Postgres schema** in the same
database — the `DATABASE_URL` in `.env.test` must end in `?schema=test`. `e2e/global-setup.ts`
applies migrations and seeds that schema before the suite runs, and refuses to start if the
URL names no schema. Development data in the default schema is never touched.

Playwright's browser binary is a one-time install:

```bash
bunx playwright install chromium
```

## Prisma

| Command | Description |
| --- | --- |
| `bunx prisma migrate dev` | Apply pending migrations and regenerate the client |
| `bunx prisma migrate dev --name <name>` | Create a new migration from schema changes |
| `bunx prisma migrate dev --create-only --name <name>` | Generate migration SQL without applying it, for hand-editing |
| `bunx prisma migrate status` | Show which migrations are applied |
| `bunx prisma migrate deploy` | Apply migrations in production (never generates or resets) |
| `bunx prisma generate` | Regenerate the client into `lib/generated/prisma` |
| `bunx prisma validate` | Validate the schema |
| `bunx prisma format` | Format `schema.prisma` |
| `bunx prisma studio` | Browse data in a local GUI |
| `bunx prisma db seed` | Run the seed script |
| `bunx prisma migrate reset` | Drop the database, replay migrations, and re-seed (destructive) |

After editing `prisma/schema.prisma`, run `bunx prisma migrate dev --name <describes-change>`.
That applies the change and regenerates the client in one step — a bare `prisma generate` only
updates the client and leaves the database untouched.

`migrate dev` is for local development only; it may prompt to reset the database. Use
`migrate deploy` against anything with real data.

### Seeding

`prisma/seed.ts` creates the default admin user. It requires `ADMIN_EMAIL` and
`ADMIN_PASSWORD` in `.env` and exits with an error if either is missing. The script is
idempotent — re-running it against an existing admin is a no-op.

It is wired up through `migrations.seed` in `prisma.config.ts`, so it runs automatically after
`prisma migrate reset` as well as on demand via `prisma db seed`.

`.env` is not JavaScript. Dotenv strips a matching pair of quotes wrapping the whole value, so
both `ADMIN_EMAIL=admin@example.com` and `ADMIN_EMAIL="admin@example.com"` work — but a
trailing semicolon defeats the stripping, and `"admin@example.com";` is stored verbatim,
quotes and all. Never end a line with `;`.

### When the client falls out of sync

If a query fails with a type error that contradicts the schema — for example
`invalid input syntax for type uuid` after switching an ID type — the generated client is
stale. Run `bunx prisma generate`.

Each command reports on a different layer, and all three can look healthy while disagreeing:

- `prisma validate` checks schema syntax only.
- `prisma migrate status` compares applied migrations against `prisma/migrations/`, not
  against `schema.prisma` — editing the schema without creating a migration still reports
  "up to date".
- The generated client in `lib/generated/prisma` is a separate artifact that only
  `prisma generate` (or a successful `migrate dev`) refreshes.

## Notes

**Tailwind v4** is CSS-first — there is no `tailwind.config.*` file and none is needed. The
theme is defined in the `@theme inline` block of `app/globals.css`.

**Prisma 7** differs from v6 in ways worth knowing before editing `prisma/schema.prisma`: the
datasource block holds only `provider` (the connection URL lives in `prisma.config.ts`), and
the client requires a driver adapter passed explicitly:

```ts
import { PrismaClient } from '@/lib/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = process.env.DATABASE_URL
const schema = new URL(connectionString).searchParams.get('schema') ?? undefined

const adapter = new PrismaPg({ connectionString }, { schema })
export const prisma = new PrismaClient({ adapter })
```

The second argument is not optional in practice: **`@prisma/adapter-pg` does not read
`?schema=` from the connection string.** node-postgres ignores that parameter and falls back to
`public`, while the Prisma CLI honours it — so `migrate deploy` can create tables in one schema
while the client queries another, failing with `P2021 TableDoesNotExist`. `lib/prisma.ts` and
`prisma/seed.ts` both parse it out of the URL.

Generated client code lands in `lib/generated/prisma` and is gitignored.

## Documentation

| File | What it covers |
| --- | --- |
| [`docs/todo.md`](docs/todo.md) | Known gaps found while working on something else |
| [`docs/auth-hardening-plan.md`](docs/auth-hardening-plan.md) | Auth weaknesses, prioritised — rate limiting first |
| [`docs/jsonb-indexing.md`](docs/jsonb-indexing.md) | Searching and indexing the JSONB columns on `Report` |
| [`docs/tanstack-table.md`](docs/tanstack-table.md) | Why TanStack Table, and the v8/v9 trap |
| [`docs/storybook-plan.md`](docs/storybook-plan.md) | Plan for adding Storybook (not implemented) |

See `CLAUDE.md` for fuller architecture notes and known gaps.
