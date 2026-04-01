'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useInvoiceStore } from '@/stores/invoiceStore'
import { convertCurrency, formatNPR } from '@/lib/api/frankfurter'

function formatCurrency(value: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
    maximumFractionDigits: 2,
  }).format(value)
}

export function PaymentDetailsSection() {
  const { formData, updateFormData } = useInvoiceStore()
  const [nprAmount, setNprAmount] = useState<string | null>(null)
  const [isConverting, setIsConverting] = useState(false)
  const [showTax, setShowTax] = useState(Boolean(formData.tax_rate))
  const [showDiscount, setShowDiscount] = useState(Boolean(formData.discount_value))
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const currency = formData.currency || 'USD'

  const fetchConversion = useCallback(async (amount: number, fromCurrency: string) => {
    setIsConverting(true)
    const result = await convertCurrency(amount, fromCurrency, 'NPR')
    setNprAmount(result !== null ? formatNPR(result) : null)
    setIsConverting(false)
  }, [])

  // Debounced NPR conversion
  useEffect(() => {
    const total = formData.total

    if (timerRef.current) clearTimeout(timerRef.current)

    if (!total || total <= 0 || currency === 'NPR') {
      timerRef.current = setTimeout(() => {
        setNprAmount(null)
        setIsConverting(false)
      }, 0)
      return () => { if (timerRef.current) clearTimeout(timerRef.current) }
    }

    timerRef.current = setTimeout(() => {
      fetchConversion(total, currency)
    }, 500)

    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [formData.total, currency, fetchConversion])

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-[14px] font-semibold text-[var(--text-soft-strong)]">
          Payment Details
        </h3>
        <p className="mt-0.5 text-[12px] text-[var(--text-soft-muted)]">
          Currency, tax, discount, and payment instructions.
        </p>
      </div>

      {/* Currency */}
      <div>
        <label className="mb-1 block text-[12px] font-medium text-[var(--text-soft-strong)]">
          Currency
        </label>
        <input
          type="text"
          value={currency}
          onChange={(e) => updateFormData({ currency: e.target.value.toUpperCase().slice(0, 3) })}
          maxLength={3}
          className="theme-shell-field h-8 w-24 rounded-[6px] px-3 text-center text-[13px] uppercase focus-visible:border-[var(--primary)] focus-visible:outline-none"
        />
      </div>

      {/* Tax toggle */}
      <div>
        <button
          type="button"
          onClick={() => {
            if (showTax) {
              updateFormData({ tax_rate: null })
            }
            setShowTax(!showTax)
          }}
          className="text-[12px] font-medium text-[var(--tertiary)] hover:text-[var(--primary)]"
        >
          {showTax ? '− Remove tax' : '+ Add tax'}
        </button>
        {showTax && (
          <div className="mt-2">
            <label className="mb-1 block text-[12px] font-medium text-[var(--text-soft-strong)]">
              Tax Rate (%)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.tax_rate ?? ''}
              onChange={(e) =>
                updateFormData({ tax_rate: e.target.value === '' ? null : Number(e.target.value) })
              }
              placeholder="13"
              className="theme-shell-field h-8 w-32 rounded-[6px] px-3 text-[13px] focus-visible:border-[var(--primary)] focus-visible:outline-none"
            />
          </div>
        )}
      </div>

      {/* Discount toggle */}
      <div>
        <button
          type="button"
          onClick={() => {
            if (showDiscount) {
              updateFormData({ discount_type: null, discount_value: null })
            }
            setShowDiscount(!showDiscount)
          }}
          className="text-[12px] font-medium text-[var(--tertiary)] hover:text-[var(--primary)]"
        >
          {showDiscount ? '− Remove discount' : '+ Add discount'}
        </button>
        {showDiscount && (
          <div className="mt-2 flex items-end gap-3">
            <div>
              <label className="mb-1 block text-[12px] font-medium text-[var(--text-soft-strong)]">
                Type
              </label>
              <select
                value={formData.discount_type || 'flat'}
                onChange={(e) => updateFormData({ discount_type: e.target.value as 'flat' | 'percent' })}
                className="theme-shell-field h-8 rounded-[6px] px-3 text-[13px] focus-visible:border-[var(--primary)] focus-visible:outline-none"
              >
                <option value="flat">Flat</option>
                <option value="percent">Percent</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-medium text-[var(--text-soft-strong)]">
                Value
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.discount_value ?? ''}
                onChange={(e) =>
                  updateFormData({ discount_value: e.target.value === '' ? null : Number(e.target.value) })
                }
                placeholder="0"
                className="theme-shell-field h-8 w-32 rounded-[6px] px-3 text-[13px] focus-visible:border-[var(--primary)] focus-visible:outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Total */}
      <div className="rounded-[10px] border border-[var(--surface-panel-border)] bg-[var(--surface-chip)] p-3">
        <div className="flex items-center justify-between text-[16px] font-bold text-[var(--text-soft-strong)]">
          <span>Total</span>
          <span>{formatCurrency(formData.total || 0, currency)}</span>
        </div>
        {nprAmount && (
          <p className="mt-1 text-right text-[11px] text-feedback-success-text/85">
            ≈ NPR {nprAmount} at today&apos;s rate
          </p>
        )}
        {isConverting && (
          <p className="mt-1 text-right text-[11px] text-[var(--text-soft-subtle)]">
            Converting...
          </p>
        )}
      </div>

      {/* Payment method + instructions */}
      <div>
        <label className="mb-1 block text-[12px] font-medium text-[var(--text-soft-strong)]">
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

      <div>
        <label className="mb-1 block text-[12px] font-medium text-[var(--text-soft-strong)]">
          Payment Instructions
        </label>
        <textarea
          value={formData.payment_instructions || ''}
          onChange={(e) => updateFormData({ payment_instructions: e.target.value })}
          placeholder="Bank details, account number, routing info..."
          rows={3}
          className="theme-shell-field w-full rounded-[6px] px-3 py-2 text-[13px] focus-visible:border-[var(--primary)] focus-visible:outline-none"
        />
      </div>
    </div>
  )
}
