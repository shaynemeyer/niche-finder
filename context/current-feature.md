# Current Feature

Report pipeline — Google Trends

## Status

<!-- Not Started|In Progress|Complete -->

In Progress

## Goals

Turn a niche and keyword into a stored `Report`. The first data source is Google Trends;
Reddit, competition and AI insights follow.

Done:

- `lib/googleTrends.ts` — typed wrapper over `google-trends-api` with interest over time,
  related queries, regional interest, and a combined `analyzeKeyword`. Unit tested.
- `types/google-trends-api.d.ts` — ambient declarations; the package ships none and has no
  `@types` on npm.

Next, in order:

1. A route handler that takes `{ niche, keyword }`, calls `analyzeKeyword`, and writes a
   `Report` row. `lib/validations/report.ts` already has the schema.
2. Wire `ValidationForm`'s `onSubmit` to it — it currently reports that validation is
   unavailable.
3. Enforce `FREE_TIER_MONTHLY_LIMIT` server-side, incrementing `UsageLog.validationCount`.
4. Replace the placeholder props on `/dashboard` and `/admin` with real queries.

## Notes

`analyzeKeyword` returns `partial: true` when any upstream call fails, so a Trends outage is
not mistaken for a keyword with no demand. Anything rendering a report must respect that
flag rather than presenting incomplete figures as fact.

The three Trends calls are deliberately sequential with a 2s pause between them. They share
one upstream rate limit and `Promise.all` is what trips it, so an `analyzeKeyword` call takes
roughly six seconds — worth knowing before it goes behind a request handler.

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
