/**
 * Contract Store - Zustand
 * Manages active contract editing state and view transitions
 */

import { create } from 'zustand'
import type { ContractFormData, ContractClauses, TemplateType } from '@/lib/validations/contract'

type ContractView = 'list' | 'templates' | 'editor'
type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

interface ContractState {
  // View state
  view: ContractView
  activeContractId: string | null
  currentStep: number // 0–4 for the 5 sections

  // Form state
  formData: Partial<ContractFormData>
  isDirty: boolean
  saveStatus: SaveStatus

  // Actions
  setView: (view: ContractView) => void
  setActiveContract: (id: string | null) => void
  setCurrentStep: (step: number) => void
  nextStep: () => void
  prevStep: () => void
  updateFormData: (data: Partial<ContractFormData>) => void
  resetForm: () => void
  setSaveStatus: (status: SaveStatus) => void
  loadTemplateDefaults: (type: TemplateType) => void
  loadContractForEdit: (contractId: string, data: Partial<ContractFormData>) => void
}

const DEFAULT_CLAUSES: ContractClauses = {
  revision: {
    on: true,
    text: '2 rounds of revisions are included in the project scope. Additional revisions will be billed at the agreed hourly rate.',
  },
  ip: {
    on: true,
    text: 'Full ownership of all deliverables transfers to the Client upon receipt of final payment. Until final payment is received, all rights remain with the Freelancer.',
  },
  termination: {
    on: true,
    text: 'Either party may terminate this agreement with 14 days written notice. The Client agrees to pay for all work completed up to the termination date.',
  },
  confidentiality: {
    on: false,
    text: 'Both parties agree to keep confidential any proprietary information shared during the course of this project. This obligation survives termination of the agreement.',
  },
  governingLaw: {
    on: true,
    text: 'This agreement shall be governed by and construed in accordance with the laws of the jurisdiction where the Freelancer resides.',
  },
}

const TEMPLATE_DEFAULTS: Record<TemplateType, Partial<ContractFormData>> = {
  general: {
    template_type: 'general',
    scope: '',
    deliverables: [],
    payment_structure: 'full',
    clauses: { ...DEFAULT_CLAUSES },
  },
  design: {
    template_type: 'design',
    scope: '',
    deliverables: [
      { text: 'Brand identity concepts' },
      { text: 'Selected direction refinements' },
      { text: 'Final deliverable files (AI, PDF, PNG)' },
    ],
    payment_structure: 'split',
    clauses: {
      ...DEFAULT_CLAUSES,
      revision: {
        on: true,
        text: '3 rounds of design revisions are included. Additional revisions will be billed at the agreed hourly rate.',
      },
    },
  },
  development: {
    template_type: 'development',
    scope: '',
    deliverables: [
      { text: 'Source code repository' },
      { text: 'Deployment documentation' },
      { text: 'Handover session' },
    ],
    payment_structure: 'milestone',
    clauses: {
      ...DEFAULT_CLAUSES,
      ip: {
        on: true,
        text: 'Full ownership of source code, documentation, and all project assets transfers to the Client upon receipt of final payment. Repository access will be granted within 48 hours of final payment.',
      },
    },
  },
  retainer: {
    template_type: 'retainer',
    scope: '',
    deliverables: [],
    payment_structure: 'custom',
    clauses: {
      ...DEFAULT_CLAUSES,
      termination: {
        on: true,
        text: 'Either party may terminate this retainer with 30 days written notice. Unused hours do not roll over to the next month.',
      },
      confidentiality: {
        ...DEFAULT_CLAUSES.confidentiality,
        on: true,
      },
    },
  },
  blank: {
    template_type: 'blank',
    scope: '',
    deliverables: [],
    payment_structure: null,
    clauses: {
      revision: { on: false, text: '' },
      ip: { on: false, text: '' },
      termination: { on: false, text: '' },
      confidentiality: { on: false, text: '' },
      governingLaw: { on: false, text: '' },
    },
  },
}

export const useContractStore = create<ContractState>()((set, get) => ({
  view: 'list',
  activeContractId: null,
  currentStep: 0,
  formData: {},
  isDirty: false,
  saveStatus: 'idle',

  setView: (view) => set({ view }),

  setActiveContract: (id) => set({ activeContractId: id }),

  setCurrentStep: (step) => set({ currentStep: Math.max(0, Math.min(4, step)) }),

  nextStep: () => {
    const { currentStep } = get()
    if (currentStep < 4) set({ currentStep: currentStep + 1 })
  },

  prevStep: () => {
    const { currentStep } = get()
    if (currentStep > 0) set({ currentStep: currentStep - 1 })
  },

  updateFormData: (data) =>
    set((state) => ({
      formData: { ...state.formData, ...data },
      isDirty: true,
      saveStatus: 'idle',
    })),

  resetForm: () =>
    set({
      activeContractId: null,
      currentStep: 0,
      formData: {},
      isDirty: false,
      saveStatus: 'idle',
    }),

  setSaveStatus: (status) => set({ saveStatus: status }),

  loadTemplateDefaults: (type) => {
    const defaults = TEMPLATE_DEFAULTS[type]
    set({
      formData: { ...defaults },
      currentStep: 0,
      isDirty: false,
      saveStatus: 'idle',
      view: 'editor',
    })
  },

  /** Load an existing contract for editing without marking the form dirty */
  loadContractForEdit: (contractId, data) =>
    set({
      activeContractId: contractId,
      formData: data,
      currentStep: 0,
      isDirty: false,
      saveStatus: 'idle',
    }),
}))

export { DEFAULT_CLAUSES, TEMPLATE_DEFAULTS }
