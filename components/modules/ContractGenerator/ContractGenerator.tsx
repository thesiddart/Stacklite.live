'use client'

import React, { useEffect } from 'react'
import { useContractStore } from '@/stores/contractStore'
import { useContracts } from '@/hooks/useContracts'
import { TemplatePicker } from './TemplatePicker'
import { ContractEditor } from './ContractEditor'
import { ContractsList } from './ContractsList'
import type { TemplateType } from '@/lib/validations/contract'

interface ContractGeneratorProps {
  variant?: 'dashboard' | 'page'
}

export function ContractGenerator({ variant = 'dashboard' }: ContractGeneratorProps) {
  const { view, setView, loadTemplateDefaults } = useContractStore()
  const { data: contracts = [] } = useContracts()

  // On mount: show list if contracts exist, otherwise templates
  useEffect(() => {
    if (contracts.length > 0 && view === 'templates') {
      setView('list')
    }
    // Only run on initial load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleTemplateSelect = (type: TemplateType) => {
    loadTemplateDefaults(type)
    // view is set to 'editor' inside loadTemplateDefaults
  }


  const isPage = variant === 'page'

  return (
    <div
      className={`flex flex-col ${
        isPage ? 'h-[calc(100vh-200px)] min-h-[600px]' : 'h-full'
      }`}
    >
      {isPage && (
        <div className="mb-4">
          <h1 className="text-2xl font-semibold text-text-base">Contract Generator</h1>
          <p className="mt-1 text-sm text-text-muted">
            Draft agreements with the right client, scope, timeline, and pricing.
          </p>
        </div>
      )}

      <div className="min-h-0 flex-1">
        {view === 'templates' && (
          <div className="flex h-full flex-col">
            <TemplatePicker onSelect={handleTemplateSelect} />
            {contracts.length > 0 && (
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => setView('list')}
                  className="text-[12px] font-medium text-[var(--tertiary)] hover:text-[var(--primary)]"
                >
                  ← Back to contracts list
                </button>
              </div>
            )}
          </div>
        )}

        {view === 'list' && <ContractsList />}

        {view === 'editor' && <ContractEditor />}
      </div>
    </div>
  )
}