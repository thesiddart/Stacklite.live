'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useInvoiceStore } from '@/stores/invoiceStore'
import { useCreateInvoice, useUpdateInvoice } from '@/hooks/useInvoices'
import { useClients } from '@/hooks/useClients'
import { useSessionStore } from '@/stores/sessionStore'
import { useSavePromptStore } from '@/stores/savePromptStore'
import { InvoiceForm } from './InvoiceForm'
import { InvoicePreview } from './InvoicePreview'
import { getDisplayStatus, type InvoiceLineItem } from '@/lib/utils/invoiceCalculations'
import { downloadInvoicePdf as saveInvoicePdf } from '@/lib/utils/pdfDownload'

export function InvoiceEditor() {
  const {
    activeInvoiceId,
    formData,
    isDirty,
    saveStatus,
    setSaveStatus,
  } = useInvoiceStore()

  const createMutation = useCreateInvoice()
  const updateMutation = useUpdateInvoice()
  const { data: clients = [] } = useClients()
  const isGuest = useSessionStore((s) => s.isGuest)
  const openWithAction = useSavePromptStore((s) => s.openWithAction)
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [isPreviewFocused, setIsPreviewFocused] = useState(false)
  const [saveErrorMessage, setSaveErrorMessage] = useState('')

  const selectedClient = useMemo(
    () => clients.find((client) => client.id === formData.client_id),
    [clients, formData.client_id]
  )

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

  const normalizeInvoiceStatus = (value: unknown): 'unpaid' | 'paid' | 'archived' => {
    const normalized = typeof value === 'string' ? value.trim().toLowerCase() : ''
    if (normalized === 'paid') return 'paid'
    if (normalized === 'archived') return 'archived'
    return 'unpaid'
  }

  const normalizeDiscountType = (value: unknown): 'flat' | 'percent' | null => {
    const normalized = typeof value === 'string' ? value.trim().toLowerCase() : ''
    if (normalized === 'flat') return 'flat'
    if (normalized === 'percent' || normalized === 'percentage') return 'percent'
    return null
  }

  const handleSave = useCallback(async () => {
    if (!isDirty && saveStatus !== 'idle') return

    setSaveStatus('saving')
    setSaveErrorMessage('')

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
      const normalizedStatus = normalizeInvoiceStatus(formData.status)
      const normalizedDiscountType = normalizeDiscountType(formData.discount_type)

      if (activeInvoiceId) {
        await updateMutation.mutateAsync({
          id: activeInvoiceId,
          data: {
            ...formData,
            issue_date: issueDate,
            due_date: dueDate,
            line_items: items,
            discount_type: normalizedDiscountType,
            status: normalizedStatus,
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
          discount_type: normalizedDiscountType,
          discount_value: formData.discount_value ?? null,
          subtotal: formData.subtotal || 0,
          total: formData.total || 0,
          payment_method: formData.payment_method || null,
          payment_instructions: formData.payment_instructions || null,
          notes_to_client: formData.notes_to_client || null,
          internal_notes: formData.internal_notes || null,
          status: normalizedStatus,
        })
        useInvoiceStore.getState().setActiveInvoice(created.id)
      }
      setSaveStatus('saved')
      setSaveErrorMessage('')
      useInvoiceStore.setState({ isDirty: false })
    } catch (error) {
      setSaveStatus('error')
      setSaveErrorMessage(error instanceof Error ? error.message : 'Failed to save invoice')
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

  const handlePreview = () => {
    setIsPreviewFocused(true)
  }

  const formatCurrency = (value: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      maximumFractionDigits: 2,
    }).format(value)
  }

  const handleDownloadPdf = () => {
    const lineItems = ((formData.line_items || []) as InvoiceLineItem[])
    const subtotal = Number(formData.subtotal || 0)
    const taxRate = Number(formData.tax_rate || 0)
    const taxAmount = taxRate > 0
      ? Number(((subtotal * taxRate) / 100).toFixed(2))
      : 0

    const discountAmount = (() => {
      if (!formData.discount_type || !formData.discount_value) return 0
      return formData.discount_type === 'percent'
        ? Number(((subtotal * Number(formData.discount_value || 0)) / 100).toFixed(2))
        : Number(formData.discount_value)
    })()

    const currency = formData.currency || 'USD'
    const clientName = selectedClient?.name || 'Client'
    const safeClientName = clientName.replace(/[^a-zA-Z0-9_-]+/g, '_')
    const safeInvoiceNumber = (formData.invoice_number || 'INV').replace(/[^a-zA-Z0-9_-]+/g, '_')

    const action = () => {
      saveInvoicePdf(`Invoice_${safeInvoiceNumber}_${safeClientName}.pdf`, {
        invoiceNumber: formData.invoice_number || 'INV-000',
        clientName,
        issueDate: formData.issue_date || 'TBD',
        dueDate: formData.due_date || 'TBD',
        status: getDisplayStatus(formData.status || 'unpaid', formData.due_date || ''),
        items: lineItems.map((item) => ({
          description: item.description || 'Item',
          qty: Number(item.qty) || 0,
          rate: formatCurrency(Number(item.rate) || 0, currency),
          amount: formatCurrency(Number(item.amount) || 0, currency),
        })),
        subtotal: formatCurrency(subtotal, currency),
        tax: formatCurrency(taxAmount, currency),
        discount: formatCurrency(discountAmount, currency),
        total: formatCurrency(Number(formData.total || 0), currency),
        paymentMethod: formData.payment_method || 'N/A',
        paymentInstructions: formData.payment_instructions || 'N/A',
        notesToClient: formData.notes_to_client || 'N/A',
      })
    }

    if (isGuest) {
      openWithAction(action)
      return
    }

    action()
  }

  const isSaveReadyForPreview = saveStatus === 'saved' && !isDirty
  const isSaving = saveStatus === 'saving'
  const shouldShowPreview = isPreviewFocused && !isDirty

  return (
    <div className="relative flex h-full flex-col gap-3 overflow-visible">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {shouldShowPreview && (
            <button
              type="button"
              onClick={() => setIsPreviewFocused(false)}
              className="rounded-[8px] border border-border-base bg-background-base px-3 py-1.5 text-[14px] font-medium leading-none text-text-base transition-colors hover:bg-background-muted"
            >
              ← Edit Invoice
            </button>
          )}
          {!shouldShowPreview && (
            <h3 className="text-[14px] font-semibold text-text-base">
              {activeInvoiceId ? 'Edit Invoice' : 'New Invoice'}
            </h3>
          )}
          <span
            className={`text-[11px] font-medium transition-opacity duration-300 ${
              saveStatus === 'saving'
                ? 'text-text-muted'
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
          {isSaveReadyForPreview && (
            <button
              type="button"
              onClick={handleDownloadPdf}
              aria-label="Download PDF"
              className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] border border-border-base bg-background-base text-text-base transition-colors hover:bg-background-muted"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 3V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8 10L12 14L16 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M4 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          )}
          <button
            type="button"
            onClick={isSaveReadyForPreview ? handlePreview : () => void handleSave()}
            disabled={isSaving || (!isDirty && saveStatus !== 'idle' && !isSaveReadyForPreview)}
            className="rounded-[8px] bg-[var(--primary)] px-3 py-1.5 text-[12px] font-medium text-white transition-colors hover:opacity-90 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : isSaveReadyForPreview ? 'Preview' : 'Save'}
          </button>
        </div>
      </div>

      {saveStatus === 'error' && saveErrorMessage ? (
        <p className="text-[12px] leading-none text-[var(--feedback-error-text)]">
          {saveErrorMessage}
        </p>
      ) : null}

      {/* Two column layout */}
      {shouldShowPreview ? (
        <InvoicePreview />
      ) : (
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-hidden lg:grid-cols-[2fr_3fr]">
          {/* Left: Form */}
          <div className="min-h-0 overflow-hidden rounded-[14px] border border-[var(--surface-panel-border)] p-4">
            <InvoiceForm />
          </div>

          {/* Right: Preview */}
          <div className="hidden min-h-0 overflow-hidden lg:block">
            <InvoicePreview />
          </div>
        </div>
      )}
    </div>
  )
}
