'use client'

import React from 'react'
import { useSessionStore } from '@/stores/sessionStore'
import { useSavePromptStore } from '@/stores/savePromptStore'

/**
 * GuestIndicator
 * Small persistent nudge in the navbar for guest users.
 * Returns null for authenticated users — completely invisible.
 */
export function GuestIndicator() {
  const isGuest = useSessionStore((s) => s.isGuest)
  const openSavePrompt = useSavePromptStore((s) => s.openSavePrompt)

  if (!isGuest) return null

  return (
    <button
      type="button"
      onClick={openSavePrompt}
      className="flex items-center gap-1.5 rounded-[8px] bg-[var(--surface-chip)] px-3 py-1.5 text-[11px] font-medium text-[var(--tertiary)] transition-colors hover:bg-[var(--surface-chip-strong)]"
      aria-label="Save your guest session"
    >
      <span>💾</span>
      <span>Guest session · Save your work →</span>
    </button>
  )
}
