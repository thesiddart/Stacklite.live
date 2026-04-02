'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useContractStore, DEFAULT_CLAUSES } from '@/stores/contractStore'
import { useCreateContract, useUpdateContract } from '@/hooks/useContracts'
import { useClients } from '@/hooks/useClients'
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'
import { useSessionStore } from '@/stores/sessionStore'
import { useSavePromptStore } from '@/stores/savePromptStore'
import { generateContractPDF } from '@/lib/pdf/generateContractPDF'
import { ContractForm } from './ContractForm'
import { ContractPreview } from './ContractPreview'

export function ContractEditor() {
  const {
    activeContractId,
    formData,
    isDirty,
    saveStatus,
    setSaveStatus,
  } = useContractStore()

  const createMutation = useCreateContract()
  const updateMutation = useUpdateContract()
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { data: clients = [] } = useClients()
  const { user } = useAuth()
  const { data: profile } = useProfile(Boolean(user))
  const isGuest = useSessionStore((s) => s.isGuest)
  const openWithAction = useSavePromptStore((s) => s.openWithAction)
  const [isPreviewFocused, setIsPreviewFocused] = useState(false)

  const selectedClient = useMemo(
    () => clients.find((client) => client.id === formData.client_id),
    [clients, formData.client_id]
  )

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
          status: formData.status || 'sent',
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

  useEffect(() => {
    if (isDirty) {
      setIsPreviewFocused(false)
    }
  }, [isDirty])

  const handlePreview = () => {
    setIsPreviewFocused(true)
  }

  const handleDownloadPdf = () => {
    const milestones = Array.isArray(formData.milestones)
      ? formData.milestones.map((item) => ({
          label: item.label || 'Milestone',
          date: item.date || 'TBD',
        }))
      : []

    const clauses = formData.clauses && typeof formData.clauses === 'object'
      ? Object.entries(formData.clauses)
          .map(([key, value]) => {
            if (!value || typeof value !== 'object') return null
            const clause = value as { on?: boolean; text?: string }
            if (!clause.on || !clause.text) return null
            return { key, on: true, text: clause.text }
          })
          .filter((entry): entry is { key: string; on: boolean; text: string } => entry !== null)
      : []

    const clientName = selectedClient?.name || 'Client'
    const freelancerName =
      profile?.full_name ||
      user?.user_metadata?.full_name ||
      user?.user_metadata?.name ||
      'Freelancer'
    const freelancerEmail = profile?.email || user?.email || ''

    const action = () => {
      void generateContractPDF({
        freelancerName,
        freelancerEmail,
        clientName,
        clientEmail: selectedClient?.email || undefined,
        projectName: formData.project_name || 'Untitled Project',
        scope: formData.scope || undefined,
        deliverables: (formData.deliverables || []).map((item) => ({ text: item.text || '' })),
        exclusions: formData.exclusions || undefined,
        startDate: formData.start_date || undefined,
        endDate: formData.end_date || undefined,
        milestones,
        totalFee: formData.total_fee ?? undefined,
        currency: (formData.currency || 'USD').toUpperCase(),
        paymentStructure: formData.payment_structure || 'custom',
        paymentMethod: formData.payment_method || undefined,
        clauses,
      })
    }

    if (isGuest) {
      openWithAction(action)
      return
    }

    action()
  }

  const isSaveReadyForPreview = saveStatus === 'saved' && !isDirty
  const isSaving = saveStatus === 'saving'

  return (
    <div className="relative flex h-full flex-col gap-3 overflow-visible">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isPreviewFocused && (
            <button
              type="button"
              onClick={() => setIsPreviewFocused(false)}
              className="rounded-[8px] border border-border-base bg-background-base px-3 py-1.5 text-[12px] font-medium text-text-base transition-colors hover:bg-background-muted"
            >
              ← Back to form
            </button>
          )}
          <h3 className="text-[14px] font-semibold text-text-base">
            {activeContractId ? 'Edit Contract' : 'New Contract'}
          </h3>
          <span
            className={`text-[11px] font-medium transition-opacity duration-300 ${
              saveStatus === 'saving'
                ? 'text-text-muted'
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
          {isSaveReadyForPreview && (
            <button
              type="button"
              onClick={handleDownloadPdf}
              aria-label="Download PDF"
              className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] border border-border-base bg-background-base text-text-base transition-colors hover:bg-background-muted"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 3V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8 10L12 14L16 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M4 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          )}
          <button
            type="button"
            onClick={isSaveReadyForPreview ? handlePreview : () => void handleSave()}
            disabled={isSaving || (!isDirty && saveStatus !== 'idle' && !isSaveReadyForPreview)}
            className="rounded-[8px] bg-[var(--primary)] px-3 py-1.5 text-[12px] font-medium text-white transition-colors hover:opacity-90 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : isSaveReadyForPreview ? 'Preview' : 'Save'}
          </button>
        </div>
      </div>

      {/* Two column layout */}
      {isPreviewFocused ? (
        <div className="min-h-0 flex-1 overflow-hidden rounded-[14px] border border-[var(--surface-panel-border)] bg-[var(--surface-panel-strong)] p-4">
          <ContractPreview />
        </div>
      ) : (
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-hidden lg:grid-cols-2">
          {/* Left: Form */}
          <div className="min-h-0 overflow-hidden rounded-[14px] border border-[var(--surface-panel-border)] bg-[var(--surface-panel-strong)] p-4">
            <ContractForm onSave={handleSave} />
          </div>

          {/* Right: Preview */}
          <div className="hidden min-h-0 overflow-hidden lg:block">
            <ContractPreview />
          </div>
        </div>
      )}
    </div>
  )
}
