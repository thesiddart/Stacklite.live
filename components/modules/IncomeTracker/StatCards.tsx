'use client'

import React from 'react'

interface StatCardsProps {
  totalEarned: number
  totalOutstanding: number
  overdueAmount: number
  selectedPeriodEarned: number
  selectedPeriodLabel: string
  currency: string
}

function formatCurrency(value: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value)
}

export function StatCards({
  totalEarned,
  totalOutstanding,
  overdueAmount,
  selectedPeriodEarned,
  selectedPeriodLabel,
  currency,
}: StatCardsProps) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      <article className="rounded-[10px] border border-[var(--surface-panel-border)] bg-[var(--surface-card)] p-4">
        <p className="text-[11px] uppercase tracking-[0.14em] text-text-muted">Total Earned</p>
        <p className="mt-2 text-[22px] font-semibold text-text-base">
          {formatCurrency(totalEarned, currency)}
        </p>
        <p className="mt-1 text-[11px] text-text-muted">All time</p>
      </article>

      <article className="rounded-[10px] border border-[var(--surface-panel-border)] bg-[var(--surface-card)] p-4">
        <p className="text-[11px] uppercase tracking-[0.14em] text-text-muted">Outstanding</p>
        <p className="mt-2 text-[22px] font-semibold text-text-base">
          {formatCurrency(totalOutstanding, currency)}
        </p>
        <p className="mt-1 text-[11px] text-text-muted">Unpaid</p>
        {overdueAmount > 0 && (
          <p className="mt-1 text-[11px] text-feedback-warning-text">
            {`Warning ${formatCurrency(overdueAmount, currency)} overdue`}
          </p>
        )}
      </article>

      <article className="rounded-[10px] border border-[var(--surface-panel-border)] bg-[var(--surface-card)] p-4">
        <p className="text-[11px] uppercase tracking-[0.14em] text-text-muted">{selectedPeriodLabel}</p>
        <p className="mt-2 text-[22px] font-semibold text-text-base">
          {formatCurrency(selectedPeriodEarned, currency)}
        </p>
        <p className="mt-1 text-[11px] text-text-muted">Paid invoices</p>
      </article>
    </div>
  )
}
