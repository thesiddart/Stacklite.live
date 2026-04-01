# Stacklite — Guest Mode Implementation Plan
> For Claude Code · Feature: Guest Mode (Try Before Sign Up)
> Stack: Next.js 15 · TypeScript 5 · TailwindCSS 4 · Zustand · Supabase

---

## What This Feature Is

Guest mode allows users to use **all Stacklite modules** without creating an account. All data persists in `localStorage` and survives page refreshes. Data is lost only when the user clears their browser storage or explicitly signs out of guest mode.

When a guest attempts to **Download PDF** or **Copy Share Link**, a save prompt appears offering them to create a free account. On sign-up, all guest data migrates seamlessly into Supabase. The user never loses their work.

---

## User Flow

```
Visit Stacklite
      │
      ▼
Landing / Auth Page
      │
      ├── [Sign In] ──────────────────→ Normal auth flow → Workspace
      │
      └── [Try Without Account] ──────→ Guest Workspace
                                              │
                                    Use all modules freely
                                    Data saves to localStorage
                                              │
                                    Hit "Download PDF"
                                    or "Copy Share Link"
                                              │
                                              ▼
                                    ┌─────────────────────┐
                                    │  Save Prompt Modal  │
                                    │                     │
                                    │  [Create Account]   │
                                    │  [Continue as Guest]│
                                    └─────────────────────┘
                                         │           │
                                         ▼           ▼
                                   Sign Up &    Proceed with
                                   Migrate      PDF/Link only
                                   Data         (no account)
```

---

## Auth Page Changes

Add a **"Try Without Account"** button below the existing auth options.

```tsx
// src/app/(auth)/page.tsx

// Existing buttons: Google OAuth, Apple OAuth, Email/Password
// Add below the divider:

<button onClick={handleGuestEntry}>
  Try Without Account
</button>

// Subtle caption below:
// "No sign up needed · Your work saves in your browser"
```

Clicking "Try Without Account":
1. Sets `guestMode: true` in Zustand + localStorage
2. Redirects to `/workspace`
3. No Supabase call made whatsoever

---

## Guest Session Architecture

### 1. Guest Flag

A single flag determines the session type throughout the app:

```ts
// src/stores/sessionStore.ts

interface SessionStore {
  isGuest: boolean
  setGuest: (value: boolean) => void
}

export const useSessionStore = create<SessionStore>()(
  persist(
    (set) => ({
      isGuest: false,
      setGuest: (value) => set({ isGuest: value }),
    }),
    { name: 'stacklite-session' }
  )
)
```

### 2. Guest Data Store

All module data uses a **unified guest store** backed by `localStorage` via Zustand `persist`.

```ts
// src/stores/guestStore.ts

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface GuestStore {
  clients:     GuestClient[]
  contracts:   GuestContract[]
  invoices:    GuestInvoice[]
  timeEntries: GuestTimeEntry[]
  income:      GuestIncome[]

  // Clients
  addClient:    (client: GuestClient) => void
  updateClient: (id: string, data: Partial<GuestClient>) => void
  deleteClient: (id: string) => void

  // Contracts
  addContract:    (contract: GuestContract) => void
  updateContract: (id: string, data: Partial<GuestContract>) => void
  deleteContract: (id: string) => void

  // Invoices
  addInvoice:    (invoice: GuestInvoice) => void
  updateInvoice: (id: string, data: Partial<GuestInvoice>) => void
  deleteInvoice: (id: string) => void

  // Time Entries
  addTimeEntry:    (entry: GuestTimeEntry) => void
  updateTimeEntry: (id: string, data: Partial<GuestTimeEntry>) => void
  deleteTimeEntry: (id: string) => void

  // Clear all (used after successful migration)
  clearAll: () => void
}

export const useGuestStore = create<GuestStore>()(
  persist(
    (set) => ({
      clients:     [],
      contracts:   [],
      invoices:    [],
      timeEntries: [],
      income:      [],

      addClient:    (client)        => set((s) => ({ clients: [...s.clients, client] })),
      updateClient: (id, data)      => set((s) => ({ clients: s.clients.map(c => c.id === id ? { ...c, ...data } : c) })),
      deleteClient: (id)            => set((s) => ({ clients: s.clients.filter(c => c.id !== id) })),

      addContract:    (contract)    => set((s) => ({ contracts: [...s.contracts, contract] })),
      updateContract: (id, data)    => set((s) => ({ contracts: s.contracts.map(c => c.id === id ? { ...c, ...data } : c) })),
      deleteContract: (id)          => set((s) => ({ contracts: s.contracts.filter(c => c.id !== id) })),

      addInvoice:    (invoice)      => set((s) => ({ invoices: [...s.invoices, invoice] })),
      updateInvoice: (id, data)     => set((s) => ({ invoices: s.invoices.map(i => i.id === id ? { ...i, ...data } : i) })),
      deleteInvoice: (id)           => set((s) => ({ invoices: s.invoices.filter(i => i.id !== id) })),

      addTimeEntry:    (entry)      => set((s) => ({ timeEntries: [...s.timeEntries, entry] })),
      updateTimeEntry: (id, data)   => set((s) => ({ timeEntries: s.timeEntries.map(e => e.id === id ? { ...e, ...data } : e) })),
      deleteTimeEntry: (id)         => set((s) => ({ timeEntries: s.timeEntries.filter(e => e.id !== id) })),

      clearAll: () => set({
        clients: [], contracts: [], invoices: [], timeEntries: [], income: []
      }),
    }),
    { name: 'stacklite-guest-data' }
  )
)
```

### 3. Guest Data Types

```ts
// src/types/guest.ts

export interface GuestClient {
  id:        string   // nanoid() — client-generated
  name:      string
  email?:    string
  phone?:    string
  company?:  string
  notes?:    string
  createdAt: string   // ISO string
}

export interface GuestContract {
  id:               string
  clientId?:        string
  templateType:     string
  projectName:      string
  scope:            string
  deliverables:     { text: string }[]
  exclusions?:      string
  startDate?:       string
  endDate?:         string
  milestones?:      { label: string; date: string }[]
  totalFee?:        number
  currency:         string
  paymentStructure: string
  paymentMethod?:   string
  clauses:          Record<string, { on: boolean; text: string }>
  status:           'draft' | 'sent' | 'signed' | 'archived'
  createdAt:        string
  updatedAt:        string
}

export interface GuestInvoice {
  id:            string
  clientId?:     string
  invoiceNumber: string
  issueDate:     string
  dueDate:       string
  lineItems:     { description: string; qty: number; rate: number }[]
  taxRate?:      number
  discount?:     number
  total:         number
  currency:      string
  status:        'unpaid' | 'paid' | 'overdue'
  createdAt:     string
}

export interface GuestTimeEntry {
  id:        string
  clientId?: string
  task:      string
  notes?:    string
  duration:  number   // seconds
  loggedAt:  string
}

export interface GuestIncome {
  month:    string   // 'YYYY-MM'
  total:    number
  currency: string
}
```

---

## Guest Session Indicator (Top Bar)

A **subtle, always-visible indicator** in the top bar. Not a banner. Not a popup. Just a small persistent nudge.

```
[💾 Guest session · Save your work →]
```

- Sits in the top bar next to the clock
- Clicking it opens the Save Prompt modal
- Styled with `bg-background-highlight` and `text-text-muted` — never draws too much attention
- Never auto-dismisses

```tsx
// src/components/workspace/GuestIndicator.tsx

export function GuestIndicator() {
  const { isGuest } = useSessionStore()
  const { openSavePrompt } = useSavePromptStore()

  if (!isGuest) return null

  return (
    <button
      onClick={openSavePrompt}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg
                 bg-background-highlight text-text-muted text-xs
                 hover:text-text-base transition-colors"
      aria-label="Save your guest session"
    >
      <span>💾</span>
      <span>Guest session · Save your work</span>
    </button>
  )
}
```

---

## Save Prompt Modal

Triggered **only** when a guest hits:
- Download PDF (Contract Generator or Invoice Generator)
- Copy Share Link (Contract Generator)

### Behaviour

1. The user's action (PDF download / copy link) is **not blocked**
2. The modal appears **after** the action completes or simultaneously
3. Two options: Create Account or Continue as Guest

```tsx
// src/components/workspace/SavePromptModal.tsx

export function SavePromptModal() {
  const { isOpen, pendingAction, close } = useSavePromptStore()

  const handleCreateAccount = () => {
    close()
    // Redirect to sign up with migration flag
    router.push('/auth?mode=signup&migrate=true')
  }

  const handleContinueAsGuest = () => {
    close()
    // Execute the original pending action (PDF / link)
    pendingAction?.()
  }

  return (
    <Modal isOpen={isOpen} onClose={close}>
      <div className="flex flex-col gap-6 p-6">

        <div>
          <h2 className="text-text-base text-lg font-semibold mb-2">
            Save your work permanently
          </h2>
          <p className="text-text-muted text-sm leading-relaxed">
            Create a free Stacklite account to save this and access
            your workspace from anywhere. Takes 30 seconds.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleCreateAccount}
            className="w-full py-3 rounded-lg bg-button-primary
                       text-button-primaryFg font-medium text-sm"
          >
            Create Free Account
          </button>
          <button
            onClick={handleContinueAsGuest}
            className="w-full py-3 rounded-lg border border-border-base
                       text-text-muted text-sm"
          >
            Continue as Guest
          </button>
        </div>

        <p className="text-center text-xs text-text-disabled">
          Your current work is safe in your browser until you close it.
        </p>

      </div>
    </Modal>
  )
}
```

### Save Prompt Store

```ts
// src/stores/savePromptStore.ts

interface SavePromptStore {
  isOpen:        boolean
  pendingAction: (() => void) | null
  openWithAction: (action: () => void) => void
  close:         () => void
}

export const useSavePromptStore = create<SavePromptStore>((set) => ({
  isOpen:        false,
  pendingAction: null,
  openWithAction: (action) => set({ isOpen: true, pendingAction: action }),
  close:         () => set({ isOpen: false, pendingAction: null }),
}))
```

### How to Trigger It from a Module

```ts
// Inside ContractGenerator.tsx — Download PDF action

const { isGuest } = useSessionStore()
const { openWithAction } = useSavePromptStore()

const handleDownloadPDF = () => {
  const download = () => generateAndDownloadPDF(contractData)

  if (isGuest) {
    openWithAction(download)  // Show prompt, pass download as pending action
  } else {
    download()                // Authenticated — just download
  }
}
```

This pattern is the same for every trigger point across all modules.

---

## Data Migration on Sign-Up

This is the most critical part. When a guest creates an account, their localStorage data must migrate to Supabase **before** they land on the workspace.

### Migration Flow

```
Guest clicks "Create Account"
        │
        ▼
Auth page loads with ?migrate=true flag
        │
        ▼
User completes sign up (email or Google)
        │
        ▼
Supabase auth callback fires
        │
        ▼
/auth/callback reads migrate flag
        │
        ▼
runGuestMigration(userId) called
        │
        ├── Read guestStore from localStorage
        ├── Batch insert clients → Supabase
        ├── Batch insert contracts → Supabase (with new user_id)
        ├── Batch insert invoices → Supabase
        ├── Batch insert time entries → Supabase
        │
        ▼
Migration success → guestStore.clearAll()
        │
        ▼
sessionStore.setGuest(false)
        │
        ▼
Redirect to /workspace
(user sees their data already there)
```

### Migration Function

```ts
// src/lib/migration/migrateGuestData.ts

import { createClient } from '@/lib/supabase/client'
import { useGuestStore } from '@/stores/guestStore'

export async function migrateGuestData(userId: string): Promise<void> {
  const supabase = createClient()
  const guest = useGuestStore.getState()

  try {
    // Build a client ID map (guest IDs → new Supabase UUIDs)
    const clientIdMap = new Map<string, string>()

    // 1. Migrate clients first (other records reference them)
    if (guest.clients.length > 0) {
      const { data: insertedClients, error } = await supabase
        .from('clients')
        .insert(
          guest.clients.map((c) => ({
            user_id:   userId,
            name:      c.name,
            email:     c.email,
            phone:     c.phone,
            company:   c.company,
            notes:     c.notes,
          }))
        )
        .select('id')

      if (error) throw new Error(`Client migration failed: ${error.message}`)

      // Map old guest IDs to new Supabase IDs
      guest.clients.forEach((c, i) => {
        if (insertedClients?.[i]) {
          clientIdMap.set(c.id, insertedClients[i].id)
        }
      })
    }

    // 2. Migrate contracts
    if (guest.contracts.length > 0) {
      const { error } = await supabase
        .from('contracts')
        .insert(
          guest.contracts.map((c) => ({
            user_id:          userId,
            client_id:        c.clientId ? clientIdMap.get(c.clientId) : null,
            template_type:    c.templateType,
            project_name:     c.projectName,
            scope:            c.scope,
            deliverables:     c.deliverables,
            exclusions:       c.exclusions,
            start_date:       c.startDate,
            end_date:         c.endDate,
            milestones:       c.milestones,
            total_fee:        c.totalFee,
            currency:         c.currency,
            payment_structure: c.paymentStructure,
            payment_method:   c.paymentMethod,
            clauses:          c.clauses,
            status:           c.status,
          }))
        )

      if (error) throw new Error(`Contract migration failed: ${error.message}`)
    }

    // 3. Migrate invoices
    if (guest.invoices.length > 0) {
      const { error } = await supabase
        .from('invoices')
        .insert(
          guest.invoices.map((inv) => ({
            user_id:        userId,
            client_id:      inv.clientId ? clientIdMap.get(inv.clientId) : null,
            invoice_number: inv.invoiceNumber,
            issue_date:     inv.issueDate,
            due_date:       inv.dueDate,
            line_items:     inv.lineItems,
            tax_rate:       inv.taxRate,
            discount:       inv.discount,
            total:          inv.total,
            currency:       inv.currency,
            status:         inv.status,
          }))
        )

      if (error) throw new Error(`Invoice migration failed: ${error.message}`)
    }

    // 4. Migrate time entries
    if (guest.timeEntries.length > 0) {
      const { error } = await supabase
        .from('time_entries')
        .insert(
          guest.timeEntries.map((e) => ({
            user_id:   userId,
            client_id: e.clientId ? clientIdMap.get(e.clientId) : null,
            task:      e.task,
            notes:     e.notes,
            duration:  e.duration,
            logged_at: e.loggedAt,
          }))
        )

      if (error) throw new Error(`Time entry migration failed: ${error.message}`)
    }

    // 5. All done — clear guest data
    guest.clearAll()

  } catch (err) {
    // Migration failed — do NOT clear guest data
    // User's work is preserved in localStorage
    // Log the error and show a soft warning
    console.error('Guest migration error:', err)
    throw err
  }
}
```

### Auth Callback Handler

```ts
// src/app/auth/callback/route.ts

import { migrateGuestData } from '@/lib/migration/migrateGuestData'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code    = searchParams.get('code')
  const migrate = searchParams.get('migrate') === 'true'

  if (code) {
    const supabase = createServerClient()
    const { data: { session } } = await supabase.auth.exchangeCodeForSession(code)

    if (session && migrate) {
      try {
        await migrateGuestData(session.user.id)
      } catch {
        // Migration failed — redirect with warning flag
        return NextResponse.redirect(new URL('/workspace?migration=failed', request.url))
      }
    }
  }

  return NextResponse.redirect(new URL('/workspace', request.url))
}
```

### Migration Failure Handling

If migration fails, the user still lands on their workspace. Their guest data is **still in localStorage** — not lost. A soft toast appears:

```
"Some data couldn't be saved automatically.
 Your work is still in your browser. [Retry]"
```

Never show a hard error. Never lose their work.

---

## Module Behaviour in Guest Mode

Every module reads from `guestStore` when `isGuest === true`, and from Supabase when `isGuest === false`. This is handled by a **data access hook** per module — not directly in the component.

```ts
// src/hooks/useClients.ts

export function useClients() {
  const { isGuest }               = useSessionStore()
  const guestClients              = useGuestStore((s) => s.clients)
  const [supabaseClients, setClients] = useState<Client[]>([])

  useEffect(() => {
    if (!isGuest) {
      // Fetch from Supabase
      supabase.from('clients').select('*').then(({ data }) => {
        if (data) setClients(data)
      })
    }
  }, [isGuest])

  return isGuest ? guestClients : supabaseClients
}
```

Same pattern for `useContracts`, `useInvoices`, `useTimeEntries`. Components never know or care whether the user is a guest — they just call the hook.

---

## What Changes Per Module

| Module | Guest behaviour | Trigger point |
|---|---|---|
| **Client Manager** | Reads/writes `guestStore.clients` | No trigger — no PDF/link output |
| **Contract Generator** | Reads/writes `guestStore.contracts` | Download PDF → Save Prompt / Copy Link → Save Prompt |
| **Invoice Generator** | Reads/writes `guestStore.invoices` | Download PDF → Save Prompt |
| **Time Tracker** | Reads/writes `guestStore.timeEntries` | No trigger — no PDF/link output |
| **Income Tracker** | Reads from `guestStore.invoices` | No trigger — view only |

---

## localStorage Keys

| Key | Contents |
|---|---|
| `stacklite-session` | `{ isGuest: boolean }` |
| `stacklite-guest-data` | All guest module data |

Both managed by Zustand `persist` middleware. No manual `localStorage.setItem` calls anywhere in the codebase.

---

## What Authenticated Users Never See

- The GuestIndicator component (returns null if `isGuest === false`)
- The Save Prompt modal (never triggered for auth users)
- Any guest store reads

The guest layer is completely invisible to signed-in users.

---

## File Structure

```
src/
├── stores/
│   ├── guestStore.ts           # All guest data + persist
│   ├── sessionStore.ts         # isGuest flag + persist
│   └── savePromptStore.ts      # Modal open/close + pending action
│
├── hooks/
│   ├── useClients.ts           # Guest/auth-aware data hook
│   ├── useContracts.ts
│   ├── useInvoices.ts
│   └── useTimeEntries.ts
│
├── lib/
│   └── migration/
│       └── migrateGuestData.ts # Full migration function
│
├── components/
│   └── workspace/
│       ├── GuestIndicator.tsx  # Top bar nudge
│       └── SavePromptModal.tsx # Conversion modal
│
└── app/
    └── auth/
        └── callback/
            └── route.ts        # Migration trigger on sign-up
```

---

## Implementation Order

Build in this exact order — each step depends on the previous:

1. `sessionStore.ts` — guest flag with persist
2. `guestStore.ts` — all guest data with persist
3. Guest data types in `src/types/guest.ts`
4. Auth page — add "Try Without Account" button
5. `GuestIndicator.tsx` — top bar nudge
6. `savePromptStore.ts` — modal state
7. `SavePromptModal.tsx` — the prompt UI
8. Data access hooks (`useClients`, `useContracts`, etc.)
9. Wire save prompt into Contract Generator (Download PDF + Copy Link)
10. Wire save prompt into Invoice Generator (Download PDF)
11. `migrateGuestData.ts` — migration function
12. Auth callback — trigger migration on sign-up
13. Migration failure toast in workspace

---

## Rules for the Agent

- Never call Supabase when `isGuest === true`
- Never call `localStorage` directly — always use Zustand `persist`
- Never clear `guestStore` unless migration has fully succeeded
- Never block the user's action (PDF/link) to show the save prompt — action executes regardless
- The `isGuest` check always lives in the hook layer — never inside module components directly
- Guest IDs use `nanoid()` — never `crypto.randomUUID()` (requires HTTPS, breaks in some dev environments)

---

## Post-MVP Enhancements

- Guest session expiry warning after 7 days of inactivity
- "Import from browser" option for returning guests who previously used the tool
- Guest data size limit warning (localStorage cap is ~5MB)

---

*Guest Mode Plan — Stacklite by Siddhartha Dwivedi*
*Status: Ready for implementation*
