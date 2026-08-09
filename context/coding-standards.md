# Coding Standards

Derived from the code actually in `frontend/`. Where the project is too new to have a pattern,
that is stated rather than filled in with generic advice.

This is a single-app repo — all source lives in `frontend/`. There is no second sub-project
with its own rules.

## Language and types

- TypeScript, `strict: true`, `noEmit` (see `frontend/tsconfig.json`). Next handles the build.
- Target ES2017, `moduleResolution: "bundler"`, ESM only.
- Path alias `@/*` → `frontend/` root: `@/lib/auth`, `@/components/ui/button`.
- Prisma types are imported from the **generated** client, never `@prisma/client`:
  `import type { PlanType, Role } from '@/lib/generated/prisma/client'`.
- Enums come from the generated client too and are used as values where it reads better
  (`role: Role.USER` in `app/api/register/route.ts`), or as string literals where the field is
  unambiguous (`planType: 'FREE'`).
- Module augmentation for auth types lives in `types/next-auth.d.ts`, extending
  `@auth/core/types` and `@auth/core/jwt` (not `next-auth` — v5 moved these).
- `any` does not appear in hand-written code. Keep it that way.

## Formatting

No Prettier config exists, and there is no format script — formatting is maintained by hand.

- **Single quotes, semicolons, 2-space indent, trailing commas** across `app/`,
  `components/` (excluding `ui/`), `lib/auth.ts`, `lib/validations/`, and `types/`.
- Two files predate this and use double quotes with no semicolons: `lib/prisma.ts` and
  `lib/utils.ts`. `components/ui/` is shadcn CLI output and follows its own style.
- Match the file you're editing; use single quotes for anything new.

## File and folder organization

```
frontend/
  app/            route segments; page.tsx per route, route.ts for handlers
    (auth)/       route group — signin/ and register/, NOT part of the URL
    api/          route handlers
  components/     shared app components, kebab-case files
    ui/           shadcn primitives — add via the shadcn CLI, don't hand-write
    dashboard/    components for /dashboard, one per section
    admin/        components for /admin, one per section
  lib/            auth.ts, prisma.ts, utils.ts, constants.ts, googleTrends.ts
    validations/  zod schemas, one file per domain area
    generated/    Prisma client output — gitignored, never edit
  prisma/         schema.prisma, migrations/, seed.ts
  types/          ambient .d.ts only
  docs/           decision records and plans
```

- Components used by one route group live in a folder named for it
  (`components/dashboard/`); anything shared across routes stays at the top level. A page
  should read as a list of composed sections, not a wall of markup — `app/admin/page.tsx`
  is the reference.

- Files are kebab-case (`login-form.tsx`, `theme-toggle.tsx`); components are PascalCase and
  **named** exports (`export function LoginForm`). Pages are the exception — default export,
  named `<Segment>Page` (`DashboardPage`, `AdminPage`).
- `(auth)` is a route group: `app/(auth)/signin/page.tsx` serves `/signin`, not `/auth/signin`.

## Components

- Server by default. `'use client'` appears only where hooks or event handlers require it:
  `login-form.tsx`, `register-form.tsx`, `theme-provider.tsx`, `theme-toggle.tsx`,
  `app/providers.tsx`.
- Pages stay thin: a server page does the auth check and renders a client form component
  (`app/(auth)/signin/page.tsx` → `<LoginForm />`).
- Props are typed with `React.ComponentProps<'div'>` and spread, rather than hand-rolled
  interfaces — see `LoginForm`.
- Compose classes with `cn()` from `@/lib/utils` (clsx + tailwind-merge).
- Style with theme tokens (`bg-background`, `bg-card`, `text-foreground`,
  `text-muted-foreground`, `border-border`, `bg-primary`), not literal colors — literals ignore
  the `.dark` variant that `globals.css` defines for both schemes. `app/page.tsx` is the
  reference for a full page built this way.
- Brand accents that are deliberately off-palette (the blue-purple gradient, the feature
  icons) keep their hue but need an explicit `dark:` variant — a `-600` shade that reads well
  on white is usually too dark on a dark background. See the icons in `app/page.tsx`.

## Forms and validation

The established pattern, used by both auth forms:

1. Define the schema and its inferred type in `lib/validations/<area>.ts`, exporting both
   (`signInSchema` / `SignInValues`).
2. `useForm<Values>({ resolver: zodResolver(schema), defaultValues })`.
3. Render with the shadcn `Field` primitives: `FieldGroup` → `Field` → `FieldLabel` /
   `Input` / `FieldError`. Set `data-invalid` on `Field` and `aria-invalid` on `Input`.
4. `<form noValidate>` — zod owns validation, not the browser.
5. Surface submit failures on `errors.root` via `setError('root', ...)`.
6. Disable the submit button on `isSubmitting` and swap its label.
7. **Re-validate the same schema server-side** in the route handler. Client validation is UX
   only.

## Tables

Use **TanStack Table** (`@tanstack/react-table`) for any dynamic table — one with sorting,
filtering, pagination, row selection, or column visibility. The admin user list and the
reports list are the cases this exists for.

- Compose it with the shadcn `table` primitive (`bunx shadcn@latest add table`). TanStack
  Table is headless: it owns state and typed APIs, not markup, so the rendered `<table>`
  stays yours and follows the same theme tokens as everything else.
- **Use the v9 API.** `useTable`, not v8's `useReactTable`, and register features explicitly
  via the `features` option rather than passing `getCoreRowModel()` and friends as options.
  Most tutorials still show v8 — check before copying.
- A plain `<table>` is fine for static markup with no interaction. Reach for TanStack Table
  when behaviour is involved, not for every table.

See `frontend/docs/tanstack-table.md` for the version history and why the v8/v9 split
matters here.

## Client state

`useState` first. When state outgrows it, use **Zustand** — not Context, and not
`useReducer`.

"Outgrows it" means state shared across components that are not parent and child, state
that must survive navigation, or a `useState` cluster that several components need to read
and write. A single component's own state stays `useState`.

- Stores live in `lib/stores/`, one file per domain area, named `use<Thing>Store`.
- Select narrowly — `useThingStore((s) => s.field)`, not the whole store — so components
  re-render only on the slice they read.
- Server state is not client state. Session data comes from `auth()` or `useSession()`, and
  data loaded per request belongs in a server component. Don't mirror either into a store.

Nothing uses this yet: current client state is the mobile menu's `useState` in
`app/dashboard/layout.tsx` and react-hook-form inside `ValidationForm`. Both are correct as
they stand.

## Error handling

Deliberately non-defensive — errors are handled where there is a real branch to take.

- Route handlers: `safeParse` the body → 400 on failure; try/catch around the Prisma write;
  match specific Prisma error codes (`P2002` → 409) and fall through to a logged 500 with a
  generic message. See `app/api/register/route.ts`.
- Never leak internal detail to the client. `console.error` the real error server-side,
  return a generic string.
- Auth failures are uniform on purpose: `authorize()` returns `null` identically for unknown
  email, passwordless user, and wrong password, so the response can't be used to enumerate
  accounts. Preserve that — do not add a distinguishing error.
- No global error boundary or exception wrapper exists, and none is wanted until something
  needs one.

## Auth

- `lib/auth.ts` is the single NextAuth v5 config, exporting `{ handlers, auth, signIn, signOut }`.
- Session strategy is JWT. Role and subscription are attached in the `jwt` callback and
  mirrored into `session.user` in the `session` callback — read them from the session, don't
  re-query.
- Server-side protection is an explicit check at the top of the page:
  ```ts
  const session = await auth();
  if (!session?.user) redirect('/signin');
  if (session.user.role !== 'ADMIN') redirect('/dashboard');
  ```
  There is no middleware. Every protected route does this itself.
- Passwords: bcrypt, cost 12. Never select the hash back out — `omit: { password: true }`.
- Validate any `callbackUrl` from query params before redirecting: it must start with `/` and
  not `//` (see `login-form.tsx`), or it becomes an open redirect.

## Database

- **Queries live in `lib/data/`, not in pages.** A server component or route handler calls
  a function there; only that layer talks to Prisma. Two reasons: moving the backend
  elsewhere then rewrites one module rather than every call site, and the ownership scope
  is a required argument (`listReports(userId)`) rather than a `where` clause someone can
  forget. ESLint enforces the page half — `app/**/*.tsx` and `components/**` cannot import
  `@/lib/prisma` at all.
- Route handlers may still import `prisma` directly for writes `lib/data` does not cover
  yet (`app/api/validate`, `app/api/register`). Move them as the layer grows.
- Import the singleton `prisma` from `@/lib/prisma`. Never construct a `PrismaClient`
  elsewhere — Prisma 7 requires an explicit driver adapter and the singleton owns it.
- `@prisma/adapter-pg` ignores `?schema=` in the connection string (node-postgres does not
  read it) and silently uses `public`. The schema must be passed as the adapter's second
  argument: `new PrismaPg({ connectionString }, { schema })`. `lib/prisma.ts` and
  `prisma/seed.ts` parse it from the URL; anything else constructing a client must too.
- Use `select` to narrow reads (see the `jwt` callback); `include` only when the full relation
  is needed.
- Related records are created in one nested write rather than sequential calls — registration
  creates `User` + `Subscription` + `UsageLog` in a single `create`.
- Schema changes go through `bunx prisma migrate dev --name <describes-change>`, which also
  regenerates the client. A bare `prisma generate` leaves the database untouched.
- JSONB columns on `Report` hold analysis payloads; read
  `frontend/docs/jsonb-indexing.md` before querying into them.

## Comments

Sparse and explanatory — they say *why*, never *what*. Existing examples: why `authorize`
returns null uniformly, why the password is omitted, why `callbackUrl` is filtered, what
`P2002` means. Add a comment when the reason isn't visible in the code; otherwise don't.

No JSDoc convention is established. `lib/auth.ts` has one `/** */` on an exported const.

## Linting

ESLint flat config at `frontend/eslint.config.mjs`, composing
`eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`. Run
`bun run lint`; don't restate or duplicate its rules here.

One custom rule: `no-restricted-imports` blocks `@/lib/prisma` (and a bare `PrismaClient`)
in `app/**/*.tsx` and `components/**`, keeping database access behind `lib/data/`. It is
scoped to those globs deliberately — `route.ts` files are excluded, because the write path
in `app/api/validate` and `app/api/register` still queries Prisma directly. Tighten the
globs as those move.

Add a rule here only when a convention is worth failing a build over. Anything softer
belongs in prose above.

## Not yet established

No pattern exists in the codebase for these — decide when the first case arrives and record
the choice here:

- Server actions (none written; all mutations go through `app/api/` route handlers)
- Data fetching and caching strategy for report pages
- `loading.tsx` and `error.tsx` route files (none written)

Testing conventions **are** established — see `context/testing-instructions.md`.

## Toasts

**Use `sonner`.** `react-hot-toast` was removed once the first real case arrived — keeping
two toast libraries meant every future call site was a coin flip.

`<Toaster />` is mounted in `app/providers.tsx`, inside `ThemeProvider` because the shadcn
wrapper reads `useTheme()` for dark mode. Import `toast` from `sonner` directly; the
primitive in `components/ui/sonner.tsx` is the styled Toaster, not the function.

A toast confirms something happened out of view. It is not a substitute for showing state
in place — `ValidationForm` raises one on submit *and* the new report renders with a
spinner and progress bar in the list below.

## Not-found pages

`app/not-found.tsx` covers both unmatched URLs and `notFound()` thrown from a route
segment. Prefer it over `global-not-found.tsx`, which is experimental, aimed at apps with
multiple root layouts, and bypasses the layout — meaning global styles and the theme would
have to be re-applied by hand.

`notFound()` in a streamed dynamic route responds **200** and renders the not-found body;
only non-streamed responses return a 404 status. Assert on content, not status.
