'use client'

import React, { useState } from 'react'
import { DocumentText1Bold, InfoCircleBold, MagicStarBold } from 'sicons'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { useClients } from '@/hooks/useClients'

interface ContractGeneratorProps {
  variant?: 'dashboard' | 'page'
}

function getContractNumber() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')

  return `CT-${year}${month}${day}`
}

export function ContractGenerator({ variant = 'dashboard' }: ContractGeneratorProps) {
  const { data: clients = [] } = useClients()
  const [clientId, setClientId] = useState('')
  const [projectDescription, setProjectDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [paymentTerms, setPaymentTerms] = useState('50% upfront, 50% on final approval')
  const [deliverables, setDeliverables] = useState('Discovery workshop\nDesign direction\nFinal files and handoff')
  const [totalAmount, setTotalAmount] = useState('2500')
  const [currency, setCurrency] = useState('USD')

  const selectedClient = clients.find((client) => client.id === clientId) ?? null
  const contractNumber = getContractNumber()
  const isPage = variant === 'page'

  return (
    <div className="flex h-full flex-col gap-lg">
      <div className="flex items-start justify-between gap-md">
        <div>
          {isPage && <h1 className="text-2xl font-semibold text-text-base">Contract Generator</h1>}
          <p className="text-sm text-text-muted">
            Draft your next agreement with the right client, scope, timeline, and pricing.
          </p>
        </div>
        <div className="rounded-full border border-border-muted bg-background-highlight/40 px-md py-sm text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">
          Placeholder
        </div>
      </div>

      <div className="rounded-lg border border-feedback-info-base/25 bg-feedback-info-base/10 p-md text-sm text-feedback-info-text">
        <div className="flex items-start gap-sm">
          <InfoCircleBold className="mt-[2px] h-4 w-4 flex-shrink-0" />
          This is the contract drafting scaffold. Save, database sync, and PDF export will plug into this form next.
        </div>
      </div>

      <div className={`grid flex-1 gap-lg ${isPage ? 'xl:grid-cols-[minmax(360px,460px)_1fr]' : '2xl:grid-cols-[minmax(300px,360px)_1fr]'}`}>
        <div className="space-y-lg overflow-y-auto pr-xs">
          <div className="rounded-lg border border-border-muted bg-background-highlight/30 p-lg shadow-sm">
            <div className="flex items-center gap-sm text-sm font-semibold text-text-base">
              <MagicStarBold className="h-4 w-4" />
              Draft Details
            </div>

            <div className="mt-lg space-y-lg">
              <div className="space-y-sm">
                <label htmlFor="contract-client" className="block text-sm font-medium text-text-base">
                  Client
                </label>
                <select
                  id="contract-client"
                  value={clientId}
                  onChange={(event) => setClientId(event.target.value)}
                  className="w-full rounded-md border-2 border-border-base bg-background-base px-lg py-md text-text-base transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-text-brand"
                >
                  <option value="">Choose a client</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
                {clients.length === 0 && (
                  <p className="text-xs text-text-muted">Add a client first to attach this contract to a real contact.</p>
                )}
              </div>

              <Input label="Contract Number" value={contractNumber} readOnly />

              <Textarea
                label="Project Description"
                value={projectDescription}
                onChange={(event) => setProjectDescription(event.target.value)}
                placeholder="Describe the scope of work, the business problem, and the expected output."
                rows={5}
              />

              <div className="grid gap-lg sm:grid-cols-2">
                <Input
                  label="Start Date"
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                />
                <Input
                  label="End Date"
                  type="date"
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                />
              </div>

              <Textarea
                label="Payment Terms"
                value={paymentTerms}
                onChange={(event) => setPaymentTerms(event.target.value)}
                placeholder="Retainer, milestones, final payment terms..."
                rows={4}
              />

              <Textarea
                label="Deliverables"
                value={deliverables}
                onChange={(event) => setDeliverables(event.target.value)}
                placeholder="List the deliverables included in the agreement."
                rows={5}
              />

              <div className="grid gap-lg sm:grid-cols-[120px_1fr]">
                <Input
                  label="Currency"
                  value={currency}
                  onChange={(event) => setCurrency(event.target.value.toUpperCase())}
                  maxLength={3}
                />
                <Input
                  label="Total Amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={totalAmount}
                  onChange={(event) => setTotalAmount(event.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-md">
            <Button type="button" className="min-w-[160px] justify-center">
              Prepare Draft
            </Button>
            <Button type="button" variant="outline" className="min-w-[160px] justify-center" disabled>
              PDF Export Next
            </Button>
          </div>
        </div>

        <div className="rounded-lg border border-border-muted bg-background-base p-lg shadow-sm">
          <div className="flex items-center gap-sm text-sm font-semibold text-text-base">
            <DocumentText1Bold className="h-4 w-4" />
            Live Preview
          </div>

          <div className="mt-lg space-y-lg rounded-lg border border-border-muted bg-background-highlight/20 p-xl">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-text-muted">Agreement</p>
              <h2 className="mt-sm text-xl font-semibold text-text-base">
                {selectedClient ? `${selectedClient.name} Service Agreement` : 'Client Service Agreement'}
              </h2>
              <p className="mt-xs text-sm text-text-muted">Contract Number: {contractNumber}</p>
            </div>

            <div className="grid gap-lg md:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-text-muted">Client</p>
                <p className="mt-sm text-sm font-medium text-text-base">
                  {selectedClient?.name ?? 'Select a client'}
                </p>
                <p className="mt-xs text-sm text-text-muted">{selectedClient?.email ?? 'Client email will appear here'}</p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-text-muted">Timeline</p>
                <p className="mt-sm text-sm font-medium text-text-base">
                  {startDate || endDate ? `${startDate || 'TBD'} to ${endDate || 'TBD'}` : 'Start and end dates pending'}
                </p>
                <p className="mt-xs text-sm text-text-muted">
                  Total value: {currency} {totalAmount || '0'}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-text-muted">Project Scope</p>
              <p className="mt-sm whitespace-pre-line text-sm leading-6 text-text-base">
                {projectDescription || 'Add a project description to define the scope, boundaries, and expected outcome.'}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-text-muted">Deliverables</p>
              <p className="mt-sm whitespace-pre-line text-sm leading-6 text-text-base">
                {deliverables || 'List each deliverable that the client will receive.'}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-text-muted">Payment Terms</p>
              <p className="mt-sm whitespace-pre-line text-sm leading-6 text-text-base">
                {paymentTerms || 'Define the invoicing schedule, deposit requirements, and payment deadlines.'}
              </p>
            </div>

            <div className="rounded-md border border-border-muted bg-background-base p-md text-xs text-text-muted">
              This preview is intentionally lightweight. The next iteration will connect Zod validation, draft persistence, and PDF generation.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}