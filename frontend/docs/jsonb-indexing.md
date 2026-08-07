# JSONB fields on `Report`: searchability and indexing

Recommendation for the five `Json?` fields on the `Report` model — `trendsData`,
`aiInsights`, `competitionData`, `monetizationIdeas`, `gtmStrategy`.

## TL;DR

**Don't add a GIN index yet.** Promote values you filter or sort on into real columns
instead. Reach for GIN only for genuinely open-ended search inside a blob, and know that it
does *not* speed up Prisma's built-in JSON filters.

## Background: they're already JSONB

Prisma's `Json` type maps to `JSONB` on PostgreSQL automatically — there is no separate
`Jsonb` scalar to opt into. Verified from the DDL Prisma generates:

```sql
"trendsData" JSONB,
"aiInsights" JSONB,
"competitionData" JSONB,
"monetizationIdeas" JSONB,
"gtmStrategy" JSONB,
```

So binary storage, containment operators, and GIN-index eligibility are already available.
The slower text-based `json` type would require explicitly opting out with `@db.Json`, which
is rarely desirable.

## The actual problem

Prisma's generated client exposes a useful filter surface on these fields
(`JsonNullableFilterBase`): `path`, `equals`, `string_contains`, `string_starts_with`,
`array_contains`, `gt`/`gte`/`lt`/`lte`, and more. This works today:

```ts
prisma.report.findMany({
  where: { trendsData: { path: ['interest', 'trend'], equals: 'rising' } },
})
```

The results are correct. The problem is that this compiles to `jsonb` path extraction, which
**no index covers** — so it is a sequential scan over the entire `reports` table, degrading
linearly as report volume grows.

## Fix 1 (preferred): promote queried values to real columns

If a value is filtered or sorted on regularly, it should be a typed column, not a key buried
in a blob. A B-tree index on a real column outperforms any JSONB index, and you get type
safety at the same time.

The `Report` model already does this correctly:

```prisma
overallScore    Float?  @default(0)
viabilityRating String?
summaryText     String? @db.Text
```

Those were extracted out of the AI payload. Keep applying that instinct — repeatedly reaching
for `path:` in a `where` clause is the signal that a value wants to be a column.

JSONB remains the right choice for opaque provider payloads rendered whole (`trendsData`,
`aiInsights`). It is the wrong choice for anything you routinely sort or filter by.

## Fix 2: GIN index, for open-ended search only

Reserve this for "search inside the blob where the key isn't predictable." Prisma cannot
express a GIN index in the schema, so it requires a hand-edited migration:

```bash
bunx prisma migrate dev --create-only --name add_report_jsonb_gin
```

Then edit the generated SQL:

```sql
CREATE INDEX "reports_trendsData_gin_idx"
  ON "reports" USING GIN ("trendsData" jsonb_path_ops);
```

Apply with `bunx prisma migrate dev`.

### The trap: GIN does not accelerate Prisma's JSON filters

A GIN index only serves containment (`@>`) and key-existence (`?`, `?|`) operators. Prisma's
`path` + `equals` filter does **not** compile to `@>`, so the index above will not speed it
up. Using the index requires raw SQL:

```ts
await prisma.$queryRaw`
  SELECT * FROM reports
  WHERE "trendsData" @> ${JSON.stringify({ trend: 'rising' })}::jsonb
`
```

This mismatch — adding a GIN index and seeing no improvement because the ORM never emits the
operator it serves — is the most common mistake in this area.

### Operator class choice

- `jsonb_path_ops` — smaller and faster, but supports containment (`@>`) only.
- default `jsonb_ops` — also supports key-existence (`?`, `?|`, `?&`), at greater size.

Pick based on the query you actually have.

### `CONCURRENTLY`

`CREATE INDEX CONCURRENTLY` cannot run inside a transaction, and Prisma wraps migrations in
one. On an empty table, omit it. On a large live table, run it outside Prisma's migration
flow.

## Fix 3: full-text search

Searching report *prose* is a different problem. Use a `tsvector` generated column with a GIN
index on that column — not a GIN index on the JSONB.

## Why not now

At the time of writing:

- No code in `app/`, `lib/`, or `components/` reads any of the five JSON fields.
- `prisma/migrations/` does not exist — there is no baseline schema in a database yet.
- `Report` already has B-tree indexes on `userId`, `niche`, and `createdAt`, which cover the
  obvious first queries ("my reports, newest first").

An unused GIN index is not free: it slows every write and consumes space. Adding one before a
query exists is speculative optimization.

**Sequence:** create the initial migration (`bunx prisma migrate dev --name init`), build a
feature that reads reports, observe which access patterns recur, promote those to columns, and
only then consider GIN for whatever genuinely open-ended search remains.
