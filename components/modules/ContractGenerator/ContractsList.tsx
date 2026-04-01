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
import { useContractStore } from '@/stores/contractStore'
import { useSessionStore } from '@/stores/sessionStore'
import { useSavePromptStore } from '@/stores/savePromptStore'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import type { Contract } from '@/lib/types/database'

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  sent: {
    bg: 'bg-[var(--surface-chip)]',
    text: 'text-[var(--text-soft-muted)]',
    label: 'Not Signed',
  },
  signed: {
    bg: 'bg-[rgba(0,126,0,0.18)]',
    text: 'text-[var(--feedback-success-text)]',
    label: 'Signed',
  },
  archived: {
    bg: 'bg-[var(--surface-disabled)]',
    text: 'text-[var(--text-soft-disabled)]',
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
  const deleteMutation = useDeleteContract()
  const updateMutation = useUpdateContract()
  const shareMutation = useGenerateShareLink()
  const { setView, setActiveContract, updateFormData, resetForm } =
    useContractStore()
  const [copiedId, setCopiedId] = useState<string | null>(null)

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
    try {
      const url = await shareMutation.mutateAsync(contract.id)
      await navigator.clipboard.writeText(url)
      setCopiedId(contract.id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      // silently fail
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id)
    } catch {
      // silently fail
    }
  }

  const handleMarkSigned = async (id: string) => {
    try {
      await updateMutation.mutateAsync({ id, data: { status: 'signed' } })
    } catch {
      // silently fail
    }
  }

  const escapeHtml = (value: unknown) => {
    const text =
      typeof value === 'string'
        ? value
        : Array.isArray(value)
          ? value
              .map((item) => {
                if (typeof item === 'string') return item
                if (item && typeof item === 'object' && 'text' in item) {
                  const row = item as { text?: unknown }
                  return typeof row.text === 'string' ? row.text : ''
                }
                return ''
              })
              .filter(Boolean)
              .join(', ')
          : ''

    return text
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;')
  }

  const openGuestContractPrint = (contract: Contract) => {
    const clientName = getClientName(contract.client_id) || 'Client'
    const timelineText = contract.start_date || contract.end_date
      ? `${contract.start_date || 'TBD'} to ${contract.end_date || 'TBD'}`
      : 'No timeline provided.'
    const html = `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${escapeHtml(contract.project_name)}.pdf</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 32px; color: #111; }
            h1 { margin: 0 0 8px 0; }
            h2 { margin: 24px 0 8px; font-size: 16px; }
            p { line-height: 1.5; }
            .muted { color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <h1>${escapeHtml(contract.project_name)}</h1>
          <p class="muted">Client: ${escapeHtml(clientName)} | Status: ${escapeHtml(contract.status)}</p>
          <h2>Scope of Work</h2>
          <p>${escapeHtml(contract.scope || 'No scope provided.')}</p>
          <h2>Deliverables</h2>
          <p>${escapeHtml(contract.deliverables || 'No deliverables provided.')}</p>
          <h2>Payment Terms</h2>
          <p>${escapeHtml(contract.payment_terms || 'No payment terms provided.')}</p>
          <h2>Timeline</h2>
          <p>${escapeHtml(timelineText)}</p>
          <p class="muted">Generated with Stacklite</p>
          <script>window.print()</script>
        </body>
      </html>
    `

    const popup = window.open('', '_blank', 'noopener,noreferrer')
    if (!popup) return
    popup.document.open()
    popup.document.write(html)
    popup.document.close()
    popup.focus()
  }

  const handleDownload = (contract: Contract) => {
    const action = () => {
      openGuestContractPrint(contract)
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

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-[13px] text-[var(--text-soft-muted)]">Loading contracts...</p>
      </div>
    )
  }

  return (
    <TooltipProvider delayDuration={180}>
    <div className="flex h-full flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-[14px] font-semibold text-[var(--text-soft-strong)]">
          Contracts
        </h3>
        <button
          type="button"
          onClick={handleNewContract}
          className="inline-flex items-center gap-1 rounded-[8px] bg-[var(--primary)] px-3 py-1.5 text-[12px] font-medium text-white transition-colors hover:opacity-90"
        >
          <AddCircleBold size={14} />
          New
        </button>
      </div>

      {/* List */}
      {contracts.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
          <DocumentText1Bold size={28} className="text-[var(--text-soft-muted)]" />
          <p className="text-[13px] text-[var(--text-soft-muted)]">No contracts yet</p>
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
                className="group flex items-center justify-between rounded-[10px] border border-[var(--surface-panel-border)] bg-[var(--surface-card)] p-3 transition-all duration-200 hover:border-[var(--primary)]"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-[13px] font-medium text-[var(--text-soft-strong)]">
                      {clientName
                        ? `${clientName} — ${contract.project_name || 'Untitled'}`
                        : contract.project_name || 'Untitled Contract'}
                    </p>
                    <StatusBadge status={displayStatus} />
                  </div>
                  <p className="mt-0.5 text-[11px] text-[var(--text-soft-subtle)]">
                    Updated {new Date(contract.updated_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => handleEdit(contract)}
                        className="rounded-[6px] p-1.5 text-[var(--text-soft-muted)] hover:bg-[var(--surface-chip)] hover:text-[var(--tertiary)]"
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
                        onClick={() => handleCopyLink(contract)}
                        className="rounded-[6px] p-1.5 text-[var(--text-soft-muted)] hover:bg-[var(--surface-chip)] hover:text-[var(--tertiary)]"
                        aria-label="Copy share link"
                      >
                        {copiedId === contract.id ? (
                          <span className="text-[11px] font-medium text-[var(--feedback-success-text)]">
                            Copied!
                          </span>
                        ) : (
                          <LinkBold size={14} />
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Copy share link</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => handleDownload(contract)}
                        className="rounded-[6px] p-1.5 text-[var(--text-soft-muted)] hover:bg-[var(--surface-chip)] hover:text-[var(--tertiary)]"
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
                          onClick={() => handleMarkSigned(contract.id)}
                          className="rounded-[6px] p-1.5 text-[var(--text-soft-muted)] hover:bg-feedback-success-base/10 hover:text-feedback-success-text"
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
                        onClick={() => handleDelete(contract.id)}
                        className="rounded-[6px] p-1.5 text-[var(--text-soft-muted)] hover:bg-[var(--surface-danger-soft)] hover:text-[var(--text-danger-soft)]"
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
