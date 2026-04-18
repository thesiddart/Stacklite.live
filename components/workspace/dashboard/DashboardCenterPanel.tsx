'use client'

import React from 'react'
import {
  Chart2Bold,
  CloseCircleBold,
  DocumentText1Bold,
  WalletBold,
} from 'sicons'
import { ContractGenerator } from '@/components/modules/ContractGenerator'
import { InvoiceGenerator } from '@/components/modules/InvoiceGenerator'
import { IncomeTracker } from '@/components/modules/IncomeTracker'

export type DashboardCenterPanelProps = {
  shouldShowCenterPanel: boolean
  isCenterFormActive: boolean
  activeDockTab: 'contract' | 'invoice' | 'income' | null
  contractView: 'templates' | 'list' | 'editor'
  invoiceView: 'list' | 'editor'
  setContractView: (view: 'templates' | 'list' | 'editor') => void
  setInvoiceView: (view: 'list' | 'editor') => void
  setActiveDockTab: React.Dispatch<React.SetStateAction<'contract' | 'invoice' | 'income' | null>>
  onOpenInvoiceFromIncome: (invoiceId: string) => void
}

export function DashboardCenterPanel({
  shouldShowCenterPanel,
  isCenterFormActive,
  activeDockTab,
  contractView,
  invoiceView,
  setContractView,
  setInvoiceView,
  setActiveDockTab,
  onOpenInvoiceFromIncome,
}: DashboardCenterPanelProps) {
  const centerPanelTitle = activeDockTab === 'invoice'
    ? 'Invoice Generator'
    : activeDockTab === 'income'
      ? 'Income Tracker'
      : 'Contract Generator'

  const shouldShowContractBackButton =
    activeDockTab === 'contract' && contractView === 'templates'

  const CenterPanelIcon = activeDockTab === 'invoice'
    ? WalletBold
    : activeDockTab === 'income'
      ? Chart2Bold
      : DocumentText1Bold

  return (
    <section
      aria-hidden={!shouldShowCenterPanel}
      className={`absolute z-10 flex flex-col gap-2 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        isCenterFormActive
          ? 'bottom-28 left-[214px] right-[214px] top-[120px] w-auto translate-x-0'
          : 'bottom-28 left-1/2 top-[120px] w-[min(90%,700px)] -translate-x-1/2 max-h-[calc(100vh-200px)] lg:w-[min(50vw,900px)]'
      } ${
        shouldShowCenterPanel
          ? 'pointer-events-auto opacity-100 translate-y-0 scale-100'
          : 'pointer-events-none opacity-0 translate-y-3 scale-[0.98]'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="inline-flex w-fit items-center gap-1">
          <div className="theme-shell-chip-strong inline-flex h-8 w-8 items-center justify-center rounded-[3px] transition-colors duration-200">
            <CenterPanelIcon size={16} />
          </div>
          <div className="theme-shell-chip-strong inline-flex h-8 items-center rounded-[4px] px-4 transition-all duration-200">
            <span className="text-[14px] font-medium">
              {centerPanelTitle}
            </span>
          </div>
        </div>

        {shouldShowContractBackButton && (
          <button
            type="button"
            onClick={() => setContractView('list')}
            className="theme-shell-chip-strong inline-flex h-8 w-8 items-center justify-center rounded-[3px] text-[var(--tertiary)] transition-colors duration-200 hover:text-[var(--primary)]"
            aria-label="Back from Contract Generator"
          >
            <CloseCircleBold size={16} />
          </button>
        )}

        {!shouldShowContractBackButton && ((activeDockTab === 'contract' && contractView === 'editor') ||
          (activeDockTab === 'invoice' && invoiceView === 'editor')) && (
          <button
            type="button"
            onClick={() => {
              if (activeDockTab === 'contract') {
                setContractView('list')
                return
              }

              if (activeDockTab === 'invoice') {
                setInvoiceView('list')
              }
            }}
            className="theme-shell-chip-strong inline-flex h-8 w-8 items-center justify-center rounded-[3px] text-[var(--tertiary)] transition-colors duration-200 hover:text-[var(--primary)]"
            aria-label={`Close ${centerPanelTitle}`}
          >
            <CloseCircleBold size={16} />
          </button>
        )}

      </div>
      <div className="theme-shell-panel relative flex-1 min-h-0 overflow-visible rounded-[14px] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]">
        <div className="h-full min-h-0 overflow-visible rounded-[14px]">
          {activeDockTab === 'contract' ? (
            <div className="h-full overflow-visible rounded-[10px] border border-[var(--surface-divider)] bg-[var(--surface-overlay)] p-4 theme-scrollbar">
              <ContractGenerator variant="dashboard" />
            </div>
          ) : activeDockTab === 'invoice' ? (
            <div className="h-full overflow-visible rounded-[10px] border border-[var(--surface-divider)] bg-[var(--surface-overlay)] p-4 theme-scrollbar">
              <InvoiceGenerator variant="dashboard" />
            </div>
          ) : activeDockTab === 'income' ? (
            <div className="h-full overflow-visible rounded-[10px] border border-[var(--surface-divider)] bg-[var(--surface-overlay)] p-4 theme-scrollbar">
              <IncomeTracker
                variant="dashboard"
                onOpenInvoice={onOpenInvoiceFromIncome}
                onOpenInvoiceGenerator={() => {
                  setActiveDockTab('invoice')
                  setInvoiceView('list')
                }}
              />
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center rounded-[10px] border border-[var(--surface-divider)] bg-[var(--surface-overlay)] text-center">
              <CenterPanelIcon size={28} className="text-[var(--tertiary)]" />
              <p className="mt-2 text-sm font-medium text-[var(--tertiary)]">{centerPanelTitle}</p>
              <p className="mt-1 max-w-[280px] text-xs text-text-muted">
                This module is coming soon.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
