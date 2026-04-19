import { create } from 'zustand'
import type { MobileDashboardTabId } from '@/lib/navigation/workspaceModules'

type MobileNavState = {
  activeTab: MobileDashboardTabId
  setActiveTab: (tab: MobileDashboardTabId) => void
}

export const useMobileNavStore = create<MobileNavState>((set) => ({
  activeTab: 'contracts',
  setActiveTab: (tab) => set({ activeTab: tab }),
}))
