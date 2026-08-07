# NicheFinder — Frontend

AI-powered niche and market validation: Reddit analysis, Google Trends data, competition
insights, and generated market reports.

> **Status: early scaffold.** The landing page is built. The application itself is not —
> `app/(auth)/`, `app/admin/`, `app/api/`, and `app/dashboard/` exist but are empty, and the
> Prisma schema has no models yet. Dependencies for the full feature set are installed but
> mostly unused.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui · Prisma 7 +
PostgreSQL · NextAuth v5

## Getting started

Requires [Bun](https://bun.sh) (this project pins `bun@1.3.8`).

```bash
bun install
```

Set `DATABASE_URL` in `.env` to a PostgreSQL connection string, then generate the Prisma
client:

```bash
bunx prisma generate
```

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
| `bunx prisma validate` | Validate the schema |
| `bunx prisma generate` | Regenerate the client into `lib/generated/prisma` |

Use `bun run build` / `bun run lint`, not `bun build` / `bun lint` — the shorter forms invoke
Bun's own builtins instead of these package scripts.

No test framework is currently configured.

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
