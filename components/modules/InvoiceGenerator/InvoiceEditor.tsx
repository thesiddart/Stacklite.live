'use client'

import React, { useCallback, useEffect, useRef } from 'react'
import { CloseCircleBold } from 'sicons'
import { useInvoiceStore } from '@/stores/invoiceStore'
import { useCreateInvoice, useUpdateInvoice } from '@/hooks/useInvoices'
import { InvoiceForm } from './InvoiceForm'
import { InvoicePreview } from './InvoicePreview'
import type { InvoiceLineItem } from '@/lib/utils/invoiceCalculations'

export function InvoiceEditor() {
  const {
    activeInvoiceId,
    formData,
    isDirty,
    saveStatus,
    setView,
    resetForm,
    setSaveStatus,
  } = useInvoiceStore()

  const createMutation = useCreateInvoice()
  const updateMutation = useUpdateInvoice()
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const normalizeDate = (value: string | null | undefined): string => {
    if (!value) return new Date().toISOString().slice(0, 10)

    // Keep ISO input dates untouched.
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value

    // Convert locale-style dates (MM/DD/YYYY etc.) when possible.
    const parsed = new Date(value)
    if (!Number.isNaN(parsed.getTime())) {
      const year = parsed.getFullYear()
      const month = String(parsed.getMonth() + 1).padStart(2, '0')
      const day = String(parsed.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }

    return new Date().toISOString().slice(0, 10)
  }

  const handleSave = useCallback(async () => {
    if (!isDirty && saveStatus !== 'idle') return

    setSaveStatus('saving')

    try {
      const rawItems = (formData.line_items || []) as InvoiceLineItem[]
      const items = (rawItems.length > 0 ? rawItems : [{ id: 'fallback-1', description: 'Item', qty: 1, rate: 0, amount: 0 }])
        .map((item, index) => {
          const qty = Number(item.qty) || 0
          const rate = Number(item.rate) || 0
          const amount = Number((qty * rate).toFixed(2))

          return {
            id: item.id || `li-${index + 1}`,
            description: (item.description || '').trim() || `Item ${index + 1}`,
            qty,
            rate,
            amount,
            ...(item.timeEntryId ? { timeEntryId: item.timeEntryId } : {}),
          }
        })

      const issueDate = normalizeDate(formData.issue_date)
      const dueDate = normalizeDate(formData.due_date)

      if (activeInvoiceId) {
        await updateMutation.mutateAsync({
          id: activeInvoiceId,
          data: {
            ...formData,
            issue_date: issueDate,
            due_date: dueDate,
            line_items: items,
          },
        })
      } else {
        const created = await createMutation.mutateAsync({
          client_id: formData.client_id || null,
          contract_id: formData.contract_id || null,
          invoice_number: formData.invoice_number || 'INV-000',
          issue_date: issueDate,
          due_date: dueDate,
          line_items: items,
          currency: formData.currency || 'USD',
          tax_rate: formData.tax_rate ?? null,
          discount_type: formData.discount_type ?? null,
          discount_value: formData.discount_value ?? null,
          subtotal: formData.subtotal || 0,
          total: formData.total || 0,
          payment_method: formData.payment_method || null,
          payment_instructions: formData.payment_instructions || null,
          notes_to_client: formData.notes_to_client || null,
          internal_notes: formData.internal_notes || null,
          status: formData.status || 'unpaid',
        })
        useInvoiceStore.getState().setActiveInvoice(created.id)
      }
      setSaveStatus('saved')
      useInvoiceStore.setState({ isDirty: false })
    } catch {
      setSaveStatus('error')
    }
  }, [activeInvoiceId, createMutation, formData, isDirty, saveStatus, setSaveStatus, updateMutation])

  // Auto-save every 30 seconds when dirty
  useEffect(() => {
    if (!isDirty) return

    autoSaveTimerRef.current = setTimeout(() => {
      handleSave()
    }, 30_000)

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }
    }
  }, [isDirty, formData, handleSave])

  const handleClose = () => {
    if (isDirty) {
      handleSave()
    }
    resetForm()
    setView('list')
  }

  return (
    <div className="flex h-full flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-[14px] font-semibold text-[var(--text-soft-strong)]">
            {activeInvoiceId ? 'Edit Invoice' : 'New Invoice'}
          </h3>
          <span
            className={`text-[11px] font-medium transition-opacity duration-300 ${
              saveStatus === 'saving'
                ? 'text-[var(--text-soft-muted)]'
                : saveStatus === 'saved'
                  ? 'text-[var(--feedback-success-text)]'
                  : saveStatus === 'error'
                    ? 'text-[var(--feedback-error-text)]'
                    : 'opacity-0'
            }`}
          >
            {saveStatus === 'saving'
              ? 'Saving...'
              : saveStatus === 'saved'
                ? 'Saved'
                : saveStatus === 'error'
                  ? 'Error saving'
                  : ''}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={!isDirty && saveStatus !== 'idle'}
            className="rounded-[8px] bg-[var(--primary)] px-3 py-1.5 text-[12px] font-medium text-white transition-colors hover:opacity-90 disabled:opacity-50"
          >
            Save
          </button>
          <button
            type="button"
            onClick={handleClose}
            className="text-[var(--text-soft-muted)] hover:text-[var(--text-soft-strong)]"
            aria-label="Close editor"
          >
            <CloseCircleBold size={20} />
          </button>
        </div>
      </div>

      {/* Two column layout */}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-hidden lg:grid-cols-2">
        {/* Left: Form */}
        <div className="min-h-0 overflow-hidden rounded-[14px] border border-[var(--surface-panel-border)] bg-[var(--surface-panel-strong)] p-4">
          <InvoiceForm />
        </div>

        {/* Right: Preview */}
        <div className="hidden min-h-0 overflow-hidden lg:block">
          <InvoicePreview />
        </div>
      </div>
    </div>
  )
}
