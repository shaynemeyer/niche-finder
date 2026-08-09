# Current Feature

Report pipeline — Google Trends

## Status

<!-- Not Started|In Progress|Complete -->

In Progress

## Goals

Turn a niche and keyword into a stored `Report`. The first data source is Google Trends;
Reddit, competition and AI insights follow.

Done:

- `lib/trends/` — typed wrapper over `google-trends-api` with interest over time, related
  queries, regional interest, and a combined `analyzeKeyword`. Unit tested. Needs no API
  key; the package scrapes public endpoints.
- `types/google-trends-api.d.ts` — ambient declarations; the package ships none and has no
  `@types` on npm.
- `lib/openai/` — market insights over the trends result, with model fallback and a
  built-in template when every model fails.
- `POST /api/validate` — claims the quota, writes a `PENDING` report, schedules the
  analysis with `after()`, returns 202. 22 unit tests.
- `ValidationForm` posts to it and stays on the dashboard; `ReportStatusPoller` refreshes
  while any report is unsettled. 7 E2E specs.
- `FREE_TIER_MONTHLY_LIMIT` enforced server-side, claimed before the analysis runs.
- `/dashboard` queries real reports and usage instead of placeholder zeros.
- Running reports show a spinner badge and an indeterminate progress bar; submitting
  raises a sonner toast. `Toaster` is mounted in `app/providers.tsx`.
- `/dashboard/reports/[id]` — placeholder showing niche, keyword, id and status. The
  query is scoped to the session user; 4 E2E specs cover the ownership boundary.
- `app/not-found.tsx` — 404 page for unmatched URLs and `notFound()` calls.
- **The pipeline runs end to end.** A live validation stores `isFallback: false`,
  `model: gpt-5-nano`, a real score and a ~1,000-word generated summary. Confirmed
  2026-08-09 against Trends and OpenAI, not mocks.
- `GET /api/reports` — the caller's reports as JSON, with `?status=` and a capped
  `?limit=`. 8 unit tests.
- **All database access is behind `lib/data/`.** Pages and route handlers call functions
  there; nothing under `app/` or `components/` imports Prisma, enforced by ESLint. See
  the architecture direction in `project-overview.md` for why.
- Route tests mock `lib/data` and cover the handler's own job — auth, validation, error
  mapping, response shape. Query and write shapes are tested in `lib/data/*.test.ts`.
  116 unit tests, 22 E2E.

Next, in order:

1. **`/dashboard/reports`** — a placeholder stub exists but is not wired up. It should
   list the caller's reports via `listReports`, and is linked from both "View All" and
   the sidebar. The dashboard's `RecentReports` is the component to reuse or extract
   from. `/dashboard/settings` is a stub too, with no design decided.
2. Build out `/dashboard/reports/[id]`. It must handle `PENDING`/`PROCESSING` and respect
   `isFallback` and `partialData` rather than presenting template output as analysis.
3. Replace the placeholder props on `/admin` with real queries.
4. Reddit analysis, competition, and PDF export — none started.

Dead links, all landing on the 404 page: `/admin/users`, `/admin/analytics`,
`/admin/settings`, `/admin/payment-requests`.

## Notes

`analyzeKeyword` returns `partial: true` when any upstream call fails, so a Trends outage is
not mistaken for a keyword with no demand. Anything rendering a report must respect that
flag rather than presenting incomplete figures as fact.

The three Trends calls are deliberately sequential with a 2s pause between them. They share
one upstream rate limit and `Promise.all` is what trips it, so an `analyzeKeyword` call takes
roughly six seconds. Trends plus OpenAI is roughly ten, which is why the route returns 202
and runs the analysis in `after()` rather than holding the request open.

`after()` rather than a floating promise: the callback runs inside the route's
`maxDuration`, whereas an un-awaited call can be frozen the moment the response is sent,
leaving reports stuck `PENDING` with no error recorded anywhere.

**A score is stored only when it came from real analysis of real data.** The model withholds
one when trends data is `partial`; the fallback template's score is a heuristic that would
render identically to a genuine one, so `isFallback` withholds it too. `overallScore` and
`viabilityRating` are both null in that case, and the report still completes so the trends
half is not discarded.

The quota is claimed before the analysis rather than incremented after it — incrementing
afterwards lets two concurrent requests both read an under-limit count and proceed. A
request that exceeds the limit releases the slot it claimed. A `FAILED` report still
consumes one; whether that should be refunded is undecided.

`docs/report-queue-design.md` records the queue this becomes when upstream rate limits or
invocation cost start to bind, and why neither is the constraint yet.

**The gpt-5 models are reasoning models, and two settings follow from that.** Never send
`temperature`: they accept only the default of 1 and reject any explicit value with a 400.
And `max_completion_tokens` covers internal reasoning *plus* the visible response, with
reasoning charged first — at the old 800-token ceiling reasoning consumed the whole budget
and the API returned `finish_reason: "length"` with empty content. Both failures took out
every model in the chain and silently dropped every report to the boilerplate template.
`lib/openai/index.test.ts` guards both.

See `docs/lessons-learned.md` for the full write-up of these and how they were found.

**Adding a query means adding a function to `lib/data/`, not calling Prisma.** ESLint
blocks the import anywhere under `app/` or `components/`. Pass `userId` as an argument so
the ownership scope is part of the signature rather than a `where` clause a caller can
forget — `getReport(id, userId)` is the shape. Test the query in `lib/data/*.test.ts` and
mock `lib/data` in the route or page test.

The Prisma client is generated as CommonJS (`moduleFormat = "cjs"`), because `package.json`
declares no `"type": "module"`. ESM output could not be imported from Playwright specs at
all. `lib/generated/prisma` is gitignored, so pulling a schema change needs
`bunx prisma generate` — the schema alone does not update a local client.

`notFound()` in a streamed dynamic route responds **200** and renders the not-found body, so
an E2E spec must assert on content rather than a 404 status.

Two bugs so far have been invisible to the test suite and caught only by running the
pipeline against the real services. Prefer one real run over another mock.

## History

<!-- Keep this updated. Earliest to latest -->

- `b4fb5ef` dark mode and component split for the user dashboard
- `6526648` ValidationForm moved onto the react-hook-form + zod pattern
- `520bd63` Storybook implementation plan (not implemented)
- `be3531c` sign out wired up in the dashboard layout
- `86357ff` `docs/todo.md` recording known gaps
- `9daa353` standardised on TanStack Table and Zustand
- `5fb45af` admin sign-in page — later removed
- `abb98ac` `docs/auth-hardening-plan.md`
- `226960b` role-based redirect in `/signin`; dropped the separate admin login
- `858ca58` dark mode and component split for the admin dashboard
- `32ef125` Google Trends service with typed responses and unit tests
- `3abb4c9` AI service modules split; two OpenAI API mismatches fixed
- `79837b6` default models changed to gpt-5-nano / gpt-5-mini
- `3a14aaa` OpenAI model test aligned with the current default
- `f14eeb4` validation pipeline wired to the dashboard: `POST /api/validate`, quota
  enforcement, real dashboard queries, status polling
- `bdb4e7f` E2E coverage for the validation form
- `c948db9` dropped the hardcoded `temperature` that gpt-5 models reject — every report
  had been silently falling through to the fallback template
- `a178650` Prisma client emitted as CommonJS to match the project's module system
- `dff33d0` spinner badge, indeterminate progress bar and submit toast for running reports
- `74a5839` placeholder `/dashboard/reports/[id]` with an ownership-scoped query, plus a
  404 page and 4 access-control E2E specs
- `ed52ce2` raised the token budget so gpt-5 reasoning leaves room for a response — the
  last of three silent bugs between the pipeline and real insights
- `af55d05` submit buttons sized and stopped from stretching; contrast measured, not guessed
- `274d070` admin and user areas linked in both directions, gated on role
- `GET /api/reports`, `lib/data/` for every query, and an ESLint rule keeping Prisma out
  of `app/` — the first step toward a backend that can move
- `d3a7698` route tests retargeted at `lib/data`; query and write shapes now tested where
  they live
