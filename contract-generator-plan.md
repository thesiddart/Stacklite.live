# Contract Generator — Complete Plan
> Stacklite · Module: Contract Generator · Version 1.0 · March 2026

---

## Full Flow Overview

```
Canvas Dock → Template Pick → Form (5 sections) → Live Preview → Save Draft → Share / Download
```

---

## Phase 1 — Entry Point (Canvas State)

The Contract Generator lives in the **bottom dock**. When clicked, the center canvas card expands in place — no modal, no overlay, no navigation.

The expanded card has **two columns**:
- **Left column** — the form
- **Right column** — live document preview

Both visible at the same time. Always. The freelancer never has to guess what the output will look like.

If a draft already exists, the card opens to the **contracts list** instead of the template picker — showing all saved contracts with status badges.

---

## Phase 2 — Template Picker

First screen inside the expanded card. Five options displayed as selectable tiles:

```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  General        │  │  Design         │  │  Development    │
│  Freelance      │  │  Project        │  │  Project        │
│                 │  │                 │  │                 │
│  All-purpose    │  │  Revisions,     │  │  IP ownership,  │
│  agreement      │  │  deliverables   │  │  repo handover  │
└─────────────────┘  └─────────────────┘  └─────────────────┘

┌─────────────────┐  ┌─────────────────┐
│  Consulting     │  │  Blank          │
│  Retainer       │  │                 │
│                 │  │  Start from     │
│  Monthly terms  │  │  scratch        │
└─────────────────┘  └─────────────────┘
```

Each template pre-fills relevant sections with sensible defaults. Picking one is instant — the form appears immediately with those defaults loaded.

### Template Default Content

| Template | Pre-filled defaults |
|---|---|
| General Freelance | Basic scope, full upfront payment, standard IP + termination clauses |
| Design Project | Deliverables list, revision rounds, design ownership on full payment |
| Development Project | Repo handover clause, IP ownership, milestone-based payment |
| Consulting Retainer | Monthly fee, rolling termination notice, confidentiality on by default |
| Blank | All fields empty |

---

## Phase 3 — The Form (5 Sections)

Not one long scroll. A **section stepper** — each section is a focused block. The freelancer moves through them in order but can jump back freely.

```
① Parties  →  ② Project  →  ③ Timeline  →  ④ Payment  →  ⑤ Terms
```

Progress shown as a simple step indicator at the top of the form column.

---

### Section 1 — Parties

| Field | Behaviour |
|---|---|
| Freelancer name | Auto-filled from user profile |
| Freelancer email | Auto-filled from user profile |
| Freelancer location | Auto-filled from user profile |
| Client | Dropdown — pulls from Client Manager via `clientStore` |
| Add new client | Inline shortcut if client doesn't exist — no leaving the flow |

When a client is selected, their name, email, and company auto-populate from the Client Manager. No re-typing.

EVA email validation runs silently on the client email field on blur — inline indicator only (green check / soft warning). Never blocks the flow.

---

### Section 2 — Project

| Field | Behaviour |
|---|---|
| Project name | Text input |
| Scope of work | Rich text area — core of the contract |
| Deliverables | Repeatable bullet list — add / remove rows |
| Not included | Optional — explicitly defines what's out of scope |

The "Not included" field is collapsed by default with a `+ Add exclusions` toggle. Reduces visual noise for simple contracts.

---

### Section 3 — Timeline

| Field | Behaviour |
|---|---|
| Start date | Date picker |
| End date | Date picker |
| Milestones | Optional repeatable rows — label + date |

Milestones are collapsed by default. Toggle to add them.

---

### Section 4 — Payment

| Field | Behaviour |
|---|---|
| Total fee | Number input |
| Currency | Dropdown — auto-filled from user preference |
| NPR equivalent | Auto-calculated via Frankfurter — shown as subtle helper text below fee field |
| Payment structure | Radio — Full upfront / 50-50 / Milestone-based / Custom |
| Payment method | Text input (e.g. bank transfer, Wise) |
| Late payment clause | Toggle — pre-written clause, on by default |

The NPR conversion is silent — just a small line below the fee field:
> `≈ NPR 3,18,400 at today's rate`

No separate field. No extra UI. Completely invisible to the user unless they look for it.

---

### Section 5 — Terms

All pre-written clauses. Freelancer can toggle on/off and edit text inline.

| Clause | Default | Notes |
|---|---|---|
| Revision policy | On | "X rounds of revisions included. Additional revisions billed at [rate]." |
| IP / Ownership transfer | On | "Full ownership transfers to client upon receipt of final payment." |
| Termination | On | "Either party may terminate with X days written notice." |
| Confidentiality / NDA | Off | Toggle to include |
| Governing law | On | Auto-suggested from freelancer's country |

Each clause renders as a readable text block with an edit icon. Clicking opens the text inline for editing — no separate editor.

---

## Phase 4 — Live Preview (Right Column)

As each field is filled, the right column renders a **formatted document in real time**.

The preview looks like a real contract — not a form dump:
- Document header with freelancer + client names
- Section headings (Scope, Timeline, Payment Terms, etc.)
- Numbered clauses for Terms section
- Signature lines at the bottom
- Subtle `Generated with Stacklite` footer

The preview is **read-only**. Freelancer edits via the form only. Scrolls independently from the form column.

---

## Phase 5 — Saving

**Auto-save** every 30 seconds while the form is open.
Status shown in card header: `Saving...` → `Saved`

**Manual save** via "Save Draft" button. Saves to Supabase with status `draft`.

### Contract Statuses

| Status | Meaning |
|---|---|
| `draft` | Being worked on — not yet shared |
| `sent` | Shareable link has been generated |
| `signed` | Freelancer manually marked as signed (MVP) |
| `archived` | Old or inactive contracts |

---

## Phase 6 — Output Actions

Two actions available once the form has enough data:

### Download PDF
- Generated client-side using `react-pdf`
- Clean document layout — professional typography, numbered clauses
- File name: `Contract_[ClientName]_[ProjectName].pdf`
- No data sent to any external server

### Copy Shareable Link
- Generates a unique read-only URL: `stacklite.app/c/[token]`
- Token is a UUID stored in Supabase against the contract record
- Client opens the link — sees a clean read-only page, no login required
- Client can print or save to PDF from their own browser
- Contract status automatically updates to `sent` when link is generated

---

## The Shareable Link Page (`/c/[token]`)

A minimal public page — no Stacklite navigation, no login prompt. Just the contract.

```
┌──────────────────────────────────────┐
│  [Stacklite logo — small, top left]  │
│                                      │
│  CONTRACT                            │
│  Between [Freelancer] and [Client]   │
│                                      │
│  [Full contract content]             │
│                                      │
│  Signatures                          │
│  [Freelancer name + date]            │
│  [Client signature line — blank]     │
│                                      │
│  [Print / Save as PDF button]        │
│                                      │
│  Generated with Stacklite            │
└──────────────────────────────────────┘
```

- View only — no editing, no commenting
- No Stacklite account required to view
- `share_token` in the URL is a separate UUID from the internal `id` — never exposes the database record ID

---

## Contracts List (When Drafts Exist)

When the card opens and contracts already exist, the freelancer sees a list instead of the template picker:

```
┌─────────────────────────────────────────────────┐
│  Contracts                          [+ New]     │
├─────────────────────────────────────────────────┤
│  Acme Corp — Brand Design       [draft]  [···]  │
│  John Doe — Web Development     [sent]   [···]  │
│  RetainerCo — Monthly Consult   [signed] [···]  │
└─────────────────────────────────────────────────┘
```

Each row `···` menu contains: Edit, Copy Link, Download PDF, Archive.

`+ New` takes the freelancer back to the template picker.

---

## Database Schema

```sql
contracts (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid REFERENCES auth.users NOT NULL,
  client_id         uuid REFERENCES clients(id),
  template_type     text,     -- 'general' | 'design' | 'development' | 'retainer' | 'blank'
  project_name      text,
  scope             text,
  deliverables      jsonb,    -- [{ text: string }]
  exclusions        text,
  start_date        date,
  end_date          date,
  milestones        jsonb,    -- [{ label: string, date: date }]
  total_fee         numeric,
  currency          text DEFAULT 'USD',
  payment_structure text,     -- 'full' | 'split' | 'milestone' | 'custom'
  payment_method    text,
  clauses           jsonb,    -- { revision: { on: bool, text: string }, ip: {...}, ... }
  share_token       uuid UNIQUE DEFAULT gen_random_uuid(),
  status            text DEFAULT 'draft',
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now()
)
```

### RLS Policy

```sql
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_owns_contracts"
  ON contracts
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

Full user isolation — no user can ever access another user's contracts.

### Public Share Policy (read-only via token)

```sql
CREATE POLICY "public_can_view_by_token"
  ON contracts
  FOR SELECT
  USING (share_token IS NOT NULL AND status != 'draft');
```

Only sent/signed contracts are publicly readable via token. Drafts are never exposed.

---

## Zustand Store Shape

```ts
interface ContractFormData {
  clientId: string
  templateType: 'general' | 'design' | 'development' | 'retainer' | 'blank'
  projectName: string
  scope: string
  deliverables: { text: string }[]
  exclusions: string
  startDate: string
  endDate: string
  milestones: { label: string; date: string }[]
  totalFee: number
  currency: string
  paymentStructure: 'full' | 'split' | 'milestone' | 'custom'
  paymentMethod: string
  clauses: {
    revision: { on: boolean; text: string }
    ip: { on: boolean; text: string }
    termination: { on: boolean; text: string }
    confidentiality: { on: boolean; text: string }
    governingLaw: { on: boolean; text: string }
  }
}

interface ContractStore {
  contracts: Contract[]
  activeContractId: string | null
  formData: Partial<ContractFormData>
  isDirty: boolean
  isSaving: boolean

  setActiveContract: (id: string) => void
  updateFormData: (data: Partial<ContractFormData>) => void
  saveContract: () => Promise<void>
  generateShareLink: (id: string) => Promise<string>
  archiveContract: (id: string) => Promise<void>
}
```

---

## Connection to Other Modules

| Module | How it connects |
|---|---|
| **Client Manager** | Client dropdown reads from `clientStore` — selecting a client auto-fills the entire Parties section |
| **Invoice Generator** | When creating an invoice, existing contracts appear as an optional reference dropdown — links the two records |
| **Time Tracker** | Project name from the contract appears as a selectable project when logging new time entries |

Data flows through Zustand stores — no direct prop passing between modules.

---

## API Integrations in This Module

| API | Where | What it does |
|---|---|---|
| **EVA** | Section 1 — client email field | Silent email validation on blur. Inline indicator only. Never blocks submission. |
| **Frankfurter** | Section 4 — payment fee field | Fetches live USD/EUR → NPR rate. Shows equivalent as helper text. Silent fail. |

---

## Component File Structure

```
src/
└── components/
    └── modules/
        └── contract-generator/
            ├── ContractGenerator.tsx        # Root module card component
            ├── TemplatePickerScreen.tsx     # Template selection tiles
            ├── ContractForm.tsx             # Section stepper wrapper
            ├── sections/
            │   ├── PartiesSection.tsx
            │   ├── ProjectSection.tsx
            │   ├── TimelineSection.tsx
            │   ├── PaymentSection.tsx
            │   └── TermsSection.tsx
            ├── ContractPreview.tsx          # Live read-only document preview
            ├── ContractsList.tsx            # List of saved contracts
            └── ContractCard.tsx             # Single row in the list
```

---

## Post-MVP (Do Not Build Now)

- E-signature — needs DocuSign / HelloSign integration
- Client filling their own fields via the shared link
- Contract versioning and change history
- AI-assisted scope generation
- User-saved custom contract templates
- PDF custom branding (client's logo on the contract)
- Contract expiry / auto-archive after X days

---

*Contract Generator Plan — Stacklite by Siddhartha Dwivedi*
*Status: Ready for implementation*
