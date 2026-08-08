import { execSync } from 'node:child_process';

/**
 * Prepares the test schema before any spec runs: applies migrations, then
 * seeds the admin and default users the auth specs sign in as.
 *
 * DATABASE_URL comes from .env.test and must end in ?schema=test — that
 * parameter is what keeps these writes out of the development data.
 */
export default function globalSetup(): void {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not set. Copy .env.example.test to .env.test.');
  }

  // Guard against pointing the suite at development data: seeding wipes
  // nothing, but the specs create users and would pollute `public`.
  if (!/[?&]schema=/.test(databaseUrl)) {
    throw new Error(
      'DATABASE_URL in .env.test must specify a schema (e.g. ?schema=test) ' +
        'so tests do not write to the development schema.',
    );
  }

  const env = { ...process.env, DATABASE_URL: databaseUrl };

  // migrate deploy, not migrate dev: it never prompts and never resets.
  execSync('bunx prisma migrate deploy', { env, stdio: 'inherit' });
  execSync('bunx prisma db seed', { env, stdio: 'inherit' });
}
