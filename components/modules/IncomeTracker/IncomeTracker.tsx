'use client'

import React, { useState } from 'react'
import { AddCircleBold, Chart2Bold } from 'sicons'
import { Select } from '@/components/ui/Select'
import { useIncomeData, type IncomeFilter } from '@/hooks/useIncomeData'
import { StatCards } from './StatCards'
import { MonthlyChart } from './MonthlyChart'
import { RecentInvoicesList } from './RecentInvoicesList'
import { NprEquivalent } from './NprEquivalent'

interface IncomeTrackerProps {
  variant?: 'dashboard' | 'page'
  onOpenInvoice?: (id: string) => void
  onOpenInvoiceGenerator?: () => void
}
const FILTER_OPTIONS: Array<{ value: IncomeFilter; label: string }> = [
  { value: 'this-month', label: 'This Month' },
  { value: 'last-3-months', label: 'Last 3 Months' },
  { value: 'last-6-months', label: 'Last 6 Months' },
  { value: 'this-year', label: 'This Year' },
  { value: 'all-time', label: 'All Time' },
]

export function IncomeTracker({
  variant = 'dashboard',
  onOpenInvoice,
  onOpenInvoiceGenerator,
}: IncomeTrackerProps) {
  const [filter, setFilter] = useState<IncomeFilter>('this-month')
  const data = useIncomeData(filter)
  const isPage = variant === 'page'

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-start justify-between gap-md">
        <div>
          {isPage && <h1 className="text-2xl font-semibold text-text-base">Income Tracker</h1>}
          <p className="text-sm text-text-muted">
            Read-only financial overview based on invoice activity.
          </p>
        </div>

        <Select
          aria-label="Income filter"
          value={filter}
          onChange={(event) => setFilter(event.target.value as IncomeFilter)}
          containerClassName="w-[188px]"
          className="h-8 rounded-[8px] pl-4 pr-10 text-[12px] font-medium text-text-base"
        >
          {FILTER_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>

      {!data.hasInvoices ? (
        <section className="flex h-full min-h-[320px] flex-col items-center justify-center rounded-[10px] border border-[var(--surface-panel-border)] bg-[var(--surface-card)] p-6 text-center">
          <Chart2Bold size={28} className="text-[var(--tertiary)]" />
          <p className="mt-3 text-[14px] font-medium text-text-base">No income data yet.</p>
          <p className="mt-1 max-w-[360px] text-[12px] text-text-muted">
            Create and mark invoices as paid to see your earnings here.
          </p>
          <button
            type="button"
            onClick={() => onOpenInvoiceGenerator?.()}
            className="mt-4 inline-flex h-8 items-center justify-center gap-1 rounded-[8px] bg-[var(--primary)] px-3 py-1.5 text-[12px] font-medium text-white transition-colors hover:opacity-90"
          >
            <AddCircleBold size={14} />
            Create New
          </button>
        </section>
      ) : (
        <div className="space-y-3">
          <StatCards
            totalEarned={data.totalEarned}
            totalOutstanding={data.totalOutstanding}
            overdueAmount={data.overdueAmount}
            selectedPeriodEarned={data.selectedPeriodEarned}
            selectedPeriodLabel={data.selectedPeriodLabel}
            currency={data.currency}
          />
          <MonthlyChart data={data.monthlyData} currency={data.currency} />
          <RecentInvoicesList
            invoices={data.recentInvoices}
            onOpenInvoice={(id) => onOpenInvoice?.(id)}
            onViewAllInvoices={() => onOpenInvoiceGenerator?.()}
          />
          <NprEquivalent amount={data.totalEarned} currency={data.currency} />
        </div>
      )}
    </div>
  )
}