# Stacklite — Product Documentation
> Version 1.0 · March 2026 · Authored by Siddhartha Dwivedi

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [System Architecture](#2-system-architecture)
3. [Tech Stack](#3-tech-stack)
4. [Design System](#4-design-system)
5. [Color System (Lumea Tokens)](#5-color-system-lumea-tokens)
6. [Coding Standards](#6-coding-standards)
7. [Security Standards](#7-security-standards)
8. [Rules & Conventions](#8-rules--conventions)

---

## 1. Product Overview

**Stacklite** is a lightweight, modular workspace for freelancers and solo professionals. It consolidates contract generation, invoicing, time tracking, and client management into a single calm, distraction-free interface — a freelancer operating system.

### Mission

> Everything a freelancer needs. Nothing they don't.

### Core Modules (MVP)

| Module | Purpose |
|---|---|
| Contract Generator | Create, preview, and export legally structured contracts as PDF |
| Invoice Generator | Professional invoices with dynamic line items, tax, and PDF export |
| Time Tracker | Start/pause/stop timer, link entries to clients and projects |
| Client Manager | Central client data store used across all modules |
| Income Tracker | Monthly earnings overview aggregated from invoices |

### Target Users

Freelance designers, developers, consultants, writers, creative professionals, solo founders, and small creative teams.

---

## 2. System Architecture

### High-Level Architecture

```
┌──────────────────────────────────────────────────────┐
│                    CLIENT (Next.js)                  │
│                                                      │
│  ┌──────────┐  ┌──────────┐  ┌────────────────────┐ │
│  │ Modules  │  │  Canvas  │  │   Bottom Dock       │ │
│  │ (Cards)  │  │ (Grid)   │  │   (Tool Switcher)   │ │
│  └──────────┘  └──────────┘  └────────────────────┘ │
└─────────────────────────┬────────────────────────────┘
                          │ HTTPS / REST
┌─────────────────────────▼────────────────────────────┐
│                  SUPABASE (BaaS)                      │
│                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │     Auth     │  │  PostgreSQL  │  │  Storage   │ │
│  │ (JWT/OAuth)  │  │  (RLS)       │  │  (Assets)  │ │
│  └──────────────┘  └──────────────┘  └────────────┘ │
└──────────────────────────────────────────────────────┘
                          │
┌─────────────────────────▼────────────────────────────┐
│             CLIENT-SIDE PDF GENERATION               │
│              (pdf-lib / react-pdf)                   │
└──────────────────────────────────────────────────────┘
```

### Workspace Layout

```
┌─────────────────────────────────────────────────────┐
│  [Logo]                            [Clock] [Avatar] │  ← Top Bar
├──────────┬──────────────────────────┬───────────────┤
│          │                          │               │
│  Manage  │   Contract Generator /   │  Time Tracker │
│  Clients │   Invoice Generator /    │  Module       │
│  (Left)  │   Active Tool (Center)   │  (Right)      │
│          │                          │               │
├──────────┴──────────────────────────┴───────────────┤
│      [Contract Generator] [Invoice] [Income]        │  ← Bottom Dock
└─────────────────────────────────────────────────────┘
```

### Data Flow

```
Client Manager ──→ Contract Generator
               ──→ Invoice Generator
               ──→ Time Tracker

Time Tracker ──→ Invoice Generator (time-to-invoice)
Invoice Generator ──→ Income Tracker
```

### Database Schema (PostgreSQL via Supabase)

```sql
-- Users are managed by Supabase Auth (auth.users)

clients (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES auth.users NOT NULL,
  name        text NOT NULL,
  email       text,
  phone       text,
  company     text,
  notes       text,
  created_at  timestamptz DEFAULT now()
)

contracts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES auth.users NOT NULL,
  client_id       uuid REFERENCES clients(id),
  project_scope   text,
  timeline        text,
  payment_terms   text,
  deliverables    text,
  clauses         text,
  status          text DEFAULT 'draft',
  created_at      timestamptz DEFAULT now()
)

invoices (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES auth.users NOT NULL,
  client_id       uuid REFERENCES clients(id),
  invoice_number  text NOT NULL,
  issue_date      date,
  due_date        date,
  line_items      jsonb,
  tax_rate        numeric,
  discount        numeric,
  total           numeric,
  status          text DEFAULT 'unpaid',
  created_at      timestamptz DEFAULT now()
)

time_entries (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid REFERENCES auth.users NOT NULL,
  client_id    uuid REFERENCES clients(id),
  task         text,
  notes        text,
  duration     interval,
  logged_at    timestamptz DEFAULT now()
)
```

All tables enforce **Row Level Security (RLS)** — users can only access rows where `user_id = auth.uid()`.

---

## 3. Tech Stack

### Frontend

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 15.x |
| Language | TypeScript | 5.x |
| Styling | TailwindCSS | 4.x |
| State Management | Zustand | 5.x |
| Forms | React Hook Form + Zod | Latest |
| PDF Generation | react-pdf / pdf-lib | Latest |
| Icons | Lucide React | Latest |
| Animation | Framer Motion | Latest |

### Backend / Infrastructure

| Layer | Technology |
|---|---|
| Auth | Supabase Auth (JWT, Google OAuth, Apple OAuth) |
| Database | Supabase PostgreSQL with RLS |
| File Storage | Supabase Storage |
| Hosting | Vercel (Frontend) |
| Environment Config | `.env.local` via Vercel Environment Variables |

### Dev Tooling

| Tool | Purpose |
|---|---|
| ESLint | Code linting |
| Prettier | Code formatting |
| Husky | Pre-commit hooks |
| lint-staged | Run linting only on staged files |
| Vitest | Unit testing |
| Playwright | E2E testing |

---

## 4. Design System

### Spacing Scale

Based on a **4px base unit**. All spacing, padding, margin, and gap values must use multiples of 4.

| Token | Value | Usage |
|---|---|---|
| `space-1` | 4px | Micro gaps |
| `space-2` | 8px | Tight spacing |
| `space-3` | 12px | Internal card padding |
| `space-4` | 16px | Standard padding |
| `space-6` | 24px | Section spacing |
| `space-8` | 32px | Module gap |
| `space-12` | 48px | Large sections |

### Typography

| Role | Font | Size | Weight |
|---|---|---|---|
| Display | Inter | 28–32px | 700 |
| Heading 1 | Inter | 22px | 600 |
| Heading 2 | Inter | 18px | 600 |
| Body | Inter | 14px | 400 |
| Small / Caption | Inter | 12px | 400 |
| Label | Inter | 12px | 500 |
| Code | JetBrains Mono | 13px | 400 |

### Border Radius

| Token | Value | Usage |
|---|---|---|
| `radius-sm` | 6px | Inputs, small elements |
| `radius-md` | 10px | Buttons, tags |
| `radius-lg` | 14px | Cards, modules |
| `radius-xl` | 20px | Modal panels |

### Elevation (Shadows)

```css
--shadow-card:   0 2px 8px rgba(0, 0, 0, 0.06);
--shadow-module: 0 4px 16px rgba(0, 0, 0, 0.08);
--shadow-popup:  0 8px 32px rgba(0, 0, 0, 0.12);
```

### Component Rules

- All interactive elements must have a visible `:focus-visible` ring using `brand.300`
- Disabled states use `background-disabled` and `text-disabled` tokens — never raw hex
- All form inputs must have an associated `<label>` — no placeholder-only labels
- Modules on the canvas are draggable cards — each has a fixed minimum width of `280px`
- The bottom dock is sticky and always visible regardless of scroll state

---

## 5. Color System (Lumea Tokens)

The color system is sourced from **Colors by Lumea** (`lumea_tokens.json`), following the [Design Tokens Community Group](https://www.designtokens.org) W3C standard (`$schema: 2025.10`).

### Architecture

```
_primitives  →  colorTokens (light / dark)  →  CSS Variables  →  TailwindCSS
```

Primitives are raw values. They are **never used directly** in components. Always use semantic `colorTokens`.

---

### Primitive Palette

#### Brand (Purple)

| Step | Hex | Usage |
|---|---|---|
| 50 | `#ebaaff` | Tints, hover backgrounds |
| 100 | `#b86fff` | Light accents |
| 200 | `#9a46ff` | Highlights |
| 300 | `#8114ff` | Active states |
| 400 | `#6c00e6` | Dark mode brand text |
| 500 | `#5a00cc` | **Primary button** |
| 600 | `#4a00b3` | Light mode brand text, links |
| 700 | `#3d009c` | Link hover |
| 800 | `#320086` | Deep accents |
| 900 | `#280072` | Darkest brand |

#### Gray (Cool Blue-Gray)

| Step | Hex |
|---|---|
| 50 | `#cee1f1` |
| 100 | `#99acbb` |
| 200 | `#7a8c9a` |
| 300 | `#60717f` |
| 400 | `#4a5b68` |
| 500 | `#364653` |
| 600 | `#253440` |
| 700 | `#15242f` |
| 800 | `#07151f` |
| 900 | `#000711` |

#### Semantic Palette Summary

| Color | 500 (Base) | Usage |
|---|---|---|
| Red | `#c40066` | Error states |
| Green | `#007e00` | Success states |
| Yellow | `#a35600` | Warning states |
| Blue | `#0077c3` | Info states |
| Orange | `#d2000b` | Destructive actions |

---

### Semantic Color Tokens

#### Light Mode

| Token | Primitive Reference | Resolved Hex |
|---|---|---|
| `background-base` | `gray.50` | `#cee1f1` |
| `background-highlight` | `gray.100` | `#99acbb` |
| `background-muted` | `gray.200` | `#7a8c9a` |
| `background-emphasis` | `gray.900` | `#000711` |
| `background-disabled` | `gray.300` | `#60717f` |
| `text-base` | `gray.900` | `#000711` |
| `text-muted` | `gray.600` | `#253440` |
| `text-disabled` | `gray.400` | `#4a5b68` |
| `text-inverse` | `gray.50` | `#cee1f1` |
| `text-brand` | `brand.600` | `#4a00b3` |
| `border-base` | `gray.300` | `#60717f` |
| `border-muted` | `gray.200` | `#7a8c9a` |
| `border-disabled` | `gray.100` | `#99acbb` |
| `button-primary` | `brand.500` | `#5a00cc` |
| `button-primary-foreground` | `gray.50` | `#cee1f1` |
| `button-secondary` | `gray.200` | `#7a8c9a` |
| `button-secondary-foreground` | `gray.900` | `#000711` |
| `button-ghost-foreground` | `gray.700` | `#15242f` |
| `link-base` | `brand.600` | `#4a00b3` |
| `link-hover` | `brand.700` | `#3d009c` |
| `feedback-error-base` | `red.500` | `#c40066` |
| `feedback-error-text` | `red.700` | `#780033` |
| `feedback-success-base` | `green.500` | `#007e00` |
| `feedback-success-text` | `green.700` | `#004600` |
| `feedback-warning-base` | `yellow.500` | `#a35600` |
| `feedback-warning-text` | `yellow.800` | `#400d00` |
| `feedback-info-base` | `blue.500` | `#0077c3` |
| `feedback-info-text` | `blue.700` | `#003f7c` |

#### Dark Mode

| Token | Primitive Reference | Resolved Hex |
|---|---|---|
| `background-base` | `gray.900` | `#000711` |
| `background-highlight` | `gray.800` | `#07151f` |
| `background-muted` | `gray.700` | `#15242f` |
| `background-emphasis` | `gray.100` | `#99acbb` |
| `background-disabled` | `gray.600` | `#253440` |
| `text-base` | `gray.50` | `#cee1f1` |
| `text-muted` | `gray.400` | `#4a5b68` |
| `text-disabled` | `gray.500` | `#364653` |
| `text-inverse` | `gray.900` | `#000711` |
| `text-brand` | `brand.400` | `#6c00e6` |
| `border-base` | `gray.600` | `#253440` |
| `border-muted` | `gray.700` | `#15242f` |
| `border-disabled` | `gray.800` | `#07151f` |
| `button-primary` | `brand.500` | `#5a00cc` |
| `button-primary-foreground` | `gray.50` | `#cee1f1` |
| `button-secondary` | `gray.700` | `#15242f` |
| `button-secondary-foreground` | `gray.50` | `#cee1f1` |
| `button-ghost-foreground` | `gray.300` | `#60717f` |
| `link-base` | `brand.400` | `#6c00e6` |
| `link-hover` | `brand.300` | `#8114ff` |
| `feedback-error-base` | `red.500` | `#c40066` |
| `feedback-error-text` | `red.300` | `#ff619e` |
| `feedback-success-base` | `green.500` | `#007e00` |
| `feedback-success-text` | `green.300` | `#59b550` |
| `feedback-warning-base` | `yellow.500` | `#a35600` |
| `feedback-warning-text` | `yellow.200` | `#f3b500` |
| `feedback-info-base` | `blue.500` | `#0077c3` |
| `feedback-info-text` | `blue.300` | `#00b1f9` |

---

### CSS Variable Implementation

In `globals.css`:

```css
:root {
  --background-base:            #cee1f1;
  --background-highlight:       #99acbb;
  --background-muted:           #7a8c9a;
  --background-emphasis:        #000711;
  --background-disabled:        #60717f;

  --text-base:                  #000711;
  --text-muted:                 #253440;
  --text-disabled:              #4a5b68;
  --text-inverse:               #cee1f1;
  --text-brand:                 #4a00b3;

  --border-base:                #60717f;
  --border-muted:               #7a8c9a;
  --border-disabled:            #99acbb;

  --button-primary:             #5a00cc;
  --button-primary-fg:          #cee1f1;
  --button-secondary:           #7a8c9a;
  --button-secondary-fg:        #000711;
  --button-ghost-fg:            #15242f;

  --link-base:                  #4a00b3;
  --link-hover:                 #3d009c;

  --feedback-error-base:        #c40066;
  --feedback-error-text:        #780033;
  --feedback-success-base:      #007e00;
  --feedback-success-text:      #004600;
  --feedback-warning-base:      #a35600;
  --feedback-warning-text:      #400d00;
  --feedback-info-base:         #0077c3;
  --feedback-info-text:         #003f7c;
}

.dark {
  --background-base:            #000711;
  --background-highlight:       #07151f;
  --background-muted:           #15242f;
  --background-emphasis:        #99acbb;
  --background-disabled:        #253440;

  --text-base:                  #cee1f1;
  --text-muted:                 #4a5b68;
  --text-disabled:              #364653;
  --text-inverse:               #000711;
  --text-brand:                 #6c00e6;

  --border-base:                #253440;
  --border-muted:               #15242f;
  --border-disabled:            #07151f;

  --button-primary:             #5a00cc;
  --button-primary-fg:          #cee1f1;
  --button-secondary:           #15242f;
  --button-secondary-fg:        #cee1f1;
  --button-ghost-fg:            #60717f;

  --link-base:                  #6c00e6;
  --link-hover:                 #8114ff;

  --feedback-error-base:        #c40066;
  --feedback-error-text:        #ff619e;
  --feedback-success-base:      #007e00;
  --feedback-success-text:      #59b550;
  --feedback-warning-base:      #a35600;
  --feedback-warning-text:      #f3b500;
  --feedback-info-base:         #0077c3;
  --feedback-info-text:         #00b1f9;
}
```

### TailwindCSS Integration

In `tailwind.config.ts`:

```ts
theme: {
  extend: {
    colors: {
      background: {
        base:      'var(--background-base)',
        highlight: 'var(--background-highlight)',
        muted:     'var(--background-muted)',
        emphasis:  'var(--background-emphasis)',
        disabled:  'var(--background-disabled)',
      },
      text: {
        base:     'var(--text-base)',
        muted:    'var(--text-muted)',
        disabled: 'var(--text-disabled)',
        inverse:  'var(--text-inverse)',
        brand:    'var(--text-brand)',
      },
      border: {
        base:     'var(--border-base)',
        muted:    'var(--border-muted)',
        disabled: 'var(--border-disabled)',
      },
      // ... etc
    }
  }
}
```

### Color Usage Rules

- **Never** use raw hex values or primitive tokens (`brand.500`) directly in component code
- **Always** use semantic tokens (`button-primary`, `text-muted`) via CSS variables
- Feedback colors (`error`, `success`, `warning`, `info`) must only be used for their intended state — no decorative use
- The dotted grid background of the canvas uses `background-base` at 100% opacity with a dot pattern overlay at 10% opacity of `border-muted`

---

## 6. Coding Standards

### File & Folder Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/             # Auth routes
│   ├── (workspace)/        # Main workspace
│   └── layout.tsx
├── components/
│   ├── ui/                 # Base UI components (Button, Input, Card)
│   ├── modules/            # Feature modules (ContractGenerator, etc.)
│   └── workspace/          # Canvas, Dock, layout components
├── lib/
│   ├── supabase/           # Supabase client & server instances
│   ├── pdf/                # PDF generation utilities
│   └── utils.ts
├── hooks/                  # Custom React hooks
├── stores/                 # Zustand state stores
├── types/                  # Global TypeScript types
└── styles/
    └── globals.css
```

### TypeScript Rules

- `strict: true` in `tsconfig.json` — no exceptions
- No `any` type — use `unknown` and narrow explicitly
- All API responses must be typed with a shared interface
- Props must be typed with `interface`, not inline types for components
- Use `type` for unions and utility types, `interface` for object shapes

```ts
// ✅ Correct
interface Client {
  id: string
  name: string
  email?: string
}

// ❌ Wrong
const getClient = async (): Promise<any> => { ... }
```

### Component Standards

- Use **functional components** only — no class components
- One component per file
- File name matches component name: `ContractGenerator.tsx`
- Use named exports for components, default export only for pages
- Co-locate component-specific hooks in the same folder

```tsx
// ✅ Correct
export function ContractGenerator({ clientId }: ContractGeneratorProps) { ... }

// ❌ Wrong
export default function thing() { ... }
```

### Naming Conventions

| Type | Convention | Example |
|---|---|---|
| Components | PascalCase | `TimeTracker.tsx` |
| Hooks | camelCase with `use` prefix | `useTimeEntry.ts` |
| Stores | camelCase with `Store` suffix | `clientStore.ts` |
| Types | PascalCase | `InvoiceLineItem` |
| Constants | UPPER_SNAKE_CASE | `MAX_CLIENTS` |
| CSS Classes | kebab-case | `module-card` |
| API routes | kebab-case | `/api/invoice-generate` |

### Import Order

```ts
// 1. React
import { useState, useEffect } from 'react'

// 2. Next.js
import { useRouter } from 'next/navigation'

// 3. Third-party libraries
import { z } from 'zod'

// 4. Internal — absolute paths
import { Button } from '@/components/ui/Button'

// 5. Internal — relative paths
import { formatCurrency } from './utils'

// 6. Types
import type { Invoice } from '@/types'
```

### State Management Rules

- **Local UI state** → `useState` / `useReducer`
- **Shared module state** → Zustand store
- **Server state / data fetching** → Supabase + `useEffect` or React Query
- No prop drilling beyond 2 levels — lift to store or context

### Git Conventions

Branch naming:
```
feature/contract-generator
fix/time-tracker-pause
chore/update-dependencies
```

Commit message format (Conventional Commits):
```
feat: add PDF export to invoice generator
fix: correct timer pause behavior
chore: update supabase client to v2
docs: update color token documentation
```

---

## 7. Security Standards

### Authentication

- All auth is handled by **Supabase Auth** — never implement custom auth
- JWTs are managed by Supabase and stored in `httpOnly` cookies via `@supabase/ssr`
- Session refresh is handled automatically — do not manually manage tokens
- OAuth providers (Google, Apple) must be configured with verified redirect URIs only

### Authorization — Row Level Security

Every table in the database **must** have RLS enabled with user-scoped policies:

```sql
-- Enable RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Policy: users can only access their own data
CREATE POLICY "user_owns_clients"
  ON clients
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

**Rule:** If a table doesn't have an RLS policy, it must not be exposed through the client.

### Environment Variables

```bash
# .env.local — never commit this file
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=   # server-only, never expose to client
```

- `NEXT_PUBLIC_` prefix only for values safe to expose to browser
- `SUPABASE_SERVICE_ROLE_KEY` is **never** used in client-side code
- All secrets are managed via Vercel environment variables in production

### Input Validation

- All user inputs are validated with **Zod** schemas on the client before submission
- Server-side API routes must re-validate inputs independently — never trust client validation alone

```ts
const contractSchema = z.object({
  clientId: z.string().uuid(),
  projectScope: z.string().min(10).max(2000),
  paymentTerms: z.string().min(5),
})
```

### PDF Generation Security

- PDF generation is **client-side only** — no user data is sent to a third-party PDF service
- Generated files are not stored on the server — they are generated on demand and downloaded directly

### API Security Rules

- All API routes check for authenticated session before processing
- Rate limiting is applied to auth endpoints (handled by Supabase)
- CORS is restricted to the production domain — no wildcard origins in production
- No sensitive data (passwords, keys) is ever logged

### Dependency Security

- Run `npm audit` as part of CI — fail on high/critical vulnerabilities
- Keep dependencies updated via Dependabot
- Do not install packages without reviewing their published source and download count

### Content Security Policy (CSP)

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob:;
  connect-src 'self' https://*.supabase.co;
  font-src 'self';
```

---

## 8. Rules & Conventions

### General Product Rules

- The workspace canvas is the **single entry point** — no separate pages per module
- Modules open as floating cards on the canvas — never as full-page routes
- Every module must work independently but share data through the Client Manager
- Empty states are required for all modules — no blank/invisible panels
- Every destructive action (delete client, delete contract) requires a confirmation dialog

### Design Rules

- Do not use raw hex or primitive token values in component styles
- Do not break the 4px spacing grid
- All interactive elements must have hover, focus, active, and disabled states
- No hardcoded widths on text elements — use `max-w` and `w-full` as appropriate
- The dotted grid canvas background must never be used outside the workspace context
- Module cards must not overlap by default — provide enough canvas space for clear spatial separation

### Module Communication Rules

- Modules communicate via Zustand store — no direct prop passing between modules
- Client data is always read from the `clientStore` — never duplicated into local module state
- Time entries linked to a client update the Time Tracker display immediately via store subscription

### Development Rules

- No component renders without loading and error states
- All async operations must be wrapped in `try/catch` with user-facing error feedback
- Console logs are not permitted in production builds — use a logger utility
- No TODO comments in merged code — create a GitHub issue instead
- Every new module must include at minimum one unit test for its core logic

### Accessibility Rules

- Minimum contrast ratio: **4.5:1** for normal text, **3:1** for large text (WCAG AA)
- All icons used without text labels must have `aria-label`
- Keyboard navigation must work for all interactive elements
- Focus order must follow visual reading order
- Do not remove focus outlines — style them using `ring` utilities with `brand` color

---

*This document is a living reference. Update it alongside each product milestone.*

*Stacklite — Built by Siddhartha Dwivedi*