/**
 * Client Store - Zustand
 * Shared state for client data across modules
 */

import { create } from 'zustand'
import type { Client } from '@/lib/types/database'

interface ClientState {
  clients: Client[]
  selectedClientId: string | null
  isLoading: boolean
  error: string | null

  // Actions
  setClients: (clients: Client[]) => void
  selectClient: (clientId: string | null) => void
  addClient: (client: Client) => void
  updateClient: (id: string, client: Partial<Client>) => void
  removeClient: (id: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  getSelectedClient: () => Client | undefined
}

export const useClientStore = create<ClientState>()((set, get) => ({
    clients: [],
    selectedClientId: null,
    isLoading: false,
    error: null,

    setClients: (clients) => set({ clients }),
    selectClient: (clientId) => set({ selectedClientId: clientId }),
    addClient: (client) => set((state) => ({ clients: [...state.clients, client] })),
    updateClient: (id, updates) =>
      set((state) => ({
        clients: state.clients.map((c) => (c.id === id ? { ...c, ...updates } : c)),
      })),
    removeClient: (id) =>
      set((state) => ({
        clients: state.clients.filter((c) => c.id !== id),
        selectedClientId: state.selectedClientId === id ? null : state.selectedClientId,
      })),
    setLoading: (loading) => set({ isLoading: loading }),
    setError: (error) => set({ error }),
    getSelectedClient: () => {
      const { clients, selectedClientId } = get()
      return clients.find((c) => c.id === selectedClientId)
    },
  }))
