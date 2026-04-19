# Stacklite

Stacklite is a Next.js + Supabase freelancer workspace built around five modules:

- Client Manager
- Time Tracker
- Contract Generator
- Invoice Generator
- Income Tracker

## Current State

The app is in active development with core auth and data foundations in place.

- Auth is implemented with Supabase Auth (email/password + social providers), callback routes, and protected dashboard routes.
- Client Manager is persisted and supports create, read, update, delete, and search.
- Time Tracker is persisted and supports running timers, manual entries, pause/resume/stop, and editing.
- Contract Generator supports guest + authenticated draft flows with persistence, PDF/export flow, and share-token route support.
- Invoice Generator supports guest + authenticated draft flows, itemized totals, payment status updates, and share-token route support.
- Income Tracker is data-driven from invoice/client data and provides period-based earnings/outstanding insights.
- Guest mode is supported via Zustand persist; hooks are guest-aware and switch between local guest state and Supabase.
- **Cookie consent** (`components/legal/CookieBanner.tsx`, `lib/cookieConsent.ts`): Accept/Decline persists across reloads using `sessionStorage` (same tab), `localStorage`, and a first-party cookie; signed-in users sync to `cookie_consents` via `hooks/useAuth.ts`. Plausible custom events (`lib/analytics.ts`) run only after acceptance.
- **SEO surfaces:** `app/sitemap.ts` and `app/robots.ts` expose `/sitemap.xml` and `/robots.txt` for crawlers.

## Stack

- Next.js 16 (App Router)
- React 19
- TypeScript (strict)
- Tailwind CSS v4
- Supabase SSR + Supabase JS
- React Query
- Zustand
- Zod
- Vitest

## Project Layout

```text
app/                    App Router routes, layouts, sitemap.ts, robots.ts
components/             UI, layout, workspace, feature modules, legal (banner, Plausible)
hooks/                  React Query and app hooks
lib/                    API, validation, cookieConsent, analytics, Supabase clients
stores/                 Zustand stores
supabase/migrations/    Database schema and follow-up migrations
tests/                  Unit tests
docs/                   Optional planning notes (gitignored; not maintained as shipped docs)
codebase-tree.md        Auto-generated file map (`npm run tree:update`)
```

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Configure `.env.local` using `.env.example` and Supabase project credentials.

3. Apply migrations in order:

- `supabase/migrations/20260212000000_initial_schema.sql`
- `supabase/migrations/20260214000000_extend_clients_profile.sql`
- `supabase/migrations/20260401000000_extend_contracts.sql`
- `supabase/migrations/20260403000000_backfill_share_tokens.sql`
- `supabase/migrations/20260404000000_invoices_clean.sql`
- `supabase/migrations/20260406000000_cookie_consents.sql`

4. Start the development server:

```bash
npm run dev
```

5. Open `http://localhost:3000`.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run type-check
npm run test
npm run test:watch
npm run tree:update
```

## Route Map

### Public

- `/` landing page
- `/privacy` privacy page
- `/terms` terms page
- `/support` support page

### Auth

- `/login`
- `/signup`
- `/auth/reset-password`
- `/auth/callback` (route handler)
- `/auth/signout` (route handler)
- `/auth/delete-account` (route handler)

### Dashboard

- `/dashboard`
- `/clients`
- `/time`
- `/contracts`
- `/invoices`
- `/income`

### Public Share Pages

- `/c/[token]` contract share view
- `/i/[token]` invoice share view

## Security and Data Rules

- Supabase Row Level Security (RLS) is required for user-isolated tables.
- Input is validated with Zod in app flows.
- Guest mode never relies on service-role access from client code.
- Sensitive keys remain in environment variables.

## Reference Docs

- [codebase-tree.md](./codebase-tree.md) — auto-generated file map (`npm run tree:update`)
- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
- [SECURITY_AUDIT.md](./SECURITY_AUDIT.md)
- [TESTING.md](./TESTING.md)
- [designsystem.md](./designsystem.md)
- [.github/copilot-instructions.md](./.github/copilot-instructions.md)

Planning and exploration notes may live under `docs/` locally (see `.gitignore`); they are **not** treated as canonical product documentation.
