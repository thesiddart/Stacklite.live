# Stacklite — Fresh Start Setup ✅
> Project initialized March 16, 2026

## What's Been Configured

### 1. **Design System** ✅
- **CSS Variables** (`app/globals.css`):
  - Lumea color tokens (light + dark mode)
  - 4px spacing scale (xs, sm, md, lg, xl, 2xl, 3xl, 4xl)
  - Border radius tokens (sm, md, lg, xl)
  - Shadow elevation system (sm, md, lg)
  - Typography defaults with Inter font
  - Focus ring styling (accessibility)

### 2. **TypeScript Configuration** ✅
- Strict mode enabled (`tsconfig.json`)
- Absolute imports configured (`@/*`)
- Ready for type-safe development

### 3. **Core Type Definitions** ✅
Location: `lib/types/`

- **domain.ts**: Core entity types
  - `Client`, `Contract`, `Invoice`, `TimeEntry`, `UserProfile`
  - `InvoiceLineItem`, `IncomeSummary`
  - API response patterns
  - Pagination types

- **database.ts**: Supabase schema (with Row Level Security)

### 4. **Validation Schemas** ✅
Location: `lib/validations/`

- **schemas.ts**: Zod schema definitions
  - Client validation
  - Contract validation
  - Invoice & line items validation
  - Time entry validation
  - All ready for server + client validation

### 5. **State Management** ✅
Location: `stores/`

- **clientStore.ts**: Zustand + subscribeWithSelector
  - Centralized client data
  - Selection management
  - Ready for React Query integration

### 6. **Design Constants** ✅
Location: `lib/constants/`

- **design-system.ts**: Re-exportable constants
  - Spacing, radius, shadows
  - Color palette reference
  - Module dimension rules
  - Keyboard shortcuts
  - Input validation limits

### 7. **Environment Setup** ✅
- `.env.example` template created with Supabase variables
- Service role key kept server-side only
- Database connection string prepared

### 8. **Dependencies Added** ✅
```json
{
  "react-hook-form": "^7.51.0",
  "framer-motion": "^11.0.0",
  "lucide-react": "^0.408.0"
}
```

---

## Next Steps

### Phase 1: Database & Auth ⏭️
1. Create Supabase RLS policies (migrations)
2. Set up Supabase Auth (email + OAuth)
3. Create server/client Supabase instances

### Phase 2: Core Components ⏭️
1. Build UI component library (`components/ui/`)
   - Button, Input, Card, Modal, Textarea
   - Use CSS variables (no hardcoded colors)

2. Build workspace layout (`components/workspace/`)
   - Canvas grid
   - Module cards (draggable containers, min 280px)
   - Bottom dock (sticky, tool switcher)

### Phase 3: Modules ⏭️
1. ClientManager
2. ContractGenerator
3. InvoiceGenerator
4. TimeTracker
5. IncomeTracker

### Phase 4: API Routes ⏭️
1. `/api/*` endpoints with RLS enforcement
2. PDF generation (client-side only)
3. Input validation + error handling

### Phase 5: Testing ⏭️
1. Unit tests (Vitest)
2. E2E tests (Playwright)
3. Security audit

---

## Architecture Checkpoints

### Before Building Any Feature:
- [ ] Check RLS is enabled on table
- [ ] Verify user_id column exists
- [ ] Input validation schema created (Zod)
- [ ] TypeScript interfaces defined
- [ ] Share-no-secrets in frontend code

### Component Patterns:
- [ ] Props properly typed with `interface`
- [ ] No `any` types
- [ ] Error boundaries in place
- [ ] Loading + error states visible
- [ ] Accessibility: focus rings, labels, ARIA

### Styling Rules:
- [ ] Use CSS variables (`var(--text-base)`)
- [ ] Spacing multiples of 4px only
- [ ] No hardcoded colors or pixel values
- [ ] Shared components from `components/ui/`
- [ ] No `!important` or inline styles

---

## File Structure (Updated)

```
app/
├── globals.css              ← Design system tokens
├── layout.tsx               ← Root layout
├── page.tsx                 ← Landing
├── (auth)/                  ← Auth route group
├── (dashboard)/             ← Main workspace
└── auth/                    ← Auth API routes

components/
├── ui/                      ← Reusable components (to build)
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Card.tsx
│   ├── Modal.tsx
│   └── ...
├── workspace/               ← Layout (to build)
│   ├── Canvas.tsx
│   ├── ModuleCard.tsx
│   └── Dock.tsx
├── modules/                 ← Feature modules (to build)
│   ├── ClientManager/
│   ├── ContractGenerator/
│   ├── InvoiceGenerator/
│   ├── TimeTracker/
│   └── IncomeTracker/
├── auth/                    ← Auth components (to build)
└── QueryProvider.tsx        ← React Query setup

lib/
├── types/
│   ├── database.ts          ✅ Supabase schema
│   └── domain.ts            ✅ Core types
├── constants/
│   └── design-system.ts     ✅ Constants
├── validations/
│   └── schemas.ts           ✅ Zod schemas
├── supabase/
│   ├── client.ts            (to update)
│   ├── server.ts            (to update)
│   └── middleware.ts
├── api/                     (to build)
└── utils/                   (to build)

hooks/
├── useAuth.ts               (to build)
├── useClients.ts            (to build)
└── ...

stores/
├── clientStore.ts           ✅ Zustand store
├── authStore.ts             (to build)
├── timerStore.ts            (to build)
└── workspaceStore.ts        (to build)

supabase/
└── migrations/
    └── 20260212000000_initial_schema.sql
```

---

## Key Rules to Remember

### Security 🔐
- RLS is mandatory
- No service role key in frontend
- Validate all user input (Zod)
- httpOnly cookies for JWTs
- Environment variables for secrets

### Design 🎨
- Always use CSS variables
- 4px spacing grid (no magic pixels)
- Semantic color usage only
- Module min-width: 280px
- Canvas has dotted grid background

### Code Quality 💻
- TypeScript strict mode (no `any`)
- Named exports for components
- Zod validation before DB writes
- Try/catch + user-facing errors
- No console.log in production

### Testing ✅
- Unit tests required for core logic
- E2E tests for critical flows
- Accessibility baseline (WCAG AA)
- Security audit before launch

---

## Verified Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| next | 16.1.6 | Framework |
| react | 19.2.3 | UI library |
| typescript | 5.x | Type safety |
| tailwindcss | 4.x | Styling |
| zustand | 5.0.2 | State (light) |
| @tanstack/react-query | 5.62.9 | Server state |
| @supabase/ssr | 0.5.2 | Auth + DB |
| zod | 4.3.6 | Validation |
| react-hook-form | 7.51.0 | Forms |
| framer-motion | 11.0.0 | Animation |
| lucide-react | 0.408.0 | Icons |

---

## Figma Design System Link
- **Status**: Ready to receive design tokens
- **Colors**: Lumea tokens implemented
- **Spacing**: 4px system active
- **Components**: Ready for UI design import

---

**Project Ready for Phase 1 Development** 🚀
All foundational systems are in place. Proceed with database schema & authentication setup.
