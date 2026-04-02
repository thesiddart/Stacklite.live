import React from 'react'
import Link from 'next/link'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import type { Database, Contract as ContractRow } from '@/lib/types/database'

interface ContractClauses {
  revision?: { on: boolean; text: string }
  ip?: { on: boolean; text: string }
  termination?: { on: boolean; text: string }
  confidentiality?: { on: boolean; text: string }
  governingLaw?: { on: boolean; text: string }
}

interface SharedClient {
  name: string
  email: string | null
  company_name: string | null
}

export default async function SharedContractPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const supabase = await createClient()
  let adminSupabase: ReturnType<typeof createSupabaseClient<Database>> | null = null

  const { data: contractData } = await supabase
    .from('contracts')
    .select('*')
    .eq('share_token', token)
    .neq('status', 'draft')
    .maybeSingle()

  let contract = contractData

  if (!contract) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()

    if (supabaseUrl && serviceRoleKey) {
      adminSupabase = createSupabaseClient<Database>(supabaseUrl, serviceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })

      const { data: adminContract } = await adminSupabase
        .from('contracts')
        .select('*')
        .eq('share_token', token)
        .neq('status', 'draft')
        .maybeSingle()

      contract = adminContract
    }
  }

  if (!contract) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-muted">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-text-base">
            Contract not found
          </h1>
          <p className="mt-2 text-sm text-text-muted">
            This link may have expired or the contract is unavailable.
          </p>
        </div>
      </div>
    )
  }

  const typedContract = contract as ContractRow

  let client: SharedClient | null = null

  if (typedContract.client_id) {
    const { data: clientData } = await supabase
      .from('clients')
      .select('name, email, company_name')
      .eq('id', typedContract.client_id)
      .maybeSingle()

    client = clientData

    if (!client && adminSupabase) {
      const { data: adminClientData } = await adminSupabase
        .from('clients')
        .select('name, email, company_name')
        .eq('id', typedContract.client_id)
        .maybeSingle()

      client = adminClientData
    }
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
    <div className="min-h-screen bg-background-muted">
      <div className="mx-auto max-w-[680px] px-6 py-12">
        {/* Logo */}
        <div className="mb-8">
          <Link href="/" aria-label="Go to Stacklite home" className="inline-flex">
            <picture>
              <source media="(prefers-color-scheme: dark)" srcSet="/logo-dark.svg" />
              <source media="(prefers-color-scheme: light)" srcSet="/logo-light.svg" />
              <img src="/logo-light.svg" alt="Stacklite" className="h-6 w-auto opacity-40 transition-opacity hover:opacity-70" />
            </picture>
          </Link>
        </div>

        {/* Document */}
        <div className="rounded-[16px] border border-border-muted bg-background-base p-8 shadow-sm">
          {/* Header */}
          <div className="border-b border-border-muted pb-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-text-muted">
              Service Agreement
            </p>
            <h1 className="mt-2 text-[22px] font-bold leading-tight text-text-base">
              {typedContract.project_name || 'Service Agreement'}
            </h1>
            {client && (
              <p className="mt-1 text-[13px] text-text-muted">
                Prepared for{' '}
                <span className="font-medium text-text-base">
                  {client.name}
                </span>
              </p>
            )}
          </div>

          {/* Client */}
          {client && (
            <div className="mt-6 border-b border-border-muted pb-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">
                Client
              </p>
              <p className="mt-2 text-[14px] font-medium text-text-base">
                {client.name}
              </p>
              {client.email && (
                <p className="text-[13px] text-text-muted">{client.email}</p>
              )}
              {client.company_name && (
                <p className="text-[13px] text-text-muted">{client.company_name}</p>
              )}
            </div>
          )}

          {/* Scope */}
          {typedContract.scope && (
            <div className="mt-6 border-b border-border-muted pb-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">
                Scope of Work
              </p>
              <p className="mt-2 whitespace-pre-line text-[14px] leading-[22px] text-text-base">
                {typedContract.scope}
              </p>
            </div>
          )}

          {/* Deliverables */}
          {deliverables.length > 0 && (
            <div className="mt-6 border-b border-border-muted pb-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">
                Deliverables
              </p>
              <ul className="mt-2 space-y-1.5">
                {deliverables.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-[14px] text-text-base">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-icon-brand" />
                    {item.text}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Exclusions */}
          {typedContract.exclusions && (
            <div className="mt-6 border-b border-border-muted pb-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">
                Not Included
              </p>
              <p className="mt-2 whitespace-pre-line text-[14px] leading-[22px] text-text-base">
                {typedContract.exclusions}
              </p>
            </div>
          )}

          {/* Timeline */}
          {(typedContract.start_date || typedContract.end_date) && (
            <div className="mt-6 border-b border-border-muted pb-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">
                Timeline
              </p>
              <p className="mt-2 text-[14px] text-text-base">
                {typedContract.start_date || 'TBD'} — {typedContract.end_date || 'TBD'}
              </p>
              {milestones.length > 0 && (
                <div className="mt-2 space-y-1">
                  {milestones.map((m, i) => (
                    <p key={i} className="text-[13px] text-text-muted">
                      • {m.label} — {m.date}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Payment */}
          {(typedContract.total_fee || typedContract.payment_structure) && (
            <div className="mt-6 border-b border-border-muted pb-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">
                Payment Terms
              </p>
              {typedContract.total_fee != null && (
                <p className="mt-2 text-[18px] font-bold text-text-base">
                  {typedContract.currency || 'USD'}{' '}
                  {Number(typedContract.total_fee).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              )}
              {paymentLabel && (
                <p className="mt-1 text-[14px] text-text-muted">{paymentLabel}</p>
              )}
              {typedContract.payment_method && (
                <p className="mt-1 text-[13px] text-text-muted">
                  Via {typedContract.payment_method}
                </p>
              )}
            </div>
          )}

          {/* Clauses */}
          {activeClauses.length > 0 && (
            <div className="mt-6 border-b border-border-muted pb-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">
                Terms & Conditions
              </p>
              <ol className="mt-3 space-y-4">
                {activeClauses.map(([key, clause], index) => (
                  <li key={key} className="text-[14px] leading-[22px]">
                    <span className="font-semibold text-text-base">
                      {index + 1}. {clauseLabelMap[key] || key}.
                    </span>{' '}
                    <span className="text-text-muted">{clause!.text}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Signatures */}
          <div className="mt-8 grid grid-cols-2 gap-10">
            <div>
              <div className="mb-3 h-px w-full bg-border-base" />
              <p className="text-[13px] font-medium text-text-base">Freelancer</p>
              <p className="mt-1 text-[12px] text-text-muted">Date: ___________</p>
            </div>
            <div>
              <div className="mb-3 h-px w-full bg-border-base" />
              <p className="text-[13px] font-medium text-text-base">
                {client?.name || 'Client'}
              </p>
              <p className="mt-1 text-[12px] text-text-muted">Date: ___________</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => {}}
            className="rounded-[10px] border border-border-muted bg-background-base px-5 py-2.5 text-[13px] font-medium text-text-base shadow-sm transition-colors hover:bg-button-secondary"
            id="print-button"
          >
            Print / Save as PDF
          </button>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-[11px] text-text-muted">Generated with Stacklite</p>
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
