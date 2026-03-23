🔐 2️⃣ STACKLITE SECURITY AUDIT CHECKLIST

This checklist must be reviewed:
	•	Before production launch
	•	Before major releases
	•	During quarterly audits

⸻

SECTION 1 – AUTHENTICATION

Email & Password
	•	Password rules enforced
	•	Email verification enabled
	•	Brute force protection enabled

OAuth
	•	Google OAuth properly configured
	•	Apple OAuth properly configured
	•	Redirect URLs restricted
	•	No open redirect vulnerabilities

Session Security
	•	Sessions persist correctly
	•	Session invalidates on logout
	•	Protected routes validated server-side
	•	No client-only protection

⸻

SECTION 2 – DATABASE SECURITY

Row Level Security
	•	RLS enabled on ALL tables
	•	user_id = auth.uid() enforced
	•	No permissive public policies
	•	Service role not misused

Isolation Testing
	•	Test user A cannot see user B data
	•	Test manual API calls blocked by RLS
	•	Verify no public endpoints leak data

⸻

SECTION 3 – INPUT SECURITY
	•	Zod or schema validation in place
	•	No unsanitized HTML in PDF
	•	XSS tested manually
	•	SQL injection impossible via Supabase client
	•	No dangerouslySetInnerHTML without sanitization

⸻

SECTION 4 – SECRETS & ENVIRONMENT
	•	No service key in client
	•	Env variables properly scoped
	•	Production keys separated from development
	•	No secrets committed to GitHub

⸻

SECTION 5 – API & NETWORK
	•	Rate limiting strategy defined
	•	No open admin endpoints
	•	No unrestricted API routes
	•	Error messages do not expose internal data

⸻

SECTION 6 – PDF GENERATION
	•	User content sanitized before rendering
	•	No script injection inside PDF
	•	File names sanitized
	•	No path traversal vulnerabilities

⸻

SECTION 7 – PERFORMANCE & SCALABILITY
	•	Proper DB indexes on foreign keys
	•	Large queries paginated
	•	No N+1 query patterns
	•	Efficient data fetching strategy

⸻

SECTION 8 – OWASP TOP 10 REVIEW
	•	Injection risks mitigated
	•	Broken authentication mitigated
	•	Sensitive data exposure prevented
	•	Access control verified
	•	XSS prevented
	•	CSRF evaluated
	•	Security misconfiguration reviewed

⸻

SECTION 9 – FINAL LAUNCH CHECK
	•	All modules tested with multiple users
	•	Cross-user isolation verified
	•	Auth edge cases tested
	•	Logs reviewed
	•	Production build audited

⸻

Critical Rule

If ANY item in this checklist fails:
→ Deployment must be blocked.