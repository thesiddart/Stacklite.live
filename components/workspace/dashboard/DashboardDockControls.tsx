'use client'

import React from 'react'
import {
  Chart2Bold,
  DocumentText1Bold,
  WalletBold,
} from 'sicons'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

export type DashboardDockControlsProps = {
  activeDockTab: 'contract' | 'invoice' | 'income' | null
  toggleDockTab: (tab: 'contract' | 'invoice' | 'income') => void
}

export function DashboardDockControls({
  activeDockTab,
  toggleDockTab,
}: DashboardDockControlsProps) {
  return (
    <footer className="theme-shell-card absolute bottom-8 left-1/2 z-10 flex h-12 -translate-x-1/2 items-center gap-[10px] rounded-[14px] p-2">
      {activeDockTab === 'contract' ? (
        <button
          type="button"
          onClick={() => toggleDockTab('contract')}
          aria-pressed
          className="theme-shell-chip inline-flex h-8 items-center justify-center gap-1 overflow-hidden whitespace-nowrap rounded-[8px] px-2 text-[14px] font-medium text-[var(--tertiary)] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
        >
          <DocumentText1Bold size={16} />
          Contract Generator
        </button>
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={() => toggleDockTab('contract')}
              aria-pressed={false}
              className="inline-flex h-8 w-8 items-center justify-center overflow-hidden whitespace-nowrap text-[var(--tertiary)] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
            >
              <DocumentText1Bold size={16} />
            </button>
          </TooltipTrigger>
          <TooltipContent>Contract Generator</TooltipContent>
        </Tooltip>
      )}

      <div className="theme-shell-divider h-8 w-px" />

      {activeDockTab === 'invoice' ? (
        <button
          type="button"
          onClick={() => toggleDockTab('invoice')}
          aria-pressed
          className="theme-shell-chip inline-flex h-8 items-center justify-center gap-1 overflow-hidden whitespace-nowrap rounded-[8px] px-2 text-[14px] font-medium text-[var(--tertiary)] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
        >
          <WalletBold size={16} />
          Invoice Generator
        </button>
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={() => toggleDockTab('invoice')}
              aria-pressed={false}
              className="inline-flex h-8 w-8 items-center justify-center overflow-hidden whitespace-nowrap text-[var(--tertiary)] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
            >
              <WalletBold size={16} />
            </button>
          </TooltipTrigger>
          <TooltipContent>Invoice Generator</TooltipContent>
        </Tooltip>
      )}

      <div className="theme-shell-divider h-8 w-px" />

      {activeDockTab === 'income' ? (
        <button
          type="button"
          onClick={() => toggleDockTab('income')}
          aria-pressed
          className="theme-shell-chip inline-flex h-8 items-center justify-center gap-1 overflow-hidden whitespace-nowrap rounded-[8px] px-2 text-[14px] font-medium text-[var(--tertiary)] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
        >
          <Chart2Bold size={16} />
          Income Tracker
        </button>
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={() => toggleDockTab('income')}
              aria-pressed={false}
              className="inline-flex h-8 w-8 items-center justify-center overflow-hidden whitespace-nowrap text-[var(--tertiary)] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
            >
              <Chart2Bold size={16} />
            </button>
          </TooltipTrigger>
          <TooltipContent>Income Tracker</TooltipContent>
        </Tooltip>
      )}
    </footer>
  )
}
