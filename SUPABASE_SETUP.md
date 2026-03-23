# Supabase Setup

Stacklite expects a Supabase project with Auth enabled and both project migrations applied.

## Required Environment Variables

Set these in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Required Migrations

Apply these in order:

1. `supabase/migrations/20260212000000_initial_schema.sql`
2. `supabase/migrations/20260214000000_extend_clients_profile.sql`

The active schema should include:

- `profiles`
- `clients`
- `contracts`
- `invoices`
- `invoice_items`
- `time_logs`

## Auth Expectations

- Email/password flow is supported
- Google OAuth UI is present
- Apple OAuth UI is present
- Protected routes are enforced through the project middleware

## Verification

After setup:

1. Run `npm run dev`
2. Create an account at `/signup`
3. Confirm `/dashboard` is accessible after auth
4. Create a client at `/clients`
5. Create a timer entry at `/time`

## Common Problems

### Placeholder env vars

The app middleware throws a setup error when the URL or anon key still uses placeholder values.

### Missing tables

If `clients` or `time_logs` actions fail, the migrations were not fully applied to the active Supabase project.

### Auth works, but data actions fail

This usually points to one of:

- wrong Supabase project keys
- partial migration state
- profile creation failing in the active environment
