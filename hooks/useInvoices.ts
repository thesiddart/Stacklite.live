import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { nanoid } from 'nanoid'
import {
  getInvoices,
  getInvoice,
  getInvoiceByToken,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  generateInvoiceShareLink,
  markInvoicePaid,
} from '@/lib/api/invoices'
import { useSessionStore } from '@/stores/sessionStore'
import { useGuestStore } from '@/stores/guestStore'
import type { Invoice } from '@/lib/types/database'
import type { GuestInvoice } from '@/lib/types/guest'
import type { InvoiceFormData, UpdateInvoiceFormData } from '@/lib/validations/invoice'

/**
 * React Query hooks for invoice management
 * Guest-aware: when isGuest, CRUD goes to guestStore (localStorage).
 */

const INVOICES_QUERY_KEY = 'invoices'

function guestToInvoice(g: GuestInvoice): Invoice {
  return {
    id: g.id,
    user_id: 'guest',
    client_id: g.client_id,
    contract_id: g.contract_id,
    invoice_number: g.invoice_number,
    issue_date: g.issue_date,
    due_date: g.due_date,
    line_items: g.line_items,
    subtotal: g.subtotal,
    tax_rate: g.tax_rate ?? 0,
    tax_amount: g.tax_rate ? parseFloat(((g.subtotal * g.tax_rate) / 100).toFixed(2)) : 0,
    discount_type: g.discount_type,
    discount_value: g.discount_value,
    total: g.total,
    currency: g.currency,
    payment_method: g.payment_method,
    payment_instructions: g.payment_instructions,
    notes: g.notes_to_client,
    notes_to_client: g.notes_to_client,
    internal_notes: g.internal_notes,
    terms: null,
    status: g.status,
    paid_at: null,
    pdf_url: null,
    share_token: '',
    created_at: g.created_at,
    updated_at: g.updated_at,
  }
}

export function useInvoices() {
  const isGuest = useSessionStore((s) => s.isGuest)
  const guestInvoices = useGuestStore((s) => s.invoices)

  return useQuery({
    queryKey: [INVOICES_QUERY_KEY],
    queryFn: isGuest ? () => guestInvoices.map(guestToInvoice) : getInvoices,
    staleTime: isGuest ? Infinity : 60 * 1000,
  })
}

export function useInvoice(id: string | null) {
  const isGuest = useSessionStore((s) => s.isGuest)
  const guestInvoices = useGuestStore((s) => s.invoices)

  return useQuery({
    queryKey: [INVOICES_QUERY_KEY, id],
    queryFn: isGuest
      ? () => {
          const found = guestInvoices.find((i) => i.id === id)
          return found ? guestToInvoice(found) : null
        }
      : () => getInvoice(id!),
    staleTime: isGuest ? Infinity : 60 * 1000,
    enabled: !!id,
  })
}

export function useInvoiceByToken(token: string | null) {
  return useQuery({
    queryKey: [INVOICES_QUERY_KEY, 'token', token],
    queryFn: () => getInvoiceByToken(token!),
    staleTime: 5 * 60 * 1000,
    enabled: !!token,
  })
}

export function useCreateInvoice() {
  const queryClient = useQueryClient()
  const isGuest = useSessionStore((s) => s.isGuest)

  return useMutation({
    mutationFn: async (data: InvoiceFormData) => {
      if (isGuest) {
        const now = new Date().toISOString()
        const guestInvoice: GuestInvoice = {
          id: nanoid(),
          client_id: data.client_id || null,
          contract_id: data.contract_id || null,
          invoice_number: data.invoice_number,
          issue_date: data.issue_date,
          due_date: data.due_date,
          line_items: data.line_items || [],
          currency: data.currency || 'USD',
          tax_rate: data.tax_rate ?? null,
          discount_type: data.discount_type ?? null,
          discount_value: data.discount_value ?? null,
          subtotal: data.subtotal || 0,
          total: data.total || 0,
          payment_method: data.payment_method || null,
          payment_instructions: data.payment_instructions || null,
          notes_to_client: data.notes_to_client || null,
          internal_notes: data.internal_notes || null,
          status: (data.status as GuestInvoice['status']) || 'unpaid',
          created_at: now,
          updated_at: now,
        }
        useGuestStore.getState().addInvoice(guestInvoice)
        return guestToInvoice(guestInvoice)
      }
      return createInvoice(data)
    },
    onMutate: async () => {
      if (isGuest) return {}
      await queryClient.cancelQueries({ queryKey: [INVOICES_QUERY_KEY] })
      const previousInvoices = queryClient.getQueryData<Invoice[]>([INVOICES_QUERY_KEY])
      return { previousInvoices }
    },
    onError: (_err, _data, context) => {
      if (context?.previousInvoices) {
        queryClient.setQueryData([INVOICES_QUERY_KEY], context.previousInvoices)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [INVOICES_QUERY_KEY] })
    },
  })
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient()
  const isGuest = useSessionStore((s) => s.isGuest)

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateInvoiceFormData }) => {
      if (isGuest) {
        useGuestStore.getState().updateInvoice(id, {
          client_id: data.client_id ?? undefined,
          contract_id: data.contract_id ?? undefined,
          invoice_number: data.invoice_number ?? undefined,
          issue_date: data.issue_date ?? undefined,
          due_date: data.due_date ?? undefined,
          line_items: data.line_items ?? undefined,
          currency: data.currency ?? undefined,
          tax_rate: data.tax_rate ?? undefined,
          discount_type: data.discount_type ?? undefined,
          discount_value: data.discount_value ?? undefined,
          subtotal: data.subtotal ?? undefined,
          total: data.total ?? undefined,
          payment_method: data.payment_method ?? undefined,
          payment_instructions: data.payment_instructions ?? undefined,
          notes_to_client: data.notes_to_client ?? undefined,
          internal_notes: data.internal_notes ?? undefined,
          status: (data.status as GuestInvoice['status']) ?? undefined,
        })
        const updated = useGuestStore.getState().invoices.find((i) => i.id === id)
        if (updated) return guestToInvoice(updated)
        return guestToInvoice({
          id, client_id: null, contract_id: null, invoice_number: '', issue_date: '',
          due_date: '', line_items: [], currency: 'USD', tax_rate: null, discount_type: null,
          discount_value: null, subtotal: 0, total: 0, payment_method: null,
          payment_instructions: null, notes_to_client: null, internal_notes: null,
          status: 'unpaid', created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
        })
      }
      return updateInvoice(id, data)
    },
    onMutate: async ({ id }) => {
      if (isGuest) return {}
      await queryClient.cancelQueries({ queryKey: [INVOICES_QUERY_KEY] })
      const previousInvoices = queryClient.getQueryData<Invoice[]>([INVOICES_QUERY_KEY])
      const previousInvoice = queryClient.getQueryData<Invoice>([INVOICES_QUERY_KEY, id])
      return { previousInvoices, previousInvoice }
    },
    onError: (_err, { id }, context) => {
      if (context?.previousInvoices) {
        queryClient.setQueryData([INVOICES_QUERY_KEY], context.previousInvoices)
      }
      if (context?.previousInvoice) {
        queryClient.setQueryData([INVOICES_QUERY_KEY, id], context.previousInvoice)
      }
    },
    onSuccess: (data, { id }) => {
      if (!isGuest) {
        queryClient.setQueryData([INVOICES_QUERY_KEY, id], data)
      }
      queryClient.invalidateQueries({ queryKey: [INVOICES_QUERY_KEY] })
    },
  })
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient()
  const isGuest = useSessionStore((s) => s.isGuest)

  return useMutation({
    mutationFn: async (id: string) => {
      if (isGuest) {
        useGuestStore.getState().deleteInvoice(id)
        return
      }
      return deleteInvoice(id)
    },
    onMutate: async (id) => {
      if (isGuest) return {}
      await queryClient.cancelQueries({ queryKey: [INVOICES_QUERY_KEY] })
      const previousInvoices = queryClient.getQueryData<Invoice[]>([INVOICES_QUERY_KEY])
      if (previousInvoices) {
        queryClient.setQueryData<Invoice[]>(
          [INVOICES_QUERY_KEY],
          previousInvoices.filter((invoice) => invoice.id !== id)
        )
      }
      return { previousInvoices }
    },
    onError: (_err, _id, context) => {
      if (context?.previousInvoices) {
        queryClient.setQueryData([INVOICES_QUERY_KEY], context.previousInvoices)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [INVOICES_QUERY_KEY] })
    },
  })
}

export function useGenerateInvoiceShareLink() {
  const queryClient = useQueryClient()
  const isGuest = useSessionStore((s) => s.isGuest)

  return useMutation({
    mutationFn: async (id: string) => {
      if (isGuest) {
        throw new Error('Guest mode requires account save before creating share links')
      }
      return generateInvoiceShareLink(id)
    },
    onSuccess: () => {
      if (!isGuest) {
        queryClient.invalidateQueries({ queryKey: [INVOICES_QUERY_KEY] })
      }
    },
  })
}

export function useMarkInvoicePaid() {
  const queryClient = useQueryClient()
  const isGuest = useSessionStore((s) => s.isGuest)

  return useMutation({
    mutationFn: async (id: string) => {
      if (isGuest) {
        useGuestStore.getState().updateInvoice(id, { status: 'paid' })
        const updated = useGuestStore.getState().invoices.find((i) => i.id === id)
        return updated ? guestToInvoice(updated) : null
      }
      return markInvoicePaid(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [INVOICES_QUERY_KEY] })
    },
  })
}
