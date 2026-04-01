import React from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import type { Contract as ContractRow } from '@/lib/types/database'

interface ContractClauses {
  revision?: { on: boolean; text: string }
  ip?: { on: boolean; text: string }
  termination?: { on: boolean; text: string }
  confidentiality?: { on: boolean; text: string }
  governingLaw?: { on: boolean; text: string }
}

export default async function SharedContractPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const supabase = await createClient()

  const { data: contract, error } = await supabase
    .from('contracts')
    .select('*, clients(name, email, company_name)')
    .eq('share_token', token)
    .neq('status', 'draft')
    .single()

  if (error || !contract) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f9f9f9]">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-[#1a163d]">
            Contract not found
          </h1>
          <p className="mt-2 text-sm text-[#7c7288]">
            This link may have expired or the contract is still in draft.
          </p>
        </div>
      </div>
    )
  }

  const typedContract = contract as ContractRow & {
    clients?: { name: string; email: string | null; company_name: string | null } | null
  }

  const deliverables = Array.isArray(typedContract.deliverables)
    ? (typedContract.deliverables as { text: string }[])
    : []
  const milestones = Array.isArray(typedContract.milestones)
    ? (typedContract.milestones as { label: string; date: string }[])
    : []
  const clauses: ContractClauses =
    typedContract.clauses && typeof typedContract.clauses === 'object'
      ? (typedContract.clauses as ContractClauses)
      : {}

  const activeClauses = Object.entries(clauses).filter(
    ([, clause]) => clause && clause.on && clause.text
  )

  const paymentLabel =
    typedContract.payment_structure === 'full'
      ? 'Full payment upfront'
      : typedContract.payment_structure === 'split'
        ? '50% upfront, 50% on completion'
        : typedContract.payment_structure === 'milestone'
          ? 'Milestone-based payments'
          : typedContract.payment_structure === 'custom'
            ? 'Custom payment terms'
            : null

  const clauseLabelMap: Record<string, string> = {
    revision: 'Revisions',
    ip: 'Intellectual Property',
    termination: 'Termination',
    confidentiality: 'Confidentiality',
    governingLaw: 'Governing Law',
  }

  return (
    <div className="min-h-screen bg-[#f9f9f9]">
      <div className="mx-auto max-w-[680px] px-6 py-12">
        {/* Logo */}
        <div className="mb-8">
          <Image src="/logo.svg" alt="Stacklite" width={120} height={32} className="h-6 w-auto opacity-40" />
        </div>

        {/* Document */}
        <div className="rounded-[16px] border border-[#e8e4f6] bg-white p-8 shadow-sm">
          {/* Header */}
          <div className="border-b border-[#e8e4f6] pb-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7c7288]">
              Service Agreement
            </p>
            <h1 className="mt-2 text-[22px] font-bold leading-tight text-[#1a163d]">
              {typedContract.project_name || 'Service Agreement'}
            </h1>
            {typedContract.clients && (
              <p className="mt-1 text-[13px] text-[#7c7288]">
                Prepared for{' '}
                <span className="font-medium text-[#1a163d]">
                  {typedContract.clients.name}
                </span>
              </p>
            )}
          </div>

          {/* Client */}
          {typedContract.clients && (
            <div className="mt-6 border-b border-[#e8e4f6] pb-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7c7288]">
                Client
              </p>
              <p className="mt-2 text-[14px] font-medium text-[#1a163d]">
                {typedContract.clients.name}
              </p>
              {typedContract.clients.email && (
                <p className="text-[13px] text-[#7c7288]">{typedContract.clients.email}</p>
              )}
              {typedContract.clients.company_name && (
                <p className="text-[13px] text-[#7c7288]">{typedContract.clients.company_name}</p>
              )}
            </div>
          )}

          {/* Scope */}
          {typedContract.scope && (
            <div className="mt-6 border-b border-[#e8e4f6] pb-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7c7288]">
                Scope of Work
              </p>
              <p className="mt-2 whitespace-pre-line text-[14px] leading-[22px] text-[#1a163d]">
                {typedContract.scope}
              </p>
            </div>
          )}

          {/* Deliverables */}
          {deliverables.length > 0 && (
            <div className="mt-6 border-b border-[#e8e4f6] pb-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7c7288]">
                Deliverables
              </p>
              <ul className="mt-2 space-y-1.5">
                {deliverables.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-[14px] text-[#1a163d]">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#7962f4]" />
                    {item.text}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Exclusions */}
          {typedContract.exclusions && (
            <div className="mt-6 border-b border-[#e8e4f6] pb-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7c7288]">
                Not Included
              </p>
              <p className="mt-2 whitespace-pre-line text-[14px] leading-[22px] text-[#1a163d]">
                {typedContract.exclusions}
              </p>
            </div>
          )}

          {/* Timeline */}
          {(typedContract.start_date || typedContract.end_date) && (
            <div className="mt-6 border-b border-[#e8e4f6] pb-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7c7288]">
                Timeline
              </p>
              <p className="mt-2 text-[14px] text-[#1a163d]">
                {typedContract.start_date || 'TBD'} — {typedContract.end_date || 'TBD'}
              </p>
              {milestones.length > 0 && (
                <div className="mt-2 space-y-1">
                  {milestones.map((m, i) => (
                    <p key={i} className="text-[13px] text-[#7c7288]">
                      • {m.label} — {m.date}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Payment */}
          {(typedContract.total_fee || typedContract.payment_structure) && (
            <div className="mt-6 border-b border-[#e8e4f6] pb-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7c7288]">
                Payment Terms
              </p>
              {typedContract.total_fee != null && (
                <p className="mt-2 text-[18px] font-bold text-[#1a163d]">
                  {typedContract.currency || 'USD'}{' '}
                  {Number(typedContract.total_fee).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              )}
              {paymentLabel && (
                <p className="mt-1 text-[14px] text-[#7c7288]">{paymentLabel}</p>
              )}
              {typedContract.payment_method && (
                <p className="mt-1 text-[13px] text-[#5c5c5c]">
                  Via {typedContract.payment_method}
                </p>
              )}
            </div>
          )}

          {/* Clauses */}
          {activeClauses.length > 0 && (
            <div className="mt-6 border-b border-[#e8e4f6] pb-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7c7288]">
                Terms & Conditions
              </p>
              <ol className="mt-3 space-y-4">
                {activeClauses.map(([key, clause], index) => (
                  <li key={key} className="text-[14px] leading-[22px]">
                    <span className="font-semibold text-[#1a163d]">
                      {index + 1}. {clauseLabelMap[key] || key}.
                    </span>{' '}
                    <span className="text-[#5c5c5c]">{clause!.text}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Signatures */}
          <div className="mt-8 grid grid-cols-2 gap-10">
            <div>
              <div className="mb-3 h-px w-full bg-[#1a163d]" />
              <p className="text-[13px] font-medium text-[#1a163d]">Freelancer</p>
              <p className="mt-1 text-[12px] text-[#7c7288]">Date: ___________</p>
            </div>
            <div>
              <div className="mb-3 h-px w-full bg-[#1a163d]" />
              <p className="text-[13px] font-medium text-[#1a163d]">
                {typedContract.clients?.name || 'Client'}
              </p>
              <p className="mt-1 text-[12px] text-[#7c7288]">Date: ___________</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => {}}
            className="rounded-[10px] border border-[#e8e4f6] bg-white px-5 py-2.5 text-[13px] font-medium text-[#1a163d] shadow-sm transition-colors hover:bg-[#f3e8ff]"
            id="print-button"
          >
            Print / Save as PDF
          </button>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-[11px] text-[#7c7288]">Generated with Stacklite</p>
        </div>
      </div>

      {/* Print button script */}
      <script
        dangerouslySetInnerHTML={{
          __html: `document.getElementById('print-button')?.addEventListener('click', function() { window.print(); })`,
        }}
      />
    </div>
  )
}
