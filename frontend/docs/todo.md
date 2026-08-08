# TODO

Known gaps found while working on something else. Each entry states what is wrong, how it
was verified, and why it was not fixed at the time.

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

## Free-tier limit is not enforced

The landing page advertises 3 validations per month, and
`lib/constants.ts` exports `FREE_TIER_MONTHLY_LIMIT = 3`, but nothing reads it
server-side. `UsageLog` rows are created with `validationCount: 0` at registration and
never incremented.

`SubscriptionStatusCard` renders the limit and the progress bar from props, so the UI is
ready; the enforcement is not. This lands with the report pipeline, since there is nothing
to count yet.

## `context/current-feature.md` is stale

Still reads "Not Started" while several features have shipped. The workflow in
`context/ai-interaction.md` expects it to be updated at steps 1 and 10 of each change.
