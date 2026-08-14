---
name: next-ts
description: Review and improve Next.js 16 App Router code quality in frontend/app/ (add "fix" to apply changes)
---

Review `frontend/app/` for Next.js-specific issues — routing, route handlers, server/client
boundaries, and the Next 16 / Prisma 7 traps this project has already been bitten by. Checked
against `CLAUDE.md`, `frontend/CLAUDE.md`, and `context/coding-standards.md`.

This is the App Router / server-runtime half of the review. Component-level React/TypeScript
quality (props typing, hooks, styling, forms) is `react-ts`'s job, not this skill's — don't
duplicate its checks here.

## Checks

### Next.js 16 API surface
- A file named `middleware.ts` — Next 16 renamed this to `proxy.ts` (`proxy()` export, same
  request/response shape). `middleware.ts` is silently ignored, not an error, so this is easy
  to miss.
- A page component with a hand-written props interface for route params/searchParams instead
  of the generated `PageProps<'/route/path'>` type (see `app/layout.tsx`,
  `app/dashboard/reports/[id]/page.tsx`)
- `params` or `searchParams` accessed without `await` — both are Promises in the App Router
  now (`const { id } = await props.params`)
- A claim about a Next API that isn't verified against `node_modules/next/dist/docs/` in this
  checkout — training data is stale for a fast-moving major version; per `AGENTS.md`, read the
  local docs before asserting how something behaves.

### Route protection
- A protected page (`app/dashboard/**`, `app/admin/**`) missing its own explicit
  `const session = await auth(); if (!session?.user) redirect('/signin');` check — `proxy.ts`
  is defence in depth, not the only check. Every protected page must still do this itself;
  there is no shared layout-level guard doing it for them.
- An admin-only page checking `session.user.role` inconsistently with the
  `if (session.user.role !== 'ADMIN') redirect('/dashboard')` pattern used elsewhere
- A `callbackUrl` (or any redirect target) taken from a query param and used without
  validating it starts with `/` and not `//` — otherwise it's an open redirect (see
  `login-form.tsx`)

### Route handlers (`route.ts`)
- A response path that doesn't return `NextResponse.json(...)` — every branch must respond;
  a catch block that only logs and falls through leaves the client hanging
- Internal error detail (exception message, stack, Prisma error text) sent to the client
  instead of a generic message — log the real error with `console.error` server-side only
- Body parsing without `.json().catch(() => null)` before `schema.safeParse`, risking an
  unhandled throw on malformed JSON
- A Prisma error code handled generically instead of matched specifically where a real branch
  exists (`P2002` → 409 on unique violation, `P2025` → 404 on not-found)
- `@/lib/prisma` imported directly in a *new* route handler instead of going through
  `lib/data/`. `app/api/validate` and `app/api/register` still do this and are grandfathered
  — that's known debt, not license to add more. New route handlers should use `lib/data/`.
- A slow multi-step operation awaited inline in the request/response cycle instead of using
  `after()` when the route can respond before the work finishes (see `app/api/validate`) — a
  floating un-awaited promise instead of `after()` can be frozen the moment the response is
  sent, leaving work silently incomplete with no error recorded anywhere

### Server/client boundary
- `'use client'` on a component with no hooks or event handlers — this repo defaults to
  server components; client-side is the exception (forms, `theme-provider`, `theme-toggle`,
  anything with local interactive state)
- A server page doing data-fetching or business logic inline instead of delegating to
  `lib/data/` and composing typed section/form components
- A client component importing `@/lib/prisma` or anything from `lib/data/` — that access
  belongs in a server component or route handler, not shipped to the client

### Prisma 7 in Next
- `new PrismaClient()` constructed anywhere outside `lib/prisma.ts` (or `prisma/seed.ts`,
  which needs its own instance for seeding) — there is no zero-arg constructor in Prisma 7,
  and the singleton owns the driver adapter
- A connection string relying on `?schema=` without also passing `schema` as the adapter's
  second argument (`new PrismaPg({ connectionString }, { schema })`) — `@prisma/adapter-pg`
  silently ignores the query param and falls back to `public`
- `import type { X } from '@prisma/client'` instead of `@/lib/generated/prisma/client` — the
  generated client is the only valid import source in this repo
- A schema change committed without running `bunx prisma migrate dev --name <name>` — a bare
  `prisma generate` regenerates the client but leaves the database untouched

### `notFound()` and streaming
- An E2E or integration assertion checking `response.status() === 404` on a page under a
  dynamic streamed route — `notFound()` in a streamed route responds **200** with the
  not-found body rendered; only non-streamed responses return a real 404 status. Assert on
  rendered content instead.

### Not yet established — flag as a pattern decision, not a missing file
- `loading.tsx` / `error.tsx` — none exist yet in this repo; don't flag their absence as a
  bug, but do flag a page doing manual loading/error state where one of these route files
  would be the idiomatic fix once the convention is decided
- Server actions — none written; all mutations currently go through `app/api/` route
  handlers. Flag a new server action as a pattern question for the user, not silently
  approve or reject it.

---

## Mode

**Default (no argument / "check"):**
- Scan `frontend/app/` (and anywhere it imports from directly) and report all findings
- Group findings by category
- Do not modify any files

**If asked to "fix":**
- First report all findings grouped by category with numbered items
- Ask: "Which items would you like me to fix? (enter numbers like 1,3,5 or 'all' or 'none')"
- Wait for confirmation before changing anything
- Apply only the approved fixes
- Report what changed
