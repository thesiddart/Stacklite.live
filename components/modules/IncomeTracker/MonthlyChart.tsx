'use client'

import React from 'react'
import type { IncomeMonthlyData } from '@/hooks/useIncomeData'

interface MonthlyChartProps {
  data: IncomeMonthlyData[]
  currency: string
}

function formatCurrency(value: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value)
}

export function MonthlyChart({ data, currency }: MonthlyChartProps) {
  const maxValue = Math.max(...data.map((entry) => entry.earned), 0)
  const currentMonth = new Date().toLocaleString('en-US', { month: 'short' })

  return (
    <section className="rounded-[10px] border border-[var(--surface-panel-border)] bg-[var(--surface-card)] p-4">
      <h3 className="text-[13px] font-semibold text-text-base">Monthly Overview</h3>

      {data.filter((entry) => entry.earned > 0).length < 2 ? (
        <p className="mt-3 text-[12px] text-text-muted">
          Your monthly overview will appear once you have paid invoices.
        </p>
      ) : (
        <div className="mt-4 grid h-44 grid-cols-6 items-end gap-3">
          {data.map((entry) => {
            const ratio = maxValue > 0 ? entry.earned / maxValue : 0
            const height = Math.max(8, Math.round(120 * ratio))
            const isCurrentMonth = entry.month === currentMonth

            return (
              <div key={`${entry.month}-${entry.year}`} className="flex flex-col items-center gap-2">
                <div className="h-32 w-full max-w-8 rounded-[6px] bg-[var(--surface-chip)] p-1">
                  <div
                    title={`${entry.month} ${entry.year}: ${formatCurrency(entry.earned, currency)}`}
                    className={`w-full rounded-[4px] ${isCurrentMonth ? 'bg-[var(--link-hover)]' : 'bg-button-primary'}`}
                    style={{ height: `${height}px`, marginTop: `${124 - height}px` }}
                  />
                </div>
                <span className="text-[11px] text-text-muted">{entry.month}</span>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
