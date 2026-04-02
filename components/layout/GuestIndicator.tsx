'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { useSessionStore } from '@/stores/sessionStore'
import { useGuestStore } from '@/stores/guestStore'
import { useSavePromptStore } from '@/stores/savePromptStore'

export function GuestIndicator() {
  const pathname = usePathname()
  const isGuest = useSessionStore((s) => s.isGuest)
  const openSavePrompt = useSavePromptStore((s) => s.openSavePrompt)
  const hasGuestData = useGuestStore((s) =>
    s.clients.length > 0 ||
    s.contracts.length > 0 ||
    s.invoices.length > 0 ||
    s.timeEntries.length > 0
  )

  const isHiddenRoute =
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname.startsWith('/c/') ||
    pathname.startsWith('/i/')

  if (!isGuest || !hasGuestData || isHiddenRoute) {
    return null
  }

  return (
    <button
      type="button"
      onClick={openSavePrompt}
      aria-label="Save your guest session"
      className="theme-shell-chip inline-flex h-8 items-center gap-2 rounded-[8px] px-3 text-[12px] font-medium text-text-muted transition-colors hover:text-text-base"
    >
      <span aria-hidden="true">Save guest session</span>
      <span className="text-text-brand">Save your work →</span>
    </button>
  )
}
