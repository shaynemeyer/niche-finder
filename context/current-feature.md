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

Next, in order:

1. `/dashboard/reports` and `/dashboard/reports/[id]` — both are linked from
   `RecentReports` and currently 404. The detail page must handle `PENDING`/`PROCESSING`
   and respect `isFallback` and `partialData`.
2. Run the pipeline for real once. Every test mocks or intercepts the services, so no
   validation has yet called Trends and OpenAI end to end.
3. Replace the placeholder props on `/admin` with real queries.
4. Reddit analysis, competition, and PDF export — none started.

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
