'use client'

import { useEffect } from 'react'
import { useInvoiceStore } from '@/stores/invoiceStore'
import { useInvoices } from '@/hooks/useInvoices'
import { InvoiceEditor } from './InvoiceEditor'
import { InvoicesList } from './InvoicesList'

interface InvoiceGeneratorProps {
  variant?: 'dashboard' | 'page'
}

export function InvoiceGenerator({ variant = 'dashboard' }: InvoiceGeneratorProps) {
  const { view, setView } = useInvoiceStore()
  const { data: invoices = [] } = useInvoices()

  // On mount: show list if invoices exist, otherwise start a new invoice
  useEffect(() => {
    if (invoices.length > 0 && view === 'editor' && !useInvoiceStore.getState().activeInvoiceId && !useInvoiceStore.getState().isDirty) {
      setView('list')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const isPage = variant === 'page'

  // If no invoices and on list view, show empty state via InvoicesList
  // which has its own "Create your first invoice" CTA

  return (
    <div
      className={`flex flex-col ${
        isPage ? 'h-[calc(100vh-200px)] min-h-[600px]' : 'h-full'
      }`}
    >
      {isPage && (
        <div className="mb-4">
          <h1 className="text-2xl font-semibold text-text-base">Invoice Generator</h1>
          <p className="mt-1 text-sm text-text-muted">
            Build professional invoices with dynamic line items, tax, and payment terms.
          </p>
        </div>
      )}

      <div className="min-h-0 flex-1">
        {view === 'list' && <InvoicesList />}
        {view === 'editor' && <InvoiceEditor />}
      </div>
    </div>
  )
}
