# Security Rules
Every new table needs RLS enabled + user-scoped policy.
Never expose SUPABASE_SERVICE_ROLE_KEY in client code.
Validate with Zod on client AND server independently.
When isGuest === true — never call Supabase.
Never clear guestStore before migration succeeds.