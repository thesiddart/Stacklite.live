/**
 * Guest Data Types
 * Mirror the Supabase schema but with client-generated IDs (nanoid).
 * Used exclusively in guestStore.
 */

export interface GuestStore {
  clients: GuestClient[]
  contracts: GuestContract[]
  invoices: GuestInvoice[]
  timeEntries: GuestTimeEntry[]
  createdAt: number | null

  addClient: (client: GuestClient) => void
  updateClient: (id: string, data: Partial<GuestClient>) => void
  deleteClient: (id: string) => void

  addContract: (contract: GuestContract) => void
  updateContract: (id: string, data: Partial<GuestContract>) => void
  deleteContract: (id: string) => void

  addInvoice: (invoice: GuestInvoice) => void
  updateInvoice: (id: string, data: Partial<GuestInvoice>) => void
  deleteInvoice: (id: string) => void

  addTimeEntry: (entry: GuestTimeEntry) => void
  updateTimeEntry: (id: string, data: Partial<GuestTimeEntry>) => void
  deleteTimeEntry: (id: string) => void

  clearAll: () => void
}

export interface GuestClient {
  id: string          // nanoid-generated
  name: string
  email: string | null
  phone: string | null
  company_name: string | null
  address: string | null
  notes: string | null
  tags: string[] | null
  is_active: boolean
  created_at: string  // ISO string
  updated_at: string
}

export interface GuestContract {
  id: string
  client_id: string | null
  template_type: string | null
  project_name: string | null
  scope: string | null
  deliverables: { text: string }[]
  exclusions: string | null
  start_date: string | null
  end_date: string | null
  milestones: { label: string; date: string }[]
  total_fee: number | null
  currency: string
  payment_structure: string | null
  payment_method: string | null
  clauses: Record<string, { on: boolean; text: string }>
  status: 'sent' | 'signed' | 'archived'
  created_at: string
  updated_at: string
}

export interface GuestInvoice {
  id: string
  client_id: string | null
  contract_id: string | null
  invoice_number: string
  issue_date: string
  due_date: string
  line_items: { id: string; description: string; qty: number; rate: number; amount: number; timeEntryId?: string }[]
  currency: string
  tax_rate: number | null
  discount_type: string | null
  discount_value: number | null
  subtotal: number
  total: number
  payment_method: string | null
  payment_instructions: string | null
  notes_to_client: string | null
  internal_notes: string | null
  status: 'unpaid' | 'paid' | 'archived'
  created_at: string
  updated_at: string
}

export interface GuestTimeEntry {
  id: string
  client_id: string | null
  task_name: string
  notes: string | null
  start_time: string
  end_time: string | null
  duration_seconds: number | null
  is_running: boolean
  created_at: string
  updated_at: string
}
