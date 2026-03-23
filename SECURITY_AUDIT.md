# Stacklite Security Audit

Last updated: 2026-03-23

This document is the required security audit baseline for Stacklite. It is intended to be used as both:

- the project security standard
- the repeatable audit checklist before release

Stacklite handles authentication data, client records, contracts, invoices, and time logs. That makes data isolation, secret handling, and input validation mandatory controls rather than optional hardening.

## 1. Scope

This audit applies to:

- Next.js application code under `app/`, `components/`, `hooks/`, `lib/`, and `stores/`
- Supabase auth/session handling
- Supabase database schema and RLS policies
- local environment and secret handling
- dependency and build-time security checks

## 2. Security Objectives

The project must preserve the following:

- Users can only access their own data
- Secrets are never exposed to the browser
- Auth sessions are managed by Supabase and server cookies, not manual token storage
- All user-controlled inputs are validated before database writes
- Sensitive business data is not unnecessarily persisted in browser storage
- Production builds complete without framework security/runtime violations

## 3. Threat Model

Primary risks for this project:

- Cross-user data leakage from missing or broken RLS
- Secret exposure through frontend code or committed config
- Client-side auth-only protections that can be bypassed
- Unsafe input reaching database writes, future PDF generation, or rendered HTML
- Supply-chain issues from vulnerable dependencies
- Sensitive data leakage via browser persistence

## 4. Required Controls

### 4.1 Authentication and Session Controls

- Route protection must be enforced in middleware/proxy, not only in the client
- Supabase session refresh must happen through the SSR middleware path
- Authenticated redirects must prevent signed-in users from returning to auth screens
- No manual JWT storage in `localStorage`, `sessionStorage`, or custom cookies

Current evidence:

- Middleware session handling exists in `lib/supabase/middleware.ts`
- Request interception exists in `proxy.ts`
- Auth flows exist in `app/(auth)/login/page.tsx` and `app/(auth)/signup/page.tsx`

### 4.2 Database Isolation Controls

- Every user-owned table must have `user_id`
- RLS must be enabled on all user-owned tables
- Policies must restrict access to `auth.uid()`
- Child tables without direct `user_id` must still be constrained through parent ownership

Current evidence from migrations:

- `profiles`, `clients`, `contracts`, `invoices`, and `time_logs` have RLS enabled
- `invoice_items` is protected through an ownership check against `invoices.user_id`
- Schema defined in `supabase/migrations/20260212000000_initial_schema.sql`

### 4.3 Secret Handling Controls

- `SUPABASE_SERVICE_ROLE_KEY` must never be imported into browser code
- Public env vars must only contain the Supabase URL and anon key
- `.env.local` must not be committed
- Error messages may instruct setup, but must not print live secrets

Current evidence:

- `.env.example` documents the service role key as server-side only
- No service-role usage was found in app code during the local scan

### 4.4 Input Validation Controls

- All write paths must validate payloads with Zod
- Validation must normalize optional empty strings to `null` where relevant
- Free text must be treated as untrusted input for future PDF/export work
- No raw HTML rendering of user content

Current evidence:

- Client validation in `lib/validations/client.ts`
- Time log validation in `lib/validations/timeLog.ts`
- Write paths use validated payloads in `lib/api/clients.ts` and `lib/api/timeLogs.ts`
- No `dangerouslySetInnerHTML` usage found in the local scan

### 4.5 Client-Side Persistence Controls

- Auth/session tokens must not be stored manually
- Sensitive business data should not be stored client-side unless there is a clear reason and explicit data classification review

Current evidence:

- No manual token storage found
- A persisted Zustand timer store exists in `stores/timerStore.ts` using `localStorage`

Required follow-up:

- Confirm whether `stores/timerStore.ts` is still active runtime code or legacy/local-only state
- If active, review whether `taskName`, `notes`, and `clientName` are acceptable to persist in browser storage

### 4.6 Dependency and Build Controls

- Lint, type-check, unit tests, and production build must pass
- Dependency vulnerability audit must be run regularly
- High-severity dependency issues must be triaged before release

## 5. Audit Procedure

Run this audit before release and after any auth, data-layer, or dependency change.

### 5.1 Local Verification Commands

```bash
npm run lint
npm run type-check
npm run test
npm run build
```

### 5.2 Static Security Search

```bash
rg -n "SUPABASE_SERVICE_ROLE_KEY|service_role|dangerouslySetInnerHTML|localStorage|sessionStorage|document.cookie|innerHTML\\s*=|eval\\(|new Function\\(" app components hooks lib stores
```

### 5.3 Dependency Audit

```bash
npm audit
```

### 5.4 Manual Supabase Review

These checks cannot be fully verified from the repo alone:

- Confirm RLS is enabled in the active Supabase project
- Confirm policies are present on every table in production
- Confirm OAuth providers use correct redirect URIs
- Confirm email confirmation policy is correct for the deployment environment
- Confirm no extra SQL policies or functions were added manually outside migrations

## 6. Pass / Fail Checklist

### Release blockers

- [ ] RLS missing or disabled on any user-owned table
- [ ] Any path exposes the service role key to the client
- [ ] Any write path bypasses Zod validation
- [ ] Any user content is rendered through raw HTML injection
- [ ] Production build fails
- [ ] High-severity dependency issue is present without documented mitigation

### Required manual confirmation

- [ ] Supabase production project matches migration-defined RLS and schema
- [ ] OAuth redirect URIs are correct
- [ ] Auth email and session settings are correct for environment
- [ ] Browser persistence contains no unacceptable sensitive data

## 7. Audit Snapshot: 2026-03-23

### Local checks run

- `npm run lint` -> passed
- `npm run type-check` -> passed
- `npm run test` -> passed
- `npm audit` -> failed with 2 dependency advisories

### Static scan observations

- No `dangerouslySetInnerHTML` found
- No service-role key usage found in app/runtime code
- No manual JWT or cookie persistence found
- `stores/timerStore.ts` persists timer data via `localStorage`; this needs classification review

### Architecture observations

- Auth protection is enforced in middleware/proxy
- Supabase clients fail fast when env vars are placeholders
- Client and time-log writes use Zod validation before mutation
- Database migrations define RLS policies for the main tables

### Open items

- Triage and remediate current dependency advisories:
  - `flatted@3.4.1` via `eslint -> file-entry-cache -> flat-cache -> flatted` reported as high severity
  - `next@16.1.6` reported with moderate-severity advisories; npm indicates `next@16.2.1` as the fix target
- Manually confirm production Supabase settings and effective RLS in the live project
- Decide whether the persisted timer store is acceptable, legacy, or should be removed

### Dependency audit details

Observed from `npm audit` on 2026-03-23:

- High: `flatted <=3.4.1` prototype pollution
- Moderate: `next 16.0.0-beta.0 - 16.1.6` advisory set covering request smuggling, image cache growth, buffering DoS, and null-origin CSRF bypass cases

Current assessment:

- This audit is not clean today
- The dependency findings should be treated as release-signoff blockers until triaged or upgraded

## 8. Recommended Ongoing Cadence

- On every PR touching auth, database access, validation, or dependencies:
  - run the full local verification commands
  - rerun the static security search
- Before each release:
  - run `npm audit`
  - verify Supabase policies/settings in the target environment
  - review browser persistence usage

## 9. Ownership

Security sign-off for this project should include:

- application code review
- schema and RLS review
- dependency audit review
- deployment configuration review

No release should be treated as complete until all release blockers are cleared and all required manual confirmations are checked.
