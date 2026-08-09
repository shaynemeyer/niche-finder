# TODO

Known gaps found while working on something else. Each entry states what is wrong, how it
was verified, and why it was not fixed at the time.

Delete an entry when it is fixed. An entry that has been here a long time is either not
actually a problem — delete it — or is being avoided, which is worth naming.

## No rate limiting on authentication

Nothing limits repeated sign-in attempts, so passwords can be guessed as fast as the
network allows. This is the largest remaining weakness in the auth surface.

See `docs/auth-hardening-plan.md` for this and the rest of the auth work, prioritised.

## Auth pages configured but missing

`lib/auth.ts` points NextAuth at three custom pages, two of which do not exist:

```ts
pages: {
  signIn: '/signin',   // exists — app/(auth)/signin/page.tsx
  signOut: '/signout', // MISSING — 404
  error: '/error',     // MISSING — 404
},
```

Verified against the dev server:

```text
/signin  -> 200
/signout -> 404
/error   -> 404
```

**Impact is limited but real.** Neither route is reached by current code:

- Sign-out never hits `/signout`. `app/dashboard/layout.tsx` calls
  `signOut({ redirect: false })` and pushes to `/signin` itself, which bypasses NextAuth's
  own confirmation page.
- `/error` is where NextAuth redirects on an auth error it cannot handle inline — for
  example a misconfigured provider, or a callback failure. The credentials flow surfaces
  errors on the form instead, so this is currently unreachable in normal use.

The risk is that a future flow (OAuth provider, email verification) starts relying on
either page and lands on a 404 instead of a handled error.

**Options:** build the two pages, or drop the lines from the config so NextAuth falls back
to its built-in defaults. Dropping them is the smaller change and matches the project's
non-defensive style — build them when a flow actually needs them.

## Nothing meaningful to show a PRO user's plan

`PlanBadge` shows `Free · 1/3` with a progress bar, which is useful — the number has a
reference point and the bar implies scarcity. PRO shows only `Pro`, because a bare count
("3 this month") means nothing without something to compare it against, and inventing a
figure to fill the space is what got the old full-width card removed.

The candidate worth building is **the renewal date** — "Renews Sep 9", or "Expires in 12
days" as it approaches. It is the question a paying user actually has, and
`subscription.endDate` is already on the session, so it needs no query.

Blocked on there being a value: `endDate` is null on every account, because nothing sets
it. It should start being written when the `PaymentRequest` approval flow lands. Until
then a renewal line would render empty for everyone.

Rejected while deciding: a feature list, an "unlimited ✓" marker, or usage framed as
activity. The first two are the filler the old card was removed for; the third only becomes
interesting at volumes a solo user will not reach soon.

## Historical validations are uncounted

`claimMonthlyValidation` originally ran for free-tier users only, so PRO accounts never
incremented `UsageLog`. Fixed in `3fc4ed4`, but only for validations run after it — reports
created before that still are not reflected in the count.

Verified: `admin@gmail.com` has 3 reports against a `validationCount` of 0.

A backfill would set each user's count for the current month to their actual report count
for that month. Small and safe, but it rewrites usage data, so it wants a deliberate
decision rather than being folded into another change.

## `docs/lessons-learned.md` overlaps this file

Both record things worth remembering. The split intended: this file is open work someone
should pick up; `lessons-learned.md` is closed work worth not repeating. Entries that get
fixed should move there or be deleted, not left here.
