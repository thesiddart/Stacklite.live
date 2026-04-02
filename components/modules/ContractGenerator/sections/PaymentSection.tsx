'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useContractStore } from '@/stores/contractStore'
import { convertCurrency, formatNPR } from '@/lib/api/frankfurter'
import type { PaymentStructure } from '@/lib/validations/contract'

const PAYMENT_STRUCTURES: { value: PaymentStructure; label: string; description: string }[] = [
  { value: 'full', label: 'Full Upfront', description: '100% before work begins' },
  { value: 'split', label: '50 / 50', description: '50% upfront, 50% on completion' },
  { value: 'milestone', label: 'Milestone-based', description: 'Payment tied to milestones' },
  { value: 'custom', label: 'Custom', description: 'Define your own terms' },
]

export function PaymentSection() {
  const { formData, updateFormData } = useContractStore()
  const [nprAmount, setNprAmount] = useState<string | null>(null)
  const [isConverting, setIsConverting] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchConversion = useCallback(async (fee: number, currency: string) => {
    setIsConverting(true)
    const result = await convertCurrency(fee, currency, 'NPR')
    setNprAmount(result !== null ? formatNPR(result) : null)
    setIsConverting(false)
  }, [])

  // Debounced Frankfurter NPR conversion
  useEffect(() => {
    const fee = formData.total_fee
    const currency = formData.currency || 'USD'

    if (timerRef.current) clearTimeout(timerRef.current)

    if (!fee || fee <= 0 || currency === 'NPR') {
      // Reset asynchronously via microtask to satisfy lint
      timerRef.current = setTimeout(() => {
        setNprAmount(null)
        setIsConverting(false)
      }, 0)
      return () => { if (timerRef.current) clearTimeout(timerRef.current) }
    }

    timerRef.current = setTimeout(() => {
      fetchConversion(fee, currency)
    }, 500)

    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [formData.total_fee, formData.currency, fetchConversion])

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-[14px] font-semibold text-text-base">
          Payment
        </h3>
        <p className="mt-0.5 text-[12px] text-text-muted">
          Set up the pricing, payment schedule, and terms.
        </p>
      </div>

      {/* Fee + Currency */}
      <div className="grid grid-cols-[1fr_100px] gap-3">
        <div>
          <label className="mb-1 block text-[12px] font-medium text-text-base">
            Total Fee
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={formData.total_fee ?? ''}
            onChange={(e) =>
              updateFormData({
                total_fee: e.target.value === '' ? null : Number(e.target.value),
              })
            }
            placeholder="0.00"
            className="theme-shell-field h-8 w-full rounded-[6px] px-3 text-[13px] focus-visible:border-[var(--primary)] focus-visible:outline-none"
          />
          {/* NPR conversion hint */}
          {nprAmount && (
            <p className="mt-1 text-[11px] text-feedback-success-text/85">
              ≈ NPR {nprAmount} at today&apos;s rate
            </p>
          )}
          {isConverting && (
            <p className="mt-1 text-[11px] text-text-muted">
              Converting...
            </p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-[12px] font-medium text-text-base">
            Currency
          </label>
          <input
            type="text"
            value={formData.currency || 'USD'}
            onChange={(e) =>
              updateFormData({ currency: e.target.value.toUpperCase().slice(0, 3) })
            }
            maxLength={3}
            className="theme-shell-field h-8 w-full rounded-[6px] px-3 text-[13px] text-center uppercase focus-visible:border-[var(--primary)] focus-visible:outline-none"
          />
        </div>
      </div>

      {/* Payment structure */}
      <div>
        <label className="mb-2 block text-[12px] font-medium text-text-base">
          Payment Structure
        </label>
        <div className="grid grid-cols-2 gap-2">
          {PAYMENT_STRUCTURES.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => updateFormData({ payment_structure: option.value })}
              className={`rounded-[10px] border p-3 text-left transition-all duration-200 ${
                formData.payment_structure === option.value
                  ? 'border-[var(--primary)] bg-[var(--surface-chip)]'
                  : 'border-[var(--surface-panel-border)] bg-[var(--surface-card)] hover:border-[var(--primary)]'
              }`}
            >
              <p className="text-[13px] font-medium text-text-base">
                {option.label}
              </p>
              <p className="mt-0.5 text-[11px] text-text-muted">
                {option.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Payment method */}
      <div>
        <label className="mb-1 block text-[12px] font-medium text-text-base">
          Payment Method
        </label>
        <input
          type="text"
          value={formData.payment_method || ''}
          onChange={(e) => updateFormData({ payment_method: e.target.value })}
          placeholder="e.g. Bank transfer, Wise, PayPal"
          className="theme-shell-field h-8 w-full rounded-[6px] px-3 text-[13px] focus-visible:border-[var(--primary)] focus-visible:outline-none"
        />
      </div>
    </div>
  )
}
