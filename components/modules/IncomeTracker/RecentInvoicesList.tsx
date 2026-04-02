'use client'

import React from 'react'

type RecentInvoice = {
  id: string
  invoiceNumber: string
  clientName: string
  total: number
  currency: string
  issueDate: string
  status: string
}

interface RecentInvoicesListProps {
  invoices: RecentInvoice[]
  onOpenInvoice: (id: string) => void
  onViewAllInvoices: () => void
}

function formatCurrency(value: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value)
}

function statusClass(status: string): string {
  if (status === 'paid') return 'bg-[var(--surface-chip)] text-text-brand'
  if (status === 'overdue') return 'bg-feedback-error-base/15 text-feedback-error-text'
  return 'bg-feedback-warning-base/15 text-feedback-warning-text'
}

export function RecentInvoicesList({ invoices, onOpenInvoice, onViewAllInvoices }: RecentInvoicesListProps) {
  return (
    <section className="rounded-[10px] border border-[var(--surface-panel-border)] bg-[var(--surface-card)] p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[13px] font-semibold text-text-base">Recent Invoices</h3>
      </div>

      {invoices.length === 0 ? (
        <p className="mt-3 text-[12px] text-text-muted">No invoices in this range.</p>
      ) : (
        <div className="mt-3 space-y-2">
          {invoices.map((invoice) => (
            <div
              key={invoice.id}
              className="grid grid-cols-[minmax(0,1fr)_auto_auto_auto_auto] items-center gap-2 rounded-[8px] border border-[var(--surface-panel-border)] px-3 py-2"
            >
              <div className="min-w-0">
                <p className="truncate text-[12px] font-medium text-text-base">
                  {invoice.invoiceNumber}
                </p>
                <p className="truncate text-[11px] text-text-muted">{invoice.clientName}</p>
              </div>
              <span className="text-[12px] text-text-base">{formatCurrency(invoice.total, invoice.currency)}</span>
              <span className="text-[11px] text-text-muted">{new Date(invoice.issueDate).toLocaleDateString()}</span>
              <span className={`inline-flex rounded-[4px] px-2 py-0.5 text-[10px] font-medium ${statusClass(invoice.status)}`}>
                {invoice.status}
              </span>
              <button
                type="button"
                onClick={() => onOpenInvoice(invoice.id)}
                className="text-[14px] text-[var(--tertiary)] transition-colors hover:text-[var(--primary)]"
                aria-label={`Open ${invoice.invoiceNumber}`}
              >
                →
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={onViewAllInvoices}
        className="mt-3 text-[12px] font-medium text-[var(--tertiary)] transition-colors hover:text-[var(--primary)]"
      >
        View all invoices →
      </button>
    </section>
  )
}
