# Invoice Generator — Complete Plan
> Stacklite · Module: Invoice Generator · Version 1.0 · April 2026

---

## Full Flow Overview

```
Canvas Dock → New Invoice → Form (4 sections) → Live Preview → Save Draft → Share / Download / Mark Status
```

---

## Phase 1 — Entry Point (Canvas State)

Same behavior as Contract Generator. Clicking **Invoice Generator** in the bottom dock expands the center canvas card in place — two columns side by side:

- **Left column** — the form
- **Right column** — live invoice preview

If invoices already exist, opens to the **invoices list** instead of a blank form.

---

## Phase 2 — New Invoice Form (4 Sections)

```
① Client & Project  →  ② Line Items  →  ③ Payment Details  →  ④ Notes
```

---

### Section 1 — Client & Project

| Field | Behaviour |
|---|---|
| Client | Dropdown from Client Manager (`clientStore`) — auto-fills name, email, company |
| Reference Contract | Optional dropdown — pulls from existing contracts for this client. Selecting one auto-fills project name. |
| Project name | Auto-filled from contract if selected — editable manually |
| Invoice number | Auto-generated (`INV-001`, `INV-002`, etc.) — editable |
| Issue date | Date picker — defaults to today |
| Due date | Date picker — defaults to today + 14 days |

If no contract exists for the selected client, the reference contract field simply doesn't appear — no empty dropdown confusion.

---

### Section 2 — Line Items

The core of the invoice. A dynamic table of rows.

| Column | Behaviour |
|---|---|
| Description | Text input |
| Qty | Number input — default 1 |
| Rate | Number input |
| Amount | Auto-calculated (Qty × Rate) — read only |

Each row has a delete button. `+ Add Item` appends a new blank row.

**Time Tracker import (optional):**

A subtle `+ Import from Time Tracker` button appears below the line items table. Clicking it opens a small panel showing unlinked time entries for the selected client. The freelancer picks which entries to import — each becomes a line item:

- Task name → Description
- Hours → Qty
- Hourly rate → Rate

This is optional — the freelancer can ignore it and enter line items manually. Both workflows coexist without conflict.

**Subtotal** auto-calculates live as rows are added, edited, or removed.

---

### Section 3 — Payment Details

| Field | Behaviour |
|---|---|
| Currency | Dropdown — auto-filled from user preference |
| NPR equivalent | Live via Frankfurter — subtle helper text below total |
| Tax | Optional percentage — toggle to enable |
| Discount | Optional — flat amount or percentage — toggle to enable |
| Total | Auto-calculated — Subtotal + Tax - Discount |
| Payment method | Text input (bank transfer, Wise, etc.) |
| Payment instructions | Optional text area — bank details, account number, etc. |

Tax and discount are collapsed by default with a toggle. Clean form for simple invoices, powerful when needed.

The NPR conversion shows silently below the total:
> `≈ NPR 3,59,289 at today's rate`

Never a separate field. Never intrusive.

---

### Section 4 — Notes

| Field | Behaviour |
|---|---|
| Notes to client | Optional free text — shown on PDF and shareable link |
| Internal notes | Optional — never shown on PDF or shareable link |

---

## Phase 3 — Live Preview (Right Column)

Real-time document preview as fields are filled. Looks like a professional invoice — not a form dump.

Preview includes:
- Stacklite wordmark — small, top right
- Freelancer info — name, email, location (from profile)
- Client info — name, company, email
- Invoice number + issue date + due date
- Line items table — description, qty, rate, amount
- Subtotal, tax, discount, **total** (prominent)
- NPR equivalent below total — subtle, small
- Payment instructions
- Notes to client
- Status badge — Unpaid / Paid / Overdue

Read-only. Freelancer edits via the form only. Scrolls independently from the form column.

---

## Phase 4 — Invoice Statuses

| Status | Meaning | How it's set |
|---|---|---|
| `draft` | Being worked on | Automatic on creation |
| `unpaid` | Sent to client | Automatic when PDF downloaded or link generated |
| `paid` | Payment received | Manual toggle by freelancer |
| `overdue` | Past due date + unpaid | Computed — not stored |

Overdue is computed at render time — not a stored value in the database:

```ts
const isOverdue = invoice.status === 'unpaid' && new Date(invoice.dueDate) < new Date()
const displayStatus = isOverdue ? 'overdue' : invoice.status
```

---

## Phase 5 — Output Actions

### Download PDF
- Client-side generation via `react-pdf`
- File name: `Invoice_[InvoiceNumber]_[ClientName].pdf`
- Professional layout — line items table, totals section, payment instructions
- Footer: subtle `Generated with Stacklite`
- Status auto-updates to `unpaid` on first download
- Guest mode → triggers Save Prompt (action executes regardless)

### Copy Shareable Link
- Unique read-only URL: `stacklite.app/i/[token]`
- `share_token` is separate from `id` — never exposes internal record ID
- Client sees clean invoice page — no login required
- Client can print or save PDF from their browser
- Status auto-updates to `unpaid` when link is generated
- Guest mode → triggers Save Prompt (action executes regardless)

### Mark as Paid
- One-click toggle on the invoice card and inside the form
- Updates `status` to `paid` in Supabase (or `guestStore`)
- Feeds into Income Tracker automatically

### Email to Client (Post-MVP)
- Not in MVP — placeholder in the UI only
- Tooltip on hover: "Coming soon"

---

## The Shareable Link Page (`/i/[token]`)

Minimal public page — no Stacklite navigation, no login prompt.

```
┌──────────────────────────────────────────┐
│  [Stacklite logo — small, top left]      │
│                                 INVOICE  │
│                                          │
│  From: [Freelancer name + email]         │
│  To:   [Client name + company]           │
│                                          │
│  Invoice No: INV-001                     │
│  Issue Date: 1 Apr 2026                  │
│  Due Date:   15 Apr 2026                 │
│                                          │
│  ┌──────────────┬─────┬────────┬───────┐ │
│  │ Description  │ Qty │  Rate  │  Amt  │ │
│  ├──────────────┼─────┼────────┼───────┤ │
│  │ UI Design    │  1  │ $1,200 │$1,200 │ │
│  │ Development  │  3  │   $400 │$1,200 │ │
│  └──────────────┴─────┴────────┴───────┘ │
│                                          │
│                   Subtotal:    $2,400    │
│                   Tax (13%):     $312    │
│                   Total:      $2,712    │
│              ≈ NPR 3,59,289 today        │
│                                          │
│  Payment: Bank Transfer                  │
│  [Payment instructions]                  │
│                                          │
│  [Notes to client]                       │
│                                          │
│  [Print / Save as PDF]                   │
│                                          │
│  Generated with Stacklite                │
└──────────────────────────────────────────┘
```

- View only — no editing, no commenting
- No Stacklite account required to view
- Internal notes are never shown here

---

## Invoices List (When Invoices Exist)

```
┌──────────────────────────────────────────────────────┐
│  Invoices                                  [+ New]   │
├──────────────────────────────────────────────────────┤
│  INV-001 · Acme Corp · $2,712      [unpaid]  [···]   │
│  INV-002 · John Doe  · $800        [paid]    [···]   │
│  INV-003 · RetainerCo · $1,500     [overdue] [···]   │
└──────────────────────────────────────────────────────┘
```

Each row `···` menu: Edit, Copy Link, Download PDF, Mark as Paid, Archive.

Overdue rows get a subtle red left border — `border-l-2 border-feedback-errorBase`. No aggressive colors.

`+ New` takes the freelancer to a blank form.

---

## Database Schema

```sql
invoices (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              uuid REFERENCES auth.users NOT NULL,
  client_id            uuid REFERENCES clients(id),
  contract_id          uuid REFERENCES contracts(id),      -- optional
  invoice_number       text NOT NULL,
  issue_date           date NOT NULL,
  due_date             date NOT NULL,
  line_items           jsonb NOT NULL,
  -- [{
  --   description: string,
  --   qty: number,
  --   rate: number,
  --   amount: number,
  --   time_entry_id?: string   ← links back to time_entries table
  -- }]
  currency             text DEFAULT 'USD',
  tax_rate             numeric,
  discount_type        text,                               -- 'flat' | 'percent'
  discount_value       numeric,
  subtotal             numeric NOT NULL,
  total                numeric NOT NULL,
  payment_method       text,
  payment_instructions text,
  notes_to_client      text,
  internal_notes       text,                              -- never shown publicly
  share_token          uuid UNIQUE DEFAULT gen_random_uuid(),
  status               text DEFAULT 'draft',
  -- 'draft' | 'unpaid' | 'paid' | 'archived'
  -- 'overdue' is computed at render time — never stored
  created_at           timestamptz DEFAULT now(),
  updated_at           timestamptz DEFAULT now()
)
```

### RLS Policies

```sql
-- User isolation
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_owns_invoices"
  ON invoices FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Public read via share token (non-draft only)
CREATE POLICY "public_view_by_token"
  ON invoices FOR SELECT
  USING (share_token IS NOT NULL AND status != 'draft');
```

---

## Zustand Store Shape

```ts
interface InvoiceLineItem {
  id:            string
  description:   string
  qty:           number
  rate:          number
  amount:        number        // computed: qty * rate
  timeEntryId?:  string        // if imported from Time Tracker
}

interface InvoiceFormData {
  clientId:             string
  contractId?:          string
  invoiceNumber:        string
  issueDate:            string
  dueDate:              string
  lineItems:            InvoiceLineItem[]
  currency:             string
  taxRate?:             number
  discountType?:        'flat' | 'percent'
  discountValue?:       number
  subtotal:             number
  total:                number
  paymentMethod?:       string
  paymentInstructions?: string
  notesToClient?:       string
  internalNotes?:       string
}

interface InvoiceStore {
  invoices:         Invoice[]
  activeInvoiceId:  string | null
  formData:         Partial<InvoiceFormData>
  isDirty:          boolean
  isSaving:         boolean

  setActiveInvoice:   (id: string) => void
  updateFormData:     (data: Partial<InvoiceFormData>) => void
  addLineItem:        () => void
  updateLineItem:     (id: string, data: Partial<InvoiceLineItem>) => void
  removeLineItem:     (id: string) => void
  importTimeEntries:  (entries: TimeEntry[]) => void
  saveInvoice:        () => Promise<void>
  markAsPaid:         (id: string) => Promise<void>
  generateShareLink:  (id: string) => Promise<string>
  archiveInvoice:     (id: string) => Promise<void>
}
```

---

## Connection to Other Modules

| Module | How it connects |
|---|---|
| **Client Manager** | Client dropdown reads from `clientStore` — auto-fills all client details |
| **Contract Generator** | Optional reference dropdown — links invoice to an existing contract record |
| **Time Tracker** | Optional import panel — unlinked time entries become line items |
| **Income Tracker** | Every invoice with `status === 'paid'` feeds into monthly earnings automatically |

Data flows through Zustand stores — no direct prop passing between modules.

---

## API Integrations in This Module

| API | Where | What it does |
|---|---|---|
| **Frankfurter** | Payment Details section | Fetches live rate — shows NPR equivalent below total as helper text. Silent fail — if call fails, helper text simply doesn't appear. |
| **EVA** | Client section | Already validated at Client Manager entry point — no re-validation needed here. |

---

## Key Differences from Contract Generator

| | Contract Generator | Invoice Generator |
|---|---|---|
| Core content | Text-heavy (scope, clauses) | Number-heavy (line items, totals) |
| Live calculations | None | Subtotal, tax, discount, total auto-calculate |
| Time Tracker link | None | Optional import of time entries as line items |
| Contract link | N/A | Optional reference to existing contract |
| Status logic | Manual only | `overdue` computed from due date automatically |
| Income Tracker | No connection | Every `paid` invoice feeds Income Tracker |
| Shareable link path | `/c/[token]` | `/i/[token]` |

---

## Component File Structure

```
src/
└── components/
    └── modules/
        └── invoice-generator/
            ├── InvoiceGenerator.tsx         # Root module card
            ├── InvoiceForm.tsx              # Section stepper wrapper
            ├── sections/
            │   ├── ClientProjectSection.tsx
            │   ├── LineItemsSection.tsx
            │   ├── PaymentDetailsSection.tsx
            │   └── NotesSection.tsx
            ├── TimeEntryImportPanel.tsx     # Optional time import UI
            ├── InvoicePreview.tsx           # Live read-only preview
            ├── InvoicesList.tsx             # List of saved invoices
            └── InvoiceCard.tsx             # Single row in list
```

---

## Auto-Save Behaviour

Same as Contract Generator:
- Auto-save every 30 seconds while form is open
- Status shown in card header: `Saving...` → `Saved`
- Manual save via "Save Draft" button
- Draft persists across page refreshes via Supabase (auth) or `guestStore` (guest)

---

## Calculation Logic

All calculations are pure functions — no side effects:

```ts
// src/lib/utils/invoiceCalculations.ts

export const calcLineAmount = (qty: number, rate: number): number =>
  parseFloat((qty * rate).toFixed(2))

export const calcSubtotal = (items: InvoiceLineItem[]): number =>
  parseFloat(items.reduce((sum, item) => sum + item.amount, 0).toFixed(2))

export const calcTax = (subtotal: number, taxRate: number): number =>
  parseFloat(((subtotal * taxRate) / 100).toFixed(2))

export const calcDiscount = (
  subtotal: number,
  type: 'flat' | 'percent',
  value: number
): number =>
  type === 'percent'
    ? parseFloat(((subtotal * value) / 100).toFixed(2))
    : parseFloat(value.toFixed(2))

export const calcTotal = (
  subtotal: number,
  tax: number,
  discount: number
): number => parseFloat((subtotal + tax - discount).toFixed(2))
```

These run inside the Zustand store on every `updateLineItem` call — never in the component.

---

## Post-MVP Features

- Email invoice to client (Resend / SMTP integration)
- Recurring invoice templates
- Payment link integration (Stripe, etc.)
- Invoice reminder automation (due date warnings)
- Multi-currency totals on the same invoice
- Bulk mark as paid
- Invoice aging report

---

*Invoice Generator Plan — Stacklite by Siddhartha Dwivedi*
*Status: Ready for implementation*