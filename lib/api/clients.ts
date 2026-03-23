import { createClient as createSupabaseClient } from '@/lib/supabase/client'
import { clientSchema, updateClientSchema } from '@/lib/validations/client'
import type { Client, ClientInsert, ClientUpdate } from '@/lib/types/database'
import type { ClientFormData, UpdateClientFormData } from '@/lib/validations/client'

function toClientApiError(action: string, message: string): Error {
  if (message.includes("Could not find the table 'public.clients' in the schema cache")) {
    return new Error(
      "Database is not initialized: 'public.clients' table is missing. Apply Supabase migrations to your active project and refresh."
    )
  }

  if (message.includes('clients_user_id_fkey')) {
    return new Error(
      "Your profile record is missing. Please refresh and try again; we'll create your profile automatically before creating a client."
    )
  }

  return new Error(`Failed to ${action}: ${message}`)
}

/**
 * Client API Layer
 * All functions use RLS - no manual user_id filtering needed
 */

/**
 * Get all clients for the authenticated user
 * RLS automatically filters by auth.uid()
 */
export async function getClients(): Promise<Client[]> {
  const supabase = createSupabaseClient()
  
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    throw toClientApiError('fetch clients', error.message)
  }
  
  return data as Client[]
}

/**
 * Get a single client by ID
 * RLS ensures user can only access their own client
 */
export async function getClient(id: string): Promise<Client> {
  const supabase = createSupabaseClient()
  
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) {
    throw toClientApiError('fetch client', error.message)
  }
  
  return data as Client
}

/**
 * Create a new client
 * Validates input and creates client for authenticated user
 */
export async function createClient(formData: ClientFormData): Promise<Client> {
  const supabase = createSupabaseClient()
  
  // Validate input
  const validated = clientSchema.parse(formData)
  
  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    throw new Error('User not authenticated')
  }

  if (!user.email) {
    throw new Error('Authenticated user email is missing')
  }

  // Ensure profile row exists before inserting client because clients.user_id references profiles.id.
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert(
      {
        id: user.id,
        email: user.email,
      },
      { onConflict: 'id' }
    )

  if (profileError) {
    throw new Error(`Failed to ensure profile: ${profileError.message}`)
  }
  
  // Prepare insert data
  const insertData: ClientInsert = {
    user_id: user.id,
    ...validated,
    metadata: validated.metadata as ClientInsert['metadata'],
  }
  
  const { data, error } = await supabase
    .from('clients')
    .insert(insertData)
    .select()
    .single()
  
  if (error) {
    throw toClientApiError('create client', error.message)
  }
  
  return data as Client
}

/**
 * Update an existing client
 * RLS ensures user can only update their own client
 */
export async function updateClient(
  id: string,
  formData: UpdateClientFormData
): Promise<Client> {
  const supabase = createSupabaseClient()
  
  // Validate input
  const validated = updateClientSchema.parse(formData)
  
  const updateData: ClientUpdate = {
    ...validated,
    metadata: validated.metadata as ClientUpdate['metadata'],
  }
  
  const { data, error } = await supabase
    .from('clients')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    throw toClientApiError('update client', error.message)
  }
  
  return data as Client
}

/**
 * Delete a client
 * RLS ensures user can only delete their own client
 */
export async function deleteClient(id: string): Promise<void> {
  const supabase = createSupabaseClient()
  
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id)
  
  if (error) {
    throw toClientApiError('delete client', error.message)
  }
}

/**
 * Search clients by name, company, or industry
 */
export async function searchClients(query: string): Promise<Client[]> {
  const supabase = createSupabaseClient()
  
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .or(`name.ilike.%${query}%,company_name.ilike.%${query}%,industry.ilike.%${query}%`)
    .order('created_at', { ascending: false })
  
  if (error) {
    throw toClientApiError('search clients', error.message)
  }
  
  return data as Client[]
}
