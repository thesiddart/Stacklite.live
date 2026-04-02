import Link from 'next/link'
import type { Metadata } from 'next'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import type { Database, Invoice as InvoiceRow } from '@/lib/types/database'

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
}

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
    .neq('status', 'draft')
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
        .neq('status', 'draft')
        .maybeSingle()

      invoice = adminInvoice
    }
  }

  if (!invoice) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-muted">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-text-base">
            Invoice not found
          </h1>
          <p className="mt-2 text-sm text-text-muted">
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
      ? 'bg-feedback-success-bg text-feedback-success-text'
      : displayStatus === 'overdue'
        ? 'bg-feedback-error-bg text-feedback-error-text'
        : displayStatus === 'unpaid'
          ? 'bg-feedback-warning-bg text-feedback-warning-text'
          : 'bg-background-muted text-text-muted'

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
          <div className="flex items-start justify-between border-b border-border-muted pb-6">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-text-muted">
                Invoice
              </p>
              <h1 className="mt-2 text-[22px] font-bold leading-tight text-text-base">
                {typedInvoice.invoice_number}
              </h1>
              <p className="mt-1 text-[13px] text-text-muted">
                Issued {typedInvoice.issue_date} &middot; Due {typedInvoice.due_date}
              </p>
            </div>
            <span className={`inline-flex items-center rounded-[6px] px-3 py-1 text-[12px] font-semibold ${statusColor}`}>
              {statusLabel}
            </span>
          </div>

          {/* Client */}
          {client && (
            <div className="mt-6 border-b border-border-muted pb-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">
                Bill To
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

          {/* Line items table */}
          {lineItems.length > 0 && (
            <div className="mt-6 border-b border-border-muted pb-6">
              <div className="overflow-hidden rounded-[10px] border border-border-muted">
                <div className="grid grid-cols-[1fr_70px_100px_110px] gap-2 border-b border-border-muted bg-background-highlight px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">
                  <span>Description</span>
                  <span className="text-right">Qty</span>
                  <span className="text-right">Rate</span>
                  <span className="text-right">Amount</span>
                </div>
                {lineItems.map((item, index) => (
                  <div
                    key={item.id || index}
                    className="grid grid-cols-[1fr_70px_100px_110px] gap-2 border-b border-border-muted px-4 py-3 text-[14px] text-text-base last:border-b-0"
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
          <div className="mt-6 ml-auto w-full max-w-[280px] space-y-2 border-b border-border-muted pb-6">
            <div className="flex justify-between text-[13px] text-text-muted">
              <span>Subtotal</span>
              <span>{formatCurrency(typedInvoice.subtotal, typedInvoice.currency)}</span>
            </div>
            {taxAmount > 0 && (
              <div className="flex justify-between text-[13px] text-text-muted">
                <span>Tax ({typedInvoice.tax_rate}%)</span>
                <span>{formatCurrency(taxAmount, typedInvoice.currency)}</span>
              </div>
            )}
            {discountAmount > 0 && (
              <div className="flex justify-between text-[13px] text-text-muted">
                <span>Discount</span>
                <span>-{formatCurrency(discountAmount, typedInvoice.currency)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-border-muted pt-2 text-[18px] font-bold text-text-base">
              <span>Total</span>
              <span>{formatCurrency(typedInvoice.total, typedInvoice.currency)}</span>
            </div>
          </div>

          {/* Payment info */}
          {(typedInvoice.payment_method || typedInvoice.payment_instructions) && (
            <div className="mt-6 border-b border-border-muted pb-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">
                Payment
              </p>
              {typedInvoice.payment_method && (
                <p className="mt-2 text-[14px] font-medium text-text-base">
                  {typedInvoice.payment_method}
                </p>
              )}
              {typedInvoice.payment_instructions && (
                <p className="mt-1 whitespace-pre-line text-[13px] leading-[20px] text-text-muted">
                  {typedInvoice.payment_instructions}
                </p>
              )}
            </div>
          )}

          {/* Notes (never show internal_notes) */}
          {typedInvoice.notes_to_client && (
            <div className="mt-6 border-b border-border-muted pb-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">
                Notes
              </p>
              <p className="mt-2 whitespace-pre-line text-[14px] leading-[22px] text-text-base">
                {typedInvoice.notes_to_client}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            type="button"
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

      <script
        dangerouslySetInnerHTML={{
          __html: `document.getElementById('print-button')?.addEventListener('click', function() { window.print(); })`,
        }}
      />
    </div>
  )
}
