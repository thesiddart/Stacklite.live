'use client'

import React from 'react'
import { useInvoiceStore } from '@/stores/invoiceStore'

export function NotesSection() {
  const { formData, updateFormData } = useInvoiceStore()

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-[14px] font-semibold text-[var(--text-soft-strong)]">
          Notes
        </h3>
        <p className="mt-0.5 text-[12px] text-[var(--text-soft-muted)]">
          Add any notes for the client or internal reference.
        </p>
      </div>

      <div>
        <label className="mb-1 block text-[12px] font-medium text-[var(--text-soft-strong)]">
          Notes to Client
        </label>
        <textarea
          value={formData.notes_to_client || ''}
          onChange={(e) => updateFormData({ notes_to_client: e.target.value })}
          placeholder="Thank you for the opportunity to collaborate."
          rows={4}
          className="theme-shell-field w-full rounded-[6px] px-3 py-2 text-[13px] focus-visible:border-[var(--primary)] focus-visible:outline-none"
        />
        <p className="mt-1 text-[11px] text-[var(--text-soft-muted)]">
          Visible on the PDF and shareable link.
        </p>
      </div>

      <div>
        <label className="mb-1 block text-[12px] font-medium text-[var(--text-soft-strong)]">
          Internal Notes
        </label>
        <textarea
          value={formData.internal_notes || ''}
          onChange={(e) => updateFormData({ internal_notes: e.target.value })}
          placeholder="Private notes — never shown to the client."
          rows={3}
          className="theme-shell-field w-full rounded-[6px] px-3 py-2 text-[13px] focus-visible:border-[var(--primary)] focus-visible:outline-none"
        />
        <p className="mt-1 text-[11px] text-[var(--feedback-warning-text)]">
          Not shown on PDF or shareable link — for your reference only.
        </p>
      </div>
    </div>
  )
}
