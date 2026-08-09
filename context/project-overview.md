## Project Specifications

**NicheFinder** — AI-powered niche and market validation. A user enters a niche idea and gets
back a research report combining Reddit community analysis, Google Trends demand data,
competition insights, and AI-generated strategy.

Single Next.js 16 app in `frontend/`. There is no separate backend.

**Current state:** authentication is built and working (credentials sign-in, registration,
JWT sessions, role-based redirects). The data model is complete and migrated. The user and
admin dashboards are built as presentational shells — the components exist and take typed
props, but every value is a placeholder because no data layer feeds them yet.

The report pipeline is partly started: `lib/googleTrends.ts` wraps the Google Trends API
with typed responses and is unit tested, but nothing calls it. `openai`, `axios`,
`recharts`, `jspdf`, and `node-cron` remain installed and unused.

---

## Problem (Core Idea)

People validate business/content niches by guesswork. NicheFinder replaces that with
evidence: real community pain points, real search demand, real competition, synthesized into
a scored report with a go-to-market recommendation.

---

## Users

- **Indie founders / solopreneurs** evaluating whether a niche is worth entering
- **Content creators** picking a topic with demand and low saturation
- **Admins** (internal) — approve or reject bank-transfer payment requests, manage users

Roles are `USER` and `ADMIN` (`Role` enum). Admins are routed to `/admin`; everyone else to
`/dashboard`.

---

## ✨ Core Features

Built:

- Email/password registration (`POST /api/register`) with bcrypt hashing, auto-provisioning a
  FREE subscription and a usage log row
- Credentials sign-in via NextAuth v5, JWT session strategy
- Route protection by session and role (`app/dashboard`, `app/admin`)
- Light/dark theming via `next-themes`

Planned (not implemented):

- **Reddit analysis** — pain points and sentiment across relevant subreddits
- **Google Trends** — search volume, growth, seasonality
- **AI insights** — market analysis and opportunity assessment (OpenAI)
- **Full reports** — competition, monetization, and GTM strategy, exportable to PDF
- **Usage limits** — FREE tier allows 3 validations/month; PRO is unlimited
- **Payment requests** — bank-transfer flow with invoice upload and admin approval

---

## Architecture direction

Single Next.js app today, but built so the backend can move. The goal is a clean
frontend/backend split: if this later becomes a React frontend against FastAPI (or any
other backend), the change should be contained rather than a rewrite.

What that means in practice:

- **Database access lives in `lib/data/`.** Pages and route handlers call functions there;
  only that layer talks to Prisma. A backend move rewrites those functions to `fetch` from
  the new service, and callers stay as they are. Enforced by ESLint for pages — see
  `coding-standards.md`.
- **`app/api/*` route handlers are the seam.** They already speak HTTP with a JSON
  contract, so they are the natural proxy layer if Next stays as a BFF (Backend For
  Frontend) in front of another service.
- **Not yet done:** the write path. `app/api/validate` and `app/api/register` still query
  Prisma directly. They should move behind `lib/data/` as that layer grows.
- **Undecided:** whether a future React frontend authenticates against Next (BFF, keeping
  NextAuth) or directly against the new backend (which would also mean porting session
  handling). This choice decides how much of `lib/auth.ts` is migration debt.

---

## Data Model

Defined in `frontend/prisma/schema.prisma`. PostgreSQL, Prisma 7, UUIDv7 primary keys.

**Auth (NextAuth/`@auth/prisma-adapter` shapes):** `User`, `Account`, `Session`,
`VerificationToken`, `Authenticator`.

**Domain:**

| Model            | Purpose                | Key fields                                                                     |
| ---------------- | ---------------------- | ------------------------------------------------------------------------------ |
| `User`           | Account + role         | `email` (unique), `password` (bcrypt, nullable for OAuth), `role`              |
| `Subscription`   | One per user           | `planType` (FREE/PRO), `isActive`, `endDate`                                   |
| `UsageLog`       | Monthly quota tracking | unique on `(userId, month, year)`, `validationCount`                           |
| `Report`         | A validation run       | `niche`, `keyword`, `status`, `overallScore`, `viabilityRating`, `summaryText` |
| `PaymentRequest` | Bank-transfer upgrade  | `transactionId`, `invoicePath`, `status`, `rejectedReason`                     |

`Report` stores its analysis in JSONB columns: `trendsData`, `aiInsights`,
`competitionData`, `monetizationIdeas`, `gtmStrategy`. See
`frontend/docs/jsonb-indexing.md` for searchability and indexing notes on these.

Enums: `Role`, `PlanType`, `PaymentStatus`, `ReportStatus`.

All child relations cascade on user delete.

---

## Tech Stack

| Layer                  | Choice                                                                   |
| ---------------------- | ------------------------------------------------------------------------ |
| Framework              | Next.js 16 (App Router), React 19                                        |
| Language               | TypeScript 5, `strict: true`                                             |
| Styling                | Tailwind CSS v4 (CSS-first, no config file), `tw-animate-css`            |
| UI                     | shadcn/ui (style `radix-nova`, base neutral), `radix-ui`, `lucide-react` |
| Forms                  | react-hook-form + zod via `@hookform/resolvers`                          |
| Auth                   | NextAuth v5 beta, credentials provider, `@auth/prisma-adapter`, bcryptjs |
| Database               | PostgreSQL via Prisma 7 with the `@prisma/adapter-pg` driver adapter     |
| Notifications          | sonner / react-hot-toast                                                 |
| Charts (planned)       | recharts                                                                 |
| AI (planned)           | openai                                                                   |
| Data sources (planned) | google-trends-api, axios                                                 |
| Export (planned)       | jspdf, jspdf-autotable                                                   |
| Scheduling (planned)   | node-cron                                                                |
| Package manager        | bun 1.3.8                                                                |
| Tests                  | Vitest 4 (unit), Playwright (E2E)                                        |
| State (planned)        | Zustand, when `useState` is not enough                                   |
| Tables (planned)       | TanStack Table v9                                                        |

Prisma 7 specifics that break v6 habits: the datasource block holds `provider` only (the URL
lives in `prisma.config.ts`), the generator is `prisma-client` with a required `output`
(`lib/generated/prisma`, gitignored), and the client requires an explicit driver adapter —
there is no zero-arg `new PrismaClient()`.
