'use client'

import React from 'react'
import { Select } from '@/components/ui/Select'
import { useInvoiceStore } from '@/stores/invoiceStore'
import { useClients } from '@/hooks/useClients'
import { useContracts } from '@/hooks/useContracts'

export function ClientProjectSection() {
  const { formData, updateFormData } = useInvoiceStore()
  const { data: clients = [] } = useClients()
  const { data: contracts = [] } = useContracts()

  const clientContracts = formData.client_id
    ? contracts.filter((c) => c.client_id === formData.client_id && c.status !== 'archived')
    : []

  const handleClientChange = (clientId: string) => {
    updateFormData({ client_id: clientId || null, contract_id: null })
  }

  const handleContractChange = (contractId: string) => {
    if (!contractId) {
      updateFormData({ contract_id: null })
      return
    }
    const contract = contracts.find((c) => c.id === contractId)
    updateFormData({
      contract_id: contractId,
      ...(contract?.project_name ? {} : {}),
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-[14px] font-semibold text-text-base">
          Client & Project
        </h3>
        <p className="mt-0.5 text-[12px] text-text-muted">
          Select the client and link an existing contract if applicable.
        </p>
      </div>

      {/* Client dropdown */}
      <div>
        <label className="mb-1 block text-[12px] font-medium text-text-base">
          Client
        </label>
        <Select
          value={formData.client_id || ''}
          onChange={(e) => handleClientChange(e.target.value)}
          className="h-8 rounded-[6px] px-3 text-[13px]"
        >
          <option value="">Choose a client</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </Select>
        {clients.length === 0 && (
          <p className="mt-1 text-[11px] text-text-muted">
            Add a client in the Client Manager first.
          </p>
        )}
      </div>

      {/* Reference contract — only shown when client has contracts */}
      {clientContracts.length > 0 && (
        <div>
          <label className="mb-1 block text-[12px] font-medium text-text-base">
            Reference Contract
          </label>
          <Select
            value={formData.contract_id || ''}
            onChange={(e) => handleContractChange(e.target.value)}
            className="h-8 rounded-[6px] px-3 text-[13px]"
          >
            <option value="">None</option>
            {clientContracts.map((contract) => (
              <option key={contract.id} value={contract.id}>
                {contract.project_name || contract.contract_number}
              </option>
            ))}
          </Select>
          <p className="mt-1 text-[11px] text-text-muted">
            Optional — links this invoice to an existing contract.
          </p>
        </div>
      )}

      {/* Invoice number + dates */}
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="mb-1 block text-[12px] font-medium text-text-base">
            Invoice Number
          </label>
          <input
            type="text"
            value={formData.invoice_number || ''}
            onChange={(e) => updateFormData({ invoice_number: e.target.value })}
            placeholder="INV-001"
            className="theme-shell-field h-8 w-full rounded-[6px] px-3 text-[13px] focus-visible:border-[var(--primary)] focus-visible:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-[12px] font-medium text-text-base">
            Issue Date
          </label>
          <input
            type="date"
            value={formData.issue_date || ''}
            onChange={(e) => updateFormData({ issue_date: e.target.value })}
            className="theme-shell-field h-8 w-full rounded-[6px] px-3 text-[13px] focus-visible:border-[var(--primary)] focus-visible:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-[12px] font-medium text-text-base">
            Due Date
          </label>
          <input
            type="date"
            value={formData.due_date || ''}
            onChange={(e) => updateFormData({ due_date: e.target.value })}
            className="theme-shell-field h-8 w-full rounded-[6px] px-3 text-[13px] focus-visible:border-[var(--primary)] focus-visible:outline-none"
          />
        </div>
      </div>
    </div>
  )
}
