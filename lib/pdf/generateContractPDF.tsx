import React from 'react'
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer'

type ClauseEntry = {
  key: string
  on: boolean
  text: string
}

export interface ContractPdfData {
  freelancerName: string
  freelancerEmail?: string
  clientName: string
  clientEmail?: string
  projectName: string
  scope?: string
  deliverables?: Array<{ text: string }>
  exclusions?: string
  startDate?: string
  endDate?: string
  milestones?: Array<{ label: string; date: string }>
  totalFee?: number
  currency: string
  paymentStructure?: 'full' | 'split' | 'milestone' | 'custom' | null
  paymentMethod?: string
  clauses: ClauseEntry[]
}

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#1a2018',
    backgroundColor: '#ffffff',
    paddingTop: 56,
    paddingBottom: 56,
    paddingLeft: 64,
    paddingRight: 64,
    lineHeight: 1.6,
  },
  docTypeLabel: {
    fontSize: 8,
    fontWeight: 500,
    color: '#5a6657',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  projectTitle: {
    fontSize: 22,
    fontWeight: 700,
    color: '#1a2018',
    marginBottom: 4,
  },
  partiesSubtitle: {
    fontSize: 10,
    fontWeight: 400,
    color: '#5a6657',
    marginBottom: 0,
  },
  partiesSubtitleBold: {
    fontSize: 10,
    fontWeight: 600,
    color: '#1a2018',
  },
  divider: {
    borderBottomWidth: 0.5,
    borderBottomColor: '#e4e8e2',
    borderBottomStyle: 'solid',
    marginTop: 16,
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 7.5,
    fontWeight: 600,
    color: '#5a6657',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  sectionValue: {
    fontSize: 10,
    fontWeight: 400,
    color: '#1a2018',
    lineHeight: 1.5,
  },
  twoCol: {
    flexDirection: 'row',
  },
  colLeft: {
    flex: 1,
    marginRight: 24,
  },
  colRight: {
    flex: 1,
  },
  termsLabel: {
    fontSize: 7.5,
    fontWeight: 600,
    color: '#5a6657',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  clauseRow: {
    marginBottom: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  clauseTitle: {
    fontSize: 10,
    fontWeight: 700,
    color: '#1a2018',
  },
  clauseBody: {
    fontSize: 10,
    fontWeight: 400,
    color: '#1a2018',
    lineHeight: 1.6,
  },
  signatureBlock: {
    flexDirection: 'row',
    marginTop: 8,
  },
  signatureColLeft: {
    flex: 1,
    marginRight: 48,
  },
  signatureColRight: {
    flex: 1,
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#1a2018',
    borderBottomStyle: 'solid',
    marginBottom: 6,
    height: 20,
  },
  signatureName: {
    fontSize: 10,
    fontWeight: 600,
    color: '#1a2018',
    marginBottom: 1,
  },
  signatureRole: {
    fontSize: 9,
    fontWeight: 400,
    color: '#5a6657',
    marginBottom: 4,
  },
  signatureDate: {
    fontSize: 9,
    fontWeight: 400,
    color: '#9aa696',
  },
  footer: {
    marginTop: 24,
    textAlign: 'center',
    fontSize: 8,
    fontWeight: 400,
    color: '#9aa696',
  },
})

const Divider = () => <View style={styles.divider} />

const SectionLabel = ({ children }: { children: string }) => (
  <Text style={styles.sectionLabel}>{children}</Text>
)

const clauseTitles: Record<string, string> = {
  revision: 'Revisions',
  ip: 'Intellectual Property',
  termination: 'Termination',
  confidentiality: 'Confidentiality',
  governingLaw: 'Governing Law',
}

function paymentText(data: ContractPdfData): string {
  if (data.paymentStructure === 'full') return 'Full payment upfront'
  if (data.paymentStructure === 'split') return '50% upfront, 50% on completion'
  if (data.paymentStructure === 'milestone') return 'Milestone-based payments'
  if (data.paymentStructure === 'custom') return data.paymentMethod || 'Custom payment terms'
  return data.paymentMethod || 'Custom payment terms'
}

function ContractDocument({ data }: { data: ContractPdfData }) {
  const activeClauses = data.clauses.filter((clause) => clause.on && clause.text.trim() !== '')

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.docTypeLabel}>Service Agreement</Text>
        <Text style={styles.projectTitle}>{data.projectName || 'Untitled Project'}</Text>
        <Text style={styles.partiesSubtitle}>
          {'Between '}
          <Text style={styles.partiesSubtitleBold}>{data.freelancerName || 'Freelancer'}</Text>
          {' and '}
          <Text style={styles.partiesSubtitleBold}>{data.clientName || 'Client'}</Text>
        </Text>

        <Divider />

        <View style={styles.twoCol}>
          <View style={styles.colLeft}>
            <SectionLabel>Freelancer</SectionLabel>
            <Text style={styles.sectionValue}>{data.freelancerName || 'Freelancer'}</Text>
            {data.freelancerEmail ? (
              <Text style={{ ...styles.sectionValue, color: '#5a6657', fontSize: 9 }}>
                {data.freelancerEmail}
              </Text>
            ) : null}
          </View>
          <View style={styles.colRight}>
            <SectionLabel>Client</SectionLabel>
            <Text style={styles.sectionValue}>{data.clientName || 'Select a client'}</Text>
            {data.clientEmail ? (
              <Text style={{ ...styles.sectionValue, color: '#5a6657', fontSize: 9 }}>
                {data.clientEmail}
              </Text>
            ) : null}
          </View>
        </View>

        <Divider />

        <SectionLabel>Payment Terms</SectionLabel>
        <Text style={styles.sectionValue}>{paymentText(data)}</Text>
        {typeof data.totalFee === 'number' ? (
          <Text style={{ ...styles.sectionValue, marginTop: 2 }}>
            {`Total: ${(data.currency || 'USD').toUpperCase()} ${data.totalFee.toLocaleString()}`}
          </Text>
        ) : null}

        {data.scope ? (
          <>
            <Divider />
            <SectionLabel>Scope of Work</SectionLabel>
            <Text style={styles.sectionValue}>{data.scope}</Text>

            {data.deliverables && data.deliverables.length > 0 ? (
              <>
                <Text style={{ ...styles.sectionValue, marginTop: 6, fontWeight: 600 }}>
                  Deliverables
                </Text>
                {data.deliverables.map((deliverable, index) => (
                  <Text key={index} style={{ ...styles.sectionValue, marginLeft: 8 }}>
                    - {deliverable.text}
                  </Text>
                ))}
              </>
            ) : null}

            {data.exclusions ? (
              <>
                <Text style={{ ...styles.sectionValue, marginTop: 6, fontWeight: 600 }}>
                  Not included
                </Text>
                <Text style={{ ...styles.sectionValue, marginLeft: 8 }}>{data.exclusions}</Text>
              </>
            ) : null}
          </>
        ) : null}

        {data.startDate || data.endDate ? (
          <>
            <Divider />
            <SectionLabel>Timeline</SectionLabel>
            <View style={styles.twoCol}>
              {data.startDate ? (
                <View style={styles.colLeft}>
                  <Text style={{ ...styles.sectionLabel, marginBottom: 2 }}>Start Date</Text>
                  <Text style={styles.sectionValue}>{data.startDate}</Text>
                </View>
              ) : null}
              {data.endDate ? (
                <View style={styles.colRight}>
                  <Text style={{ ...styles.sectionLabel, marginBottom: 2 }}>End Date</Text>
                  <Text style={styles.sectionValue}>{data.endDate}</Text>
                </View>
              ) : null}
            </View>

            {data.milestones && data.milestones.length > 0 ? (
              <>
                <Text style={{ ...styles.sectionValue, marginTop: 8, fontWeight: 600 }}>
                  Milestones
                </Text>
                {data.milestones.map((milestone, index) => (
                  <Text key={index} style={{ ...styles.sectionValue, marginLeft: 8 }}>
                    - {milestone.label} - {milestone.date}
                  </Text>
                ))}
              </>
            ) : null}
          </>
        ) : null}

        {activeClauses.length > 0 ? (
          <>
            <Divider />
            <Text style={styles.termsLabel}>Terms & Conditions</Text>
            {activeClauses.map((clause, index) => (
              <View key={`${clause.key}-${index}`} style={styles.clauseRow}>
                <Text>
                  <Text style={styles.clauseTitle}>{index + 1}. {clauseTitles[clause.key] || clause.key}. </Text>
                  <Text style={styles.clauseBody}>{clause.text}</Text>
                </Text>
              </View>
            ))}
          </>
        ) : null}

        <Divider />

        <View style={styles.signatureBlock}>
          <View style={styles.signatureColLeft}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureName}>{data.freelancerName || 'Freelancer'}</Text>
            <Text style={styles.signatureRole}>{data.freelancerEmail || 'Freelancer'}</Text>
            <Text style={styles.signatureDate}>Date: ___________</Text>
          </View>
          <View style={styles.signatureColRight}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureName}>{data.clientName || 'Client'}</Text>
            <Text style={styles.signatureRole}>{data.clientEmail || 'Client'}</Text>
            <Text style={styles.signatureDate}>Date: ___________</Text>
          </View>
        </View>

        <Divider />
        <Text style={styles.footer}>Generated with Stacklite</Text>
      </Page>
    </Document>
  )
}

export async function generateContractPDF(data: ContractPdfData): Promise<void> {
  const blob = await pdf(<ContractDocument data={data} />).toBlob()

  const safeClientName = (data.clientName || 'Client').replace(/\s+/g, '_')
  const safeProjectName = (data.projectName || 'Contract').replace(/\s+/g, '_')
  const fileName = `Contract_${safeClientName}_${safeProjectName}.pdf`

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.click()
  URL.revokeObjectURL(url)
}
