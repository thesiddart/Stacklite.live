'use client'

import React from 'react'
import { useContractStore } from '@/stores/contractStore'
import { useClients } from '@/hooks/useClients'
import { useProfile } from '@/hooks/useProfile'
import { useAuth } from '@/hooks/useAuth'
import { Select } from '@/components/ui/Select'

export function PartiesSection() {
  const { formData, updateFormData } = useContractStore()
  const { data: clients = [], isLoading: isClientsLoading } = useClients()
  const { user } = useAuth()
  const { data: profile } = useProfile(Boolean(user))

  const freelancerName = profile?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name || ''
  const freelancerEmail = profile?.email || user?.email || ''
  const freelancerLocation = profile?.company_address || ''

  const selectedClient = clients.find((c) => c.id === formData.client_id)

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-[14px] font-semibold text-text-base">
          Parties
        </h3>
        <p className="mt-0.5 text-[12px] text-text-muted">
          Identify the freelancer and client for this contract.
        </p>
      </div>

      {/* Freelancer info — auto-filled from profile */}
      <div className="rounded-[10px] border border-[var(--surface-panel-border)] bg-[var(--surface-panel-strong)] p-3">
        <p className="text-[11px] font-medium uppercase tracking-wider text-text-muted">
          Freelancer
        </p>
        <div className="mt-2 space-y-2">
          <div>
            <label className="mb-1 block text-[12px] font-medium text-text-base">
              Name
            </label>
            <input
              type="text"
              value={freelancerName}
              readOnly
              className="theme-shell-field h-8 w-full cursor-not-allowed rounded-[6px] px-3 text-[13px] opacity-70"
            />
          </div>
          <div>
            <label className="mb-1 block text-[12px] font-medium text-text-base">
              Email
            </label>
            <input
              type="email"
              value={freelancerEmail}
              readOnly
              className="theme-shell-field h-8 w-full cursor-not-allowed rounded-[6px] px-3 text-[13px] opacity-70"
            />
          </div>
          {freelancerLocation && (
            <div>
              <label className="mb-1 block text-[12px] font-medium text-text-base">
                Location
              </label>
              <input
                type="text"
                value={freelancerLocation}
                readOnly
                className="theme-shell-field h-8 w-full cursor-not-allowed rounded-[6px] px-3 text-[13px] opacity-70"
              />
            </div>
          )}
        </div>
      </div>

      {/* Client selection */}
      <div className="rounded-[10px] border border-[var(--surface-panel-border)] bg-[var(--surface-panel-strong)] p-3">
        <p className="text-[11px] font-medium uppercase tracking-wider text-text-muted">
          Client
        </p>
        <div className="mt-2 space-y-2">
          <div>
            <label className="mb-1 block text-[12px] font-medium text-text-base">
              Select client
            </label>
            <Select
              value={formData.client_id || ''}
              onChange={(e) => updateFormData({ client_id: e.target.value || null })}
              className="h-8 rounded-[6px] px-3 text-[13px]"
            >
              <option value="">Choose a client</option>
              {isClientsLoading && <option disabled>Loading...</option>}
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                  {client.company_name ? ` — ${client.company_name}` : ''}
                </option>
              ))}
            </Select>
            {clients.length === 0 && !isClientsLoading && (
              <p className="mt-1 text-[11px] text-text-muted">
                No clients yet. Add one via the Client Manager first.
              </p>
            )}
          </div>

          {/* Auto-filled client info */}
          {selectedClient && (
            <div className="mt-2 space-y-1 rounded-[8px] bg-[var(--surface-card)] p-2">
              <p className="text-[13px] font-medium text-text-base">
                {selectedClient.name}
              </p>
              {selectedClient.email && (
                <p className="text-[12px] text-text-muted">
                  {selectedClient.email}
                </p>
              )}
              {selectedClient.company_name && (
                <p className="text-[12px] text-text-muted">
                  {selectedClient.company_name}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
