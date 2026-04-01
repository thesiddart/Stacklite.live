/**
 * Invoice Calculation Utilities
 * Pure functions — no side effects, no imports.
 */

export interface InvoiceLineItem {
  id: string
  description: string
  qty: number
  rate: number
  amount: number
  timeEntryId?: string
}

export const calcLineAmount = (qty: number, rate: number): number =>
  parseFloat((qty * rate).toFixed(2))

export const calcSubtotal = (items: InvoiceLineItem[]): number =>
  parseFloat(items.reduce((sum, item) => sum + item.amount, 0).toFixed(2))

export const calcTax = (subtotal: number, taxRate: number): number =>
  parseFloat(((subtotal * taxRate) / 100).toFixed(2))

export const calcDiscount = (
  subtotal: number,
  type: 'flat' | 'percent',
  value: number
): number =>
  type === 'percent'
    ? parseFloat(((subtotal * value) / 100).toFixed(2))
    : parseFloat(value.toFixed(2))

export const calcTotal = (
  subtotal: number,
  tax: number,
  discount: number
): number => parseFloat((subtotal + tax - discount).toFixed(2))

export const isOverdue = (status: string, dueDate: string): boolean =>
  status === 'unpaid' && new Date(dueDate) < new Date()

export const getDisplayStatus = (status: string, dueDate: string): string =>
  isOverdue(status, dueDate) ? 'overdue' : status

export const generateInvoiceNumber = (existingCount: number): string =>
  `INV-${String(existingCount + 1).padStart(3, '0')}`
