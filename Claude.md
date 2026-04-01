# Stacklite — Claude Code Session Prompt

You are working on **Stacklite** — a modular freelancer workspace web app. Read everything below before touching a single file.

---

## What Stacklite Is

A single-page, canvas-based workspace for freelancers. It is NOT a multi-page app. All tools (Contract Generator, Invoice Generator, Time Tracker, Client Manager, Income Tracker) are floating card modules on a dotted-grid canvas. There is no page navigation between modules — everything lives on one canvas.

**Product principle:** Everything a freelancer needs. Nothing they don't.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5 — strict mode ON |
| Styling | TailwindCSS 4 |
| State | Zustand + persist middleware |
| Forms | React Hook Form + Zod |
| PDF | react-pdf / pdf-lib (client-side only) |
| Auth | Supabase Auth (email, Google OAuth) |
| Database | Supabase PostgreSQL with RLS |
| Storage | Supabase Storage |
| UI Components | Radian UI (always override with Lumea tokens) |
| Hosting | Vercel |

---

## Project Structure

```
src/
├── app/                    # Next.js App Router pages only
├── components/
│   ├── ui/                 # Base Radian UI components
│   ├── modules/            # Feature modules
│   │   ├── contract-generator/
│   │   ├── invoice-generator/
│   │   ├── time-tracker/
│   │   ├── client-manager/
│   │   └── income-tracker/
│   └── workspace/          # Canvas, Dock, GuestIndicator, SavePromptModal
├── hooks/                  # useClients, useContracts, useInvoices, useTimeEntries
├── stores/                 # Zustand stores
│   ├── guestStore.ts
│   ├── sessionStore.ts
│   ├── savePromptStore.ts
│   └── [module]Store.ts
├── lib/
│   ├── supabase/           # client.ts + server.ts
│   ├── pdf/                # PDF generation utilities
│   ├── migration/          # migrateGuestData.ts
│   └── utils.ts
├── types/                  # Global TypeScript interfaces
└── styles/
    └── globals.css         # Lumea token CSS variables — DO NOT MODIFY
```

Do not create folders outside this structure without asking.

---

## Color System — MOST IMPORTANT RULE

**Never use raw hex values. Never use Tailwind default color classes.**
Always use Lumea semantic token classes only.

```tsx
// ✅ CORRECT
<button className="bg-button-primary text-button-primaryFg rounded-lg px-4 py-2">

// ❌ WRONG — raw Tailwind color
<button className="bg-violet-600 text-white rounded-lg px-4 py-2">

// ❌ WRONG — raw hex in style prop
<button style={{ backgroundColor: '#5a00cc' }}>
```

### Token Reference

| Token class | Use for |
|---|---|
| `bg-background-base` | Canvas, page background |
| `bg-background-highlight` | Card surfaces |
| `bg-background-muted` | Subtle zones |
| `text-text-base` | Primary text |
| `text-text-muted` | Secondary text |
| `text-text-brand` | Brand text, links |
| `text-text-disabled` | Disabled text |
| `bg-button-primary` | Primary CTA buttons |
| `text-button-primaryFg` | Text on primary buttons |
| `bg-button-secondary` | Secondary buttons |
| `text-button-secondaryFg` | Text on secondary buttons |
| `border-border-base` | Default borders |
| `border-border-muted` | Subtle borders |
| `text-feedback-errorText` | Error messages |
| `text-feedback-successText` | Success messages |
| `text-feedback-warningText` | Warning messages |

CSS variables live in `globals.css`. Tailwind mappings in `tailwind.config.ts`.
**Never remove or rename either.**

---

## Design System Rules

- **Spacing:** 4px grid — Tailwind default scale only (`p-1`=4px, `p-2`=8px, `p-4`=16px)
- **Border radius:** inputs → `rounded-md` · buttons → `rounded-lg` · cards → `rounded-xl` · modals → `rounded-2xl`
- **Shadows:** cards → `shadow-md` · popups → `shadow-lg`
- **Focus ring:** always `focus-visible:ring-2 focus-visible:ring-text-brand`
- **Typography:** Inter for UI · JetBrains Mono for code/numeric only
- All form inputs must have a `<label>` — no placeholder-only labels
- All icon-only buttons must have `aria-label` + Tooltip
- Every module must have an empty state — no blank invisible panels
- Destructive actions always require a confirmation dialog

---

## TypeScript Rules

- `strict: true` — no exceptions
- No `any` type — use `unknown` and narrow explicitly
- No `@ts-ignore` under any circumstance
- Props typed with `interface`, not inline types
- All API responses must be typed

```ts
// ✅ Correct
interface ContractFormData {
  clientId: string
  projectName: string
  totalFee: number
}

// ❌ Wrong
const handleSubmit = async (data: any) => {}
```

---

## Component Rules

- Functional components only — no class components
- One component per file — file name matches component name
- Named exports for all components — default export only for Next.js pages
- No prop drilling beyond 2 levels — lift to Zustand store
- Every async operation must have `try/catch` with user-facing error state
- No `console.log` in committed code

---

## Naming Conventions

| Type | Convention | Example |
|---|---|---|
| Components | PascalCase | `ContractGenerator.tsx` |
| Hooks | camelCase + `use` | `useContractForm.ts` |
| Stores | camelCase + `Store` | `contractStore.ts` |
| Types | PascalCase | `ContractStatus` |
| Constants | UPPER_SNAKE_CASE | `MAX_CLAUSE_LENGTH` |
| API routes | kebab-case | `/api/contract-export` |

---

## Supabase & Security Rules

- Never implement custom auth — Supabase Auth only
- Use `@supabase/ssr` for server-side session handling
- Never expose `SUPABASE_SERVICE_ROLE_KEY` in client-side code
- `NEXT_PUBLIC_` prefix only for values safe in the browser

**Every new table MUST include both of these — no exceptions:**

```sql
ALTER TABLE your_table ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_owns_data"
  ON your_table FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

- Never drop columns or tables without explicit instruction
- Never modify existing migration files — always create new ones
- Validate with Zod on client AND re-validate on server independently

---

## Guest Mode Rules

Stacklite supports guest mode — users can use all modules without signing up. Data persists in localStorage via Zustand `persist`.

```ts
const { isGuest } = useSessionStore()

// Data access pattern — always use hooks, never direct store reads in components
// useClients(), useContracts(), useInvoices(), useTimeEntries()
// These hooks return guestStore data when isGuest === true
// and Supabase data when isGuest === false
```

**Hard rules:**
- When `isGuest === true` — never call Supabase
- Use `nanoid()` for guest IDs — never `crypto.randomUUID()`
- Never clear `guestStore` unless migration has fully succeeded
- Save prompt triggers only on Download PDF or Copy Share Link actions
- The save prompt never blocks the user's action — action executes regardless

---

## State Management Rules

| Data type | Where |
|---|---|
| Local UI state | `useState` |
| Form state | React Hook Form |
| Shared module data | Zustand store |
| Server data | Supabase + hooks |

- Client data always reads from `clientStore` — never duplicated into local state
- Do not use React Context for anything Zustand handles

---

## Approved APIs (MVP only)

| API | Used in | Notes |
|---|---|---|
| Frankfurter `api.frankfurter.app` | Invoice Generator, Income Tracker | Live + historical currency rates — no key needed |
| EVA `api.eva.pingutil.com` | Client Manager, Contract Generator | Email validation — no key needed |
| Nager.Date `date.nager.at/api/v3` | Time Tracker | Public holidays — no key needed |

**All API calls must be invisible to the user. Always fail silently and gracefully.**
Do not introduce any other external API without asking first.

---

## PDF Rules

- Client-side generation only — `react-pdf` or `pdf-lib`
- No user data sent to any external PDF service
- PDFs generated on demand — not stored server-side
- Every PDF footer: subtle `Generated with Stacklite` text — never remove this
- Contract PDF file name: `Contract_[ClientName]_[ProjectName].pdf`
- Invoice PDF file name: `Invoice_[InvoiceNumber]_[ClientName].pdf`

---

## Git Rules

Branch naming:
```
feature/contract-generator-form
fix/time-tracker-pause-state
chore/radian-token-override
```

Commit format:
```
feat: add section stepper to contract generator
fix: resolve client dropdown not syncing with store
chore: override radian input colors with lumea tokens
```

- Never commit to `main` directly
- Never commit `.env.local`
- Never commit `console.log` statements

---

## Behavior Rules

- **Act immediately** on clearly defined, single-file tasks
- **Ask before acting** when a task affects more than 3 files or is ambiguous
- **Always ask** before: touching `globals.css` token definitions, modifying RLS policies, installing new packages, changing DB column types
- **Never refactor** unless explicitly asked
- When unsure, ask ONE focused question in this format:

```
Before I proceed — [one specific question].
My assumption is: [X]. Is that correct?
```

---

## Hard Stops — Never Do These

- ❌ Raw hex values in any component or style
- ❌ Radian or Tailwind default color classes in components
- ❌ Disable or bypass RLS on any table
- ❌ Expose `SUPABASE_SERVICE_ROLE_KEY` in client code
- ❌ Send contract/invoice/client data to any external API
- ❌ Add page navigation between modules
- ❌ Call Supabase when `isGuest === true`
- ❌ Clear `guestStore` before migration succeeds
- ❌ Build post-MVP features without being explicitly asked
- ❌ Use `any` type in TypeScript
- ❌ Submit a migration without RLS policies
- ❌ Install new packages without asking first
- ❌ Run `rm -rf` or destructive DB commands without confirmation

---

## Current Module Status

| Module | Status |
|---|---|
| Contract Generator | In design/implementation — plan documented |
| Invoice Generator | Design phase |
| Time Tracker | Design phase |
| Client Manager | Design phase |
| Income Tracker | Design phase |
| Guest Mode | Plan documented — ready for implementation |
| Auth (email + Google) | Supabase configured |
| Email Templates | Branded template done |

Do not build beyond the current module scope unless explicitly told to.

---

*Stacklite — Built by Siddhartha Dwivedi*
*Next.js 15 · TypeScript 5 · TailwindCSS 4 · Supabase · Vercel*