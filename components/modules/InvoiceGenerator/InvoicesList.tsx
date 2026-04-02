'use client'

import { useState } from 'react'
import {
  DocumentText1Bold,
  EditBold,
  LinkBold,
  TrashBold,
  AddCircleBold,
  TickCircleBold,
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
import { getDisplayStatus, generateInvoiceNumber } from '@/lib/utils/invoiceCalculations'
import { downloadInvoicePdf as saveInvoicePdf } from '@/lib/utils/pdfDownload'
import type { Invoice } from '@/lib/types/database'
import type { InvoiceLineItem } from '@/lib/utils/invoiceCalculations'

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  unpaid: { bg: 'bg-[rgba(234,179,0,0.12)]', text: 'text-[var(--feedback-warning-text)]', label: 'Unpaid' },
  paid: { bg: 'bg-feedback-success-base/12', text: 'text-feedback-success-text', label: 'Paid' },
  overdue: { bg: 'bg-[rgba(220,38,38,0.12)]', text: 'text-[var(--feedback-error-text)]', label: 'Overdue' },
  archived: { bg: 'bg-[var(--surface-disabled)]', text: 'text-[var(--text-soft-disabled)]', label: 'Archived' },
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

export function InvoicesList() {
  const isGuest = useSessionStore((s) => s.isGuest)
  const openWithAction = useSavePromptStore((s) => s.openWithAction)
  const { data: invoices = [], isLoading } = useInvoices()
  const { data: clients = [] } = useClients()
  const deleteMutation = useDeleteInvoice()
  const shareMutation = useGenerateInvoiceShareLink()
  const paidMutation = useMarkInvoicePaid()
  const { setView, setActiveInvoice, updateFormData, resetForm, initNewInvoice } =
    useInvoiceStore()
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null)

  const getClientName = (clientId: string | null) => {
    if (!clientId) return null
    return clients.find((c) => c.id === clientId)?.name || null
  }

  const handleEdit = (invoice: Invoice) => {
    resetForm()
    setActiveInvoice(invoice.id)

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
      discount_type: (invoice.discount_type as 'flat' | 'percent') || null,
      discount_value: invoice.discount_value || null,
      subtotal: invoice.subtotal,
      total: invoice.total,
      payment_method: invoice.payment_method,
      payment_instructions: invoice.payment_instructions,
      notes_to_client: invoice.notes_to_client,
      internal_notes: invoice.internal_notes,
      status: (invoice.status as 'unpaid' | 'paid' | 'archived') || 'unpaid',
    })

    setView('editor')
  }

  const handleCopyLink = async (invoice: Invoice) => {
    try {
      const url = await shareMutation.mutateAsync(invoice.id)
      await navigator.clipboard.writeText(url)
      setCopiedId(invoice.id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      // silently fail
    }
  }

  const handleMarkPaid = async (id: string) => {
    try {
      await paidMutation.mutateAsync(id)
    } catch {
      // silently fail
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id)
    } catch {
      // silently fail
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
        <p className="text-[13px] text-[var(--text-soft-muted)]">Loading invoices...</p>
      </div>
    )
  }

  return (
    <TooltipProvider delayDuration={180}>
    <div className="flex h-full flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        {previewInvoice ? (
          <button
            type="button"
            onClick={() => setPreviewInvoice(null)}
            className="text-[14px] font-semibold text-[var(--text-soft-strong)] hover:text-[var(--tertiary)]"
          >
            ← Back
          </button>
        ) : (
          <h3 className="text-[14px] font-semibold text-[var(--text-soft-strong)]">
            Invoices
          </h3>
        )}
        {!previewInvoice && (
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

      {/* List */}
      {previewInvoice ? (
        <div className="min-h-0 flex-1 overflow-y-auto rounded-[10px] border border-[var(--surface-panel-border)] bg-[var(--surface-card)] p-4 theme-scrollbar">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-soft-muted)]">Invoice</p>
          <h2 className="mt-2 text-[20px] font-bold text-[var(--text-soft-strong)]">{previewInvoice.invoice_number}</h2>
          <p className="mt-1 text-[13px] text-[var(--text-soft-muted)]">Issued {previewInvoice.issue_date} · Due {previewInvoice.due_date}</p>

          <div className="mt-5 border-t border-[var(--surface-divider)] pt-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-soft-muted)]">Bill To</p>
            <p className="mt-2 text-[14px] font-medium text-[var(--text-soft-strong)]">{getClientName(previewInvoice.client_id) || 'Client'}</p>
          </div>

          <div className="mt-5 border-t border-[var(--surface-divider)] pt-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-soft-muted)]">Line Items</p>
            <div className="mt-2 space-y-2">
              {(Array.isArray(previewInvoice.line_items)
                ? (previewInvoice.line_items as unknown as InvoiceLineItem[])
                : []
              ).map((item) => (
                <div key={item.id} className="grid grid-cols-[1fr_50px_90px_100px] gap-2 text-[13px] text-[var(--text-soft-strong)]">
                  <span>{item.description || 'Item'}</span>
                  <span className="text-right">{item.qty}</span>
                  <span className="text-right">{formatCurrency(item.rate, previewInvoice.currency)}</span>
                  <span className="text-right">{formatCurrency(item.amount, previewInvoice.currency)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 border-t border-[var(--surface-divider)] pt-4">
            <div className="ml-auto w-full max-w-[240px] space-y-1 text-[13px]">
              <div className="flex justify-between text-[var(--text-soft-muted)]"><span>Subtotal</span><span>{formatCurrency(previewInvoice.subtotal, previewInvoice.currency)}</span></div>
              <div className="flex justify-between text-[var(--text-soft-muted)]"><span>Tax</span><span>{formatCurrency(previewInvoice.tax_amount || 0, previewInvoice.currency)}</span></div>
              <div className="flex justify-between border-t border-[var(--surface-divider)] pt-1 font-semibold text-[var(--text-soft-strong)]"><span>Total</span><span>{formatCurrency(previewInvoice.total, previewInvoice.currency)}</span></div>
            </div>
          </div>

          {(previewInvoice.payment_method || previewInvoice.payment_instructions) && (
            <div className="mt-5 border-t border-[var(--surface-divider)] pt-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-soft-muted)]">Payment</p>
              {previewInvoice.payment_method && <p className="mt-2 text-[14px] text-[var(--text-soft-strong)]">{previewInvoice.payment_method}</p>}
              {previewInvoice.payment_instructions && <p className="mt-1 whitespace-pre-line text-[13px] text-[var(--text-soft-muted)]">{previewInvoice.payment_instructions}</p>}
            </div>
          )}

          {previewInvoice.notes_to_client && (
            <div className="mt-5 border-t border-[var(--surface-divider)] pt-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-soft-muted)]">Notes</p>
              <p className="mt-2 whitespace-pre-line text-[14px] leading-[22px] text-[var(--text-soft-strong)]">{previewInvoice.notes_to_client}</p>
            </div>
          )}
        </div>
      ) : invoices.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
          <DocumentText1Bold size={28} className="text-[var(--text-soft-muted)]" />
          <p className="text-[13px] text-[var(--text-soft-muted)]">No invoices yet</p>
          <button
            type="button"
            onClick={handleNewInvoice}
            className="text-[12px] font-medium text-[var(--tertiary)] hover:text-[var(--primary)]"
          >
            Create your first invoice →
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
                onClick={() => setPreviewInvoice(invoice)}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-[13px] font-medium text-[var(--text-soft-strong)]">
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
                </div>

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
                        ) : (
                          <LinkBold size={14} />
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Copy share link</TooltipContent>
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
                          handleDelete(invoice.id)
                        }}
                        className="rounded-[6px] p-1.5 text-text-brand hover:bg-[var(--surface-danger-soft)] hover:text-[var(--text-danger-soft)]"
                        aria-label="Delete"
                      >
                        <TrashBold size={14} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Delete</TooltipContent>
                  </Tooltip>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
    </TooltipProvider>
  )
}
