---
name: react-ts
description: Review and improve React + TypeScript code quality in frontend/ (add "fix" to apply changes)
---

Review `frontend/app/`, `frontend/components/`, and `frontend/lib/` for React and TypeScript
code quality issues, checked against this repo's actual conventions in
`context/coding-standards.md`.

## Checks

### TypeScript
- `any` types — replace with proper types or `unknown`; `any` does not appear anywhere in
  hand-written code in this repo
- Prisma types imported from `@prisma/client` instead of the generated client
  (`@/lib/generated/prisma/client`)
- Missing return types on non-trivial functions
- Props not typed — components should use `React.ComponentProps<'div'>` (or similar) and
  spread, rather than a hand-rolled interface, unless the component takes props with no DOM
  element equivalent
- Unnecessary type assertions (`as SomeType`) that could be avoided with proper typing
- Non-null assertions (`!`) without a clear reason
- Hand-written functions using positional parameters where two or more share a type — should
  take a single options object instead (see coding-standards.md's Function Parameters
  section). Does not apply to component props (already objects) or third-party call
  signatures.

### File and folder organization
- New component files placed loose at the `components/` root instead of inside a folder named
  for their route group (`components/dashboard/`, `components/admin/`) or concern
  (`components/auth/`, `components/theme/`)
- A component used by only one route group living outside that route's folder, or a component
  shared across multiple routes buried inside one route's folder instead of promoted to the
  shared level
- A folder of generic, multi-page-reused widgets not grouped under a `shared/` subfolder the
  way `components/admin/shared/` does (`key-metrics`, `metric-card`, `progress-bar`, etc.)
- Files not kebab-case, or components not PascalCase named exports (`export function Thing`) —
  pages are the one exception: default export, named `<Segment>Page`
- A page doing its own markup instead of reading as a list of composed section components

### React
- Class components — convert to functional
- `'use client'` on a component that doesn't need hooks or event handlers — this repo is
  server-by-server-default; client components should be the exception (forms, theme
  provider/toggle, anything with local interactive state)
- A server page doing more than the auth check plus rendering composed section/form
  components
- State or side effects not using hooks
- Components doing more than one job — flag for extraction
- Reusable logic not extracted into a custom hook
- Missing or incorrect dependency arrays in `useEffect` / `useCallback` / `useMemo`
- `key` prop missing or using array index on dynamic lists
- Classes composed by hand instead of via `cn()` from `@/lib/utils` (clsx + tailwind-merge)

### Database access
- `@/lib/prisma` or a `PrismaClient` import inside `app/**/*.tsx` or anything under
  `components/` — queries belong behind `lib/data/`, enforced by an ESLint
  `no-restricted-imports` rule for pages. `route.ts` handlers are currently exempt only
  because `app/api/validate` and `app/api/register` haven't been migrated yet — new route
  handlers should still prefer `lib/data/`.
- A new `lib/data/` query missing `userId` (or another ownership scope) as an explicit
  argument, letting a caller construct an unscoped query

### Forms and validation
- Form without a Zod schema in `lib/validations/<area>.ts`, exporting both the schema and its
  inferred type
- Schema defined but not wired through `useForm<Values>({ resolver: zodResolver(schema), ... })`
- Manual `onChange` state management instead of react-hook-form's `register` / `Controller`
- Not using the shadcn `Field` primitives (`FieldGroup` → `Field` → `FieldLabel` / `Input` /
  `FieldError`), or missing `data-invalid` / `aria-invalid` wiring
- Missing `<form noValidate>` — zod owns validation, not the browser
- Client-only validation with no matching `safeParse` of the same schema in the route handler
- Submit failures not surfaced via `setError('root', ...)`
- Submit button not disabled on `isSubmitting`

### Client state
- `useState` reached for past the point it should be Zustand — shared across components that
  are not parent/child, state that must survive navigation, or a `useState` cluster several
  components read and write
- Context or `useReducer` used for shared state instead of Zustand (project convention:
  Zustand, not Context/useReducer, once `useState` outgrows it)
- A Zustand store selecting the whole store instead of a narrow slice
  (`useThingStore((s) => s.field)`)
- Server state (session data, per-request data) mirrored into a Zustand store instead of read
  from `auth()` / `useSession()` or fetched server-side
- Note: no Zustand store exists in this codebase yet — flag the *pattern*, not a missing
  dependency

### Tables
- A dynamic table (sorting, filtering, pagination, row selection, column visibility)
  hand-rolled instead of using TanStack Table v9 (`@tanstack/react-table`,
  `useTable`/`features`, not v8's `useReactTable`)
- A static, non-interactive table over-engineered with TanStack Table — a plain `<table>` is
  correct there
- Note: no TanStack Table usage exists in this codebase yet — flag the *pattern* when a table
  gains real interactivity, not a missing dependency

### Toasts
- `react-hot-toast` usage — removed from this project; `sonner` is the only toast library
- A toast used as the only signal that something happened, with no in-place state change
  (a toast confirms; it doesn't replace showing state)

### Styling
- Inline `style={{}}` props where a Tailwind class would do
- A `tailwind.config.ts` / `tailwind.config.js` file — Tailwind v4 is CSS-first, config lives
  in the `@theme inline` block in `app/globals.css`
- Custom components placed in `components/ui/` — that folder is shadcn CLI output only, added
  via the CLI, never hand-written
- Literal colors (`text-blue-600`, `bg-white`) instead of theme tokens (`bg-background`,
  `text-foreground`, `border-border`, etc.) — literals ignore the `.dark` variant. Off-palette
  brand accents (gradients, feature icons) are the deliberate exception, but still need an
  explicit `dark:` variant.

### Error handling
- A catch block that logs but doesn't return a response — every code path in a route handler
  must respond
- Internal error detail (exception message, stack) returned to the client instead of a
  generic message — `console.error` the real error server-side only
- A distinguishing error added to an auth failure path (`authorize()` must stay uniform across
  unknown email / passwordless / wrong password, to avoid account enumeration)

### General
- Commented-out code blocks
- Unused imports
- `console.log` statements left in
- `@ts-ignore` or `@ts-expect-error` without explanation
- Comments explaining *what* the code does instead of *why* — this repo's comment convention
  is sparse and explanatory, only added when the reason isn't visible in the code

---

## Mode

**Default (no argument / "check"):**
- Scan `frontend/app/`, `frontend/components/`, and `frontend/lib/` and report all findings
- Group findings by category
- Do not modify any files

**If asked to "fix":**
- First report all findings grouped by category with numbered items
- Ask: "Which items would you like me to fix? (enter numbers like 1,3,5 or 'all' or 'none')"
- Wait for confirmation before changing anything
- Apply only the approved fixes
- Report what changed
