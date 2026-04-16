'use client'

import React, { useEffect } from 'react'
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

  const freelancerNameDefault = profile?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name || ''
  const freelancerEmailDefault = profile?.email || user?.email || ''
  const freelancerLocationDefault = profile?.company_address || ''

  const selectedClient = clients.find((c) => c.id === formData.client_id)

  useEffect(() => {
    const nextData: Record<string, string> = {}

    if (!formData.freelancer_name && freelancerNameDefault) {
      nextData.freelancer_name = freelancerNameDefault
    }

    if (!formData.freelancer_email && freelancerEmailDefault) {
      nextData.freelancer_email = freelancerEmailDefault
    }

    if (!formData.freelancer_location && freelancerLocationDefault) {
      nextData.freelancer_location = freelancerLocationDefault
    }

    if (!formData.client_name && selectedClient?.name) {
      nextData.client_name = selectedClient.name
    }

    if (!formData.client_email && selectedClient?.email) {
      nextData.client_email = selectedClient.email
    }

    if (Object.keys(nextData).length > 0) {
      updateFormData(nextData)
    }
  }, [
    formData.client_email,
    formData.client_name,
    formData.freelancer_email,
    formData.freelancer_location,
    formData.freelancer_name,
    freelancerEmailDefault,
    freelancerLocationDefault,
    freelancerNameDefault,
    selectedClient?.email,
    selectedClient?.name,
    updateFormData,
  ])

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

      {/* Freelancer info */}
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
              value={formData.freelancer_name || ''}
              onChange={(e) => updateFormData({ freelancer_name: e.target.value })}
              placeholder="Your full name"
              className="theme-shell-field h-8 w-full rounded-[6px] px-3 text-[13px]"
            />
          </div>
          <div>
            <label className="mb-1 block text-[12px] font-medium text-text-base">
              Email
            </label>
            <input
              type="email"
              value={formData.freelancer_email || ''}
              onChange={(e) => updateFormData({ freelancer_email: e.target.value })}
              placeholder="you@example.com"
              className="theme-shell-field h-8 w-full rounded-[6px] px-3 text-[13px]"
            />
          </div>
          <div>
            <label className="mb-1 block text-[12px] font-medium text-text-base">
              Location
            </label>
            <input
              type="text"
              value={formData.freelancer_location || ''}
              onChange={(e) => updateFormData({ freelancer_location: e.target.value })}
              placeholder="City, Country"
              className="theme-shell-field h-8 w-full rounded-[6px] px-3 text-[13px]"
            />
          </div>
        </div>
      </div>

      {/* Client selection or custom input */}
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
              onChange={(e) => {
                const clientId = e.target.value || null
                const nextClient = clients.find((client) => client.id === clientId)

                updateFormData({
                  client_id: clientId,
                  client_name: nextClient?.name || formData.client_name || '',
                  client_email: nextClient?.email || formData.client_email || '',
                })
              }}
              className="h-8 rounded-[6px] px-3 text-[13px]"
            >
              <option value="">No saved client (use custom below)</option>
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
                No clients yet. You can still proceed by filling custom client details below.
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-[12px] font-medium text-text-base">
              Client name
            </label>
            <input
              type="text"
              value={formData.client_name || ''}
              onChange={(e) => updateFormData({ client_name: e.target.value })}
              placeholder="Client or company name"
              className="theme-shell-field h-8 w-full rounded-[6px] px-3 text-[13px]"
            />
          </div>

          <div>
            <label className="mb-1 block text-[12px] font-medium text-text-base">
              Client email
            </label>
            <input
              type="email"
              value={formData.client_email || ''}
              onChange={(e) => updateFormData({ client_email: e.target.value })}
              placeholder="client@example.com"
              className="theme-shell-field h-8 w-full rounded-[6px] px-3 text-[13px]"
            />
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
