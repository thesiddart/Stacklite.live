'use client'

import { useState } from 'react'
import {
  DocumentText1Bold,
  EditBold,
  LinkBold,
  TrashBold,
  AddCircleBold,
  TickCircleBold,
  CloseCircleBold,
} from 'sicons'
import {
  useInvoices,
  useDeleteInvoice,
  useGenerateInvoiceShareLink,
  useMarkInvoicePaid,
} from '@/hooks/useInvoices'
import { useClients } from '@/hooks/useClients'
import { useInvoiceStore } from '@/stores/invoiceStore'
import { useSessionStore } from '@/stores/sessionStore'
import { useSavePromptStore } from '@/stores/savePromptStore'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { InvoicePreview } from './InvoicePreview'
import { getDisplayStatus, generateInvoiceNumber } from '@/lib/utils/invoiceCalculations'
import { downloadInvoicePdf as saveInvoicePdf } from '@/lib/utils/pdfDownload'
import type { Invoice } from '@/lib/types/database'
import type { InvoiceLineItem } from '@/lib/utils/invoiceCalculations'

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  unpaid: { bg: 'bg-feedback-warning-bg', text: 'text-feedback-warning-text', label: 'Unpaid' },
  paid: { bg: 'bg-feedback-success-bg', text: 'text-feedback-success-text', label: 'Paid' },
  overdue: { bg: 'bg-feedback-error-bg', text: 'text-feedback-error-text', label: 'Overdue' },
  archived: { bg: 'bg-background-disabled', text: 'text-text-disabled', label: 'Archived' },
}

function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.unpaid
  return (
    <span
      className={`inline-flex items-center rounded-[4px] px-2 py-0.5 text-[11px] font-semibold ${style.bg} ${style.text}`}
    >
      {style.label}
    </span>
  )
}

function formatCurrency(value: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
    maximumFractionDigits: 2,
  }).format(value)
}

function normalizeInvoiceStatus(value: string | null | undefined): 'unpaid' | 'paid' | 'archived' {
  const normalized = (value ?? '').trim().toLowerCase()
  if (normalized === 'paid') return 'paid'
  if (normalized === 'archived') return 'archived'
  return 'unpaid'
}

function normalizeDiscountType(value: string | null | undefined): 'flat' | 'percent' | null {
  const normalized = (value ?? '').trim().toLowerCase()
  if (normalized === 'flat') return 'flat'
  if (normalized === 'percent' || normalized === 'percentage') return 'percent'
  return null
}

export function InvoicesList() {
  const isGuest = useSessionStore((s) => s.isGuest)
  const openWithAction = useSavePromptStore((s) => s.openWithAction)
  const {
    data: invoices = [],
    isLoading,
    error: invoicesError,
  } = useInvoices()
  const { data: clients = [] } = useClients()
  const deleteMutation = useDeleteInvoice()
  const shareMutation = useGenerateInvoiceShareLink()
  const paidMutation = useMarkInvoicePaid()
  const { setView, setActiveInvoice, updateFormData, resetForm, initNewInvoice } =
    useInvoiceStore()
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [copyErrorId, setCopyErrorId] = useState<string | null>(null)
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [pendingDeleteInvoiceId, setPendingDeleteInvoiceId] = useState<string | null>(null)

  const syncInvoiceToForm = (invoice: Invoice) => {
    updateFormData({
      client_id: invoice.client_id,
      contract_id: invoice.contract_id,
      invoice_number: invoice.invoice_number,
      issue_date: invoice.issue_date,
      due_date: invoice.due_date,
      line_items: Array.isArray(invoice.line_items)
        ? (invoice.line_items as unknown as InvoiceLineItem[])
        : [],
      currency: invoice.currency,
      tax_rate: invoice.tax_rate || null,
      discount_type: normalizeDiscountType(invoice.discount_type),
      discount_value: invoice.discount_value || null,
      subtotal: invoice.subtotal,
      total: invoice.total,
      payment_method: invoice.payment_method,
      payment_instructions: invoice.payment_instructions,
      notes_to_client: invoice.notes_to_client,
      internal_notes: invoice.internal_notes,
      status: normalizeInvoiceStatus(invoice.status),
    })
  }

  const getClientName = (clientId: string | null) => {
    if (!clientId) return null
    return clients.find((c) => c.id === clientId)?.name || null
  }

  const handleEdit = (invoice: Invoice) => {
    resetForm()
    setActiveInvoice(invoice.id)
    syncInvoiceToForm(invoice)

    setView('editor')
  }

  const handlePreviewFromList = (invoice: Invoice) => {
    resetForm()
    setActiveInvoice(invoice.id)
    syncInvoiceToForm(invoice)
    setPreviewInvoice(invoice)
  }

  const handleCopyLink = async (invoice: Invoice) => {
    if (isGuest) {
      openWithAction(() => {
        // Share links require migration to an authenticated account.
      })
      return
    }

    try {
      const url = await shareMutation.mutateAsync(invoice.id)

      if (!url || /\/(null|undefined)$/.test(url)) {
        throw new Error('Invalid share URL')
      }

      await navigator.clipboard.writeText(url)
      setCopiedId(invoice.id)
      setCopyErrorId(null)
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      setCopyErrorId(invoice.id)
      setCopiedId(null)
      setTimeout(() => setCopyErrorId(null), 2500)
    }
  }

  const handleMarkPaid = async (id: string) => {
    try {
      setActionError(null)
      await paidMutation.mutateAsync(id)
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Failed to mark invoice as paid')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      setActionError(null)
      await deleteMutation.mutateAsync(id)
      setPendingDeleteInvoiceId(null)
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Failed to delete invoice')
    }
  }

  const downloadInvoiceAsPdf = (invoice: Invoice) => {
    const clientName = getClientName(invoice.client_id) || 'Client'
    const lineItems = Array.isArray(invoice.line_items)
      ? (invoice.line_items as unknown as InvoiceLineItem[])
      : []

    const taxAmount = invoice.tax_rate
      ? parseFloat(((invoice.subtotal * invoice.tax_rate) / 100).toFixed(2))
      : 0

    const discountAmount = (() => {
      if (!invoice.discount_type || !invoice.discount_value) return 0
      return invoice.discount_type === 'percent'
        ? parseFloat(((invoice.subtotal * invoice.discount_value) / 100).toFixed(2))
        : invoice.discount_value
    })()

    const safeClientName = clientName.replace(/[^a-zA-Z0-9_-]+/g, '_')
    const safeInvoiceNumber = (invoice.invoice_number || 'INV').replace(/[^a-zA-Z0-9_-]+/g, '_')
    saveInvoicePdf(`Invoice_${safeInvoiceNumber}_${safeClientName}.pdf`, {
      invoiceNumber: invoice.invoice_number,
      clientName,
      issueDate: invoice.issue_date,
      dueDate: invoice.due_date,
      status: getDisplayStatus(invoice.status, invoice.due_date),
      items: lineItems.map((item) => ({
        description: item.description || 'Item',
        qty: item.qty,
        rate: formatCurrency(item.rate, invoice.currency),
        amount: formatCurrency(item.amount, invoice.currency),
      })),
      subtotal: formatCurrency(invoice.subtotal, invoice.currency),
      tax: formatCurrency(taxAmount, invoice.currency),
      discount: formatCurrency(discountAmount, invoice.currency),
      total: formatCurrency(invoice.total, invoice.currency),
      paymentMethod: invoice.payment_method || 'N/A',
      paymentInstructions: invoice.payment_instructions || 'N/A',
      notesToClient: invoice.notes_to_client || 'N/A',
    })
  }

  const handleDownload = (invoice: Invoice) => {
    const action = () => {
      downloadInvoiceAsPdf(invoice)
    }

    if (isGuest) {
      openWithAction(action)
      return
    }

    action()
  }

  const handleNewInvoice = () => {
    const number = generateInvoiceNumber(invoices.length)
    initNewInvoice(number)
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-[13px] text-text-muted">Loading your invoices...</p>
      </div>
    )
  }

  if (invoicesError) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex max-w-[360px] flex-col items-center gap-3 text-center">
          <h3 className="text-[16px] font-semibold text-text-base">Couldn&apos;t load invoices</h3>
          <p className="text-[13px] text-text-muted">
            Something went wrong. Try refreshing or check your connection.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex h-8 items-center justify-center rounded-[8px] bg-[var(--primary)] px-3 py-1.5 text-[12px] font-medium text-white transition-colors hover:opacity-90"
          >
            Refresh
          </button>
        </div>
      </div>
    )
  }

  return (
    <TooltipProvider delayDuration={180}>
    <div className="flex h-full flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        {previewInvoice ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPreviewInvoice(null)}
              className="rounded-[8px] border border-border-base bg-background-base px-3 py-1.5 text-[14px] font-medium leading-none text-text-base transition-colors hover:bg-background-muted"
            >
              &larr; Invoices
            </button>
            <span className="text-[11px] font-medium text-[var(--feedback-success-text)]">Saved</span>
          </div>
        ) : (
          <h3 className="text-[14px] font-semibold text-text-base">
            Invoices
          </h3>
        )}
        {previewInvoice ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleDownload(previewInvoice)}
              aria-label="Download PDF"
              className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] border border-border-base bg-background-base text-text-base transition-colors hover:bg-background-muted"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 3V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8 10L12 14L16 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M4 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => handleEdit(previewInvoice)}
              className="rounded-[8px] bg-[var(--primary)] px-3 py-1.5 text-[12px] font-medium text-white transition-colors hover:opacity-90"
            >
              Edit
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleNewInvoice}
            className="inline-flex items-center gap-1 rounded-[8px] bg-[var(--primary)] px-3 py-1.5 text-[12px] font-medium text-white transition-colors hover:opacity-90"
          >
            <AddCircleBold size={14} />
            New
          </button>
        )}
      </div>

      {actionError && (
        <p className="text-[12px] text-feedback-error-text">{actionError}</p>
      )}

      {/* List */}
      {previewInvoice ? (
        <InvoicePreview />
      ) : invoices.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
          <DocumentText1Bold size={28} className="text-[var(--tertiary)]" />
          <h3 className="text-[14px] font-medium text-text-base">No invoices yet.</h3>
          <p className="max-w-[420px] text-[12px] text-text-muted">
            Create an invoice and send it to your client in minutes. Your income tracker will update automatically when you mark one as paid.
          </p>
          <button
            type="button"
            onClick={handleNewInvoice}
            className="inline-flex items-center gap-1 rounded-[8px] bg-[var(--primary)] px-3 py-1.5 text-[12px] font-medium text-white transition-colors hover:opacity-90"
          >
            <AddCircleBold size={14} />
            New invoice
          </button>
        </div>
      ) : (
        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1 theme-scrollbar">
          {invoices.map((invoice) => {
            const clientName = getClientName(invoice.client_id)
            const displayStatus = getDisplayStatus(invoice.status, invoice.due_date)
            const isOverdue = displayStatus === 'overdue'

            return (
              <div
                key={invoice.id}
                className={`group flex items-center justify-between rounded-[10px] border border-[var(--surface-panel-border)] bg-[var(--surface-card)] p-3 transition-all duration-200 hover:border-[var(--primary)] ${
                  isOverdue ? 'border-l-2 border-l-[var(--feedback-error-text)]' : ''
                }`}
                onClick={() => {
                  if (pendingDeleteInvoiceId === invoice.id) {
                    return
                  }
                  handlePreviewFromList(invoice)
                }}
              >
                <div className="min-w-0 flex-1">
                  {pendingDeleteInvoiceId === invoice.id ? (
                    <div className="flex w-full items-center gap-3">
                      <p className="text-[13px] font-medium text-text-base">Are you sure want to delete this?</p>
                      <div className="ml-auto flex items-center gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation()
                                void handleDelete(invoice.id)
                              }}
                              className="inline-flex items-center gap-1 rounded-[6px] px-2 py-1 text-feedback-error-text hover:bg-feedback-error-bg"
                              aria-label="Confirm delete"
                            >
                              <TickCircleBold size={14} />
                              <span className="text-[12px] font-medium leading-none">Confirm</span>
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>Confirm delete</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation()
                                setPendingDeleteInvoiceId(null)
                              }}
                              className="inline-flex items-center gap-1 rounded-[6px] px-2 py-1 text-text-brand hover:bg-[var(--surface-chip)] hover:text-text-base"
                              aria-label="Cancel delete"
                            >
                              <CloseCircleBold size={14} />
                              <span className="text-[12px] font-medium leading-none">Cancel</span>
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>Cancel</TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <p className="truncate text-[13px] font-medium text-text-base">
                          {invoice.invoice_number}
                          {clientName ? ` · ${clientName}` : ''}
                          {' · '}
                          {formatCurrency(invoice.total, invoice.currency)}
                        </p>
                        <StatusBadge status={displayStatus} />
                      </div>
                      <p className="mt-0.5 text-[11px] text-text-muted">
                        Due {invoice.due_date} · Updated {new Date(invoice.updated_at).toLocaleDateString()}
                      </p>
                    </>
                  )}
                </div>

                {pendingDeleteInvoiceId !== invoice.id && (
                <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()
                          handleEdit(invoice)
                        }}
                        className="rounded-[6px] p-1.5 text-text-brand hover:bg-[var(--surface-chip)] hover:text-text-base"
                        aria-label="Edit"
                      >
                        <EditBold size={14} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Edit</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()
                          handleCopyLink(invoice)
                        }}
                        className="rounded-[6px] p-1.5 text-text-brand hover:bg-[var(--surface-chip)] hover:text-text-base"
                        aria-label="Copy share link"
                      >
                        {copiedId === invoice.id ? (
                          <span className="text-[11px] font-medium text-[var(--feedback-success-text)]">
                            Copied!
                          </span>
                        ) : copyErrorId === invoice.id ? (
                          <span className="text-[11px] font-medium text-feedback-errorText">
                            Failed
                          </span>
                        ) : (
                          <LinkBold size={14} />
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {copyErrorId === invoice.id
                        ? 'Failed to copy link'
                        : copiedId === invoice.id
                          ? 'Link copied'
                          : 'Copy share link'}
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()
                          handleDownload(invoice)
                        }}
                        className="rounded-[6px] p-1.5 text-text-brand hover:bg-[var(--surface-chip)] hover:text-text-base"
                        aria-label="Download PDF"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <path d="M12 3V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M8 10L12 14L16 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M4 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Download PDF</TooltipContent>
                  </Tooltip>

                  {invoice.status !== 'paid' && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            handleMarkPaid(invoice.id)
                          }}
                          className="rounded-[6px] p-1.5 text-text-brand hover:bg-feedback-success-base/10 hover:text-feedback-success-text"
                          aria-label="Mark as paid"
                        >
                          <TickCircleBold size={14} />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Mark as paid</TooltipContent>
                    </Tooltip>
                  )}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()
                          setPendingDeleteInvoiceId(invoice.id)
                        }}
                        className="rounded-[6px] p-1.5 text-text-brand hover:bg-feedback-error-bg hover:text-feedback-error-text"
                        aria-label="Delete"
                      >
                        <TrashBold size={14} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Delete</TooltipContent>
                  </Tooltip>
                </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
    </TooltipProvider>
  )
}
