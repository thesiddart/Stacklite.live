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

  const escapeHtml = (value: string) =>
    value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;')

  const openGuestInvoicePrint = (invoice: Invoice) => {
    const clientName = getClientName(invoice.client_id) || 'Client'
    const lineItems = Array.isArray(invoice.line_items)
      ? (invoice.line_items as unknown as InvoiceLineItem[])
      : []

    const lineRows = lineItems
      .map(
        (item) => `
          <tr>
            <td style="padding:8px;border-bottom:1px solid #ddd;">${escapeHtml(item.description || 'Item')}</td>
            <td style="padding:8px;border-bottom:1px solid #ddd;text-align:right;">${item.qty}</td>
            <td style="padding:8px;border-bottom:1px solid #ddd;text-align:right;">${formatCurrency(item.rate, invoice.currency)}</td>
            <td style="padding:8px;border-bottom:1px solid #ddd;text-align:right;">${formatCurrency(item.amount, invoice.currency)}</td>
          </tr>
        `
      )
      .join('')

    const html = `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${escapeHtml(invoice.invoice_number)}.pdf</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 32px; color: #111; }
            h1 { margin: 0 0 8px 0; }
            .muted { color: #666; font-size: 12px; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            .total { margin-top: 16px; text-align: right; font-size: 18px; font-weight: 700; }
          </style>
        </head>
        <body>
          <h1>Invoice ${escapeHtml(invoice.invoice_number)}</h1>
          <p class="muted">Client: ${escapeHtml(clientName)} | Due: ${escapeHtml(invoice.due_date)}</p>
          <table>
            <thead>
              <tr>
                <th style="text-align:left;padding:8px;border-bottom:1px solid #ddd;">Description</th>
                <th style="text-align:right;padding:8px;border-bottom:1px solid #ddd;">Qty</th>
                <th style="text-align:right;padding:8px;border-bottom:1px solid #ddd;">Rate</th>
                <th style="text-align:right;padding:8px;border-bottom:1px solid #ddd;">Amount</th>
              </tr>
            </thead>
            <tbody>${lineRows}</tbody>
          </table>
          <p class="total">Total: ${formatCurrency(invoice.total, invoice.currency)}</p>
          <p class="muted">Generated with Stacklite</p>
          <script>window.print()</script>
        </body>
      </html>
    `

    const popup = window.open('', '_blank', 'noopener,noreferrer')
    if (!popup) return
    popup.document.open()
    popup.document.write(html)
    popup.document.close()
    popup.focus()
  }

  const handleDownload = (invoice: Invoice) => {
    const action = () => {
      openGuestInvoicePrint(invoice)
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
        <h3 className="text-[14px] font-semibold text-[var(--text-soft-strong)]">
          Invoices
        </h3>
        <button
          type="button"
          onClick={handleNewInvoice}
          className="inline-flex items-center gap-1 rounded-[8px] bg-[var(--primary)] px-3 py-1.5 text-[12px] font-medium text-white transition-colors hover:opacity-90"
        >
          <AddCircleBold size={14} />
          New
        </button>
      </div>

      {/* List */}
      {invoices.length === 0 ? (
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
                  <p className="mt-0.5 text-[11px] text-[var(--text-soft-subtle)]">
                    Due {invoice.due_date} · Updated {new Date(invoice.updated_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => handleEdit(invoice)}
                        className="rounded-[6px] p-1.5 text-[var(--text-soft-muted)] hover:bg-[var(--surface-chip)] hover:text-[var(--tertiary)]"
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
                        onClick={() => handleCopyLink(invoice)}
                        className="rounded-[6px] p-1.5 text-[var(--text-soft-muted)] hover:bg-[var(--surface-chip)] hover:text-[var(--tertiary)]"
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
                        onClick={() => handleDownload(invoice)}
                        className="rounded-[6px] p-1.5 text-[var(--text-soft-muted)] hover:bg-[var(--surface-chip)] hover:text-[var(--tertiary)]"
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
                          onClick={() => handleMarkPaid(invoice.id)}
                          className="rounded-[6px] p-1.5 text-[var(--text-soft-muted)] hover:bg-feedback-success-base/10 hover:text-feedback-success-text"
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
                        onClick={() => handleDelete(invoice.id)}
                        className="rounded-[6px] p-1.5 text-[var(--text-soft-muted)] hover:bg-[var(--surface-danger-soft)] hover:text-[var(--text-danger-soft)]"
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
