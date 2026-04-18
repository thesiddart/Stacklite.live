'use client'

import React from 'react'
import { ContractGenerator } from '@/components/modules/ContractGenerator'
import { InvoiceGenerator } from '@/components/modules/InvoiceGenerator'
import { ClientManager } from '@/components/modules/ClientManager'
import { IncomeTracker } from '@/components/modules/IncomeTracker'
import { useMobileNavStore } from '@/stores/mobileNavStore'

type DashboardMobileModuleViewProps = {
  onOpenInvoiceFromIncome: (invoiceId: string) => void
  onOpenInvoiceGenerator: () => void
}

export function DashboardMobileModuleView({
  onOpenInvoiceFromIncome,
  onOpenInvoiceGenerator,
}: DashboardMobileModuleViewProps) {
  const activeTab = useMobileNavStore((s) => s.activeTab)

  return (
    <main className="mobile-scroll-area isolate min-h-0 flex-1 overflow-y-auto overscroll-y-contain rounded-2xl border border-border-base bg-background-base p-3 shadow-sm sm:p-4">
      {activeTab === 'contracts' && <ContractGenerator variant="dashboard" />}
      {activeTab === 'invoices' && <InvoiceGenerator variant="dashboard" />}
      {activeTab === 'clients' && <ClientManager variant="dashboard" />}
      {activeTab === 'income' && (
        <IncomeTracker
          variant="dashboard"
          onOpenInvoice={onOpenInvoiceFromIncome}
          onOpenInvoiceGenerator={onOpenInvoiceGenerator}
        />
      )}
    </main>
  )
}
