/**
 * Save Prompt Store
 * Controls the modal that nudges guests to create an account.
 * pendingAction holds the function to execute (PDF download / copy link)
 * regardless of whether the user creates an account or continues as guest.
 */

import { create } from 'zustand'

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
  openWithAction: (action) => set({ isOpen: true, pendingAction: action }),
  openSavePrompt: () => set({ isOpen: true, pendingAction: null }),
  close: () => set({ isOpen: false, pendingAction: null }),
}))
