import { createClient as createSupabaseClient } from '@/lib/supabase/client'
import { invoiceSchema, updateInvoiceSchema } from '@/lib/validations/invoice'
import type { Invoice, InvoiceInsert, InvoiceUpdate } from '@/lib/types/database'
import type { InvoiceFormData, UpdateInvoiceFormData } from '@/lib/validations/invoice'
import { generateInvoiceNumber } from '@/lib/utils/invoiceCalculations'

function toInvoiceApiError(action: string, message: string): Error {
  if (message.includes("Could not find the table 'public.invoices' in the schema cache")) {
    return new Error(
      "Database is not initialized: 'public.invoices' table is missing. Apply Supabase migrations to your active project and refresh."
    )
  }

  return new Error(`Failed to ${action}: ${message}`)
}

/**
 * Invoice API Layer
 * All functions use RLS — no manual user_id filtering needed
 */

export async function getInvoices(): Promise<Invoice[]> {
  const supabase = createSupabaseClient()

  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .order('updated_at', { ascending: false })

  if (error) {
    throw toInvoiceApiError('fetch invoices', error.message)
  }

  return data as Invoice[]
}

export async function getInvoice(id: string): Promise<Invoice> {
  const supabase = createSupabaseClient()

  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    throw toInvoiceApiError('fetch invoice', error.message)
  }

  return data as Invoice
}

export async function getInvoiceByToken(token: string): Promise<Invoice | null> {
  const supabase = createSupabaseClient()

  const { data, error } = await supabase
    .from('invoices')
    .select('*, clients(name, email, company_name)')
    .eq('share_token', token)
    .in('status', ['unpaid', 'paid'])
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw toInvoiceApiError('fetch shared invoice', error.message)
  }

  return data as Invoice
}

async function getNextInvoiceNumber(supabase: ReturnType<typeof createSupabaseClient>): Promise<string> {
  const { count, error } = await supabase
    .from('invoices')
    .select('*', { count: 'exact', head: true })

  if (error) {
    return generateInvoiceNumber(0)
  }

  return generateInvoiceNumber(count ?? 0)
}

export async function createInvoice(formData: InvoiceFormData): Promise<Invoice> {
  const supabase = createSupabaseClient()
  const validated = invoiceSchema.parse(formData)

  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error('User not authenticated')
  }

  if (!user.email) {
    throw new Error('Authenticated user email is missing')
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({ id: user.id, email: user.email }, { onConflict: 'id' })

  if (profileError) {
    throw new Error(`Failed to ensure profile: ${profileError.message}`)
  }

  let invoiceNumber = validated.invoice_number || await getNextInvoiceNumber(supabase)

  const buildInsertData = (): InvoiceInsert => ({
    user_id: user.id,
    client_id: validated.client_id,
    contract_id: validated.contract_id,
    invoice_number: invoiceNumber,
    issue_date: validated.issue_date,
    due_date: validated.due_date,
    line_items: JSON.parse(JSON.stringify(validated.line_items)),
    subtotal: validated.subtotal,
    tax_rate: validated.tax_rate ?? 0,
    tax_amount: validated.tax_rate
      ? parseFloat(((validated.subtotal * validated.tax_rate) / 100).toFixed(2))
      : 0,
    discount_type: validated.discount_type,
    discount_value: validated.discount_value,
    total: validated.total,
    currency: validated.currency,
    payment_method: validated.payment_method,
    payment_instructions: validated.payment_instructions,
    notes_to_client: validated.notes_to_client,
    internal_notes: validated.internal_notes,
    status: validated.status || 'unpaid',
  })

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const { data, error } = await supabase
      .from('invoices')
      .insert(buildInsertData())
      .select()
      .single()

    if (!error) {
      return data as Invoice
    }

    const message = error.message || ''
    if (/duplicate key value|unique constraint/i.test(message) && /invoice_number/i.test(message)) {
      invoiceNumber = await getNextInvoiceNumber(supabase)
      continue
    }

    throw toInvoiceApiError('create invoice', message)
  }

  throw new Error('Failed to create invoice after retrying invoice number generation')
}

export async function updateInvoice(
  id: string,
  formData: UpdateInvoiceFormData
): Promise<Invoice> {
  const supabase = createSupabaseClient()
  const validated = updateInvoiceSchema.parse(formData)
  const hasContractIdInPayload = Object.prototype.hasOwnProperty.call(formData, 'contract_id')

  const updateData: InvoiceUpdate = {}

  if (validated.client_id !== undefined) updateData.client_id = validated.client_id
  if (hasContractIdInPayload && validated.contract_id !== undefined) {
    updateData.contract_id = validated.contract_id
  }
  if (validated.invoice_number !== undefined) updateData.invoice_number = validated.invoice_number
  if (validated.issue_date !== undefined) updateData.issue_date = validated.issue_date
  if (validated.due_date !== undefined) updateData.due_date = validated.due_date
  if (validated.line_items !== undefined)
    updateData.line_items = JSON.parse(JSON.stringify(validated.line_items))
  if (validated.subtotal !== undefined) updateData.subtotal = validated.subtotal
  if (validated.tax_rate !== undefined) {
    updateData.tax_rate = validated.tax_rate ?? 0
    updateData.tax_amount = validated.tax_rate && validated.subtotal
      ? parseFloat(((validated.subtotal * validated.tax_rate) / 100).toFixed(2))
      : 0
  }
  if (validated.discount_type !== undefined) updateData.discount_type = validated.discount_type
  if (validated.discount_value !== undefined) updateData.discount_value = validated.discount_value
  if (validated.total !== undefined) updateData.total = validated.total
  if (validated.currency !== undefined) updateData.currency = validated.currency
  if (validated.payment_method !== undefined) updateData.payment_method = validated.payment_method
  if (validated.payment_instructions !== undefined) updateData.payment_instructions = validated.payment_instructions
  if (validated.notes_to_client !== undefined) updateData.notes_to_client = validated.notes_to_client
  if (validated.internal_notes !== undefined) updateData.internal_notes = validated.internal_notes
  if (validated.status !== undefined) updateData.status = validated.status

  const performUpdate = async (payload: InvoiceUpdate) => {
    const { data, error } = await supabase
      .from('invoices')
      .update(payload)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw toInvoiceApiError('update invoice', error.message)
    }

    return data as Invoice
  }

  return performUpdate(updateData)
}

export async function deleteInvoice(id: string): Promise<void> {
  const supabase = createSupabaseClient()

  const { error } = await supabase
    .from('invoices')
    .delete()
    .eq('id', id)

  if (error) {
    throw toInvoiceApiError('delete invoice', error.message)
  }
}

export async function generateInvoiceShareLink(id: string): Promise<string> {
  const supabase = createSupabaseClient()

  const { data, error } = await supabase
    .from('invoices')
    .update({ status: 'unpaid' })
    .eq('id', id)
    .select('share_token')
    .single()

  if (error) {
    throw toInvoiceApiError('generate share link', error.message)
  }

  let shareToken = data?.share_token || null

  if (!shareToken) {
    const fallbackToken = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`

    const { data: tokenData, error: tokenError } = await supabase
      .from('invoices')
      .update({ status: 'unpaid', share_token: fallbackToken })
      .eq('id', id)
      .select('share_token')
      .single()

    if (tokenError) {
      throw toInvoiceApiError('generate share link', tokenError.message)
    }

    shareToken = tokenData?.share_token || null
  }

  if (!shareToken) {
    throw new Error('Failed to generate share link: share token is missing')
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  return `${baseUrl}/i/${shareToken}`
}

export async function markInvoicePaid(id: string): Promise<Invoice> {
  const supabase = createSupabaseClient()

  const { data, error } = await supabase
    .from('invoices')
    .update({ status: 'paid', paid_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw toInvoiceApiError('mark invoice as paid', error.message)
  }

  return data as Invoice
}
