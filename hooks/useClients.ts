import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { nanoid } from 'nanoid'
import {
  getClients,
  getClient,
  createClient,
  updateClient,
  deleteClient,
  searchClients,
} from '@/lib/api/clients'
import { useSessionStore } from '@/stores/sessionStore'
import { useGuestStore } from '@/stores/guestStore'
import type { Client } from '@/lib/types/database'
import type { GuestClient } from '@/lib/types/guest'
import type { ClientFormData, UpdateClientFormData } from '@/lib/validations/client'

/**
 * React Query hooks for client management
 * Guest-aware: when isGuest, CRUD goes to guestStore (localStorage).
 */

const CLIENTS_QUERY_KEY = 'clients'

/** Convert GuestClient to a shape that matches Client for components */
function guestToClient(g: GuestClient): Client {
  return {
    id: g.id,
    user_id: 'guest',
    name: g.name,
    email: g.email,
    phone: g.phone,
    company_name: g.company_name,
    address: g.address,
    contact_person_first_name: null,
    contact_person_last_name: null,
    company_type: null,
    tax_id: null,
    website: null,
    industry: null,
    preferred_contact_method: null,
    payment_currency: 'USD',
    payment_terms: null,
    country: null,
    state_province: null,
    postal_code: null,
    is_active: g.is_active,
    tags: g.tags,
    metadata: null,
    last_contacted_at: null,
    notes: g.notes,
    created_at: g.created_at,
    updated_at: g.updated_at,
  }
}

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
  const isGuest = useSessionStore((s) => s.isGuest)
  const guestClients = useGuestStore((s) => s.clients)

  return useQuery({
    queryKey: [CLIENTS_QUERY_KEY],
    queryFn: isGuest ? () => guestClients.map(guestToClient) : getClients,
    staleTime: isGuest ? Infinity : 60 * 1000,
  })
}

/**
 * Fetch a single client by ID
 */
export function useClient(id: string) {
  const isGuest = useSessionStore((s) => s.isGuest)
  const guestClients = useGuestStore((s) => s.clients)

  return useQuery({
    queryKey: [CLIENTS_QUERY_KEY, id],
    queryFn: isGuest
      ? () => {
          const found = guestClients.find((c) => c.id === id)
          return found ? guestToClient(found) : null
        }
      : () => getClient(id),
    staleTime: isGuest ? Infinity : 60 * 1000,
    enabled: !!id,
  })
}

/**
 * Search clients by query
 */
export function useSearchClients(query: string) {
  const isGuest = useSessionStore((s) => s.isGuest)
  const guestClients = useGuestStore((s) => s.clients)

  return useQuery({
    queryKey: [CLIENTS_QUERY_KEY, 'search', query],
    queryFn: isGuest
      ? () =>
          guestClients
            .filter((c) => c.name.toLowerCase().includes(query.toLowerCase()))
            .map(guestToClient)
      : () => searchClients(query),
    staleTime: isGuest ? Infinity : 30 * 1000,
    enabled: query.length > 0,
  })
}

/**
 * Create a new client
 */
export function useCreateClient() {
  const queryClient = useQueryClient()
  const isGuest = useSessionStore((s) => s.isGuest)

  return useMutation({
    mutationFn: async (data: ClientFormData) => {
      if (isGuest) {
        const now = new Date().toISOString()
        const guestClient: GuestClient = {
          id: nanoid(),
          name: data.name,
          email: data.email || null,
          phone: data.phone || null,
          company_name: data.company_name || null,
          address: data.address || null,
          notes: data.notes || null,
          tags: data.tags || null,
          is_active: data.is_active ?? true,
          created_at: now,
          updated_at: now,
        }
        useGuestStore.getState().addClient(guestClient)
        return guestToClient(guestClient)
      }
      return createClient(data)
    },
    onMutate: async (newClient) => {
      if (isGuest) return {}
      await queryClient.cancelQueries({ queryKey: [CLIENTS_QUERY_KEY] })
      const previousClients = queryClient.getQueryData<Client[]>([CLIENTS_QUERY_KEY])
      if (previousClients) {
        queryClient.setQueryData<Client[]>(
          [CLIENTS_QUERY_KEY],
          [buildOptimisticClient(newClient), ...previousClients]
        )
      }
      return { previousClients }
    },
    onError: (_err, _newClient, context) => {
      if (context?.previousClients) {
        queryClient.setQueryData([CLIENTS_QUERY_KEY], context.previousClients)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CLIENTS_QUERY_KEY] })
    },
  })
}

/**
 * Update an existing client
 */
export function useUpdateClient() {
  const queryClient = useQueryClient()
  const isGuest = useSessionStore((s) => s.isGuest)

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateClientFormData }) => {
      if (isGuest) {
        useGuestStore.getState().updateClient(id, {
          name: data.name,
          email: data.email || null,
          phone: data.phone || null,
          company_name: data.company_name || null,
          address: data.address || null,
          notes: data.notes || null,
          tags: data.tags || null,
          is_active: data.is_active,
        })
        const updated = useGuestStore.getState().clients.find((c) => c.id === id)
        return updated ? guestToClient(updated) : guestToClient({ id, name: data.name || '', email: null, phone: null, company_name: null, address: null, notes: null, tags: null, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      }
      return updateClient(id, data)
    },
    onMutate: async ({ id, data }) => {
      if (isGuest) return {}
      await queryClient.cancelQueries({ queryKey: [CLIENTS_QUERY_KEY] })
      const previousClients = queryClient.getQueryData<Client[]>([CLIENTS_QUERY_KEY])
      const previousClient = queryClient.getQueryData<Client>([CLIENTS_QUERY_KEY, id])
      const optimisticUpdate = buildOptimisticClientUpdate(data)
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
      if (previousClient) {
        queryClient.setQueryData<Client>(
          [CLIENTS_QUERY_KEY, id],
          { ...previousClient, ...optimisticUpdate, updated_at: new Date().toISOString() }
        )
      }
      return { previousClients, previousClient }
    },
    onError: (_err, { id }, context) => {
      if (context?.previousClients) {
        queryClient.setQueryData([CLIENTS_QUERY_KEY], context.previousClients)
      }
      if (context?.previousClient) {
        queryClient.setQueryData([CLIENTS_QUERY_KEY, id], context.previousClient)
      }
    },
    onSuccess: (data, { id }) => {
      if (!isGuest) {
        queryClient.setQueryData([CLIENTS_QUERY_KEY, id], data)
      }
      queryClient.invalidateQueries({ queryKey: [CLIENTS_QUERY_KEY] })
    },
  })
}

/**
 * Delete a client
 */
export function useDeleteClient() {
  const queryClient = useQueryClient()
  const isGuest = useSessionStore((s) => s.isGuest)

  return useMutation({
    mutationFn: async (id: string) => {
      if (isGuest) {
        useGuestStore.getState().deleteClient(id)
        return
      }
      return deleteClient(id)
    },
    onMutate: async (id) => {
      if (isGuest) return {}
      await queryClient.cancelQueries({ queryKey: [CLIENTS_QUERY_KEY] })
      const previousClients = queryClient.getQueryData<Client[]>([CLIENTS_QUERY_KEY])
      if (previousClients) {
        queryClient.setQueryData<Client[]>(
          [CLIENTS_QUERY_KEY],
          previousClients.filter((client) => client.id !== id)
        )
      }
      return { previousClients }
    },
    onError: (_err, _id, context) => {
      if (context?.previousClients) {
        queryClient.setQueryData([CLIENTS_QUERY_KEY], context.previousClients)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CLIENTS_QUERY_KEY] })
    },
  })
}
