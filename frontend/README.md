# NicheFinder — Frontend

AI-powered niche and market validation: Reddit analysis, Google Trends data, competition
insights, and generated market reports.

> **Status: early scaffold.** The landing page and data model are in place. The application
> itself is not — `app/(auth)/`, `app/admin/`, `app/api/`, and `app/dashboard/` exist but are
> empty, and authentication is not yet configured.

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
| `OPENAI_API_KEY` | AI report generation |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Credentials for the seeded admin user |

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

Use `bun run build` / `bun run lint`, not `bun build` / `bun lint` — the shorter forms invoke
Bun's own builtins instead of these package scripts.

No test framework is currently configured.

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

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
export const prisma = new PrismaClient({ adapter })
```

Generated client code lands in `lib/generated/prisma` and is gitignored.

See `CLAUDE.md` for fuller architecture notes and known gaps.
