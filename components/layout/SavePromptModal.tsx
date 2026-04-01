'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useSavePromptStore } from '@/stores/savePromptStore'

/**
 * SavePromptModal
 * Appears when a guest triggers a premium action (PDF download, share link).
 * Two options: Create Account (migrate data) or Continue as Guest.
 * The pending action always executes regardless of choice.
 */
export function SavePromptModal() {
  const router = useRouter()
  const { isOpen, pendingAction, close } = useSavePromptStore()

  if (!isOpen) return null

  const handleCreateAccount = () => {
    // Execute the pending action first (download PDF / copy link)
    pendingAction?.()
    close()
    // Redirect to sign up with migration flag
    router.push('/signup?migrate=true')
  }

  const handleContinueAsGuest = () => {
    // Execute the pending action
    pendingAction?.()
    close()
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      close()
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn"
      onClick={handleBackdropClick}
    >
      <div className="mx-4 w-full max-w-[400px] animate-slideIn rounded-[16px] border border-[var(--surface-panel-border)] bg-[var(--surface-card)] p-6 shadow-lg">
        <div>
          <h2 className="text-[16px] font-semibold text-[var(--text-soft-strong)]">
            Save your work permanently
          </h2>
          <p className="mt-2 text-[13px] leading-relaxed text-[var(--text-soft-muted)]">
            You&apos;re working in guest mode — your work is saved in this browser.
            Create a free account to access it from anywhere, anytime.
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            onClick={handleCreateAccount}
            className="flex h-10 w-full items-center justify-center rounded-full bg-[var(--primary)] text-[14px] font-medium text-white transition-all hover:opacity-90"
          >
            Create Free Account
          </button>
          <button
            type="button"
            onClick={handleContinueAsGuest}
            className="flex h-10 w-full items-center justify-center rounded-full border border-[var(--surface-divider)] text-[13px] font-medium text-[var(--text-soft-muted)] transition-all hover:bg-[var(--surface-overlay)]"
          >
            Continue as Guest
          </button>
        </div>

        <p className="mt-4 text-center text-[11px] text-[var(--text-soft-disabled)]">
          Your current work stays safe until you close this browser.
        </p>
      </div>
    </div>
  )
}
