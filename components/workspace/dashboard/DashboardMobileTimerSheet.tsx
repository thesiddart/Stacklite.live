'use client'

import React from 'react'
import { TimeTracker } from '@/components/modules/TimeTracker'

export type DashboardMobileTimerSheetProps = {
  isOpen: boolean
  onClose: () => void
}

/**
 * Bottom sheet for mobile. Header chrome matches desktop: {@link TimeTracker} owns the top row
 * (`theme-shell-chip` + actions) — no duplicate title bar or drag handle.
 */
export function DashboardMobileTimerSheet({ isOpen, onClose }: DashboardMobileTimerSheetProps) {
  if (!isOpen) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-[60] md:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Time tracker"
    >
      <button
        type="button"
        aria-label="Close time tracker"
        className="absolute inset-0 bg-black/35"
        onClick={onClose}
      />

      <div className="absolute inset-x-0 bottom-0 mx-2 rounded-t-2xl border border-border-base bg-background-base shadow-2xl">
        <div className="mobile-scroll-area max-h-[85dvh] overflow-y-auto px-2 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] pt-[max(0.75rem,env(safe-area-inset-top,0px))]">
          <TimeTracker variant="dashboard" onCollapse={onClose} />
        </div>
      </div>
    </div>
  )
}
