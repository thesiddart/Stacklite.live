'use client'

import React from 'react'
import { useInvoiceStore } from '@/stores/invoiceStore'
import { useClients } from '@/hooks/useClients'
import { useProfile } from '@/hooks/useProfile'
import { useAuth } from '@/hooks/useAuth'
import { getDisplayStatus } from '@/lib/utils/invoiceCalculations'
import type { InvoiceLineItem } from '@/lib/utils/invoiceCalculations'

function formatCurrency(value: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
    maximumFractionDigits: 2,
  }).format(value)
}

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  unpaid: { bg: 'bg-feedback-warning-bg', text: 'text-feedback-warning-text', label: 'Unpaid' },
  paid: { bg: 'bg-feedback-success-bg', text: 'text-feedback-success-text', label: 'Paid' },
  overdue: { bg: 'bg-feedback-error-bg', text: 'text-feedback-error-text', label: 'Overdue' },
  archived: { bg: 'bg-background-disabled', text: 'text-text-disabled', label: 'Archived' },
}

export function InvoicePreview() {
  const { formData } = useInvoiceStore()
  const { data: clients = [] } = useClients()
  const { user } = useAuth()
  const { data: profile } = useProfile(Boolean(user))

  const freelancerName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    'Freelancer'
  const freelancerEmail = profile?.email || user?.email || ''

  const selectedClient = clients.find((c) => c.id === formData.client_id)
  const items = (formData.line_items || []) as InvoiceLineItem[]
  const currency = formData.currency || 'USD'
  const status = getDisplayStatus(formData.status || 'unpaid', formData.due_date || '')
  const statusStyle = STATUS_STYLES[status] || STATUS_STYLES.unpaid

  const taxAmount =
    formData.tax_rate && formData.subtotal
      ? parseFloat(((formData.subtotal * formData.tax_rate) / 100).toFixed(2))
      : 0

  const discountAmount = (() => {
    if (!formData.discount_type || !formData.discount_value || !formData.subtotal) return 0
    return formData.discount_type === 'percent'
      ? parseFloat(((formData.subtotal * formData.discount_value) / 100).toFixed(2))
      : formData.discount_value
  })()

  return (
    <div className="h-full overflow-y-auto rounded-[14px] border border-[var(--surface-panel-border)] bg-white p-6 shadow-sm theme-scrollbar dark:bg-[var(--surface-card)]">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-[var(--surface-divider)] pb-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-text-muted">
            Invoice
          </p>
          <h2 className="mt-2 text-[18px] font-bold leading-tight text-text-base">
            {formData.invoice_number || 'INV-000'}
          </h2>
          <p className="mt-1 text-[12px] text-text-muted">
            Issued {formData.issue_date || 'TBD'} &middot; Due {formData.due_date || 'TBD'}
          </p>
        </div>
        <span className={`inline-flex items-center rounded-[4px] px-2 py-0.5 text-[11px] font-semibold ${statusStyle.bg} ${statusStyle.text}`}>
          {statusStyle.label}
        </span>
      </div>

      {/* Parties */}
      <div className="mt-4 grid grid-cols-2 gap-4 border-b border-[var(--surface-divider)] pb-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">
            From
          </p>
          <p className="mt-1 text-[13px] font-medium text-text-base">
            {freelancerName}
          </p>
          <p className="text-[12px] text-text-muted">{freelancerEmail}</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">
            Bill To
          </p>
          <p className="mt-1 text-[13px] font-medium text-text-base">
            {selectedClient?.name || 'Select a client'}
          </p>
          <p className="text-[12px] text-text-muted">
            {selectedClient?.email || '—'}
          </p>
          {selectedClient?.company_name && (
            <p className="text-[12px] text-text-muted">
              {selectedClient.company_name}
            </p>
          )}
        </div>
      </div>

      {/* Line items table */}
      {items.length > 0 && (
        <div className="mt-4 border-b border-[var(--surface-divider)] pb-4">
          <div className="overflow-hidden rounded-[8px] border border-[var(--surface-panel-border)]">
            <div className="grid grid-cols-[1fr_60px_80px_90px] gap-2 border-b border-[var(--surface-panel-border)] bg-[var(--surface-chip)] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">
              <span>Description</span>
              <span className="text-right">Qty</span>
              <span className="text-right">Rate</span>
              <span className="text-right">Amount</span>
            </div>
            {items.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-[1fr_60px_80px_90px] gap-2 border-b border-[var(--surface-panel-border)] px-3 py-2 text-[12px] text-text-base last:border-b-0"
              >
                <span className="truncate">{item.description || 'Untitled'}</span>
                <span className="text-right">{item.qty}</span>
                <span className="text-right">{formatCurrency(item.rate, currency)}</span>
                <span className="text-right">{formatCurrency(item.amount, currency)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Totals */}
      <div className="mt-4 ml-auto w-full max-w-[240px] space-y-1 border-b border-[var(--surface-divider)] pb-4">
        <div className="flex justify-between text-[12px] text-text-muted">
          <span>Subtotal</span>
          <span>{formatCurrency(formData.subtotal || 0, currency)}</span>
        </div>
        {formData.tax_rate != null && formData.tax_rate > 0 && (
          <div className="flex justify-between text-[12px] text-text-muted">
            <span>Tax ({formData.tax_rate}%)</span>
            <span>{formatCurrency(taxAmount, currency)}</span>
          </div>
        )}
        {discountAmount > 0 && (
          <div className="flex justify-between text-[12px] text-text-muted">
            <span>Discount</span>
            <span>-{formatCurrency(discountAmount, currency)}</span>
          </div>
        )}
        <div className="flex justify-between border-t border-[var(--surface-divider)] pt-1 text-[14px] font-bold text-text-base">
          <span>Total</span>
          <span className="text-feedback-success-text">{formatCurrency(formData.total || 0, currency)}</span>
        </div>
      </div>

      {/* Payment info */}
      {(formData.payment_method || formData.payment_instructions) && (
        <div className="mt-4 border-b border-[var(--surface-divider)] pb-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">
            Payment
          </p>
          {formData.payment_method && (
            <p className="mt-2 text-[13px] text-text-base">
              {formData.payment_method}
            </p>
          )}
          {formData.payment_instructions && (
            <p className="mt-1 whitespace-pre-line text-[12px] leading-[18px] text-text-muted">
              {formData.payment_instructions}
            </p>
          )}
        </div>
      )}

      {/* Notes */}
      {formData.notes_to_client && (
        <div className="mt-4 border-b border-[var(--surface-divider)] pb-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">
            Notes
          </p>
          <p className="mt-2 whitespace-pre-line text-[13px] leading-[20px] text-text-base">
            {formData.notes_to_client}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="mt-6 text-center">
        <p className="text-[10px] text-text-muted">
          Generated with Stacklite
        </p>
      </div>
    </div>
  )
}
