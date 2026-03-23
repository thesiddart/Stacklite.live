'use client'

import React, { useMemo, useState } from 'react'
import { AddBold, DocumentText1Bold, InfoCircleBold, TrashBold } from 'sicons'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { useClients } from '@/hooks/useClients'

interface InvoiceGeneratorProps {
  variant?: 'dashboard' | 'page'
}

interface LineItem {
  id: string
  description: string
  quantity: number
  rate: number
}

function formatDateForInput(date: Date) {
  return date.toISOString().slice(0, 10)
}

function addDays(date: Date, days: number) {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

function formatCurrency(value: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
    maximumFractionDigits: 2,
  }).format(value)
}

function getInvoiceNumber() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')

  return `INV-${year}${month}${day}`
}

function createLineItem(): LineItem {
  return {
    id: `line-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    description: '',
    quantity: 1,
    rate: 0,
  }
}

export function InvoiceGenerator({ variant = 'dashboard' }: InvoiceGeneratorProps) {
  const { data: clients = [] } = useClients()
  const [clientId, setClientId] = useState('')
  const [invoiceNumber, setInvoiceNumber] = useState(getInvoiceNumber())
  const [issueDate, setIssueDate] = useState(formatDateForInput(new Date()))
  const [dueDate, setDueDate] = useState(formatDateForInput(addDays(new Date(), 30)))
  const [currency, setCurrency] = useState('USD')
  const [taxRate, setTaxRate] = useState('10')
  const [discount, setDiscount] = useState('0')
  const [notes, setNotes] = useState('Thank you for the opportunity to collaborate.')
  const [terms, setTerms] = useState('Payment due within 30 days. Late payments may incur a service fee.')
  const [lineItems, setLineItems] = useState<LineItem[]>([
    {
      id: 'line-design',
      description: 'Discovery and design direction',
      quantity: 1,
      rate: 1200,
    },
    {
      id: 'line-build',
      description: 'Interface refinement and handoff',
      quantity: 1,
      rate: 900,
    },
  ])

  const selectedClient = clients.find((client) => client.id === clientId) ?? null
  const isPage = variant === 'page'

  const subtotal = useMemo(() => {
    return lineItems.reduce((sum, item) => sum + item.quantity * item.rate, 0)
  }, [lineItems])

  const discountValue = Number(discount) || 0
  const taxRateValue = Number(taxRate) || 0
  const taxableBase = Math.max(subtotal - discountValue, 0)
  const taxAmount = taxableBase * (taxRateValue / 100)
  const total = taxableBase + taxAmount

  const updateLineItem = (id: string, updates: Partial<LineItem>) => {
    setLineItems((current) => current.map((item) => (item.id === id ? { ...item, ...updates } : item)))
  }

  const removeLineItem = (id: string) => {
    setLineItems((current) => (current.length > 1 ? current.filter((item) => item.id !== id) : current))
  }

  return (
    <div className="flex h-full flex-col gap-lg">
      <div className="flex items-start justify-between gap-md">
        <div>
          {isPage && <h1 className="text-2xl font-semibold text-text-base">Invoice Generator</h1>}
          <p className="text-sm text-text-muted">
            Build professional invoices with dynamic line items, tax, and payment terms.
          </p>
        </div>

        <div className="rounded-full border border-border-muted bg-background-highlight/40 px-md py-sm text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">
          Placeholder
        </div>
      </div>

      <div className="rounded-lg border border-feedback-info-base/25 bg-feedback-info-base/10 p-md text-sm text-feedback-info-text">
        <div className="flex items-start gap-sm">
          <InfoCircleBold className="mt-[2px] h-4 w-4 flex-shrink-0" />
          This is the invoice drafting scaffold. Persistence, PDF generation, and invoice status automation will connect here next.
        </div>
      </div>

      <div className={`grid flex-1 gap-lg ${isPage ? 'xl:grid-cols-[minmax(380px,500px)_1fr]' : '2xl:grid-cols-[minmax(320px,430px)_1fr]'}`}>
        <div className="space-y-lg overflow-y-auto pr-xs">
          <div className="rounded-lg border border-border-muted bg-background-highlight/30 p-lg shadow-sm">
            <div className="grid gap-lg sm:grid-cols-2">
              <div className="space-y-sm sm:col-span-2">
                <label htmlFor="invoice-client" className="block text-sm font-medium text-text-base">
                  Client
                </label>
                <select
                  id="invoice-client"
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
                  <p className="text-xs text-text-muted">Add a client first to generate invoices against a real customer record.</p>
                )}
              </div>

              <Input label="Invoice Number" value={invoiceNumber} onChange={(event) => setInvoiceNumber(event.target.value)} />
              <Input label="Currency" value={currency} maxLength={3} onChange={(event) => setCurrency(event.target.value.toUpperCase())} />
              <Input label="Issue Date" type="date" value={issueDate} onChange={(event) => setIssueDate(event.target.value)} />
              <Input label="Due Date" type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
            </div>
          </div>

          <div className="rounded-lg border border-border-muted bg-background-highlight/30 p-lg shadow-sm">
            <div className="flex items-center justify-between gap-md">
              <div>
                <p className="text-sm font-semibold text-text-base">Line Items</p>
                <p className="text-xs text-text-muted">Add each billable service or deliverable.</p>
              </div>

              <Button type="button" size="sm" onClick={() => setLineItems((current) => [...current, createLineItem()])}>
                <AddBold className="h-4 w-4" />
                Add Row
              </Button>
            </div>

            <div className="mt-lg space-y-md">
              {lineItems.map((item, index) => (
                <div key={item.id} className="rounded-md border border-border-muted bg-background-base p-md">
                  <div className="mb-md flex items-center justify-between gap-md">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">Item {index + 1}</p>
                    <Button type="button" size="sm" variant="ghost" onClick={() => removeLineItem(item.id)} disabled={lineItems.length === 1}>
                      <TrashBold className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid gap-md sm:grid-cols-[1fr_110px_130px]">
                    <Input
                      label="Description"
                      value={item.description}
                      onChange={(event) => updateLineItem(item.id, { description: event.target.value })}
                      placeholder="Website audit, monthly retainer, design system..."
                    />
                    <Input
                      label="Quantity"
                      type="number"
                      min="0"
                      step="1"
                      value={String(item.quantity)}
                      onChange={(event) => updateLineItem(item.id, { quantity: Number(event.target.value) || 0 })}
                    />
                    <Input
                      label="Rate"
                      type="number"
                      min="0"
                      step="0.01"
                      value={String(item.rate)}
                      onChange={(event) => updateLineItem(item.id, { rate: Number(event.target.value) || 0 })}
                    />
                  </div>

                  <p className="mt-md text-right text-sm font-semibold text-text-base">
                    Amount: {formatCurrency(item.quantity * item.rate, currency)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-border-muted bg-background-highlight/30 p-lg shadow-sm">
            <div className="grid gap-lg sm:grid-cols-2">
              <Input
                label="Tax Rate (%)"
                type="number"
                min="0"
                step="0.01"
                value={taxRate}
                onChange={(event) => setTaxRate(event.target.value)}
              />
              <Input
                label="Discount"
                type="number"
                min="0"
                step="0.01"
                value={discount}
                onChange={(event) => setDiscount(event.target.value)}
              />
            </div>

            <div className="mt-lg grid gap-lg sm:grid-cols-2">
              <Textarea label="Notes" value={notes} onChange={(event) => setNotes(event.target.value)} rows={4} />
              <Textarea label="Terms" value={terms} onChange={(event) => setTerms(event.target.value)} rows={4} />
            </div>
          </div>

          <div className="flex flex-wrap gap-md">
            <Button type="button" className="min-w-[160px] justify-center">
              Prepare Invoice
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
            <div className="flex items-start justify-between gap-md">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-text-muted">Invoice</p>
                <h2 className="mt-sm text-xl font-semibold text-text-base">{invoiceNumber}</h2>
                <p className="mt-xs text-sm text-text-muted">Issued {issueDate || 'TBD'} • Due {dueDate || 'TBD'}</p>
              </div>

              <div className="rounded-full bg-background-base px-md py-sm text-xs font-medium text-text-base">
                Draft
              </div>
            </div>

            <div className="grid gap-lg md:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-text-muted">Bill To</p>
                <p className="mt-sm text-sm font-medium text-text-base">{selectedClient?.name ?? 'Select a client'}</p>
                <p className="mt-xs text-sm text-text-muted">{selectedClient?.email ?? 'Client email will appear here'}</p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-text-muted">Summary</p>
                <p className="mt-sm text-sm font-medium text-text-base">{lineItems.length} line items</p>
                <p className="mt-xs text-sm text-text-muted">Currency: {currency}</p>
              </div>
            </div>

            <div className="overflow-hidden rounded-lg border border-border-muted bg-background-base">
              <div className="grid grid-cols-[1fr_80px_110px_130px] gap-md border-b border-border-muted px-lg py-md text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">
                <span>Description</span>
                <span className="text-right">Qty</span>
                <span className="text-right">Rate</span>
                <span className="text-right">Amount</span>
              </div>

              {lineItems.map((item) => (
                <div key={item.id} className="grid grid-cols-[1fr_80px_110px_130px] gap-md border-b border-border-muted px-lg py-md text-sm text-text-base last:border-b-0">
                  <span>{item.description || 'Untitled item'}</span>
                  <span className="text-right">{item.quantity}</span>
                  <span className="text-right">{formatCurrency(item.rate, currency)}</span>
                  <span className="text-right">{formatCurrency(item.quantity * item.rate, currency)}</span>
                </div>
              ))}
            </div>

            <div className="ml-auto w-full max-w-sm space-y-sm rounded-lg border border-border-muted bg-background-base p-lg">
              <div className="flex items-center justify-between gap-md text-sm text-text-base">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal, currency)}</span>
              </div>
              <div className="flex items-center justify-between gap-md text-sm text-text-base">
                <span>Discount</span>
                <span>-{formatCurrency(discountValue, currency)}</span>
              </div>
              <div className="flex items-center justify-between gap-md text-sm text-text-base">
                <span>Tax ({taxRateValue}%)</span>
                <span>{formatCurrency(taxAmount, currency)}</span>
              </div>
              <div className="flex items-center justify-between gap-md border-t border-border-muted pt-sm text-base font-semibold text-text-base">
                <span>Total</span>
                <span>{formatCurrency(total, currency)}</span>
              </div>
            </div>

            <div className="grid gap-lg md:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-text-muted">Notes</p>
                <p className="mt-sm whitespace-pre-line text-sm leading-6 text-text-base">{notes || 'Invoice notes will appear here.'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-text-muted">Terms</p>
                <p className="mt-sm whitespace-pre-line text-sm leading-6 text-text-base">{terms || 'Payment terms will appear here.'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}