import './fonts'

import React from 'react'
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer'
import { COLORS } from '@/lib/constants/design-system'
import type { Client, Contract, Invoice, TimeLog } from '@/lib/types/database'

interface ClientActivityReportData {
  generatedAt: string
  clients: Client[]
  contracts: Contract[]
  invoices: Invoice[]
  timeLogs: TimeLog[]
}

const REPORT_COLORS = {
  pageBackground: COLORS.light.background.base,
  textPrimary: COLORS.light.text.base,
  textSecondary: COLORS.light.text.muted,
  sectionBorder: COLORS.light.border.base,
  rowBorder: COLORS.light.border.muted,
  footerText: COLORS.light.text.disabled,
}

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Inter',
    backgroundColor: REPORT_COLORS.pageBackground,
    color: REPORT_COLORS.textPrimary,
    paddingTop: 34,
    paddingBottom: 34,
    paddingLeft: 34,
    paddingRight: 34,
    fontSize: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 9,
    color: REPORT_COLORS.textSecondary,
    marginBottom: 12,
  },
  section: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: REPORT_COLORS.sectionBorder,
    paddingTop: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
    gap: 12,
  },
  rowLabel: {
    color: REPORT_COLORS.textSecondary,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: REPORT_COLORS.sectionBorder,
    paddingBottom: 4,
    marginBottom: 4,
    color: REPORT_COLORS.textSecondary,
    fontSize: 9,
    fontWeight: 600,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: REPORT_COLORS.rowBorder,
    paddingBottom: 4,
    marginBottom: 4,
    fontSize: 9,
  },
  colWide: {
    flex: 2.2,
    paddingRight: 8,
  },
  col: {
    flex: 1,
    paddingRight: 8,
  },
  footer: {
    marginTop: 10,
    fontSize: 8,
    color: REPORT_COLORS.footerText,
    textAlign: 'center',
  },
})

function formatDate(value: string | null): string {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleDateString('en-US')
}

function formatCurrency(value: number, currency: string): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      maximumFractionDigits: 2,
    }).format(value)
  } catch {
    return `${currency || 'USD'} ${value.toFixed(2)}`
  }
}

function formatHours(seconds: number): string {
  const hours = seconds / 3600
  return `${hours.toFixed(2)}h`
}

function ClientActivityReportDocument({ data }: { data: ClientActivityReportData }) {
  const clientNameById = new Map(data.clients.map((client) => [client.id, client.name]))

  const totalHours = data.timeLogs.reduce(
    (sum, log) => sum + (log.duration_seconds ?? 0),
    0
  )

  const paidRevenue = data.invoices
    .filter((invoice) => invoice.status === 'paid')
    .reduce((sum, invoice) => sum + invoice.total, 0)

  const outstandingRevenue = data.invoices
    .filter((invoice) => invoice.status === 'unpaid')
    .reduce((sum, invoice) => sum + invoice.total, 0)

  const clientRows = data.clients.map((client) => {
    const clientTasks = data.timeLogs.filter((log) => log.client_id === client.id)
    const clientInvoices = data.invoices.filter((invoice) => invoice.client_id === client.id)
    const clientContracts = data.contracts.filter((contract) => contract.client_id === client.id)

    return {
      id: client.id,
      name: client.name,
      tasks: clientTasks.length,
      taskHours: clientTasks.reduce((sum, log) => sum + (log.duration_seconds ?? 0), 0),
      invoices: clientInvoices.length,
      contracts: clientContracts.length,
    }
  })

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Client Activity Report</Text>
        <Text style={styles.subtitle}>Generated on {new Date(data.generatedAt).toLocaleString('en-US')}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Total Clients</Text>
            <Text>{data.clients.length}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Total Contracts</Text>
            <Text>{data.contracts.length}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Total Invoices</Text>
            <Text>{data.invoices.length}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Total Task Logs</Text>
            <Text>{data.timeLogs.length}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Tracked Time</Text>
            <Text>{formatHours(totalHours)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Paid Revenue (all currencies as stored)</Text>
            <Text>{paidRevenue.toFixed(2)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Outstanding Revenue (all currencies as stored)</Text>
            <Text>{outstandingRevenue.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Clients Overview</Text>
          <View style={styles.tableHeader}>
            <Text style={styles.colWide}>Client</Text>
            <Text style={styles.col}>Tasks</Text>
            <Text style={styles.col}>Hours</Text>
            <Text style={styles.col}>Invoices</Text>
            <Text style={styles.col}>Contracts</Text>
          </View>
          {clientRows.map((row) => (
            <View key={row.id} style={styles.tableRow}>
              <Text style={styles.colWide}>{row.name}</Text>
              <Text style={styles.col}>{row.tasks}</Text>
              <Text style={styles.col}>{formatHours(row.taskHours)}</Text>
              <Text style={styles.col}>{row.invoices}</Text>
              <Text style={styles.col}>{row.contracts}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Invoices</Text>
          <View style={styles.tableHeader}>
            <Text style={styles.colWide}>Invoice</Text>
            <Text style={styles.colWide}>Client</Text>
            <Text style={styles.col}>Status</Text>
            <Text style={styles.col}>Total</Text>
            <Text style={styles.col}>Due</Text>
          </View>
          {data.invoices.map((invoice) => (
            <View key={invoice.id} style={styles.tableRow}>
              <Text style={styles.colWide}>{invoice.invoice_number}</Text>
              <Text style={styles.colWide}>{invoice.client_id ? clientNameById.get(invoice.client_id) || '-' : '-'}</Text>
              <Text style={styles.col}>{invoice.status}</Text>
              <Text style={styles.col}>{formatCurrency(invoice.total, invoice.currency)}</Text>
              <Text style={styles.col}>{formatDate(invoice.due_date)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Task Logs</Text>
          <View style={styles.tableHeader}>
            <Text style={styles.colWide}>Task</Text>
            <Text style={styles.colWide}>Client</Text>
            <Text style={styles.col}>Duration</Text>
            <Text style={styles.col}>Date</Text>
          </View>
          {data.timeLogs.map((log) => (
            <View key={log.id} style={styles.tableRow}>
              <Text style={styles.colWide}>{log.task_name}</Text>
              <Text style={styles.colWide}>{log.client_id ? clientNameById.get(log.client_id) || '-' : '-'}</Text>
              <Text style={styles.col}>{formatHours(log.duration_seconds ?? 0)}</Text>
              <Text style={styles.col}>{formatDate(log.start_time)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contracts</Text>
          <View style={styles.tableHeader}>
            <Text style={styles.colWide}>Contract</Text>
            <Text style={styles.colWide}>Client</Text>
            <Text style={styles.col}>Status</Text>
            <Text style={styles.col}>Amount</Text>
          </View>
          {data.contracts.map((contract) => (
            <View key={contract.id} style={styles.tableRow}>
              <Text style={styles.colWide}>{contract.project_name || contract.contract_number}</Text>
              <Text style={styles.colWide}>{contract.client_id ? clientNameById.get(contract.client_id) || '-' : '-'}</Text>
              <Text style={styles.col}>{contract.status}</Text>
              <Text style={styles.col}>
                {contract.total_fee == null ? '-' : formatCurrency(contract.total_fee, contract.currency || 'USD')}
              </Text>
            </View>
          ))}
        </View>

        <Text style={styles.footer}>Generated with Stacklite</Text>
      </Page>
    </Document>
  )
}

export async function generateClientActivityReportPDF(data: ClientActivityReportData): Promise<void> {
  const blob = await pdf(<ClientActivityReportDocument data={data} />).toBlob()
  const dateStamp = new Date(data.generatedAt).toISOString().slice(0, 10)
  const fileName = `Client_Activity_Report_${dateStamp}.pdf`

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.click()
  URL.revokeObjectURL(url)
}
