# Stacklite Developer Quick Reference

## 🎨 Using the Design System

### Colors (Always use CSS variables)
```tsx
// ✅ CORRECT - Use CSS variables
<div className="bg-background-base text-text-base">...</div>
<button className="bg-button-primary text-button-primary-fg">...</button>

// ❌ WRONG - Never use raw hex values
<div className="bg-[#cee1f1] text-[#000711]">...</div>
```

### Spacing (4px base unit - no magic numbers)
```tsx
// ✅ CORRECT - Use spacing tokens
<div className="p-lg gap-md rounded-md">...</div>

// ❌ WRONG - Don't use arbitrary spacing
<div className="p-[15px] gap-[7px]">...</div>
```

### Components (Always reuse)
```tsx
// ✅ CORRECT - Import shared component
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

// ❌ WRONG - Don't create local versions
<button className="...">...</button>
```

---

## 📝 Validation & Types

### Before Creating Features
```tsx
// 1. Define Zod schema
const userSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
})

// 2. Create TypeScript type
export interface User {
  id: string
  name: string
  email: string
  createdAt: string
}

// 3. Validate on client & server
const result = userSchema.parse(formData)
```

### Server vs Client
```tsx
// ✅ Server component with auth check
import { createServerClient } from '@/lib/supabase/server'

export default async function Page() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')
  // RLS handles user isolation
}

// ✅ Client hook for mutations
'use client'
import { useMutation } from '@tanstack/react-query'

export function useCreateUser() {
  return useMutation({
    mutationFn: async (data) => {
      const validated = userSchema.parse(data)
      // Send to server
    }
  })
}
```

---

## 🗂️ File Organization

### New Component
```
components/
└── ui/
    ├── Button.tsx          ← Component
    ├── Button.stories.tsx  ← Storybook (optional)
    └── index.ts            ← Export
```

### New Module
```
components/
└── modules/
    └── ClientManager/
        ├── ClientManager.tsx      ← Main
        ├── ClientForm.tsx         ← Subcomponent
        ├── ClientList.tsx         ← Subcomponent
        ├── hooks.ts               ← Local hooks
        └── index.ts               ← Export
```

### New API Route
```
app/
└── api/
    └── clients/
        ├── route.ts       ← GET, POST
        └── [id]/
            └── route.ts   ← PUT, DELETE
```

---

## 🔐 Security Checklist

Before every PR:
- [ ] Is RLS enabled? (`auth.uid() = user_id`)
- [ ] Are secrets in `.env.local` only?
- [ ] Is data validated with Zod?
- [ ] Are errors user-friendly?
- [ ] Are there TypeScript types everywhere?
- [ ] Are console.logs removed?

---

## 🧪 Testing

### Component Test
```tsx
import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/Button'

describe('Button', () => {
  it('renders with label', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button')).toHaveTextContent('Click me')
  })
})
```

### E2E Test
```ts
import { test, expect } from '@playwright/test'

test('user can create client', async ({ page }) => {
  await page.goto('/dashboard')
  await page.fill('[name="clientName"]', 'Test Client')
  await page.click('button:has-text("Create")')
  await expect(page.locator('text=Test Client')).toBeVisible()
})
```

---

## 📦 State Management Pattern

### Where Each Piece Lives
```
useAuth()                     ← Global auth state (Zustand)
useClientStore()              ← Global client data (Zustand)
useState()                    ← Local component state
useQuery / useMutation        ← Server state (React Query)
```

### Example
```tsx
import { useClientStore } from '@/stores/clientStore'
import { useQuery } from '@tanstack/react-query'

export function ClientList() {
  // Global selected client
  const selectedId = useClientStore(s => s.selectedClientId)
  
  // Server data
  const { data: clients } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => { /* fetch */ }
  })
  
  // Local UI state
  const [isExpanded, setIsExpanded] = useState(false)
}
```

---

## 🎯 Common Tasks

### Creating a New Page
1. Create file in `app/(dashboard)/feature/page.tsx`
2. Add auth check (server component)
3. Fetch data with RLS
4. Import layout components
5. Build UI with shared components

### Creating a Modal
1. Use `Modal` component from `components/ui/`
2. Accept `isOpen` and `onClose` props
3. Put form in modal content
4. Handle submit with React Hook Form
5. Validate with Zod schema

### Creating an API Route
1. Create `app/api/feature/route.ts`
2. Auth check: `getUser()` → 401 if none
3. Validate request body with Zod
4. Query Supabase (RLS enforces user isolation)
5. Return response or error

---

## 🚀 Running the Project

```bash
# Install dependencies
npm install

# Set environment variables
cp .env.example .env.local
# Add your Supabase credentials

# Start dev server
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint

# Build for production
npm run build
```

---

## 📚 Key Resources

- [Product Documentation](./product-desc.md)
- [Design System Setup](./FRESH_START_SETUP.md)
- [Security Audit Checklist](./SECURITY_AUDIT_CHECKLIST.md)
- [Implementation Plan](./IMPLEMENTATION_PLAN.md)
- [GitHub Copilot Instructions](./.github/copilot-instructions.md)

---

## ❓ Quick FAQs

**Q: How do I add a new color?**
- A: Add it to `globals.css` as a CSS variable, then use it everywhere.

**Q: Can I use `any` type?**
- A: No. Use `unknown` and narrow with type guards, or define proper interfaces.

**Q: Where do I fetch data?**
- A: Server components for initial load, React Query for client mutations, Zustand for shared UI state.

**Q: How do I protect a route?**
- A: Check `auth.getUser()` in server component or middleware, redirect if null.

**Q: What's the module min width?**
- A: 280px. This is enforced in the design system.

**Q: Can I import from the service role?**
- A: No. Only server-side. Use anon key for client, JWT is auto-managed by @supabase/ssr.

---

*Last updated: March 16, 2026*
