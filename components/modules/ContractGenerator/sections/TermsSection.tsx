'use client'

import React from 'react'
import { EditBold } from 'sicons'
import { useContractStore, DEFAULT_CLAUSES } from '@/stores/contractStore'
import type { ContractClauses } from '@/lib/validations/contract'

const CLAUSE_CONFIG: {
  key: keyof ContractClauses
  label: string
  description: string
}[] = [
  {
    key: 'revision',
    label: 'Revision Policy',
    description: 'Define how many revision rounds are included.',
  },
  {
    key: 'ip',
    label: 'IP / Ownership Transfer',
    description: 'When and how ownership transfers to the client.',
  },
  {
    key: 'termination',
    label: 'Termination',
    description: 'How either party can end the agreement.',
  },
  {
    key: 'confidentiality',
    label: 'Confidentiality / NDA',
    description: 'Protect proprietary information shared during the project.',
  },
  {
    key: 'governingLaw',
    label: 'Governing Law',
    description: 'Which jurisdiction governs this agreement.',
  },
]

export function TermsSection() {
  const { formData, updateFormData } = useContractStore()
  const clauses = formData.clauses || DEFAULT_CLAUSES

  const updateClause = (key: keyof ContractClauses, field: 'on' | 'text', value: boolean | string) => {
    const updated = {
      ...clauses,
      [key]: {
        ...clauses[key],
        [field]: value,
      },
    }
    updateFormData({ clauses: updated })
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-[14px] font-semibold text-[var(--text-soft-strong)]">
          Terms & Clauses
        </h3>
        <p className="mt-0.5 text-[12px] text-[var(--text-soft-muted)]">
          Toggle clauses on or off, and edit their text inline.
        </p>
      </div>

      <div className="space-y-3">
        {CLAUSE_CONFIG.map((config) => {
          const clause = clauses[config.key]
          const isOn = clause?.on ?? false
          const text = clause?.text ?? ''

          return (
            <div
              key={config.key}
              className={`rounded-[10px] border p-3 transition-all duration-200 ${
                isOn
                  ? 'border-[var(--primary)] bg-[var(--surface-panel-strong)]'
                  : 'border-[var(--surface-panel-border)] bg-[var(--surface-card)] opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateClause(config.key, 'on', !isOn)}
                      className={`relative h-5 w-9 rounded-full transition-colors duration-200 ${
                        isOn ? 'bg-[var(--primary)]' : 'bg-[var(--surface-divider)]'
                      }`}
                      aria-label={`Toggle ${config.label}`}
                    >
                      <span
                        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${
                          isOn ? 'translate-x-4' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                    <p className="text-[13px] font-semibold text-[var(--text-soft-strong)]">
                      {config.label}
                    </p>
                  </div>
                  <p className="mt-0.5 pl-11 text-[11px] text-[var(--text-soft-muted)]">
                    {config.description}
                  </p>
                </div>
              </div>

              {isOn && (
                <div className="mt-2 pl-11">
                  <div className="relative">
                    <textarea
                      value={text}
                      onChange={(e) => updateClause(config.key, 'text', e.target.value)}
                      rows={3}
                      className="theme-shell-field w-full rounded-[6px] px-3 py-2 pr-8 text-[12px] leading-[18px] focus-visible:border-[var(--primary)] focus-visible:outline-none"
                      placeholder={`Enter ${config.label.toLowerCase()} clause text...`}
                    />
                    <EditBold
                      size={12}
                      className="pointer-events-none absolute right-2 top-2 text-[var(--text-soft-muted)]"
                    />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
