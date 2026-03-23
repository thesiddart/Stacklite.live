# Stacklite

Stacklite is a Next.js + Supabase freelancer workspace built around five modules:

- Client Manager
- Time Tracker
- Contract Generator
- Invoice Generator
- Income Tracker

## Current State

The codebase is beyond initial scaffolding, but not all modules are equally complete.

- Auth is implemented with Supabase Auth.
- Client Manager is wired to the database and supports create, read, update, and search flows.
- Time Tracker is wired to the database and supports running timers, manual entries, pause/resume/stop, and editing.
- Contract Generator, Invoice Generator, and Income Tracker currently exist as interactive drafting/dashboard scaffolds rather than fully persisted production modules.

## Stack

- Next.js 16 App Router
- React 19
- TypeScript with strict mode
- Tailwind CSS v4
- Supabase SSR + Supabase JS
- React Query
- Zustand
- Zod
- Vitest

## Project Layout

```text
app/                    Routes and layouts
components/             UI, layout, and feature modules
hooks/                  React Query and app hooks
lib/                    API, validation, types, utilities, Supabase clients
stores/                 Zustand stores
supabase/migrations/    Database schema and follow-up migrations
tests/                  Unit tests
```

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Configure `.env.local` using `.env.example`.

3. Apply the migrations in order:

- `supabase/migrations/20260212000000_initial_schema.sql`
- `supabase/migrations/20260214000000_extend_clients_profile.sql`

4. Start the dev server:

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
```

## Main Routes

- `/` landing page
- `/login` sign in
- `/signup` sign up
- `/dashboard` dashboard workspace
- `/clients` client manager
- `/time` time tracker
- `/contracts` contract drafting scaffold
- `/invoices` invoice drafting scaffold
- `/income` income tracker scaffold

## Reference Docs

- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
- [SECURITY_AUDIT.md](./SECURITY_AUDIT.md)
- [.github/copilot-instructions.md](./.github/copilot-instructions.md)
