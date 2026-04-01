'use client'

import React from 'react'
import { useInvoiceStore } from '@/stores/invoiceStore'
import { ClientProjectSection } from './sections/ClientProjectSection'
import { LineItemsSection } from './sections/LineItemsSection'
import { PaymentDetailsSection } from './sections/PaymentDetailsSection'
import { NotesSection } from './sections/NotesSection'

const STEPS = [
  { label: 'Client & Project', number: '①' },
  { label: 'Line Items', number: '②' },
  { label: 'Payment', number: '③' },
  { label: 'Notes', number: '④' },
]

export function InvoiceForm() {
  const { currentStep, setCurrentStep, nextStep, prevStep } = useInvoiceStore()

  const renderActiveSection = () => {
    switch (currentStep) {
      case 0:
        return <ClientProjectSection />
      case 1:
        return <LineItemsSection />
      case 2:
        return <PaymentDetailsSection />
      case 3:
        return <NotesSection />
      default:
        return <ClientProjectSection />
    }
  }

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Step indicator */}
      <div className="flex items-center gap-1 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {STEPS.map((step, index) => (
          <button
            key={step.label}
            type="button"
            onClick={() => setCurrentStep(index)}
            className={`flex shrink-0 items-center gap-1 rounded-[8px] px-2.5 py-1 text-[12px] font-medium whitespace-nowrap transition-all duration-200 ${
              index === currentStep
                ? 'bg-[var(--primary)] text-white'
                : index < currentStep
                  ? 'bg-[var(--surface-chip)] text-[var(--tertiary)]'
                  : 'text-[var(--text-soft-muted)] hover:text-[var(--text-soft-strong)]'
            }`}
          >
            <span>{step.number}</span>
            <span>{step.label}</span>
          </button>
        ))}
      </div>

      {/* Active section */}
      <div className="min-h-0 flex-1 overflow-y-auto pr-1 theme-scrollbar">
        {renderActiveSection()}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between border-t border-[var(--surface-divider)] pt-3">
        <button
          type="button"
          onClick={prevStep}
          disabled={currentStep === 0}
          className="rounded-[8px] px-3 py-1.5 text-[13px] font-medium text-[var(--tertiary)] transition-colors hover:bg-[var(--surface-chip)] disabled:opacity-40 disabled:hover:bg-transparent"
        >
          ← Back
        </button>

        <span className="text-[12px] text-[var(--text-soft-muted)]">
          {currentStep + 1} of {STEPS.length}
        </span>

        <button
          type="button"
          onClick={nextStep}
          disabled={currentStep === 3}
          className="rounded-[8px] bg-[var(--primary)] px-3 py-1.5 text-[13px] font-medium text-white transition-colors hover:opacity-90 disabled:opacity-40"
        >
          Next →
        </button>
      </div>
    </div>
  )
}
