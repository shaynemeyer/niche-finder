# Niche Finder

AI-powered niche and market validation. Enter a niche idea and get a research report combining
Reddit community analysis, Google Trends demand data, competition insights, and AI-generated
strategy — instead of validating by guesswork.

> **Status: early development.** Authentication is complete — registration, sign-in,
> sessions, and role-based route protection, covered by unit and E2E tests. The research
> pipeline that the product is actually for has not been built yet.

## Repository layout

| Path | Description |
| --- | --- |
| `frontend/` | Next.js 16 application — the entire project today |
| `context/` | Project spec, coding standards, workflow, and testing conventions |

## Getting started

All setup lives in the frontend package. It needs [Bun](https://bun.sh), a PostgreSQL
database, and a populated `.env`:

```bash
cd frontend
bun install
cp .env.example .env   # then fill in the values
bunx prisma migrate dev
bunx prisma db seed    # creates the admin and default users
bun dev
```

Seeding is not optional if you want to sign in — it creates the only accounts that exist.
It requires `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `DEFAULT_USER_EMAIL`, and `DEFAULT_USER_PASSWORD`,
and throws if any is missing.

Run the tests:

```bash
bun run test:run                 # unit tests, no database needed
cp .env.example.test .env.test   # then set DATABASE_URL with ?schema=test
bunx playwright install chromium
bun run test:e2e                 # E2E, against a separate Postgres schema
```

See [`frontend/README.md`](frontend/README.md) for the environment variables and the full
command reference.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui · Prisma 7 +
PostgreSQL · NextAuth v5 · Vitest + Playwright

## Planned features

- Reddit analysis — pain points and sentiment across relevant subreddits
- Google Trends — search volume, growth, and seasonality
- AI insights — market analysis and opportunity assessment
- Full reports — competition, monetization, and go-to-market strategy, exportable to PDF

Free tier allows 3 validations per month; Pro adds unlimited validations and deeper analysis.

## Documentation

- [`frontend/README.md`](frontend/README.md) — setup and commands
- [`frontend/CLAUDE.md`](frontend/CLAUDE.md) — architecture notes and known gaps
- [`frontend/docs/jsonb-indexing.md`](frontend/docs/jsonb-indexing.md) — JSONB searchability
  and indexing on `Report`
- [`context/`](context/) — project spec, coding standards, workflow, and testing conventions;
  see [`context/README.md`](context/README.md) for what each file covers
