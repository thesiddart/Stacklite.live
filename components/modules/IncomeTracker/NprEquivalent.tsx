'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { formatNPR, getMonthlyAverageRate } from '@/lib/api/frankfurter'

interface NprEquivalentProps {
  amount: number
  currency: string
}

function formatCurrency(value: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value)
}

export function NprEquivalent({ amount, currency }: NprEquivalentProps) {
  const [nprValue, setNprValue] = useState<number | null>(null)

  const monthLabel = useMemo(
    () => new Date().toLocaleString('en-US', { month: 'short', year: 'numeric' }),
    []
  )

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      if (amount <= 0 || currency === 'NPR') {
        setNprValue(null)
        return
      }

      const currentDate = new Date()
      const avgRate = await getMonthlyAverageRate(
        currency,
        'NPR',
        currentDate.getFullYear(),
        currentDate.getMonth() + 1
      )

      if (cancelled) return

      if (avgRate === null) {
        setNprValue(null)
        return
      }

      setNprValue(Math.round(amount * avgRate))
    }

    void run()

    return () => {
      cancelled = true
    }
  }, [amount, currency])

  if (nprValue === null) return null

  return (
    <section className="rounded-[10px] border border-[var(--surface-panel-border)] bg-[var(--surface-card)] p-4">
      <h3 className="text-[13px] font-semibold text-text-base">NPR Equivalent</h3>
      <p className="mt-2 text-[12px] text-text-muted">
        {`${formatCurrency(amount, currency)} ${currency} ≈ NPR ${formatNPR(nprValue)} at average rate (${monthLabel})`}
      </p>
    </section>
  )
}
