import { createClient as createSupabaseClient } from '@/lib/supabase/client'
import { contractSchema, updateContractSchema } from '@/lib/validations/contract'
import type { Contract, ContractInsert, ContractUpdate } from '@/lib/types/database'
import type { ContractFormData, UpdateContractFormData } from '@/lib/validations/contract'

function toContractApiError(action: string, message: string): Error {
  if (message.includes("Could not find the table 'public.contracts' in the schema cache")) {
    return new Error(
      "Database is not initialized: 'public.contracts' table is missing. Apply Supabase migrations to your active project and refresh."
    )
  }

  return new Error(`Failed to ${action}: ${message}`)
}

function getContractNumber(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const rand = String(Math.floor(Math.random() * 1000)).padStart(3, '0')

  return `CT-${year}${month}${day}-${rand}`
}

/**
 * Contract API Layer
 * All functions use RLS — no manual user_id filtering needed
 */

/**
 * Get all contracts for the authenticated user
 */
export async function getContracts(): Promise<Contract[]> {
  const supabase = createSupabaseClient()

  const { data, error } = await supabase
    .from('contracts')
    .select('*')
    .order('updated_at', { ascending: false })

  if (error) {
    throw toContractApiError('fetch contracts', error.message)
  }

  return data as Contract[]
}

/**
 * Get a single contract by ID
 */
export async function getContract(id: string): Promise<Contract> {
  const supabase = createSupabaseClient()

  const { data, error } = await supabase
    .from('contracts')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    throw toContractApiError('fetch contract', error.message)
  }

  return data as Contract
}

/**
 * Get a contract by share_token (public, no auth required)
 * RLS policy "public_can_view_by_token" permits this SELECT
 */
export async function getContractByToken(token: string): Promise<Contract | null> {
  const supabase = createSupabaseClient()

  const { data, error } = await supabase
    .from('contracts')
    .select('*')
    .eq('share_token', token)
    .neq('status', 'draft')
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // Not found
    throw toContractApiError('fetch shared contract', error.message)
  }

  return data as Contract
}

/**
 * Create a new contract
 */
export async function createContract(formData: ContractFormData): Promise<Contract> {
  const supabase = createSupabaseClient()
  const validated = contractSchema.parse(formData)

  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error('User not authenticated')
  }

  if (!user.email) {
    throw new Error('Authenticated user email is missing')
  }

  // Ensure profile row exists
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({ id: user.id, email: user.email }, { onConflict: 'id' })

  if (profileError) {
    throw new Error(`Failed to ensure profile: ${profileError.message}`)
  }

  const insertData: ContractInsert = {
    user_id: user.id,
    contract_number: getContractNumber(),
    project_description: validated.scope || validated.project_name || '',
    client_id: validated.client_id,
    template_type: validated.template_type,
    project_name: validated.project_name,
    scope: validated.scope,
    deliverables: JSON.parse(JSON.stringify(validated.deliverables)),
    exclusions: validated.exclusions,
    start_date: validated.start_date,
    end_date: validated.end_date,
    milestones: JSON.parse(JSON.stringify(validated.milestones)),
    total_fee: validated.total_fee,
    total_amount: validated.total_fee,
    currency: validated.currency,
    payment_structure: validated.payment_structure,
    payment_method: validated.payment_method,
    payment_terms: validated.payment_method,
    clauses: JSON.parse(JSON.stringify(validated.clauses)),
    status: validated.status || 'sent',
  }

  const { data, error } = await supabase
    .from('contracts')
    .insert(insertData)
    .select()
    .single()

  if (error) {
    throw toContractApiError('create contract', error.message)
  }

  return data as Contract
}

/**
 * Update an existing contract
 */
export async function updateContract(
  id: string,
  formData: UpdateContractFormData
): Promise<Contract> {
  const supabase = createSupabaseClient()
  const validated = updateContractSchema.parse(formData)

  const updateData: ContractUpdate = {}

  if (validated.client_id !== undefined) updateData.client_id = validated.client_id
  if (validated.template_type !== undefined) updateData.template_type = validated.template_type
  if (validated.project_name !== undefined) {
    updateData.project_name = validated.project_name
    updateData.project_description = validated.project_name || ''
  }
  if (validated.scope !== undefined) updateData.scope = validated.scope
  if (validated.deliverables !== undefined)
    updateData.deliverables = JSON.parse(JSON.stringify(validated.deliverables))
  if (validated.exclusions !== undefined) updateData.exclusions = validated.exclusions
  if (validated.start_date !== undefined) updateData.start_date = validated.start_date
  if (validated.end_date !== undefined) updateData.end_date = validated.end_date
  if (validated.milestones !== undefined)
    updateData.milestones = JSON.parse(JSON.stringify(validated.milestones))
  if (validated.total_fee !== undefined) {
    updateData.total_fee = validated.total_fee
    updateData.total_amount = validated.total_fee
  }
  if (validated.currency !== undefined) updateData.currency = validated.currency
  if (validated.payment_structure !== undefined)
    updateData.payment_structure = validated.payment_structure
  if (validated.payment_method !== undefined) {
    updateData.payment_method = validated.payment_method
    updateData.payment_terms = validated.payment_method
  }
  if (validated.clauses !== undefined)
    updateData.clauses = JSON.parse(JSON.stringify(validated.clauses))
  if (validated.status !== undefined) updateData.status = validated.status

  const { data, error } = await supabase
    .from('contracts')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw toContractApiError('update contract', error.message)
  }

  return data as Contract
}

/**
 * Delete a contract
 */
export async function deleteContract(id: string): Promise<void> {
  const supabase = createSupabaseClient()

  const { error } = await supabase
    .from('contracts')
    .delete()
    .eq('id', id)

  if (error) {
    throw toContractApiError('delete contract', error.message)
  }
}

/**
 * Set contract status to 'sent' and return the share URL
 */
export async function generateShareLink(id: string): Promise<string> {
  const supabase = createSupabaseClient()

  const { data, error } = await supabase
    .from('contracts')
    .update({ status: 'sent' })
    .eq('id', id)
    .select('share_token')
    .single()

  if (error) {
    throw toContractApiError('generate share link', error.message)
  }

  let shareToken = data?.share_token || null

  if (!shareToken) {
    const fallbackToken = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`

    const { data: tokenData, error: tokenError } = await supabase
      .from('contracts')
      .update({ status: 'sent', share_token: fallbackToken })
      .eq('id', id)
      .select('share_token')
      .single()

    if (tokenError) {
      throw toContractApiError('generate share link', tokenError.message)
    }

    shareToken = tokenData?.share_token || null
  }

  if (!shareToken) {
    throw new Error('Failed to generate share link: share token is missing')
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  return `${baseUrl}/c/${shareToken}`
}
