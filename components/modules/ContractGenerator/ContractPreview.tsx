'use client'

import React from 'react'
import { useContractStore, DEFAULT_CLAUSES } from '@/stores/contractStore'
import { useClients } from '@/hooks/useClients'
import { useProfile } from '@/hooks/useProfile'
import { useAuth } from '@/hooks/useAuth'
import type { ContractClauses } from '@/lib/validations/contract'

export function ContractPreview() {
  const { formData } = useContractStore()
  const { data: clients = [] } = useClients()
  const { user } = useAuth()
  const { data: profile } = useProfile(Boolean(user))

  const freelancerName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    'Freelancer'
  const freelancerEmail = profile?.email || user?.email || ''

  const selectedClient = clients.find((c) => c.id === formData.client_id)
  const clauses: ContractClauses = formData.clauses || DEFAULT_CLAUSES
  const deliverables = formData.deliverables || []
  const milestones = formData.milestones || []
  const activeClauses = Object.entries(clauses).filter(
    ([, clause]) => clause.on && clause.text
  )

  const paymentLabel =
    formData.payment_structure === 'full'
      ? 'Full payment upfront'
      : formData.payment_structure === 'split'
        ? '50% upfront, 50% on completion'
        : formData.payment_structure === 'milestone'
          ? 'Milestone-based payments'
          : formData.payment_structure === 'custom'
            ? 'Custom payment terms'
            : null

  return (
    <div className="h-full overflow-y-auto rounded-[14px] border border-[var(--surface-panel-border)] bg-white p-6 shadow-sm theme-scrollbar dark:bg-[var(--surface-card)]">
      {/* Document header */}
      <div className="border-b border-[var(--surface-divider)] pb-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--text-soft-muted)]">
          Service Agreement
        </p>
        <h2 className="mt-2 text-[18px] font-bold leading-tight text-[var(--text-soft-strong)]">
          {formData.project_name || 'Untitled Project'}
        </h2>
        <p className="mt-1 text-[12px] text-[var(--text-soft-muted)]">
          Between{' '}
          <span className="font-medium text-[var(--text-soft-strong)]">
            {freelancerName}
          </span>{' '}
          and{' '}
          <span className="font-medium text-[var(--text-soft-strong)]">
            {selectedClient?.name || 'Client'}
          </span>
        </p>
      </div>

      {/* Parties */}
      <div className="mt-4 grid grid-cols-2 gap-4 border-b border-[var(--surface-divider)] pb-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-soft-muted)]">
            Freelancer
          </p>
          <p className="mt-1 text-[13px] font-medium text-[var(--text-soft-strong)]">
            {freelancerName}
          </p>
          <p className="text-[12px] text-[var(--text-soft-muted)]">{freelancerEmail}</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-soft-muted)]">
            Client
          </p>
          <p className="mt-1 text-[13px] font-medium text-[var(--text-soft-strong)]">
            {selectedClient?.name || 'Select a client'}
          </p>
          <p className="text-[12px] text-[var(--text-soft-muted)]">
            {selectedClient?.email || '—'}
          </p>
          {selectedClient?.company_name && (
            <p className="text-[12px] text-[var(--text-soft-muted)]">
              {selectedClient.company_name}
            </p>
          )}
        </div>
      </div>

      {/* Scope */}
      {formData.scope && (
        <div className="mt-4 border-b border-[var(--surface-divider)] pb-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-soft-muted)]">
            Scope of Work
          </p>
          <p className="mt-2 whitespace-pre-line text-[13px] leading-[20px] text-[var(--text-soft-strong)]">
            {formData.scope}
          </p>
        </div>
      )}

      {/* Deliverables */}
      {deliverables.length > 0 && (
        <div className="mt-4 border-b border-[var(--surface-divider)] pb-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-soft-muted)]">
            Deliverables
          </p>
          <ul className="mt-2 space-y-1">
            {deliverables.map((item, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-[13px] text-[var(--text-soft-strong)]"
              >
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]" />
                {item.text || 'Untitled deliverable'}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Exclusions */}
      {formData.exclusions && (
        <div className="mt-4 border-b border-[var(--surface-divider)] pb-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-soft-muted)]">
            Not Included
          </p>
          <p className="mt-2 whitespace-pre-line text-[13px] leading-[20px] text-[var(--text-soft-strong)]">
            {formData.exclusions}
          </p>
        </div>
      )}

      {/* Timeline */}
      {(formData.start_date || formData.end_date) && (
        <div className="mt-4 border-b border-[var(--surface-divider)] pb-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-soft-muted)]">
            Timeline
          </p>
          <p className="mt-2 text-[13px] text-[var(--text-soft-strong)]">
            {formData.start_date || 'TBD'} — {formData.end_date || 'TBD'}
          </p>
          {milestones.length > 0 && (
            <div className="mt-2 space-y-1">
              {milestones.map((m, i) => (
                <p key={i} className="text-[12px] text-[var(--text-soft-muted)]">
                  • {m.label || 'Milestone'} — {m.date || 'TBD'}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Payment */}
      {(formData.total_fee || formData.payment_structure) && (
        <div className="mt-4 border-b border-[var(--surface-divider)] pb-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-soft-muted)]">
            Payment Terms
          </p>
          {formData.total_fee != null && (
            <p className="mt-2 text-[16px] font-bold text-[var(--text-soft-strong)]">
              {formData.currency || 'USD'}{' '}
              {formData.total_fee.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          )}
          {paymentLabel && (
            <p className="mt-1 text-[13px] text-[var(--text-soft-muted)]">
              {paymentLabel}
            </p>
          )}
          {formData.payment_method && (
            <p className="mt-1 text-[12px] text-[var(--text-soft-subtle)]">
              Via {formData.payment_method}
            </p>
          )}
        </div>
      )}

      {/* Clauses */}
      {activeClauses.length > 0 && (
        <div className="mt-4 border-b border-[var(--surface-divider)] pb-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-soft-muted)]">
            Terms & Conditions
          </p>
          <ol className="mt-2 space-y-3">
            {activeClauses.map(([key, clause], index) => {
              const label =
                key === 'revision'
                  ? 'Revisions'
                  : key === 'ip'
                    ? 'Intellectual Property'
                    : key === 'termination'
                      ? 'Termination'
                      : key === 'confidentiality'
                        ? 'Confidentiality'
                        : key === 'governingLaw'
                          ? 'Governing Law'
                          : key

              return (
                <li key={key} className="text-[13px] leading-[20px]">
                  <span className="font-semibold text-[var(--text-soft-strong)]">
                    {index + 1}. {label}.
                  </span>{' '}
                  <span className="text-[var(--text-soft-muted)]">{clause.text}</span>
                </li>
              )
            })}
          </ol>
        </div>
      )}

      {/* Signatures */}
      <div className="mt-6 grid grid-cols-2 gap-8">
        <div>
          <div className="mb-2 h-px w-full bg-[var(--text-soft-strong)]" />
          <p className="text-[12px] font-medium text-[var(--text-soft-strong)]">
            {freelancerName}
          </p>
          <p className="text-[11px] text-[var(--text-soft-muted)]">Freelancer</p>
          <p className="mt-1 text-[11px] text-[var(--text-soft-subtle)]">
            Date: ___________
          </p>
        </div>
        <div>
          <div className="mb-2 h-px w-full bg-[var(--text-soft-strong)]" />
          <p className="text-[12px] font-medium text-[var(--text-soft-strong)]">
            {selectedClient?.name || 'Client'}
          </p>
          <p className="text-[11px] text-[var(--text-soft-muted)]">Client</p>
          <p className="mt-1 text-[11px] text-[var(--text-soft-subtle)]">
            Date: ___________
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-[10px] text-[var(--text-soft-subtle)]">
          Generated with Stacklite
        </p>
      </div>
    </div>
  )
}
