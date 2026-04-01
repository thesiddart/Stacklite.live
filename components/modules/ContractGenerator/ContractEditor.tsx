'use client'

import React, { useCallback, useEffect, useRef } from 'react'
import { CloseCircleBold } from 'sicons'
import { useContractStore, DEFAULT_CLAUSES } from '@/stores/contractStore'
import { useCreateContract, useUpdateContract } from '@/hooks/useContracts'
import { ContractForm } from './ContractForm'
import { ContractPreview } from './ContractPreview'

export function ContractEditor() {
  const {
    activeContractId,
    formData,
    isDirty,
    saveStatus,
    setView,
    resetForm,
    setSaveStatus,
  } = useContractStore()

  const createMutation = useCreateContract()
  const updateMutation = useUpdateContract()
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleSave = useCallback(async () => {
    if (!isDirty && saveStatus !== 'idle') return

    setSaveStatus('saving')

    try {
      if (activeContractId) {
        await updateMutation.mutateAsync({
          id: activeContractId,
          data: formData,
        })
      } else {
        const created = await createMutation.mutateAsync({
          client_id: formData.client_id || null,
          template_type: formData.template_type || null,
          project_name: formData.project_name || null,
          scope: formData.scope || null,
          deliverables: formData.deliverables || [],
          exclusions: formData.exclusions || null,
          start_date: formData.start_date || null,
          end_date: formData.end_date || null,
          milestones: formData.milestones || [],
          total_fee: formData.total_fee || null,
          currency: formData.currency || 'USD',
          payment_structure: formData.payment_structure || null,
          payment_method: formData.payment_method || null,
          clauses: formData.clauses || DEFAULT_CLAUSES,
          status: formData.status || 'draft',
        })
        useContractStore.getState().setActiveContract(created.id)
      }
      setSaveStatus('saved')
      useContractStore.setState({ isDirty: false })
    } catch {
      setSaveStatus('error')
    }
  }, [activeContractId, createMutation, formData, isDirty, saveStatus, setSaveStatus, updateMutation])

  // Auto-save every 30 seconds when dirty
  useEffect(() => {
    if (!isDirty) return

    autoSaveTimerRef.current = setTimeout(() => {
      handleSave()
    }, 30_000)

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }
    }
  }, [isDirty, formData, handleSave])

  const handleClose = () => {
    if (isDirty) {
      handleSave()
    }
    resetForm()
    setView('list')
  }

  return (
    <div className="flex h-full flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-[14px] font-semibold text-[var(--text-soft-strong)]">
            {activeContractId ? 'Edit Contract' : 'New Contract'}
          </h3>
          <span
            className={`text-[11px] font-medium transition-opacity duration-300 ${
              saveStatus === 'saving'
                ? 'text-[var(--text-soft-muted)]'
                : saveStatus === 'saved'
                  ? 'text-[var(--feedback-success-text)]'
                  : saveStatus === 'error'
                    ? 'text-[var(--feedback-error-text)]'
                    : 'opacity-0'
            }`}
          >
            {saveStatus === 'saving'
              ? 'Saving...'
              : saveStatus === 'saved'
                ? 'Saved'
                : saveStatus === 'error'
                  ? 'Error saving'
                  : ''}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={!isDirty && saveStatus !== 'idle'}
            className="rounded-[8px] bg-[var(--primary)] px-3 py-1.5 text-[12px] font-medium text-white transition-colors hover:opacity-90 disabled:opacity-50"
          >
            Save Draft
          </button>
          <button
            type="button"
            onClick={handleClose}
            className="text-[var(--text-soft-muted)] hover:text-[var(--text-soft-strong)]"
            aria-label="Close editor"
          >
            <CloseCircleBold size={20} />
          </button>
        </div>
      </div>

      {/* Two column layout */}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-hidden lg:grid-cols-2">
        {/* Left: Form */}
        <div className="min-h-0 overflow-hidden rounded-[14px] border border-[var(--surface-panel-border)] bg-[var(--surface-panel-strong)] p-4">
          <ContractForm />
        </div>

        {/* Right: Preview */}
        <div className="hidden min-h-0 overflow-hidden lg:block">
          <ContractPreview />
        </div>
      </div>
    </div>
  )
}
