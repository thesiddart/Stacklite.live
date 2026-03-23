Stacklite – Engineering & Security Compliance Agreement

1. Purpose

This agreement defines the mandatory engineering, security, and architectural standards required for any developer (human or AI) contributing to Stacklite.

Stacklite handles sensitive freelance data including:
	•	Contracts
	•	Invoices
	•	Client information
	•	Time logs

Security, data isolation, and design integrity are non-negotiable.

By contributing to Stacklite, you agree to follow all requirements in this document.

⸻

2. Technology Stack Compliance

The following stack is mandatory unless explicitly approved:
	•	Frontend: Next.js (App Router)
	•	Language: TypeScript (strict mode)
	•	Backend: Supabase (Auth + Postgres)
	•	Styling: TailwindCSS
	•	Database Security: Supabase RLS

No additional frameworks or libraries may be added without:
	•	Clear justification
	•	Trade-off analysis
	•	Approval

⸻

3. Design System Compliance

3.1 Figma as Source of Truth
	•	All UI must strictly follow Figma MCP design.
	•	No new spacing values.
	•	No new color tokens.
	•	No arbitrary radius or shadows.
	•	No magic pixel values.

3.2 Component Reusability

All UI must use shared components:
	•	Card
	•	ModuleContainer
	•	Button
	•	Input
	•	Modal
	•	FormSection
	•	Toolbar

No duplicated styling.
No inline styles.
No inconsistent layout logic.

⸻

4. Authentication Requirements

Must support:
	•	Email/password sign up
	•	Email/password login
	•	Google OAuth
	•	Apple OAuth
	•	Persistent sessions
	•	Logout
	•	Protected routes

Auth must use Supabase properly.

Forbidden:
	•	Storing JWT manually
	•	Exposing service role key to frontend
	•	Client-only route protection

⸻

5. Database & RLS Enforcement

All database tables must:
	•	Include user_id
	•	Enable Row Level Security (RLS)
	•	Enforce policy:
user_id = auth.uid()

No table may be deployed without:
	•	RLS enabled
	•	Explicit policy defined
	•	Isolation tested

⸻

6. Data Isolation Policy

Each user must only access:
	•	Their own clients
	•	Their own contracts
	•	Their own invoices
	•	Their own time logs

Cross-user data access is a critical security violation.

⸻

7. Input Validation & Sanitization

All user input must:
	•	Be validated using schema validation (e.g., Zod)
	•	Prevent SQL injection
	•	Prevent XSS
	•	Sanitize contract/invoice content before PDF generation

No unvalidated input may be written to database.

⸻

8. Secrets Management
	•	Service role key must never appear in frontend code.
	•	Environment variables must not be exposed.
	•	Secrets must be stored securely.

Violation of this rule is critical severity.

⸻

9. Code Quality Standards
	•	Strict TypeScript (no implicit any)
	•	No console logs in production
	•	Clean folder structure
	•	Feature-based architecture
	•	No monolithic components
	•	No business logic inside UI components

⸻

10. Architecture Approval Rule

Before major implementation:
	1.	Architecture must be proposed.
	2.	Database schema must be defined.
	3.	RLS policies must be shown.
	4.	Auth flow must be explained.
	5.	Only after approval can coding begin.

⸻

11. Security Override Rule

If any feature:
	•	Weakens security
	•	Compromises RLS
	•	Exposes data
	•	Bypasses validation

It must be rejected regardless of convenience.

⸻

12. Agreement

Contributors agree to:
	•	Follow OWASP Top 10 principles
	•	Follow Supabase best practices
	•	Maintain modular, scalable architecture
	•	Prioritize security over speed
