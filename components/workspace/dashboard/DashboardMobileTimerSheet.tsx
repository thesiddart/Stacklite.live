'use client'

import React from 'react'
import { CloseCircleBold } from 'sicons'
import { TimeTracker } from '@/components/modules/TimeTracker'

export type DashboardMobileTimerSheetProps = {
  isOpen: boolean
  onClose: () => void
}

export function DashboardMobileTimerSheet({ isOpen, onClose }: DashboardMobileTimerSheetProps) {
  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-background-base md:hidden" role="dialog" aria-modal="true" aria-label="Time tracker">
      <div className="flex shrink-0 items-center justify-between border-b border-border-base px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <span className="text-sm font-semibold text-text-base">Time Tracker</span>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-10 w-10 items-center justify-center rounded-[8px] text-[var(--tertiary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-brand"
          aria-label="Close time tracker"
        >
          <CloseCircleBold size={22} />
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-[env(safe-area-inset-bottom)]">
        <TimeTracker variant="dashboard" onCollapse={onClose} />
      </div>
    </div>
  )
}
