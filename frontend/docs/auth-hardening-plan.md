# Auth hardening plan

Plan for strengthening authentication. Not implemented — this is a prioritised list with
the reasoning for each item, to be picked up as its own piece of work.

## TL;DR

**Rate limiting is the one that matters.** Everything else on this page is a refinement of
an auth surface that is already sound in its fundamentals. Do item 1 first; items 2–4 are
worth doing but none of them is load-bearing on their own.

## What is already right

Worth stating, so none of it gets "fixed" into something weaker:

- **Passwords** are bcrypt at cost 12 (`app/api/register/route.ts`), and the hash is never
  selected back out (`omit: { password: true }`).
- **Account enumeration is prevented by design.** `verifyCredentials()` returns `null`
  identically for unknown email, passwordless (OAuth-only) account, and wrong password.
  Sign-in and admin sign-in both surface a single "Invalid email or password".
- **Authorization is enforced at the resource, not the door.** `proxy.ts` guards
  `/dashboard/:path*` and `/admin/:path*`, and `app/admin/page.tsx` and
  `app/dashboard/page.tsx` each re-check `auth()` themselves. A login page is not a
  security boundary; these are.
- **Sessions** are JWT with an explicit `maxAge`.

## 1. Rate limiting (highest value)

Nothing limits repeated sign-in attempts. The credentials callback can be hit without bound,
so passwords can be guessed as fast as the network allows. Uniform failure messages stop an
attacker learning *which* accounts exist, but do nothing to stop them guessing passwords for
an account they already know — and `admin@` addresses are guessable.

**Apply it at the credentials callback, not per page.** A limiter attached to the sign-in
page is bypassed by posting directly to `/api/auth/callback/credentials`, and by any future
login surface.

Shape:

- Per-IP limit with backoff, to blunt spray attacks.
- Per-account limit with a lockout window, to blunt targeted guessing. Store the counter and
  lockout expiry on `User` so it survives a process restart — an in-memory limiter resets on
  every deploy, and Next.js serverless instances do not share memory.
- Return the *same* uniform error when locked out. A distinct "account locked" message
  reintroduces enumeration through a side door.

## 2. Close the timing side-channel

`verifyCredentials()` returns early when the email is unknown:

```ts
const user = await prisma.user.findUnique({ where: { email } });
if (!user?.password) {
  return null;          // returns immediately
}
const isPasswordValid = await bcrypt.compare(password, user.password);
```

A known email runs a bcrypt comparison (deliberately slow at cost 12); an unknown one does
not. The response *bodies* are identical, but the response *times* need not be — which
partially undoes the enumeration protection the function's own comment describes.

Fix: compare against a dummy hash when no user is found, so both paths spend roughly the
same time. Cheap to do and does not change behaviour.

**Not yet measured.** An attempt to time this through `/api/auth/callback/credentials` was
rejected by CSRF before `authorize()` ran, so both paths returned in ~4ms and measured
nothing. Confirm with a real signed request, or by calling `verifyCredentials()` directly in
a test, before assuming the gap is exploitable in practice.

## 3. Generic-message audit for future auth surfaces

The uniform-error property is currently held by convention, not by a test. Anyone adding a
password reset, email verification, or OAuth link flow can reintroduce enumeration without
noticing — a reset form that says "no account with that email" leaks exactly what
`verifyCredentials()` is careful not to.

Worth an E2E spec asserting that the visible message is byte-identical for a real address
with a wrong password and an address that does not exist. `e2e/auth.spec.ts` already covers
this for `/signin`; extend it to any new flow.

## 4. Session and cookie review

Not audited yet, listed so it is not forgotten:

- Confirm `AUTH_SECRET` is set in every deployed environment and is not the development
  value.
- Confirm cookies are `Secure` and `SameSite` in production. NextAuth's defaults are
  sensible; the point is to verify rather than assume.
- Consider whether a 30-day session is right for `ADMIN`. A shorter `maxAge` for
  privileged roles limits the value of a stolen token, at some usability cost.

## Explicitly not doing: a separate, role-gated admin login

A dedicated admin login page that rejects non-admins sounds safer and is not. To reject
someone by role, the password must be verified first — so a valid-password-wrong-role
response becomes distinguishable from a wrong-password response, by message, timing, or
behaviour. That is an oracle telling an attacker precisely which accounts hold `ADMIN`,
which is a targeted phishing list.

It also buys nothing. `proxy.ts` and `app/admin/page.tsx` already stop non-admins reaching
any admin route, whichever page they signed in from — a login page is not a security
boundary.

A branded `/admin-login` page was built and then removed: it authenticated through the same
provider with the same uniform errors, so the only real difference was where it redirected
on success. That belongs in `/signin`, which now sends `ADMIN` users to `/admin` and
everyone else to `/dashboard`.

## Sources

- Current behaviour read from `lib/auth.ts`, `proxy.ts`, `app/api/register/route.ts`, and
  `app/admin/page.tsx` in this repository.
- Enumeration and lockout guidance follows OWASP's authentication guidance:
  <https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html>
