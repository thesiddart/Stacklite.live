/**
 * Invoice Store - Zustand
 * Manages active invoice editing state and view transitions
 */

import { create } from 'zustand'
import type { InvoiceFormData } from '@/lib/validations/invoice'
import {
  calcLineAmount,
  calcSubtotal,
  calcTax,
  calcDiscount,
  calcTotal,
} from '@/lib/utils/invoiceCalculations'
import type { InvoiceLineItem } from '@/lib/utils/invoiceCalculations'

type InvoiceView = 'list' | 'editor'
type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

function formatDateForInput(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

function createBlankLineItem(): InvoiceLineItem {
  return {
    id: `li-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    description: '',
    qty: 1,
    rate: 0,
    amount: 0,
  }
}

interface InvoiceState {
  // View state
  view: InvoiceView
  activeInvoiceId: string | null
  currentStep: number // 0–3 for the 4 sections

  // Form state
  formData: Partial<InvoiceFormData>
  isDirty: boolean
  saveStatus: SaveStatus

  // Actions
  setView: (view: InvoiceView) => void
  setActiveInvoice: (id: string | null) => void
  setCurrentStep: (step: number) => void
  nextStep: () => void
  prevStep: () => void
  updateFormData: (data: Partial<InvoiceFormData>) => void
  addLineItem: () => void
  updateLineItem: (id: string, data: Partial<InvoiceLineItem>) => void
  removeLineItem: (id: string) => void
  importLineItems: (items: InvoiceLineItem[]) => void
  resetForm: () => void
  setSaveStatus: (status: SaveStatus) => void
  initNewInvoice: (invoiceNumber: string) => void
}

function recomputeTotals(formData: Partial<InvoiceFormData>): Partial<InvoiceFormData> {
  const items = (formData.line_items || []) as InvoiceLineItem[]
  const subtotal = calcSubtotal(items)
  const taxRate = formData.tax_rate ?? 0
  const tax = taxRate > 0 ? calcTax(subtotal, taxRate) : 0
  const discountType = formData.discount_type as 'flat' | 'percent' | null | undefined
  const discountValue = formData.discount_value ?? 0
  const discount =
    discountType && discountValue > 0
      ? calcDiscount(subtotal, discountType, discountValue)
      : 0
  const total = calcTotal(subtotal, tax, discount)

  return { ...formData, subtotal, total }
}

export const useInvoiceStore = create<InvoiceState>()((set, get) => ({
  view: 'list',
  activeInvoiceId: null,
  currentStep: 0,
  formData: {},
  isDirty: false,
  saveStatus: 'idle',

  setView: (view) => set({ view }),

  setActiveInvoice: (id) => set({ activeInvoiceId: id }),

  setCurrentStep: (step) => set({ currentStep: Math.max(0, Math.min(3, step)) }),

  nextStep: () => {
    const { currentStep } = get()
    if (currentStep < 3) set({ currentStep: currentStep + 1 })
  },

  prevStep: () => {
    const { currentStep } = get()
    if (currentStep > 0) set({ currentStep: currentStep - 1 })
  },

  updateFormData: (data) =>
    set((state) => ({
      formData: recomputeTotals({ ...state.formData, ...data }),
      isDirty: true,
      saveStatus: 'idle',
    })),

  addLineItem: () =>
    set((state) => {
      const items = [...((state.formData.line_items || []) as InvoiceLineItem[]), createBlankLineItem()]
      const updated = { ...state.formData, line_items: items }
      return { formData: recomputeTotals(updated), isDirty: true, saveStatus: 'idle' }
    }),

  updateLineItem: (id, data) =>
    set((state) => {
      const items = ((state.formData.line_items || []) as InvoiceLineItem[]).map((item) => {
        if (item.id !== id) return item
        const merged = { ...item, ...data }
        merged.amount = calcLineAmount(merged.qty, merged.rate)
        return merged
      })
      const updated = { ...state.formData, line_items: items }
      return { formData: recomputeTotals(updated), isDirty: true, saveStatus: 'idle' }
    }),

  removeLineItem: (id) =>
    set((state) => {
      const items = ((state.formData.line_items || []) as InvoiceLineItem[])
      if (items.length <= 1) return state
      const filtered = items.filter((item) => item.id !== id)
      const updated = { ...state.formData, line_items: filtered }
      return { formData: recomputeTotals(updated), isDirty: true, saveStatus: 'idle' }
    }),

  importLineItems: (newItems) =>
    set((state) => {
      const existing = (state.formData.line_items || []) as InvoiceLineItem[]
      const items = [...existing, ...newItems]
      const updated = { ...state.formData, line_items: items }
      return { formData: recomputeTotals(updated), isDirty: true, saveStatus: 'idle' }
    }),

  resetForm: () =>
    set({
      activeInvoiceId: null,
      currentStep: 0,
      formData: {},
      isDirty: false,
      saveStatus: 'idle',
    }),

  setSaveStatus: (status) => set({ saveStatus: status }),

  initNewInvoice: (invoiceNumber) => {
    const today = new Date()
    const formData = recomputeTotals({
      invoice_number: invoiceNumber,
      issue_date: formatDateForInput(today),
      due_date: formatDateForInput(addDays(today, 14)),
      currency: 'USD',
      line_items: [createBlankLineItem()],
      status: 'unpaid',
      subtotal: 0,
      total: 0,
    })
    set({
      formData,
      currentStep: 0,
      activeInvoiceId: null,
      isDirty: false,
      saveStatus: 'idle',
      view: 'editor',
    })
  },
}))
