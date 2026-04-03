/**
 * Stacklite Core Domain Types
 * All tables include user_id for RLS enforcement
 */

/**
 * User Profile (linked to auth.users)
 */
export interface UserProfile {
  id: string
  email: string
  fullName: string | null
  companyName: string | null
  companyAddress: string | null
  taxId: string | null
  createdAt: string
  updatedAt: string
}

/**
 * Client
 * Central data store used across all modules
 */
export interface Client {
  id: string
  user_id: string
  name: string
  email: string | null
  phone: string | null
  company_name: string | null
  address: string | null
  contact_person_first_name: string | null
  contact_person_last_name: string | null
  company_type: string | null
  tax_id: string | null
  website: string | null
  industry: string | null
  preferred_contact_method: string | null
  payment_currency: string
  payment_terms: string | null
  country: string | null
  state_province: string | null
  postal_code: string | null
  is_active: boolean
  tags: string[] | null
  metadata: Record<string, unknown> | null
  last_contacted_at: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

/**
 * Contract Document
 */
export interface Contract {
  id: string
  userId: string
  clientId: string | null
  projectScope: string
  timeline: string | null
  paymentTerms: string
  deliverables: string | null
  clauses: string | null
  status: 'sent' | 'signed' | 'archived'
  pdfUrl: string | null
  createdAt: string
  updatedAt: string
}

/**
 * Invoice with line items
 */
export interface Invoice {
  id: string
  userId: string
  clientId: string | null
  contractId: string | null
  invoiceNumber: string
  issueDate: string
  dueDate: string
  lineItems: InvoiceLineItem[]
  taxRate: number
  discountType: 'flat' | 'percent' | null
  discountValue: number | null
  subtotal: number
  tax: number
  total: number
  currency: string
  paymentMethod: string | null
  paymentInstructions: string | null
  notesToClient: string | null
  internalNotes: string | null
  status: 'unpaid' | 'paid' | 'archived'
  paidAt: string | null
  shareToken: string | null
  pdfUrl: string | null
  createdAt: string
  updatedAt: string
}

/**
 * Invoice line item
 */
export interface InvoiceLineItem {
  id: string
  invoiceId: string
  description: string
  quantity: number
  rate: number
  amount: number
  createdAt: string
}

/**
 * Time Entry
 * Links to client and can be converted to invoice line items
 */
export interface TimeEntry {
  id: string
  userId: string
  clientId: string | null
  task: string
  notes: string | null
  duration: number // in minutes
  invoiceId: string | null // link to invoice if billed
  loggedAt: string
}

/**
 * Income Summary (aggregated from invoices)
 */
export interface IncomeSummary {
  monthYear: string
  paid: number
  unpaid: number
  overdue: number
  total: number
}

/**
 * API Response types
 */
export interface ApiResponse<T> {
  data: T | null
  error: ApiError | null
  success: boolean
}

export interface ApiError {
  code: string
  message: string
  details?: unknown
}

/**
 * Pagination
 */
export interface PaginationParams {
  page: number
  limit: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}
