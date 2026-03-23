import { create } from 'zustand'

type ActiveModule = 'contract-generator' | 'invoice-generator' | 'income-tracker' | 'time-tracker' | 'clients'

interface WorkspaceState {
  activeModule: ActiveModule
  setActiveModule: (module: ActiveModule) => void
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  activeModule: 'contract-generator',
  setActiveModule: (module) => set({ activeModule: module }),
}))
