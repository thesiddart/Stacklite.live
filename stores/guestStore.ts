/**
 * Guest Data Store
 * All module data persisted in localStorage via Zustand persist.
 * Key: 'stacklite-guest-data'
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { GuestClient, GuestContract, GuestTimeEntry } from '@/lib/types/guest'

interface GuestState {
  // Data
  clients: GuestClient[]
  contracts: GuestContract[]
  timeEntries: GuestTimeEntry[]

  // Clients
  addClient: (client: GuestClient) => void
  updateClient: (id: string, data: Partial<GuestClient>) => void
  deleteClient: (id: string) => void

  // Contracts
  addContract: (contract: GuestContract) => void
  updateContract: (id: string, data: Partial<GuestContract>) => void
  deleteContract: (id: string) => void

  // Time Entries
  addTimeEntry: (entry: GuestTimeEntry) => void
  updateTimeEntry: (id: string, data: Partial<GuestTimeEntry>) => void
  deleteTimeEntry: (id: string) => void

  // Clear all (used after successful migration)
  clearAll: () => void
}

export const useGuestStore = create<GuestState>()(
  persist(
    (set) => ({
      clients: [],
      contracts: [],
      timeEntries: [],

      // Clients
      addClient: (client) =>
        set((s) => ({ clients: [...s.clients, client] })),
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
        set((s) => ({ contracts: [...s.contracts, contract] })),
      updateContract: (id, data) =>
        set((s) => ({
          contracts: s.contracts.map((c) =>
            c.id === id ? { ...c, ...data, updated_at: new Date().toISOString() } : c
          ),
        })),
      deleteContract: (id) =>
        set((s) => ({ contracts: s.contracts.filter((c) => c.id !== id) })),

      // Time Entries
      addTimeEntry: (entry) =>
        set((s) => ({ timeEntries: [...s.timeEntries, entry] })),
      updateTimeEntry: (id, data) =>
        set((s) => ({
          timeEntries: s.timeEntries.map((e) =>
            e.id === id ? { ...e, ...data, updated_at: new Date().toISOString() } : e
          ),
        })),
      deleteTimeEntry: (id) =>
        set((s) => ({ timeEntries: s.timeEntries.filter((e) => e.id !== id) })),

      // Clear all
      clearAll: () => set({ clients: [], contracts: [], timeEntries: [] }),
    }),
    { name: 'stacklite-guest-data' }
  )
)
