'use client'

import React, { useState } from 'react'
import {
  DocumentText1Bold,
  EditBold,
  LinkBold,
  TrashBold,
  AddCircleBold,
} from 'sicons'
import { useContracts, useDeleteContract, useGenerateShareLink } from '@/hooks/useContracts'
import { useClients } from '@/hooks/useClients'
import { useContractStore } from '@/stores/contractStore'
import type { Contract } from '@/lib/types/database'

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  draft: {
    bg: 'bg-[var(--surface-chip)]',
    text: 'text-[var(--tertiary)]',
    label: 'Draft',
  },
  sent: {
    bg: 'bg-[rgba(0,126,0,0.12)]',
    text: 'text-[var(--feedback-success-text)]',
    label: 'Sent',
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
  const style = STATUS_STYLES[status] || STATUS_STYLES.draft
  return (
    <span
      className={`inline-flex items-center rounded-[4px] px-2 py-0.5 text-[11px] font-semibold ${style.bg} ${style.text}`}
    >
      {style.label}
    </span>
  )
}

export function ContractsList() {
  const { data: contracts = [], isLoading } = useContracts()
  const { data: clients = [] } = useClients()
  const deleteMutation = useDeleteContract()
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
      status: (contract.status as 'draft' | 'sent' | 'signed' | 'archived') || 'draft',
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
                    <StatusBadge status={contract.status} />
                  </div>
                  <p className="mt-0.5 text-[11px] text-[var(--text-soft-subtle)]">
                    Updated {new Date(contract.updated_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => handleEdit(contract)}
                    className="rounded-[6px] p-1.5 text-[var(--text-soft-muted)] hover:bg-[var(--surface-chip)] hover:text-[var(--tertiary)]"
                    aria-label="Edit"
                  >
                    <EditBold size={14} />
                  </button>
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
                  <button
                    type="button"
                    onClick={() => handleDelete(contract.id)}
                    className="rounded-[6px] p-1.5 text-[var(--text-soft-muted)] hover:bg-[var(--surface-danger-soft)] hover:text-[var(--text-danger-soft)]"
                    aria-label="Delete"
                  >
                    <TrashBold size={14} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
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
