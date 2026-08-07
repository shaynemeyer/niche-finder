# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project state

NicheFinder is an AI-powered niche/market validation product: Reddit analysis, Google Trends
data, competition insights, and AI-generated reports, on a free tier (3 validations/month) and
a $29/mo Pro tier. See `app/page.tsx` — the landing page is the most complete statement of
intended scope.

**Almost nothing is built yet.** The only real source files are `app/layout.tsx`,
`app/page.tsx`, `components/ui/button.tsx`, and `lib/utils.ts`. The route directories
`app/(auth)/`, `app/admin/`, `app/admin-login/`, `app/api/`, and `app/dashboard/` all exist
but are **empty**. Dependencies for the whole product (openai, google-trends-api, next-auth,
prisma, recharts, jspdf, node-cron, axios, bcryptjs) are installed but unused.

Treat feature requests here as greenfield: expect to create files rather than edit them, and
don't assume a helper exists because its dependency is in `package.json`.

## Commands

Package manager is **bun** (`packageManager: bun@1.3.8`, `bun.lock`).

```bash
bun dev            # dev server (Next.js 16, http://localhost:3000)
bun run build      # production build
bun run lint       # eslint (bare `eslint`, no next lint)
bunx tsc --noEmit  # typecheck; no package.json script for this
```

Note `bun run lint` / `bun run build`, not `bun lint` / `bun build` — the latter hit bun's own
builtins instead of the package scripts.

**There is no test framework installed.** No jest/vitest/playwright, no test script, no test
files. If asked to write tests, pick and install a runner first.

## Stack specifics that will bite you

**Next.js 16 + React 19.** See `@AGENTS.md` above: read `node_modules/next/dist/docs/` before
writing Next-specific code — this version's APIs differ from training data. `app/layout.tsx`
uses the generated `LayoutProps<"/">` type, not a hand-written props interface.

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
- SQL providers require a driver adapter. Import from the generated path and pass it
  explicitly — `new PrismaClient({ adapter: new PrismaPg({ connectionString }) })`. There is
  no zero-arg constructor.
- `prisma.config.ts` needs `import "dotenv/config"`; v7 does not auto-load `.env`.

Validate with `bunx prisma validate` after schema edits.

## Known gaps

These are real, currently-unresolved issues — not aspirational cleanups:

- **The schema has no models.** `prisma/schema.prisma` declares a generator and datasource and
  nothing else. There is no `prisma/migrations/` directory and no client singleton anywhere
  (`lib/` contains only `utils.ts`). `@auth/prisma-adapter` + next-auth v5 will require
  `User`/`Account`/`Session`/`VerificationToken` in adapter-specified shapes, plus the domain
  models, none of which exist. Ask before inventing this data model.
- Generated client output is `lib/generated/prisma` (import from
  `@/lib/generated/prisma/client`), matching `.gitignore`. Note `output` resolves relative to
  the *schema file*, hence the `../` — `prisma validate` passes regardless of where output
  lands, so verify with `prisma generate` and read the path it prints.
- **The landing page links to routes that don't exist.** `/auth/signin` and `/auth/register`
  are referenced in `app/page.tsx`; `app/(auth)/` is empty. Note also that a route group
  `(auth)` does not contribute `/auth` to the URL — those links need `app/auth/`, or the
  hrefs need changing.
- **`app/page.tsx` is hardcoded light-mode.** It uses literal `bg-white` / `text-gray-*`
  rather than the theme tokens (`bg-background`, `text-foreground`) that `globals.css`
  defines for both schemes, so it ignores the `.dark` variant. The footer also reads
  "NicheCopy", not NicheFinder.
- **README is untouched create-next-app boilerplate** and describes nothing about this project.

## Conventions

Path alias is `@/*` → repo root (`@/components`, `@/lib/utils`). Use `cn()` from
`lib/utils.ts` (clsx + tailwind-merge) for conditional class composition.

Formatting is inconsistent across the tree — `app/page.tsx` is single-quoted and
2-space, `lib/utils.ts` and `components/ui/button.tsx` are double-quoted. No Prettier config
exists. Match the file you're editing.
