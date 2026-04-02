'use client'

import React, { useState } from 'react'
import {
  DocumentText1Bold,
  EditBold,
  LinkBold,
  TrashBold,
  AddCircleBold,
  TickCircleBold,
} from 'sicons'
import {
  useContracts,
  useDeleteContract,
  useGenerateShareLink,
  useUpdateContract,
} from '@/hooks/useContracts'
import { useClients } from '@/hooks/useClients'
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'
import { useContractStore } from '@/stores/contractStore'
import { useSessionStore } from '@/stores/sessionStore'
import { useSavePromptStore } from '@/stores/savePromptStore'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { generateContractPDF } from '@/lib/pdf/generateContractPDF'
import type { Contract } from '@/lib/types/database'

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  sent: {
    bg: 'bg-background-highlight',
    text: 'text-text-muted',
    label: 'Not Signed',
  },
  signed: {
    bg: 'bg-feedback-success-bg',
    text: 'text-feedback-success-text',
    label: 'Signed',
  },
  archived: {
    bg: 'bg-background-disabled',
    text: 'text-text-disabled',
    label: 'Archived',
  },
}

function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.sent
  return (
    <span
      className={`inline-flex items-center rounded-[4px] px-2 py-0.5 text-[11px] font-semibold ${style.bg} ${style.text}`}
    >
      {style.label}
    </span>
  )
}

export function ContractsList() {
  const isGuest = useSessionStore((s) => s.isGuest)
  const openWithAction = useSavePromptStore((s) => s.openWithAction)
  const { data: contracts = [], isLoading } = useContracts()
  const { data: clients = [] } = useClients()
  const { user } = useAuth()
  const { data: profile } = useProfile(Boolean(user))
  const deleteMutation = useDeleteContract()
  const updateMutation = useUpdateContract()
  const shareMutation = useGenerateShareLink()
  const { setView, setActiveContract, updateFormData, resetForm } =
    useContractStore()
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [copyErrorId, setCopyErrorId] = useState<string | null>(null)
  const [previewContract, setPreviewContract] = useState<Contract | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const getClientName = (clientId: string | null) => {
    if (!clientId) return null
    return clients.find((c) => c.id === clientId)?.name || null
  }

  const handleEdit = (contract: Contract) => {
    resetForm()
    setActiveContract(contract.id)

    // Load contract data into the store
    updateFormData({
      client_id: contract.client_id,
      template_type: (contract.template_type as 'general' | 'design' | 'development' | 'retainer' | 'blank') || null,
      project_name: contract.project_name,
      scope: contract.scope,
      deliverables: Array.isArray(contract.deliverables)
        ? (contract.deliverables as { text: string }[])
        : [],
      exclusions: contract.exclusions,
      start_date: contract.start_date,
      end_date: contract.end_date,
      milestones: Array.isArray(contract.milestones)
        ? (contract.milestones as { label: string; date: string }[])
        : [],
      total_fee: contract.total_fee,
      currency: contract.currency,
      payment_structure: (contract.payment_structure as 'full' | 'split' | 'milestone' | 'custom') || null,
      payment_method: contract.payment_method,
      clauses: contract.clauses as ContractClausesType || undefined,
      status: (contract.status as 'sent' | 'signed' | 'archived') || 'sent',
    })

    setView('editor')
  }

  const handleCopyLink = async (contract: Contract) => {
    if (isGuest) {
      openWithAction(() => {
        // Share links require migration to an authenticated account.
      })
      return
    }

    try {
      const url = await shareMutation.mutateAsync(contract.id)

      if (!url || /\/(null|undefined)$/.test(url)) {
        throw new Error('Invalid share URL')
      }

      await navigator.clipboard.writeText(url)
      setCopiedId(contract.id)
      setCopyErrorId(null)
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      setCopyErrorId(contract.id)
      setCopiedId(null)
      setTimeout(() => setCopyErrorId(null), 2500)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      setActionError(null)
      await deleteMutation.mutateAsync(id)
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Failed to delete contract')
    }
  }

  const handleMarkSigned = async (id: string) => {
    try {
      setActionError(null)
      await updateMutation.mutateAsync({ id, data: { status: 'signed' } })
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Failed to update contract status')
    }
  }

  const downloadContractAsPdf = (contract: Contract) => {
    const clientName = getClientName(contract.client_id) || 'Client'

    const deliverables = Array.isArray(contract.deliverables)
      ? (contract.deliverables as Array<{ text?: string }>)
          .map((item) => ({ text: item.text || '' }))
          .filter((item) => item.text !== '')
      : []

    const milestones = Array.isArray(contract.milestones)
      ? (contract.milestones as Array<{ label?: string; date?: string }>)
          .map((item) => ({ label: item.label || 'Milestone', date: item.date || 'TBD' }))
      : []

    const clauses = contract.clauses && typeof contract.clauses === 'object'
      ? Object.entries(contract.clauses as Record<string, unknown>)
          .map(([key, value]) => {
            if (!value || typeof value !== 'object') return null
            const clause = value as { on?: unknown; text?: unknown }
            if (!clause.on || typeof clause.text !== 'string' || clause.text.trim() === '') {
              return null
            }
            return { key, on: true, text: clause.text }
          })
          .filter((entry): entry is { key: string; on: boolean; text: string } => entry !== null)
      : []

    const freelancerName =
      profile?.full_name ||
      user?.user_metadata?.full_name ||
      user?.user_metadata?.name ||
      'Freelancer'
    const freelancerEmail = profile?.email || user?.email || ''

    void generateContractPDF({
      freelancerName,
      freelancerEmail,
      clientName,
      clientEmail: clients.find((c) => c.id === contract.client_id)?.email || undefined,
      projectName: contract.project_name || 'Untitled Project',
      scope: contract.scope || undefined,
      deliverables,
      exclusions: contract.exclusions || undefined,
      startDate: contract.start_date || undefined,
      endDate: contract.end_date || undefined,
      milestones,
      totalFee: contract.total_fee ?? undefined,
      currency: (contract.currency || 'USD').toUpperCase(),
      paymentStructure: (contract.payment_structure as 'full' | 'split' | 'milestone' | 'custom' | null) || null,
      paymentMethod: contract.payment_method || undefined,
      clauses,
    })
  }

  const handleDownload = (contract: Contract) => {
    const action = () => {
      downloadContractAsPdf(contract)
    }

    if (isGuest) {
      openWithAction(action)
      return
    }

    action()
  }

  const handleNewContract = () => {
    resetForm()
    setView('templates')
  }

  const clauseLabelMap: Record<string, string> = {
    revision: 'Revisions',
    ip: 'Intellectual Property',
    termination: 'Termination',
    confidentiality: 'Confidentiality',
    governingLaw: 'Governing Law',
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-[13px] text-text-muted">Loading contracts...</p>
      </div>
    )
  }

  return (
    <TooltipProvider delayDuration={180}>
    <div className="flex h-full flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        {previewContract ? (
          <button
            type="button"
            onClick={() => setPreviewContract(null)}
            className="text-[14px] font-semibold text-text-base hover:text-[var(--tertiary)]"
          >
            ← Back
          </button>
        ) : (
          <h3 className="text-[14px] font-semibold text-text-base">
            Contracts
          </h3>
        )}
        {!previewContract && (
          <button
            type="button"
            onClick={handleNewContract}
            className="inline-flex items-center gap-1 rounded-[8px] bg-[var(--primary)] px-3 py-1.5 text-[12px] font-medium text-white transition-colors hover:opacity-90"
          >
            <AddCircleBold size={14} />
            New
          </button>
        )}
      </div>

      {actionError && (
        <p className="text-[12px] text-feedback-error-text">{actionError}</p>
      )}

      {/* List */}
      {previewContract ? (
        <div className="min-h-0 flex-1 overflow-y-auto rounded-[10px] border border-[var(--surface-panel-border)] bg-[var(--surface-card)] p-4 theme-scrollbar">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">
            Service Agreement
          </p>
          <h2 className="mt-2 text-[20px] font-bold text-text-base">
            {previewContract.project_name || 'Untitled Contract'}
          </h2>
          <p className="mt-1 text-[13px] text-text-muted">
            Between Siddhartha Dwivedi and {getClientName(previewContract.client_id) || 'Client'}
          </p>

          <div className="mt-5 border-t border-[var(--surface-divider)] pt-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">Scope of Work</p>
            <p className="mt-2 whitespace-pre-line text-[14px] leading-[22px] text-text-base">{previewContract.scope || 'No scope provided.'}</p>
          </div>

          <div className="mt-5 border-t border-[var(--surface-divider)] pt-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">Deliverables</p>
            <ul className="mt-2 space-y-1.5">
              {(Array.isArray(previewContract.deliverables)
                ? (previewContract.deliverables as Array<{ text?: string }>).map((d) => d.text || '').filter(Boolean)
                : []
              ).map((item, index) => (
                <li key={index} className="text-[14px] text-text-base">• {item}</li>
              ))}
            </ul>
          </div>

          <div className="mt-5 border-t border-[var(--surface-divider)] pt-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">Timeline</p>
            <p className="mt-2 text-[14px] text-text-base">{previewContract.start_date || 'TBD'} — {previewContract.end_date || 'TBD'}</p>
          </div>

          <div className="mt-5 border-t border-[var(--surface-divider)] pt-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">Payment Terms</p>
            <p className="mt-2 text-[18px] font-bold text-text-base">
              {previewContract.currency} {Number(previewContract.total_fee || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="mt-1 text-[14px] text-text-muted">{previewContract.payment_structure || 'Custom payment terms'}</p>
            <p className="mt-1 text-[13px] text-text-muted">Via {previewContract.payment_method || 'Bank transfer'}.</p>
          </div>

          <div className="mt-5 border-t border-[var(--surface-divider)] pt-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">Terms & Conditions</p>
            <ol className="mt-3 space-y-3">
              {Object.entries((previewContract.clauses && typeof previewContract.clauses === 'object'
                ? (previewContract.clauses as Record<string, { on?: boolean; text?: string }>)
                : {}
              ))
                .filter(([, c]) => Boolean(c?.on && c?.text))
                .map(([key, clause], index) => (
                  <li key={key} className="text-[14px] leading-[22px] text-text-muted">
                    <span className="font-semibold text-text-base">{index + 1}. {clauseLabelMap[key] || key}.</span>{' '}
                    {clause?.text}
                  </li>
                ))}
            </ol>
          </div>
        </div>
      ) : contracts.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
          <DocumentText1Bold size={28} className="text-[var(--tertiary)]" />
          <p className="text-[13px] text-text-muted">No contracts yet</p>
          <button
            type="button"
            onClick={handleNewContract}
            className="text-[12px] font-medium text-[var(--tertiary)] hover:text-[var(--primary)]"
          >
            Create your first contract →
          </button>
        </div>
      ) : (
        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1 theme-scrollbar">
          {contracts.map((contract) => {
            const clientName = getClientName(contract.client_id)
            const displayStatus = contract.status === 'signed'
              ? 'signed'
              : contract.status === 'archived'
                ? 'archived'
                : 'sent'

            return (
              <div
                key={contract.id}
                className="group flex cursor-pointer items-center justify-between rounded-[10px] border border-[var(--surface-panel-border)] bg-[var(--surface-card)] p-3 transition-all duration-200 hover:border-[var(--primary)]"
                onClick={() => setPreviewContract(contract)}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-[13px] font-medium text-text-base">
                      {clientName
                        ? `${clientName} — ${contract.project_name || 'Untitled'}`
                        : contract.project_name || 'Untitled Contract'}
                    </p>
                    <StatusBadge status={displayStatus} />
                  </div>
                  <p className="mt-0.5 text-[11px] text-text-muted">
                    Updated {new Date(contract.updated_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()
                          handleEdit(contract)
                        }}
                        className="rounded-[6px] p-1.5 text-text-brand hover:bg-[var(--surface-chip)] hover:text-text-base"
                        aria-label="Edit"
                      >
                        <EditBold size={14} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Edit</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()
                          handleCopyLink(contract)
                        }}
                        className="rounded-[6px] p-1.5 text-text-brand hover:bg-[var(--surface-chip)] hover:text-text-base"
                        aria-label="Copy share link"
                      >
                        {copiedId === contract.id ? (
                          <span className="text-[11px] font-medium text-[var(--feedback-success-text)]">
                            Copied!
                          </span>
                        ) : copyErrorId === contract.id ? (
                          <span className="text-[11px] font-medium text-feedback-errorText">
                            Failed
                          </span>
                        ) : (
                          <LinkBold size={14} />
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {copyErrorId === contract.id
                        ? 'Failed to copy link'
                        : copiedId === contract.id
                          ? 'Link copied'
                          : 'Copy share link'}
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()
                          handleDownload(contract)
                        }}
                        className="rounded-[6px] p-1.5 text-text-brand hover:bg-[var(--surface-chip)] hover:text-text-base"
                        aria-label="Download PDF"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <path d="M12 3V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M8 10L12 14L16 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M4 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Download PDF</TooltipContent>
                  </Tooltip>

                  {displayStatus !== 'signed' && displayStatus !== 'archived' && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            handleMarkSigned(contract.id)
                          }}
                          className="rounded-[6px] p-1.5 text-text-brand hover:bg-feedback-success-base/10 hover:text-feedback-success-text"
                          aria-label="Mark as signed"
                        >
                          <TickCircleBold size={14} />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Mark as signed</TooltipContent>
                    </Tooltip>
                  )}

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()
                          handleDelete(contract.id)
                        }}
                        className="rounded-[6px] p-1.5 text-text-brand hover:bg-feedback-error-bg hover:text-feedback-error-text"
                        aria-label="Delete"
                      >
                        <TrashBold size={14} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Delete</TooltipContent>
                  </Tooltip>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
    </TooltipProvider>
  )
}

// Helper type for clause loading
type ContractClausesType = {
  revision: { on: boolean; text: string }
  ip: { on: boolean; text: string }
  termination: { on: boolean; text: string }
  confidentiality: { on: boolean; text: string }
  governingLaw: { on: boolean; text: string }
}
