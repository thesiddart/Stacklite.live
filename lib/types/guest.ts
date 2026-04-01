/**
 * Guest Data Types
 * Mirror the Supabase schema but with client-generated IDs (nanoid).
 * Used exclusively in localStorage via guestStore.
 */

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
  status: 'draft' | 'sent' | 'signed' | 'archived'
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
