'use client'

import React from 'react'
import {
  Chart2Bold,
  DocumentText1Bold,
  PeopleBold,
  WalletBold,
} from 'sicons'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useMobileNavStore } from '@/stores/mobileNavStore'
import type { MobileDashboardTabId } from '@/lib/navigation/workspaceModules'

/**
 * Same chip + divider pattern as {@link DashboardDockControls}. Rendered in normal flex flow
 * (not fixed) so it stays centered with page padding and keeps a clear gap above the module.
 */
export function DashboardMobileDockControls() {
  const activeTab = useMobileNavStore((s) => s.activeTab)
  const setActiveTab = useMobileNavStore((s) => s.setActiveTab)

  const go = (tab: MobileDashboardTabId) => () => {
    setActiveTab(tab)
  }

  return (
    <footer className="flex w-full min-w-0 shrink-0 justify-center md:hidden" aria-label="Workspace modules">
      <div className="theme-shell-card flex h-12 w-fit max-w-[min(calc(100vw-2rem),560px)] items-center justify-center gap-1 overflow-x-auto overflow-y-hidden rounded-[14px] p-2 [scrollbar-width:none] sm:gap-[10px] [&::-webkit-scrollbar]:hidden">
        {activeTab === 'contracts' ? (
          <button
            type="button"
            onClick={go('contracts')}
            aria-pressed
            className="theme-shell-chip inline-flex h-8 max-w-[45vw] shrink-0 items-center justify-center gap-1 overflow-hidden rounded-[8px] px-2 text-[12px] font-medium text-[var(--tertiary)] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] sm:max-w-none sm:text-[14px]"
          >
            <DocumentText1Bold size={16} className="shrink-0" />
            <span className="truncate">Contract Generator</span>
          </button>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={go('contracts')}
                aria-pressed={false}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden text-[var(--tertiary)] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
              >
                <DocumentText1Bold size={16} />
              </button>
            </TooltipTrigger>
            <TooltipContent>Contract Generator</TooltipContent>
          </Tooltip>
        )}

        <div className="theme-shell-divider h-8 w-px shrink-0" />

        {activeTab === 'invoices' ? (
          <button
            type="button"
            onClick={go('invoices')}
            aria-pressed
            className="theme-shell-chip inline-flex h-8 max-w-[45vw] shrink-0 items-center justify-center gap-1 overflow-hidden rounded-[8px] px-2 text-[12px] font-medium text-[var(--tertiary)] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] sm:max-w-none sm:text-[14px]"
          >
            <WalletBold size={16} className="shrink-0" />
            <span className="truncate">Invoice Generator</span>
          </button>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={go('invoices')}
                aria-pressed={false}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden text-[var(--tertiary)] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
              >
                <WalletBold size={16} />
              </button>
            </TooltipTrigger>
            <TooltipContent>Invoice Generator</TooltipContent>
          </Tooltip>
        )}

        <div className="theme-shell-divider h-8 w-px shrink-0" />

        {activeTab === 'income' ? (
          <button
            type="button"
            onClick={go('income')}
            aria-pressed
            className="theme-shell-chip inline-flex h-8 max-w-[45vw] shrink-0 items-center justify-center gap-1 overflow-hidden rounded-[8px] px-2 text-[12px] font-medium text-[var(--tertiary)] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] sm:max-w-none sm:text-[14px]"
          >
            <Chart2Bold size={16} className="shrink-0" />
            <span className="truncate">Income Tracker</span>
          </button>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={go('income')}
                aria-pressed={false}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden text-[var(--tertiary)] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
              >
                <Chart2Bold size={16} />
              </button>
            </TooltipTrigger>
            <TooltipContent>Income Tracker</TooltipContent>
          </Tooltip>
        )}

        <div className="theme-shell-divider h-8 w-px shrink-0" />

        {activeTab === 'clients' ? (
          <button
            type="button"
            onClick={go('clients')}
            aria-pressed
            className="theme-shell-chip inline-flex h-8 max-w-[45vw] shrink-0 items-center justify-center gap-1 overflow-hidden rounded-[8px] px-2 text-[12px] font-medium text-[var(--tertiary)] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] sm:max-w-none sm:text-[14px]"
          >
            <PeopleBold size={16} className="shrink-0" />
            <span className="truncate">Client Manager</span>
          </button>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={go('clients')}
                aria-pressed={false}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden text-[var(--tertiary)] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
              >
                <PeopleBold size={16} />
              </button>
            </TooltipTrigger>
            <TooltipContent>Client Manager</TooltipContent>
          </Tooltip>
        )}
      </div>
    </footer>
  )
}
