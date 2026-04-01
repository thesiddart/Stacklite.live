'use client'

import React from 'react'
import { AddBold, TrashBold } from 'sicons'
import { useInvoiceStore } from '@/stores/invoiceStore'
import type { InvoiceLineItem } from '@/lib/utils/invoiceCalculations'

function formatCurrency(value: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
    maximumFractionDigits: 2,
  }).format(value)
}

export function LineItemsSection() {
  const { formData, addLineItem, updateLineItem, removeLineItem } = useInvoiceStore()
  const items = (formData.line_items || []) as InvoiceLineItem[]
  const currency = formData.currency || 'USD'

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[14px] font-semibold text-[var(--text-soft-strong)]">
            Line Items
          </h3>
          <p className="mt-0.5 text-[12px] text-[var(--text-soft-muted)]">
            Add each billable service or deliverable.
          </p>
        </div>
        <button
          type="button"
          onClick={addLineItem}
          className="inline-flex items-center gap-1 rounded-[8px] bg-[var(--primary)] px-2.5 py-1 text-[12px] font-medium text-white transition-colors hover:opacity-90"
        >
          <AddBold size={14} />
          Add Item
        </button>
      </div>

      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="rounded-[10px] border border-[var(--surface-panel-border)] bg-[var(--surface-card)] p-3"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-soft-muted)]">
                Item {index + 1}
              </span>
              <button
                type="button"
                onClick={() => removeLineItem(item.id)}
                disabled={items.length <= 1}
                className="rounded-[6px] p-1 text-[var(--text-soft-muted)] hover:bg-[var(--surface-danger-soft)] hover:text-[var(--text-danger-soft)] disabled:opacity-40"
                aria-label={`Remove item ${index + 1}`}
              >
                <TrashBold size={14} />
              </button>
            </div>

            <div className="grid gap-2 sm:grid-cols-[1fr_80px_100px]">
              <div>
                <label className="mb-1 block text-[11px] font-medium text-[var(--text-soft-strong)]">
                  Description
                </label>
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => updateLineItem(item.id, { description: e.target.value })}
                  placeholder="Website audit, design system..."
                  className="theme-shell-field h-8 w-full rounded-[6px] px-3 text-[13px] focus-visible:border-[var(--primary)] focus-visible:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-medium text-[var(--text-soft-strong)]">
                  Qty
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={item.qty}
                  onChange={(e) => updateLineItem(item.id, { qty: Number(e.target.value) || 0 })}
                  className="theme-shell-field h-8 w-full rounded-[6px] px-3 text-center text-[13px] focus-visible:border-[var(--primary)] focus-visible:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-medium text-[var(--text-soft-strong)]">
                  Rate
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.rate}
                  onChange={(e) => updateLineItem(item.id, { rate: Number(e.target.value) || 0 })}
                  className="theme-shell-field h-8 w-full rounded-[6px] px-3 text-[13px] focus-visible:border-[var(--primary)] focus-visible:outline-none"
                />
              </div>
            </div>

            <p className="mt-2 text-right text-[12px] font-semibold text-[var(--text-soft-strong)]">
              Amount: {formatCurrency(item.amount, currency)}
            </p>
          </div>
        ))}
      </div>

      {/* Subtotal */}
      <div className="flex items-center justify-between rounded-[8px] bg-[var(--surface-chip)] px-3 py-2">
        <span className="text-[13px] font-medium text-[var(--text-soft-strong)]">Subtotal</span>
        <span className="text-[13px] font-semibold text-[var(--text-soft-strong)]">
          {formatCurrency(formData.subtotal || 0, currency)}
        </span>
      </div>
    </div>
  )
}
