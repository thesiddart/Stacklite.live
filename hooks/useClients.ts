import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getClients,
  getClient,
  createClient,
  updateClient,
  deleteClient,
  searchClients,
} from '@/lib/api/clients'
import type { Client } from '@/lib/types/database'
import type { ClientFormData, UpdateClientFormData } from '@/lib/validations/client'

/**
 * React Query hooks for client management
 * Provides caching, optimistic updates, and automatic refetching
 */

const CLIENTS_QUERY_KEY = 'clients'

function buildOptimisticClient(newClient: ClientFormData): Client {
  const now = new Date().toISOString()

  return {
    id: `temp-${Date.now()}`,
    user_id: '',
    name: newClient.name,
    email: newClient.email,
    phone: newClient.phone,
    company_name: newClient.company_name,
    address: newClient.address,
    contact_person_first_name: newClient.contact_person_first_name,
    contact_person_last_name: newClient.contact_person_last_name,
    company_type: newClient.company_type ?? null,
    tax_id: newClient.tax_id,
    website: newClient.website,
    industry: newClient.industry,
    preferred_contact_method: newClient.preferred_contact_method ?? null,
    payment_currency: newClient.payment_currency,
    payment_terms: newClient.payment_terms,
    country: newClient.country,
    state_province: newClient.state_province,
    postal_code: newClient.postal_code,
    is_active: newClient.is_active,
    tags: newClient.tags,
    metadata: newClient.metadata as Client['metadata'],
    last_contacted_at: newClient.last_contacted_at,
    notes: newClient.notes,
    created_at: now,
    updated_at: now,
  }
}

function buildOptimisticClientUpdate(data: UpdateClientFormData): Partial<Client> {
  return {
    ...data,
    company_type: data.company_type ?? undefined,
    preferred_contact_method: data.preferred_contact_method ?? undefined,
    metadata: data.metadata as Client['metadata'] | undefined,
  }
}

/**
 * Fetch all clients
 */
export function useClients() {
  return useQuery({
    queryKey: [CLIENTS_QUERY_KEY],
    queryFn: getClients,
    staleTime: 60 * 1000, // 1 minute
  })
}

/**
 * Fetch a single client by ID
 */
export function useClient(id: string) {
  return useQuery({
    queryKey: [CLIENTS_QUERY_KEY, id],
    queryFn: () => getClient(id),
    staleTime: 60 * 1000,
    enabled: !!id,
  })
}

/**
 * Search clients by query
 */
export function useSearchClients(query: string) {
  return useQuery({
    queryKey: [CLIENTS_QUERY_KEY, 'search', query],
    queryFn: () => searchClients(query),
    staleTime: 30 * 1000,
    enabled: query.length > 0,
  })
}

/**
 * Create a new client
 */
export function useCreateClient() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: ClientFormData) => createClient(data),
    onMutate: async (newClient) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: [CLIENTS_QUERY_KEY] })
      
      // Snapshot previous value
      const previousClients = queryClient.getQueryData<Client[]>([CLIENTS_QUERY_KEY])
      
      // Optimistically update
      if (previousClients) {
        queryClient.setQueryData<Client[]>(
          [CLIENTS_QUERY_KEY],
          [buildOptimisticClient(newClient), ...previousClients]
        )
      }
      
      return { previousClients }
    },
    onError: (err, newClient, context) => {
      // Rollback on error
      if (context?.previousClients) {
        queryClient.setQueryData([CLIENTS_QUERY_KEY], context.previousClients)
      }
    },
    onSuccess: () => {
      // Refetch to get server data
      queryClient.invalidateQueries({ queryKey: [CLIENTS_QUERY_KEY] })
    },
  })
}

/**
 * Update an existing client
 */
export function useUpdateClient() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateClientFormData }) =>
      updateClient(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: [CLIENTS_QUERY_KEY] })
      
      // Snapshot previous value
      const previousClients = queryClient.getQueryData<Client[]>([CLIENTS_QUERY_KEY])
      const previousClient = queryClient.getQueryData<Client>([CLIENTS_QUERY_KEY, id])
      const optimisticUpdate = buildOptimisticClientUpdate(data)
      
      // Optimistically update list
      if (previousClients) {
        queryClient.setQueryData<Client[]>(
          [CLIENTS_QUERY_KEY],
          previousClients.map((client) =>
            client.id === id
              ? { ...client, ...optimisticUpdate, updated_at: new Date().toISOString() }
              : client
          )
        )
      }
      
      // Optimistically update single client
      if (previousClient) {
        queryClient.setQueryData<Client>(
          [CLIENTS_QUERY_KEY, id],
          { ...previousClient, ...optimisticUpdate, updated_at: new Date().toISOString() }
        )
      }
      
      return { previousClients, previousClient }
    },
    onError: (err, { id }, context) => {
      // Rollback on error
      if (context?.previousClients) {
        queryClient.setQueryData([CLIENTS_QUERY_KEY], context.previousClients)
      }
      if (context?.previousClient) {
        queryClient.setQueryData([CLIENTS_QUERY_KEY, id], context.previousClient)
      }
    },
    onSuccess: (data, { id }) => {
      // Update cache with server data
      queryClient.setQueryData([CLIENTS_QUERY_KEY, id], data)
      queryClient.invalidateQueries({ queryKey: [CLIENTS_QUERY_KEY] })
    },
  })
}

/**
 * Delete a client
 */
export function useDeleteClient() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => deleteClient(id),
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: [CLIENTS_QUERY_KEY] })
      
      // Snapshot previous value
      const previousClients = queryClient.getQueryData<Client[]>([CLIENTS_QUERY_KEY])
      
      // Optimistically remove from list
      if (previousClients) {
        queryClient.setQueryData<Client[]>(
          [CLIENTS_QUERY_KEY],
          previousClients.filter((client) => client.id !== id)
        )
      }
      
      return { previousClients }
    },
    onError: (err, id, context) => {
      // Rollback on error
      if (context?.previousClients) {
        queryClient.setQueryData([CLIENTS_QUERY_KEY], context.previousClients)
      }
    },
    onSuccess: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: [CLIENTS_QUERY_KEY] })
    },
  })
}
