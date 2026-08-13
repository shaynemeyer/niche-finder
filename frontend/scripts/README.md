# Scripts

One-off maintenance scripts for local/manual use. Run from `frontend/` with `bun run <script>`.

## reset-user

Resets a test user back to a fresh FREE account: deletes their payment requests, reports,
and usage logs, and puts their subscription back to `FREE` / active / no end date — the
same shape `prisma/seed.ts` gives a newly registered user.

```bash
bun run reset-user <email>
```

Example:

```bash
bun run reset-user user@gmail.com
```

Exits with an error and does nothing if the email is missing or no user has it. Deletes are
permanent — there is no confirmation prompt, so double-check the email before running it
against anything other than a local/test database.
