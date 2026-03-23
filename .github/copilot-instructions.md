# GitHub Copilot Instructions for Stacklite

## Project Overview

Stacklite is a security-critical SaaS application for freelancers that handles sensitive data including contracts, invoices, client information, and time logs. **Security, data isolation, and design integrity are non-negotiable.**

---

## Mandatory Technology Stack

- **Frontend**: Next.js (App Router only)
- **Language**: TypeScript in strict mode
- **Backend**: Supabase (Auth + PostgreSQL)
- **Styling**: Tailwind CSS only
- **State Management**: React Query + Zustand
- **Database Security**: Supabase Row Level Security (RLS)

**Do not suggest alternative frameworks or libraries without explicit justification.**

---

## Critical Security Rules

### 1. Row Level Security (RLS) is MANDATORY

Every database table MUST:
- Include a `user_id` column
- Have RLS enabled
- Enforce the policy: `user_id = auth.uid()`

**Never suggest code that bypasses RLS or accesses data across users.**

### 2. Secrets Management

- **NEVER** expose `SUPABASE_SERVICE_ROLE_KEY` in frontend code
- **NEVER** store JWTs manually
- All sensitive keys must remain in environment variables
- Use server-side Supabase client for privileged operations

### 3. Input Validation

All user input MUST be:
- Validated using Zod schemas
- Sanitized before database operations
- Protected against SQL injection
- Protected against XSS attacks
- Sanitized before PDF generation

**Never suggest code that writes unvalidated input to the database.**

### 4. Authentication Requirements

When suggesting auth code:
- Use Supabase Auth properly
- Support email/password + Google OAuth + Apple OAuth
- Implement persistent sessions with httpOnly cookies
- Protect routes using Next.js middleware
- Never implement client-only route protection

---

## Design System Rules

### Figma as Source of Truth

- All UI must match the Figma design exactly
- Use only CSS variables defined in `app/globals.css`:
  - Colors: `var(--primary)`, `var(--tertiary)`, `var(--bg-color)`, etc.
  - Spacing: `var(--spacing-xs/sm/md/lg/xl)`
  - Radius: `var(--radius-sm/md/lg)`
  - Shadows: `var(--shadow-sm/md/lg)`

**Never suggest arbitrary colors, spacing values, or magic pixel values.**

### Component Reusability

Use shared components located in `components/ui/`:
- `Card` - For card layouts
- `ModuleContainer` - For module wrappers
- `Button` - For all buttons
- `Input` - For form inputs
- `Modal` - For dialogs
- `FormSection` - For form sections
- `Toolbar` - For toolbars

**Never suggest inline styles or duplicated styling logic.**

---

## Code Quality Standards

### TypeScript
- Use strict mode (already configured)
- **Never** use `any` type
- Define proper interfaces for all data structures
- Use types from `lib/types/database.ts` for database operations

### Architecture
- Follow feature-based architecture in `components/modules/`
- Keep business logic separate from UI components
- Use React Query hooks for server state
- Use Zustand stores for global UI state
- No monolithic components

### Clean Code
- No `console.log` in production code (use proper error handling)
- Descriptive variable names
- Pure functions where possible
- Proper error boundaries

---

## Database & API Patterns

### When suggesting database queries:

```typescript
// ✅ CORRECT - Uses RLS
const { data, error } = await supabase
  .from('clients')
  .select('*')
  // RLS automatically filters by auth.uid()

// ❌ WRONG - Bypasses RLS
const { data, error } = await supabase
  .from('clients')
  .select('*')
  .eq('user_id', userId) // Don't manually filter - let RLS handle it
```

### When suggesting API routes:

```typescript
// ✅ CORRECT - Server-side with proper auth check
import { createServerClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // RLS will enforce user isolation
  const { data, error } = await supabase.from('clients').select('*')
  return Response.json({ data })
}

// ❌ WRONG - Client-side only, no auth verification
```

---

## Component Patterns

### When suggesting new components:

```typescript
// ✅ CORRECT - Server Component with proper auth
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function ClientsPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')
  
  const { data: clients } = await supabase.from('clients').select('*')
  
  return <ClientList clients={clients} />
}

// ❌ WRONG - No auth check, business logic in component
```

### When suggesting React Query hooks:

```typescript
// ✅ CORRECT - Proper error handling, TypeScript types
import { useQuery } from '@tanstack/react-query'
import { createBrowserClient } from '@/lib/supabase/client'
import type { Client } from '@/lib/types/database'

export function useClients() {
  return useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const supabase = createBrowserClient()
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data as Client[]
    },
    staleTime: 60 * 1000,
  })
}
```

---

## File Organization

When suggesting new files, follow this structure:

```
components/
├── modules/           # Feature modules
│   ├── ClientManager/
│   ├── TimeTracker/
│   └── ...
├── layout/            # Layout components
├── ui/                # Reusable UI components
└── QueryProvider.tsx

lib/
├── supabase/          # Supabase clients
├── api/               # API abstraction layer
├── types/             # TypeScript types
└── utils/             # Utility functions

app/
├── (auth)/            # Auth route group
├── (dashboard)/       # Dashboard route group
└── auth/              # Auth API routes
```

---

## Security Checklist for Suggestions

Before suggesting any code, verify:

- [ ] Does it enforce RLS properly?
- [ ] Does it validate all user input?
- [ ] Does it use TypeScript types correctly?
- [ ] Does it follow the design system?
- [ ] Does it handle errors properly?
- [ ] Does it use shared components?
- [ ] Does it avoid exposing secrets?
- [ ] Does it prevent SQL injection/XSS?

**If any check fails, revise the suggestion.**

---

## Common Anti-Patterns to Avoid

### ❌ Don't Suggest:
- `any` type usage
- Inline styles or arbitrary Tailwind values
- Client-side only authentication
- Direct database queries without RLS
- Unvalidated user input
- `console.log` for error handling
- Service role key in frontend
- Manual user_id filtering (let RLS handle it)
- Monolithic components
- Business logic in UI components
- Alternative CSS frameworks
- Alternative state management without justification

### ✅ Do Suggest:
- Proper TypeScript interfaces
- CSS variables from design system
- Server-side authentication checks
- Supabase client with RLS enabled
- Zod schema validation
- Proper error boundaries
- Environment variables for secrets
- Trusting RLS policies
- Modular component architecture
- Separation of concerns
- Tailwind CSS with design tokens
- React Query + Zustand pattern

---

## Architecture Approval Requirement

Before suggesting major features or architectural changes:

1. Propose the architecture first
2. Define database schema with RLS policies
3. Explain auth flow
4. Show validation strategy
5. Only suggest implementation after approval

**Do not suggest large code blocks for new features without architectural discussion.**

---

## Security Override Rule

**If a suggestion would compromise security, data isolation, or violate RLS policies, do not make it—regardless of convenience or speed benefits.**

Security always takes precedence over developer convenience.

---

## Example: Complete Feature Implementation

When suggesting a complete CRUD feature:

```typescript
// 1. Database Migration (with RLS)
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own clients"
  ON clients FOR ALL
  USING (auth.uid() = user_id);

// 2. TypeScript Types
export interface Client {
  id: string
  user_id: string
  name: string
  email: string | null
  created_at: string
}

// 3. Validation Schema
import { z } from 'zod'

export const clientSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email().optional(),
})

// 4. API Layer
export async function createClient(data: z.infer<typeof clientSchema>) {
  const supabase = createBrowserClient()
  
  const validated = clientSchema.parse(data)
  
  const { data: client, error } = await supabase
    .from('clients')
    .insert(validated)
    .select()
    .single()
  
  if (error) throw error
  return client
}

// 5. React Query Hook
export function useCreateClient() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
    },
  })
}

// 6. UI Component (using design system)
export function AddClientForm() {
  const { mutate, isPending } = useCreateClient()
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    mutate({
      name: formData.get('name') as string,
      email: formData.get('email') as string,
    })
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-md">
      <Input name="name" placeholder="Client name" required />
      <Input name="email" type="email" placeholder="Email" />
      <Button type="submit" disabled={isPending}>
        {isPending ? 'Adding...' : 'Add Client'}
      </Button>
    </form>
  )
}
```

---

## Summary

When providing suggestions for Stacklite:

1. **Security First**: Always enforce RLS, validate input, protect secrets
2. **Follow Design System**: Use CSS variables, shared components, no magic values
3. **TypeScript Strict**: No `any`, proper types, database type definitions
4. **Proper Architecture**: Feature-based, separated concerns, modular components
5. **Supabase Patterns**: Server/client separation, RLS trust, proper auth checks

**This is a security-critical application. When in doubt, prioritize security and data isolation over convenience.**
