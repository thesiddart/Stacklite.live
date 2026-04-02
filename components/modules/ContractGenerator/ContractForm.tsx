'use client'

import React from 'react'
import { useContractStore } from '@/stores/contractStore'
import { PartiesSection } from './sections/PartiesSection'
import { ProjectSection } from './sections/ProjectSection'
import { TimelineSection } from './sections/TimelineSection'
import { PaymentSection } from './sections/PaymentSection'
import { TermsSection } from './sections/TermsSection'

const STEPS = [
  { label: 'Parties', number: '①' },
  { label: 'Project', number: '②' },
  { label: 'Timeline', number: '③' },
  { label: 'Payment', number: '④' },
  { label: 'Terms', number: '⑤' },
]

interface ContractFormProps {
  onSave: () => void
}

export function ContractForm({ onSave }: ContractFormProps) {
  const { currentStep, setCurrentStep, nextStep, prevStep } = useContractStore()

  const renderActiveSection = () => {
    switch (currentStep) {
      case 0:
        return <PartiesSection />
      case 1:
        return <ProjectSection />
      case 2:
        return <TimelineSection />
      case 3:
        return <PaymentSection />
      case 4:
        return <TermsSection />
      default:
        return <PartiesSection />
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
                  : 'text-text-muted hover:text-text-base'
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

        <span className="text-[12px] text-text-muted">
          {currentStep + 1} of {STEPS.length}
        </span>

        <button
          type="button"
          onClick={currentStep === 4 ? onSave : nextStep}
          className="rounded-[8px] bg-[var(--primary)] px-3 py-1.5 text-[13px] font-medium text-white transition-colors hover:opacity-90"
        >
          {currentStep === 4 ? 'Save' : 'Next →'}
        </button>
      </div>
    </div>
  )
}
