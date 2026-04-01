/**
 * Session Store — Guest Mode Flag
 * Determines whether the current session is a guest (localStorage) or authenticated (Supabase).
 * Persisted to localStorage key 'stacklite-session'.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SessionState {
  isGuest: boolean
  setGuest: (value: boolean) => void
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      isGuest: false,
      setGuest: (value) => set({ isGuest: value }),
    }),
    { name: 'stacklite-session' }
  )
)
