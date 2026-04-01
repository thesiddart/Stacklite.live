import Link from 'next/link'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import type { Database, Invoice as InvoiceRow } from '@/lib/types/database'

interface InvoiceLineItem {
  id: string
  description: string
  qty: number
  rate: number
  amount: number
}

interface SharedClient {
  name: string
  email: string | null
  company_name: string | null
}

function formatCurrency(value: number, currency: string) {
  const normalizedCurrency =
    typeof currency === 'string' && /^[A-Z]{3}$/.test(currency.trim().toUpperCase())
      ? currency.trim().toUpperCase()
      : 'USD'

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: normalizedCurrency,
      maximumFractionDigits: 2,
    }).format(value)
  } catch {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    }).format(value)
  }
}

export default async function SharedInvoicePage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const supabase = await createClient()
  let adminSupabase: ReturnType<typeof createSupabaseClient<Database>> | null = null

  const { data: invoiceData } = await supabase
    .from('invoices')
    .select('*')
    .eq('share_token', token)
    .maybeSingle()

  let invoice = invoiceData

  if (!invoice) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()

    if (supabaseUrl && serviceRoleKey) {
      adminSupabase = createSupabaseClient<Database>(supabaseUrl, serviceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })

      const { data: adminInvoice } = await adminSupabase
        .from('invoices')
        .select('*')
        .eq('share_token', token)
        .maybeSingle()

      invoice = adminInvoice
    }
  }

  if (!invoice) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f9f9f9]">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-[#1a163d]">
            Invoice not found
          </h1>
          <p className="mt-2 text-sm text-[#7c7288]">
            This link may have expired or the invoice is unavailable.
          </p>
        </div>
      </div>
    )
  }

  const typedInvoice = invoice as InvoiceRow

  let client: SharedClient | null = null

  if (typedInvoice.client_id) {
    const { data: clientData } = await supabase
      .from('clients')
      .select('name, email, company_name')
      .eq('id', typedInvoice.client_id)
      .maybeSingle()

    client = clientData

    if (!client && adminSupabase) {
      const { data: adminClientData } = await adminSupabase
        .from('clients')
        .select('name, email, company_name')
        .eq('id', typedInvoice.client_id)
        .maybeSingle()

      client = adminClientData
    }
  }

  const lineItems: InvoiceLineItem[] = Array.isArray(typedInvoice.line_items)
    ? (typedInvoice.line_items as unknown as InvoiceLineItem[])
    : []

  const isOverdue =
    typedInvoice.status === 'unpaid' && new Date(typedInvoice.due_date) < new Date()
  const displayStatus = isOverdue ? 'overdue' : typedInvoice.status

  const statusLabel =
    displayStatus === 'paid'
      ? 'Paid'
      : displayStatus === 'overdue'
        ? 'Overdue'
        : displayStatus === 'unpaid'
          ? 'Unpaid'
          : 'Draft'

  const statusColor =
    displayStatus === 'paid'
      ? 'bg-[rgba(0,126,0,0.12)] text-[#007e00]'
      : displayStatus === 'overdue'
        ? 'bg-[rgba(220,38,38,0.12)] text-[#dc2626]'
        : displayStatus === 'unpaid'
          ? 'bg-[rgba(234,179,0,0.12)] text-[#b38600]'
          : 'bg-[#f0edf8] text-[#5c5c5c]'

  const taxAmount = typedInvoice.tax_rate
    ? parseFloat(((typedInvoice.subtotal * typedInvoice.tax_rate) / 100).toFixed(2))
    : 0

  const discountAmount = (() => {
    if (!typedInvoice.discount_type || !typedInvoice.discount_value) return 0
    return typedInvoice.discount_type === 'percent'
      ? parseFloat(((typedInvoice.subtotal * typedInvoice.discount_value) / 100).toFixed(2))
      : typedInvoice.discount_value
  })()

  return (
    <div className="min-h-screen bg-[#f9f9f9]">
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
        <div className="rounded-[16px] border border-[#e8e4f6] bg-white p-8 shadow-sm">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-[#e8e4f6] pb-6">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7c7288]">
                Invoice
              </p>
              <h1 className="mt-2 text-[22px] font-bold leading-tight text-[#1a163d]">
                {typedInvoice.invoice_number}
              </h1>
              <p className="mt-1 text-[13px] text-[#7c7288]">
                Issued {typedInvoice.issue_date} &middot; Due {typedInvoice.due_date}
              </p>
            </div>
            <span className={`inline-flex items-center rounded-[6px] px-3 py-1 text-[12px] font-semibold ${statusColor}`}>
              {statusLabel}
            </span>
          </div>

          {/* Client */}
          {client && (
            <div className="mt-6 border-b border-[#e8e4f6] pb-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7c7288]">
                Bill To
              </p>
              <p className="mt-2 text-[14px] font-medium text-[#1a163d]">
                {client.name}
              </p>
              {client.email && (
                <p className="text-[13px] text-[#7c7288]">{client.email}</p>
              )}
              {client.company_name && (
                <p className="text-[13px] text-[#7c7288]">{client.company_name}</p>
              )}
            </div>
          )}

          {/* Line items table */}
          {lineItems.length > 0 && (
            <div className="mt-6 border-b border-[#e8e4f6] pb-6">
              <div className="overflow-hidden rounded-[10px] border border-[#e8e4f6]">
                <div className="grid grid-cols-[1fr_70px_100px_110px] gap-2 border-b border-[#e8e4f6] bg-[#f6f4fc] px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7c7288]">
                  <span>Description</span>
                  <span className="text-right">Qty</span>
                  <span className="text-right">Rate</span>
                  <span className="text-right">Amount</span>
                </div>
                {lineItems.map((item, index) => (
                  <div
                    key={item.id || index}
                    className="grid grid-cols-[1fr_70px_100px_110px] gap-2 border-b border-[#e8e4f6] px-4 py-3 text-[14px] text-[#1a163d] last:border-b-0"
                  >
                    <span>{item.description}</span>
                    <span className="text-right">{item.qty}</span>
                    <span className="text-right">{formatCurrency(item.rate, typedInvoice.currency)}</span>
                    <span className="text-right">{formatCurrency(item.amount, typedInvoice.currency)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Totals */}
          <div className="mt-6 ml-auto w-full max-w-[280px] space-y-2 border-b border-[#e8e4f6] pb-6">
            <div className="flex justify-between text-[13px] text-[#7c7288]">
              <span>Subtotal</span>
              <span>{formatCurrency(typedInvoice.subtotal, typedInvoice.currency)}</span>
            </div>
            {taxAmount > 0 && (
              <div className="flex justify-between text-[13px] text-[#7c7288]">
                <span>Tax ({typedInvoice.tax_rate}%)</span>
                <span>{formatCurrency(taxAmount, typedInvoice.currency)}</span>
              </div>
            )}
            {discountAmount > 0 && (
              <div className="flex justify-between text-[13px] text-[#7c7288]">
                <span>Discount</span>
                <span>-{formatCurrency(discountAmount, typedInvoice.currency)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-[#e8e4f6] pt-2 text-[18px] font-bold text-[#1a163d]">
              <span>Total</span>
              <span>{formatCurrency(typedInvoice.total, typedInvoice.currency)}</span>
            </div>
          </div>

          {/* Payment info */}
          {(typedInvoice.payment_method || typedInvoice.payment_instructions) && (
            <div className="mt-6 border-b border-[#e8e4f6] pb-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7c7288]">
                Payment
              </p>
              {typedInvoice.payment_method && (
                <p className="mt-2 text-[14px] font-medium text-[#1a163d]">
                  {typedInvoice.payment_method}
                </p>
              )}
              {typedInvoice.payment_instructions && (
                <p className="mt-1 whitespace-pre-line text-[13px] leading-[20px] text-[#7c7288]">
                  {typedInvoice.payment_instructions}
                </p>
              )}
            </div>
          )}

          {/* Notes (never show internal_notes) */}
          {typedInvoice.notes_to_client && (
            <div className="mt-6 border-b border-[#e8e4f6] pb-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7c7288]">
                Notes
              </p>
              <p className="mt-2 whitespace-pre-line text-[14px] leading-[22px] text-[#1a163d]">
                {typedInvoice.notes_to_client}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            type="button"
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

      <script
        dangerouslySetInnerHTML={{
          __html: `document.getElementById('print-button')?.addEventListener('click', function() { window.print(); })`,
        }}
      />
    </div>
  )
}
