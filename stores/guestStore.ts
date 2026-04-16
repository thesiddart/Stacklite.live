/**
 * Guest Data Store
 * All module data is persisted in localStorage via Zustand persist.
 * Data expires automatically after 24 hours from first guest write.
 * Key: 'stacklite-guest-data'
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { GuestStore } from '@/lib/types/guest'

const TTL_MS = 24 * 60 * 60 * 1000

export const useGuestStore = create<GuestStore>()(
  persist(
    (set) => ({
      clients: [],
      contracts: [],
      invoices: [],
      timeEntries: [],
      createdAt: null,

      // Clients
      addClient: (client) =>
        set((s) => ({
          clients: [...s.clients, client],
          createdAt: s.createdAt ?? Date.now(),
        })),
      updateClient: (id, data) =>
        set((s) => ({
          clients: s.clients.map((c) =>
            c.id === id ? { ...c, ...data, updated_at: new Date().toISOString() } : c
          ),
        })),
      deleteClient: (id) =>
        set((s) => ({ clients: s.clients.filter((c) => c.id !== id) })),

      // Contracts
      addContract: (contract) =>
        set((s) => ({
          contracts: [...s.contracts, contract],
          createdAt: s.createdAt ?? Date.now(),
        })),
      updateContract: (id, data) =>
        set((s) => ({
          contracts: s.contracts.map((c) =>
            c.id === id ? { ...c, ...data, updated_at: new Date().toISOString() } : c
          ),
        })),
      deleteContract: (id) =>
        set((s) => ({ contracts: s.contracts.filter((c) => c.id !== id) })),

      // Invoices
      addInvoice: (invoice) =>
        set((s) => ({
          invoices: [...s.invoices, invoice],
          createdAt: s.createdAt ?? Date.now(),
        })),
      updateInvoice: (id, data) =>
        set((s) => ({
          invoices: s.invoices.map((i) =>
            i.id === id ? { ...i, ...data, updated_at: new Date().toISOString() } : i
          ),
        })),
      deleteInvoice: (id) =>
        set((s) => ({ invoices: s.invoices.filter((i) => i.id !== id) })),

      // Time Entries
      addTimeEntry: (entry) =>
        set((s) => ({
          timeEntries: [...s.timeEntries, entry],
          createdAt: s.createdAt ?? Date.now(),
        })),
      updateTimeEntry: (id, data) =>
        set((s) => ({
          timeEntries: s.timeEntries.map((e) =>
            e.id === id ? { ...e, ...data, updated_at: new Date().toISOString() } : e
          ),
        })),
      deleteTimeEntry: (id) =>
        set((s) => ({ timeEntries: s.timeEntries.filter((e) => e.id !== id) })),

      // Clear all
      clearAll: () => set({ clients: [], contracts: [], invoices: [], timeEntries: [], createdAt: null }),
    }),
    {
      name: 'stacklite-guest-data',
      version: 2,
      onRehydrateStorage: () => (state) => {
        if (!state?.createdAt) {
          return
        }

        if (Date.now() - state.createdAt > TTL_MS) {
          useGuestStore.getState().clearAll()
        }
      },
    }
  )
)
