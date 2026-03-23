'use client'

import React, { useMemo, useState } from 'react'
import { ArrowUp3Bold, Chart2Bold, DollarCircleBold, WalletBold } from 'sicons'
import { Button } from '@/components/ui/Button'

interface IncomeTrackerProps {
  variant?: 'dashboard' | 'page'
}

interface IncomeMonth {
  monthYear: string
  label: string
  expected: number
  paid: number
  unpaid: number
  overdue: number
  invoiceCount: number
  paidInvoiceCount: number
}

const incomeData: IncomeMonth[] = [
  {
    monthYear: '2026-01',
    label: 'January 2026',
    expected: 8200,
    paid: 5100,
    unpaid: 2200,
    overdue: 900,
    invoiceCount: 8,
    paidInvoiceCount: 4,
  },
  {
    monthYear: '2026-02',
    label: 'February 2026',
    expected: 9700,
    paid: 6400,
    unpaid: 2100,
    overdue: 1200,
    invoiceCount: 10,
    paidInvoiceCount: 6,
  },
  {
    monthYear: '2026-03',
    label: 'March 2026',
    expected: 11800,
    paid: 7600,
    unpaid: 2700,
    overdue: 1500,
    invoiceCount: 11,
    paidInvoiceCount: 7,
  },
]

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

export function IncomeTracker({ variant = 'dashboard' }: IncomeTrackerProps) {
  const [selectedMonth, setSelectedMonth] = useState(incomeData[incomeData.length - 1]?.monthYear ?? '')

  const selectedSummary = useMemo(() => {
    return incomeData.find((entry) => entry.monthYear === selectedMonth) ?? incomeData[0]
  }, [selectedMonth])

  const progress = selectedSummary.expected === 0 ? 0 : Math.round((selectedSummary.paid / selectedSummary.expected) * 100)
  const collectionGap = Math.max(selectedSummary.expected - selectedSummary.paid, 0)
  const isPage = variant === 'page'

  return (
    <div className="flex h-full flex-col gap-lg">
      <div className="flex items-start justify-between gap-md">
        <div>
          {isPage && <h1 className="text-2xl font-semibold text-text-base">Income Tracker</h1>}
          <p className="text-sm text-text-muted">
            Review paid, pending, and overdue revenue with a clear monthly snapshot.
          </p>
        </div>

        <div className="rounded-full border border-border-muted bg-background-highlight/40 px-md py-sm text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">
          Placeholder
        </div>
      </div>

      <div className="grid gap-lg lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-lg border border-border-muted bg-background-highlight/30 p-lg shadow-sm">
          <div className="flex items-center justify-between gap-md">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-text-muted">Selected Month</p>
              <h2 className="mt-sm text-lg font-semibold text-text-base">{selectedSummary.label}</h2>
            </div>

            <select
              aria-label="Select month"
              value={selectedMonth}
              onChange={(event) => setSelectedMonth(event.target.value)}
              className="rounded-md border-2 border-border-base bg-background-base px-lg py-md text-sm text-text-base transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-text-brand"
            >
              {incomeData.map((entry) => (
                <option key={entry.monthYear} value={entry.monthYear}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-xl grid gap-md sm:grid-cols-3">
            <div className="rounded-md border border-border-muted bg-background-base p-md">
              <p className="text-xs uppercase tracking-[0.16em] text-text-muted">Expected</p>
              <p className="mt-sm text-2xl font-semibold text-text-base">{formatCurrency(selectedSummary.expected)}</p>
            </div>
            <div className="rounded-md border border-border-muted bg-background-base p-md">
              <p className="text-xs uppercase tracking-[0.16em] text-text-muted">Collected</p>
              <p className="mt-sm text-2xl font-semibold text-feedback-success-text">{formatCurrency(selectedSummary.paid)}</p>
            </div>
            <div className="rounded-md border border-border-muted bg-background-base p-md">
              <p className="text-xs uppercase tracking-[0.16em] text-text-muted">Collection Gap</p>
              <p className="mt-sm text-2xl font-semibold text-feedback-warning-text">{formatCurrency(collectionGap)}</p>
            </div>
          </div>

          <div className="mt-xl rounded-lg border border-border-muted bg-background-base p-lg">
            <div className="flex items-center justify-between gap-md">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-text-muted">Collection Progress</p>
                <p className="mt-sm text-lg font-semibold text-text-base">{progress}% collected</p>
              </div>

              <div className="rounded-full bg-background-highlight px-md py-sm text-xs font-medium text-text-base">
                {selectedSummary.paidInvoiceCount} / {selectedSummary.invoiceCount} invoices paid
              </div>
            </div>

            <div className="mt-lg h-3 overflow-hidden rounded-full bg-background-highlight">
              <div
                className="h-full rounded-full bg-button-primary transition-all duration-300"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>

            <div className="mt-lg grid gap-md sm:grid-cols-3">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-text-muted">Paid</p>
                <p className="mt-sm text-base font-semibold text-feedback-success-text">{formatCurrency(selectedSummary.paid)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-text-muted">Pending</p>
                <p className="mt-sm text-base font-semibold text-text-base">{formatCurrency(selectedSummary.unpaid)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-text-muted">Overdue</p>
                <p className="mt-sm text-base font-semibold text-feedback-error-text">{formatCurrency(selectedSummary.overdue)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-lg">
          <div className="rounded-lg border border-border-muted bg-background-base p-lg shadow-sm">
            <div className="flex items-center gap-sm text-sm font-semibold text-text-base">
              <Chart2Bold className="h-4 w-4" />
              Breakdown
            </div>

            <div className="mt-lg space-y-md">
              {[
                { label: 'Paid', value: selectedSummary.paid, color: 'bg-feedback-success-base' },
                { label: 'Pending', value: selectedSummary.unpaid, color: 'bg-button-secondary' },
                { label: 'Overdue', value: selectedSummary.overdue, color: 'bg-feedback-error-base' },
              ].map((item) => {
                const width = selectedSummary.expected === 0 ? 0 : (item.value / selectedSummary.expected) * 100

                return (
                  <div key={item.label}>
                    <div className="mb-sm flex items-center justify-between gap-md text-sm">
                      <span className="font-medium text-text-base">{item.label}</span>
                      <span className="text-text-muted">{formatCurrency(item.value)}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-background-highlight">
                      <div className={`h-full rounded-full ${item.color}`} style={{ width: `${Math.min(width, 100)}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="rounded-lg border border-border-muted bg-background-base p-lg shadow-sm">
            <div className="flex items-center gap-sm text-sm font-semibold text-text-base">
              <WalletBold className="h-4 w-4" />
              Module Notes
            </div>

            <div className="mt-lg space-y-md text-sm text-text-muted">
              <p>This placeholder models how expected revenue from contracts will compare against paid invoices.</p>
              <p>The next implementation will connect these cards to contract and invoice queries with real monthly filters.</p>
            </div>

            <div className="mt-lg flex flex-wrap gap-md">
              <Button type="button" className="min-w-[160px] justify-center">
                Review Pipeline
              </Button>
              <Button type="button" variant="outline" className="min-w-[160px] justify-center" disabled>
                Charts Next
              </Button>
            </div>
          </div>

          <div className="rounded-lg border border-border-muted bg-background-highlight/30 p-lg shadow-sm">
            <div className="flex items-center gap-sm text-sm font-semibold text-text-base">
              <DollarCircleBold className="h-4 w-4" />
              Momentum Snapshot
            </div>

            <div className="mt-lg flex items-center justify-between gap-md rounded-md border border-border-muted bg-background-base p-md">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-text-muted">Compared to last month</p>
                <p className="mt-sm text-base font-semibold text-text-base">Collections are trending up</p>
              </div>
              <div className="inline-flex items-center gap-xs rounded-full bg-feedback-success-base/10 px-md py-sm text-sm font-semibold text-feedback-success-text">
                <ArrowUp3Bold className="h-4 w-4" />
                +19%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}