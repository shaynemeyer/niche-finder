# Niche Finder

AI-powered niche and market validation. Enter a niche idea and get a research report combining
Reddit community analysis, Google Trends demand data, competition insights, and AI-generated
strategy — instead of validating by guesswork.

> **Status: early development.** The landing page and data model exist; the application itself
> is still being built.

## Repository layout

| Path | Description |
| --- | --- |
| `frontend/` | Next.js 16 application — the entire project today |

## Getting started

All setup lives in the frontend package:

```bash
cd frontend
bun install
bun dev
```

See [`frontend/README.md`](frontend/README.md) for prerequisites, environment variables, and
the full command reference.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui · Prisma 7 +
PostgreSQL · NextAuth v5

## Planned features

- Reddit analysis — pain points and sentiment across relevant subreddits
- Google Trends — search volume, growth, and seasonality
- AI insights — market analysis and opportunity assessment
- Full reports — competition, monetization, and go-to-market strategy, exportable to PDF

Free tier allows 3 validations per month; Pro adds unlimited validations and deeper analysis.

## Documentation

- [`frontend/README.md`](frontend/README.md) — setup and commands
- [`frontend/CLAUDE.md`](frontend/CLAUDE.md) — architecture notes and known gaps
- [`frontend/docs/`](frontend/docs/) — technical write-ups
