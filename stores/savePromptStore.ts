/**
 * Save Prompt Store
 * Controls the modal that nudges guests to create an account.
 * pendingAction holds the function to execute (PDF download / copy link)
 * regardless of whether the user creates an account or continues as guest.
 */

import { create } from 'zustand'
import { track } from '@/lib/analytics'

interface SavePromptState {
  isOpen: boolean
  pendingAction: (() => void) | null
  openWithAction: (action: () => void) => void
  openSavePrompt: () => void
  close: () => void
}

export const useSavePromptStore = create<SavePromptState>((set) => ({
  isOpen: false,
  pendingAction: null,
  openWithAction: (action) => {
    track('guest_save_prompt_shown')
    set({ isOpen: true, pendingAction: action })
  },
  openSavePrompt: () => {
    track('guest_save_prompt_shown')
    set({ isOpen: true, pendingAction: null })
  },
  close: () => set({ isOpen: false, pendingAction: null }),
}))
