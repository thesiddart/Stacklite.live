import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { nanoid } from 'nanoid'
import {
  getContracts,
  getContract,
  getContractByToken,
  createContract,
  updateContract,
  deleteContract,
  generateShareLink,
} from '@/lib/api/contracts'
import { useSessionStore } from '@/stores/sessionStore'
import { useGuestStore } from '@/stores/guestStore'
import type { Contract } from '@/lib/types/database'
import type { GuestContract } from '@/lib/types/guest'
import type { ContractFormData, UpdateContractFormData } from '@/lib/validations/contract'

/**
 * React Query hooks for contract management
 * Guest-aware: when isGuest, CRUD goes to guestStore (localStorage).
 */

const CONTRACTS_QUERY_KEY = 'contracts'

/** Convert GuestContract to a Contract-like shape */
function guestToContract(g: GuestContract): Contract {
  return {
    id: g.id,
    user_id: 'guest',
    client_id: g.client_id,
    contract_number: `GUEST-${g.id.slice(0, 6).toUpperCase()}`,
    project_description: g.scope || '',
    template_type: g.template_type,
    project_name: g.project_name,
    scope: g.scope,
    deliverables: g.deliverables,
    exclusions: g.exclusions,
    start_date: g.start_date,
    end_date: g.end_date,
    milestones: g.milestones,
    total_amount: g.total_fee,
    total_fee: g.total_fee,
    currency: g.currency,
    payment_terms: g.payment_structure,
    payment_structure: g.payment_structure,
    payment_method: g.payment_method,
    clauses: g.clauses,
    status: g.status,
    pdf_url: null,
    share_token: '',
    created_at: g.created_at,
    updated_at: g.updated_at,
  }
}

/**
 * Fetch all contracts
 */
export function useContracts() {
  const isGuest = useSessionStore((s) => s.isGuest)
  const guestContracts = useGuestStore((s) => s.contracts)

  return useQuery({
    queryKey: [CONTRACTS_QUERY_KEY],
    queryFn: isGuest ? () => guestContracts.map(guestToContract) : getContracts,
    staleTime: isGuest ? Infinity : 60 * 1000,
  })
}

/**
 * Fetch a single contract by ID
 */
export function useContract(id: string | null) {
  const isGuest = useSessionStore((s) => s.isGuest)
  const guestContracts = useGuestStore((s) => s.contracts)

  return useQuery({
    queryKey: [CONTRACTS_QUERY_KEY, id],
    queryFn: isGuest
      ? () => {
          const found = guestContracts.find((c) => c.id === id)
          return found ? guestToContract(found) : null
        }
      : () => getContract(id!),
    staleTime: isGuest ? Infinity : 60 * 1000,
    enabled: !!id,
  })
}

/**
 * Fetch a contract by share token (public — always Supabase)
 */
export function useContractByToken(token: string | null) {
  return useQuery({
    queryKey: [CONTRACTS_QUERY_KEY, 'token', token],
    queryFn: () => getContractByToken(token!),
    staleTime: 5 * 60 * 1000,
    enabled: !!token,
  })
}

/**
 * Create a new contract
 */
export function useCreateContract() {
  const queryClient = useQueryClient()
  const isGuest = useSessionStore((s) => s.isGuest)

  return useMutation({
    mutationFn: async (data: ContractFormData) => {
      if (isGuest) {
        const now = new Date().toISOString()
        const guestContract: GuestContract = {
          id: nanoid(),
          client_id: data.client_id || null,
          template_type: data.template_type || null,
          project_name: data.project_name || null,
          scope: data.scope || null,
          deliverables: data.deliverables || [],
          exclusions: data.exclusions || null,
          start_date: data.start_date || null,
          end_date: data.end_date || null,
          milestones: data.milestones || [],
          total_fee: data.total_fee || null,
          currency: data.currency || 'USD',
          payment_structure: data.payment_structure || null,
          payment_method: data.payment_method || null,
          clauses: data.clauses || {},
          status: (data.status as GuestContract['status']) || 'sent',
          created_at: now,
          updated_at: now,
        }
        useGuestStore.getState().addContract(guestContract)
        return guestToContract(guestContract)
      }
      return createContract(data)
    },
    onMutate: async () => {
      if (isGuest) return {}
      await queryClient.cancelQueries({ queryKey: [CONTRACTS_QUERY_KEY] })
      const previousContracts = queryClient.getQueryData<Contract[]>([CONTRACTS_QUERY_KEY])
      return { previousContracts }
    },
    onError: (_err, _data, context) => {
      if (context?.previousContracts) {
        queryClient.setQueryData([CONTRACTS_QUERY_KEY], context.previousContracts)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CONTRACTS_QUERY_KEY] })
    },
  })
}

/**
 * Update an existing contract
 */
export function useUpdateContract() {
  const queryClient = useQueryClient()
  const isGuest = useSessionStore((s) => s.isGuest)

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateContractFormData }) => {
      if (isGuest) {
        useGuestStore.getState().updateContract(id, {
          client_id: data.client_id ?? undefined,
          template_type: data.template_type ?? undefined,
          project_name: data.project_name ?? undefined,
          scope: data.scope ?? undefined,
          deliverables: data.deliverables ?? undefined,
          exclusions: data.exclusions ?? undefined,
          start_date: data.start_date ?? undefined,
          end_date: data.end_date ?? undefined,
          milestones: data.milestones ?? undefined,
          total_fee: data.total_fee ?? undefined,
          currency: data.currency ?? undefined,
          payment_structure: data.payment_structure ?? undefined,
          payment_method: data.payment_method ?? undefined,
          clauses: data.clauses ?? undefined,
          status: (data.status as GuestContract['status']) ?? undefined,
        })
        const updated = useGuestStore.getState().contracts.find((c) => c.id === id)
        return updated ? guestToContract(updated) : guestToContract({ id, client_id: null, template_type: null, project_name: null, scope: null, deliverables: [], exclusions: null, start_date: null, end_date: null, milestones: [], total_fee: null, currency: 'USD', payment_structure: null, payment_method: null, clauses: {}, status: 'sent', created_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      }
      return updateContract(id, data)
    },
    onMutate: async ({ id, data }) => {
      if (isGuest) return {}
      await queryClient.cancelQueries({ queryKey: [CONTRACTS_QUERY_KEY] })
      const previousContracts = queryClient.getQueryData<Contract[]>([CONTRACTS_QUERY_KEY])
      const previousContract = queryClient.getQueryData<Contract>([CONTRACTS_QUERY_KEY, id])
      if (previousContracts) {
        queryClient.setQueryData<Contract[]>(
          [CONTRACTS_QUERY_KEY],
          previousContracts.map((contract) =>
            contract.id === id
              ? { ...contract, ...data, updated_at: new Date().toISOString() }
              : contract
          )
        )
      }
      if (previousContract) {
        queryClient.setQueryData<Contract>(
          [CONTRACTS_QUERY_KEY, id],
          { ...previousContract, ...data, updated_at: new Date().toISOString() }
        )
      }
      return { previousContracts, previousContract }
    },
    onError: (_err, { id }, context) => {
      if (context?.previousContracts) {
        queryClient.setQueryData([CONTRACTS_QUERY_KEY], context.previousContracts)
      }
      if (context?.previousContract) {
        queryClient.setQueryData([CONTRACTS_QUERY_KEY, id], context.previousContract)
      }
    },
    onSuccess: (data, { id }) => {
      if (!isGuest) {
        queryClient.setQueryData([CONTRACTS_QUERY_KEY, id], data)
      }
      queryClient.invalidateQueries({ queryKey: [CONTRACTS_QUERY_KEY] })
    },
  })
}

/**
 * Delete a contract
 */
export function useDeleteContract() {
  const queryClient = useQueryClient()
  const isGuest = useSessionStore((s) => s.isGuest)

  return useMutation({
    mutationFn: async (id: string) => {
      if (isGuest) {
        useGuestStore.getState().deleteContract(id)
        return
      }
      return deleteContract(id)
    },
    onMutate: async (id) => {
      if (isGuest) return {}
      await queryClient.cancelQueries({ queryKey: [CONTRACTS_QUERY_KEY] })
      const previousContracts = queryClient.getQueryData<Contract[]>([CONTRACTS_QUERY_KEY])
      if (previousContracts) {
        queryClient.setQueryData<Contract[]>(
          [CONTRACTS_QUERY_KEY],
          previousContracts.filter((contract) => contract.id !== id)
        )
      }
      return { previousContracts }
    },
    onError: (_err, _id, context) => {
      if (context?.previousContracts) {
        queryClient.setQueryData([CONTRACTS_QUERY_KEY], context.previousContracts)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CONTRACTS_QUERY_KEY] })
    },
  })
}

/**
 * Generate a shareable link for a contract
 * Guest mode: no-op (share links require Supabase)
 */
export function useGenerateShareLink() {
  const queryClient = useQueryClient()
  const isGuest = useSessionStore((s) => s.isGuest)

  return useMutation({
    mutationFn: async (id: string) => {
      if (isGuest) {
        // Guest contracts can't generate share links — trigger save prompt instead
        return `${window.location.origin}/c/guest-${id}`
      }
      return generateShareLink(id)
    },
    onSuccess: () => {
      if (!isGuest) {
        queryClient.invalidateQueries({ queryKey: [CONTRACTS_QUERY_KEY] })
      }
    },
  })
}
