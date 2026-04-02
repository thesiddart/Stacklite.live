import { useMemo } from 'react'
import { useInvoices } from '@/hooks/useInvoices'
import { useClients } from '@/hooks/useClients'
import { getDisplayStatus } from '@/lib/utils/invoiceCalculations'
import type { Invoice } from '@/lib/types/database'

export type IncomeFilter =
  | 'this-month'
  | 'last-3-months'
  | 'last-6-months'
  | 'this-year'
  | 'all-time'

export interface IncomeMonthlyData {
  month: string
  year: number
  earned: number
}

interface IncomeInvoiceItem {
  id: string
  invoiceNumber: string
  clientName: string
  total: number
  currency: string
  issueDate: string
  dueDate: string
  status: string
  raw: Invoice
}

interface IncomeData {
  hasInvoices: boolean
  currency: string
  totalEarned: number
  totalOutstanding: number
  overdueAmount: number
  selectedPeriodEarned: number
  selectedPeriodLabel: string
  monthlyData: IncomeMonthlyData[]
  recentInvoices: IncomeInvoiceItem[]
}

const FILTER_LABEL: Record<IncomeFilter, string> = {
  'this-month': 'This Month',
  'last-3-months': 'Last 3 Months',
  'last-6-months': 'Last 6 Months',
  'this-year': 'This Year',
  'all-time': 'All Time',
}

function startOfCurrentMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function startOfMonthOffset(date: Date, monthsAgo: number): Date {
  return new Date(date.getFullYear(), date.getMonth() - monthsAgo, 1)
}

function startOfYear(date: Date): Date {
  return new Date(date.getFullYear(), 0, 1)
}

function toDate(value: string): Date {
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? new Date(0) : parsed
}

function withinFilter(issueDate: Date, filter: IncomeFilter, now: Date): boolean {
  switch (filter) {
    case 'this-month':
      return issueDate >= startOfCurrentMonth(now)
    case 'last-3-months':
      return issueDate >= startOfMonthOffset(now, 2)
    case 'last-6-months':
      return issueDate >= startOfMonthOffset(now, 5)
    case 'this-year':
      return issueDate >= startOfYear(now)
    case 'all-time':
    default:
      return true
  }
}

function normalizeInvoiceStatus(status: string, dueDate: string): string {
  return getDisplayStatus(status, dueDate)
}

function buildMonthlyData(paidInvoices: Invoice[], filter: IncomeFilter, now: Date): IncomeMonthlyData[] {
  const monthCount = filter === 'this-month'
    ? 1
    : filter === 'last-3-months'
      ? 3
      : filter === 'last-6-months'
        ? 6
        : filter === 'this-year'
          ? now.getMonth() + 1
          : 6

  const buckets: Array<{ year: number; monthIndex: number }> = []
  for (let i = monthCount - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    buckets.push({ year: d.getFullYear(), monthIndex: d.getMonth() })
  }

  return buckets.map(({ year, monthIndex }) => {
    const earned = paidInvoices
      .filter((invoice) => {
        const issueDate = toDate(invoice.issue_date)
        return issueDate.getFullYear() === year && issueDate.getMonth() === monthIndex
      })
      .reduce((sum, invoice) => sum + invoice.total, 0)

    return {
      month: new Date(year, monthIndex, 1).toLocaleString('en-US', { month: 'short' }),
      year,
      earned,
    }
  })
}

export function useIncomeData(filter: IncomeFilter): IncomeData {
  const { data: invoices = [] } = useInvoices()
  const { data: clients = [] } = useClients()

  return useMemo(() => {
    const now = new Date()
    const sortedInvoices = [...invoices].sort(
      (a, b) => toDate(b.issue_date).getTime() - toDate(a.issue_date).getTime()
    )

    const currency = sortedInvoices[0]?.currency || 'USD'
    const sameCurrencyInvoices = sortedInvoices.filter((invoice) => invoice.currency === currency)

    const paidAllTime = sameCurrencyInvoices.filter((invoice) => normalizeInvoiceStatus(invoice.status, invoice.due_date) === 'paid')
    const unpaidAllTime = sameCurrencyInvoices.filter((invoice) => {
      const status = normalizeInvoiceStatus(invoice.status, invoice.due_date)
      return status === 'unpaid' || status === 'overdue'
    })

    const overdueInvoices = unpaidAllTime.filter((invoice) => normalizeInvoiceStatus(invoice.status, invoice.due_date) === 'overdue')

    const filteredInvoices = sameCurrencyInvoices.filter((invoice) => withinFilter(toDate(invoice.issue_date), filter, now))
    const filteredPaid = filteredInvoices.filter((invoice) => normalizeInvoiceStatus(invoice.status, invoice.due_date) === 'paid')

    const clientNameById = new Map(clients.map((client) => [client.id, client.name]))

    const recentInvoices: IncomeInvoiceItem[] = filteredInvoices
      .slice(0, 10)
      .map((invoice) => ({
        id: invoice.id,
        invoiceNumber: invoice.invoice_number,
        clientName: invoice.client_id ? clientNameById.get(invoice.client_id) || 'Client' : 'Client',
        total: invoice.total,
        currency: invoice.currency,
        issueDate: invoice.issue_date,
        dueDate: invoice.due_date,
        status: normalizeInvoiceStatus(invoice.status, invoice.due_date),
        raw: invoice,
      }))

    return {
      hasInvoices: sameCurrencyInvoices.length > 0,
      currency,
      totalEarned: paidAllTime.reduce((sum, invoice) => sum + invoice.total, 0),
      totalOutstanding: unpaidAllTime.reduce((sum, invoice) => sum + invoice.total, 0),
      overdueAmount: overdueInvoices.reduce((sum, invoice) => sum + invoice.total, 0),
      selectedPeriodEarned: filteredPaid.reduce((sum, invoice) => sum + invoice.total, 0),
      selectedPeriodLabel: FILTER_LABEL[filter],
      monthlyData: buildMonthlyData(filteredPaid, filter, now),
      recentInvoices,
    }
  }, [clients, filter, invoices])
}
