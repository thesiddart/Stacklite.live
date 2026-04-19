'use client'

import React from 'react'
import { Chart2Bold, DocumentText1Bold, PeopleBold, WalletBold } from 'sicons'
import type { MobileDashboardTabId } from '@/lib/navigation/workspaceModules'
import { useMobileNavStore } from '@/stores/mobileNavStore'

const tabs: Array<{
  id: MobileDashboardTabId
  label: string
  Icon: typeof DocumentText1Bold
}> = [
  { id: 'contracts', label: 'Contracts', Icon: DocumentText1Bold },
  { id: 'invoices', label: 'Invoices', Icon: WalletBold },
  { id: 'clients', label: 'Clients', Icon: PeopleBold },
  { id: 'income', label: 'Income', Icon: Chart2Bold },
]

export function DashboardMobileBottomNav() {
  const activeTab = useMobileNavStore((s) => s.activeTab)
  const setActiveTab = useMobileNavStore((s) => s.setActiveTab)

  return (
    <nav
      className="flex shrink-0 items-stretch border-t border-border-base bg-background-base pb-[max(0.5rem,env(safe-area-inset-bottom))] md:hidden"
      aria-label="Workspace modules"
    >
      {tabs.map(({ id, label, Icon }) => {
        const isActive = activeTab === id

        return (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            aria-label={label}
            aria-current={isActive ? 'page' : undefined}
            className={`flex min-h-[56px] min-w-0 flex-1 flex-col items-center justify-center gap-1 py-2 transition-colors ${
              isActive ? 'text-text-brand' : 'text-text-muted'
            }`}
          >
            <Icon size={20} className="shrink-0" />
            <span className="text-[10px] font-medium leading-none">{label}</span>
          </button>
        )
      })}
    </nav>
  )
}
