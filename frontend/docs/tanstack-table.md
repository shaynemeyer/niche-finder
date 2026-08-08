# TanStack Table for dynamic tables

Decision record for how tables are built in this project. The standard itself lives in
`context/coding-standards.md` under "Tables" — this page covers the version detail and the
one trap worth knowing about.

## TL;DR

Use `@tanstack/react-table` v9 with the shadcn `table` primitive for any table that sorts,
filters, paginates, or selects rows. **Write v9 API (`useTable`), not v8
(`useReactTable`)** — most tutorials and blog posts still show v8, and the two are not
interchangeable.

Nothing is installed yet. There are no tables in the codebase at the time of writing; this
is a decision recorded ahead of the first one.

## Where it applies

The cases that motivated this:

- **Admin user list** — needs sorting and filtering at minimum, likely pagination
- **Reports list** (`/dashboard/reports`) — the `RecentReports` component on the dashboard
  shows a handful; the full list wants real table behaviour

A plain `<table>` remains fine for static markup. TanStack Table is for behaviour, not for
every grid of cells.

## Why TanStack Table

It is **headless**: it owns table state and gives typed APIs, and prescribes no markup or
styles. From the [docs](https://tanstack.com/table/latest): "TanStack Table supplies state
and typed APIs without prescribing a single element or style."

That matters here because the rendered `<table>` stays ours — same theme tokens, same
`cn()` composition, same shadcn primitives as the rest of the app. A batteries-included
grid component would fight the existing styling conventions.

## Versions (verified against the npm registry)

```json
{
  "@tanstack/react-table": "9.1.1",
  "peerDependencies": { "react": ">=18" }
}
```

React 19.2.8 satisfies the peer range. No overrides needed.

## The v8/v9 trap

`@tanstack/react-table@latest` resolves to v9, but until very recently shadcn's DataTable
documentation and examples were written against v8. Copying those docs while installing
`@latest` produced code that did not run.

This was tracked as [shadcn-ui#11389](https://github.com/shadcn-ui/ui/issues/11389) and
fixed by [PR #11399](https://github.com/shadcn-ui/ui/pull/11399), which rewrote the data
table docs for v9 and pinned older registries to v8. Merged **2026-08-06**; the issue is
closed.

**So the current shadcn data-table docs are v9 and safe to follow.** Older tutorials,
Stack Overflow answers, and anything written before August 2026 are almost certainly v8.

### Telling them apart

| v8 | v9 |
| --- | --- |
| `useReactTable` | `useTable` |
| `getCoreRowModel()` option | automatic, always included |
| `getSortedRowModel()` | `sortedRowModel: createSortedRowModel()` |
| `getFilteredRowModel()` | `filteredRowModel: createFilteredRowModel()` |
| `getPaginationRowModel()` | `paginatedRowModel: createPaginatedRowModel()` |

In v9 these live inside a single `features` option rather than being passed as separate
table options, which is what enables tree-shaking:

```tsx
import { useTable, tableFeatures, rowSortingFeature } from '@tanstack/react-table';

const table = useTable({
  features: tableFeatures({
    rowSortingFeature,
  }),
  columns,
  data,
});
```

Registering only the features a table uses is the point: roughly 6–7kb for a simple table
against 15–20kb for the v8 equivalent. `stockFeatures` restores the v8
everything-included behaviour at the cost of that saving — useful when migrating, not when
starting fresh.

Other v9 changes: state is backed by TanStack Store, so subscribe to slices via
`table.Subscribe` or a `useTable` selector instead of reaching for `React.memo`. Markup is
unchanged — `<table>`, `<thead>`, `<tr>`, `<td>` render exactly as before.

## When the first table is built

```bash
bunx shadcn@latest add table      # the presentational primitive
bun add @tanstack/react-table     # resolves to v9
```

Then follow the shadcn data-table docs, which are now v9-native. Expect a
`data-table-features.ts` alongside the table component — that is where feature
registration lives in the v9 examples.

## Sources

- [TanStack Table](https://tanstack.com/table/latest)
- [Migrating to TanStack Table V9 (React)](https://tanstack.com/table/latest/docs/framework/react/guide/migrating)
- [Announcing TanStack Table V9](https://tanstack.com/blog/announcing-tanstack-table-v9)
- [shadcn-ui#11389](https://github.com/shadcn-ui/ui/issues/11389) —
  [PR #11399](https://github.com/shadcn-ui/ui/pull/11399)
- Version and peer range read with `npm view @tanstack/react-table`, not from documentation.
