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
  initSession: (hasAuthenticatedUser: boolean) => void
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      isGuest: true,
      setGuest: (value) => {
        if (typeof document !== 'undefined') {
          if (value) {
            document.cookie = 'stacklite-guest=true; path=/; max-age=31536000; SameSite=Lax'
          } else {
            document.cookie = 'stacklite-guest=; path=/; max-age=0; SameSite=Lax'
          }
        }

        set({ isGuest: value })
      },
      initSession: (hasAuthenticatedUser) => {
        if (hasAuthenticatedUser) {
          if (typeof document !== 'undefined') {
            document.cookie = 'stacklite-guest=; path=/; max-age=0; SameSite=Lax'
          }
          set({ isGuest: false })
          return
        }

        if (typeof document !== 'undefined') {
          document.cookie = 'stacklite-guest=true; path=/; max-age=31536000; SameSite=Lax'
        }
        set({ isGuest: true })
      },
    }),
    { name: 'stacklite-session' }
  )
)
