function escapePdfText(value: string): string {
  return value
    .replaceAll('\\', '\\\\')
    .replaceAll('(', '\\(')
    .replaceAll(')', '\\)')
}

type Rgb = [number, number, number]

type TextCmd = {
  kind: 'text'
  text: string
  x: number
  y: number
  size: number
  color: Rgb
  bold?: boolean
}

type LineCmd = {
  kind: 'line'
  x1: number
  y1: number
  x2: number
  y2: number
  width: number
  color: Rgb
}

type RectCmd = {
  kind: 'rect'
  x: number
  y: number
  w: number
  h: number
  stroke?: Rgb
  fill?: Rgb
  lineWidth?: number
}

type PdfCmd = TextCmd | LineCmd | RectCmd

function rgb([r, g, b]: Rgb): string {
  return `${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)}`
}

function buildPdfContent(commands: PdfCmd[]): string {
  const out: string[] = []

  for (const cmd of commands) {
    if (cmd.kind === 'text') {
      const font = cmd.bold ? 'F2' : 'F1'
      out.push(
        `BT\n/${font} ${cmd.size} Tf\n${rgb(cmd.color)} rg\n1 0 0 1 ${cmd.x} ${cmd.y} Tm\n(${escapePdfText(cmd.text)}) Tj\nET`
      )
      continue
    }

    if (cmd.kind === 'line') {
      out.push(
        `${rgb(cmd.color)} RG\n${cmd.width} w\n${cmd.x1} ${cmd.y1} m\n${cmd.x2} ${cmd.y2} l\nS`
      )
      continue
    }

    if (cmd.kind === 'rect') {
      if (cmd.fill) out.push(`${rgb(cmd.fill)} rg`)
      if (cmd.stroke) out.push(`${rgb(cmd.stroke)} RG`)
      out.push(`${cmd.lineWidth ?? 1} w`)
      out.push(`${cmd.x} ${cmd.y} ${cmd.w} ${cmd.h} re`)
      out.push(cmd.fill && cmd.stroke ? 'B' : cmd.fill ? 'f' : 'S')
    }
  }

  return out.join('\n')
}

function buildPdfString(commands: PdfCmd[]): string {
  const stream = buildPdfContent(commands)
  const objects = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R /F2 6 0 R >> >> /Contents 5 0 R >>\nendobj\n',
    '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n',
    `5 0 obj\n<< /Length ${stream.length} >>\nstream\n${stream}\nendstream\nendobj\n`,
    '6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n',
  ]

  const header = '%PDF-1.4\n'
  let pdf = header
  const offsets: number[] = [0]

  for (const object of objects) {
    offsets.push(pdf.length)
    pdf += object
  }

  const xrefStart = pdf.length
  pdf += `xref\n0 ${objects.length + 1}\n`
  pdf += '0000000000 65535 f \n'

  for (let index = 1; index <= objects.length; index += 1) {
    pdf += `${String(offsets[index]).padStart(10, '0')} 00000 n \n`
  }

  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`

  return pdf
}

function downloadPdf(fileName: string, commands: PdfCmd[]) {
  const pdf = buildPdfString(commands)
  const blob = new Blob([pdf], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)

  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()

  window.setTimeout(() => {
    URL.revokeObjectURL(url)
  }, 0)
}

function wrapText(text: string, maxChars: number): string[] {
  const words = text.trim().split(/\s+/)
  if (words.length === 0) return ['']

  const lines: string[] = []
  let current = ''

  for (const word of words) {
    const next = current ? `${current} ${word}` : word
    if (next.length <= maxChars) {
      current = next
      continue
    }

    if (current) lines.push(current)
    current = word
  }

  if (current) lines.push(current)
  return lines
}

export interface InvoicePdfData {
  invoiceNumber: string
  clientName: string
  issueDate: string
  dueDate: string
  status: string
  items: Array<{ description: string; qty: number; rate: string; amount: string }>
  subtotal: string
  tax: string
  discount: string
  total: string
  paymentMethod: string
  paymentInstructions: string
  notesToClient: string
}

export function downloadInvoicePdf(fileName: string, data: InvoicePdfData) {
  const textDark: Rgb = [0.102, 0.086, 0.239]
  const textMuted: Rgb = [0.486, 0.447, 0.533]
  const border: Rgb = [0.910, 0.894, 0.965]
  const success: Rgb = [0.176, 0.541, 0.392]
  const commands: PdfCmd[] = []

  let y = 760
  commands.push({ kind: 'text', text: 'INVOICE', x: 50, y, size: 10, color: textMuted, bold: true })
  y -= 24
  commands.push({ kind: 'text', text: data.invoiceNumber, x: 50, y, size: 22, color: textDark, bold: true })
  y -= 18
  commands.push({ kind: 'text', text: `Issued ${data.issueDate} · Due ${data.dueDate}`, x: 50, y, size: 11, color: textMuted })
  commands.push({ kind: 'text', text: data.status.toUpperCase(), x: 460, y, size: 11, color: success, bold: true })
  y -= 16
  commands.push({ kind: 'line', x1: 50, y1: y, x2: 560, y2: y, width: 1, color: border })

  y -= 24
  commands.push({ kind: 'text', text: 'BILL TO', x: 50, y, size: 10, color: textMuted, bold: true })
  y -= 14
  commands.push({ kind: 'text', text: data.clientName, x: 50, y, size: 13, color: textDark, bold: true })

  y -= 24
  commands.push({ kind: 'text', text: 'LINE ITEMS', x: 50, y, size: 10, color: textMuted, bold: true })
  y -= 16
  commands.push({ kind: 'line', x1: 50, y1: y, x2: 560, y2: y, width: 1, color: border })
  y -= 14
  commands.push({ kind: 'text', text: 'Description', x: 50, y, size: 10, color: textMuted, bold: true })
  commands.push({ kind: 'text', text: 'Qty', x: 340, y, size: 10, color: textMuted, bold: true })
  commands.push({ kind: 'text', text: 'Rate', x: 400, y, size: 10, color: textMuted, bold: true })
  commands.push({ kind: 'text', text: 'Amount', x: 480, y, size: 10, color: textMuted, bold: true })

  for (const item of data.items) {
    y -= 14
    commands.push({ kind: 'line', x1: 50, y1: y, x2: 560, y2: y, width: 0.6, color: border })
    y -= 12
    const wrapped = wrapText(item.description || 'Item', 40)
    commands.push({ kind: 'text', text: wrapped[0], x: 50, y, size: 10, color: textDark })
    commands.push({ kind: 'text', text: String(item.qty), x: 340, y, size: 10, color: textDark })
    commands.push({ kind: 'text', text: item.rate, x: 400, y, size: 10, color: textDark })
    commands.push({ kind: 'text', text: item.amount, x: 480, y, size: 10, color: textDark })
    for (let i = 1; i < wrapped.length; i += 1) {
      y -= 12
      commands.push({ kind: 'text', text: wrapped[i], x: 50, y, size: 10, color: textDark })
    }
  }

  y -= 24
  commands.push({ kind: 'line', x1: 320, y1: y, x2: 560, y2: y, width: 1, color: border })
  y -= 16
  commands.push({ kind: 'text', text: `Subtotal`, x: 360, y, size: 11, color: textMuted })
  commands.push({ kind: 'text', text: data.subtotal, x: 480, y, size: 11, color: textDark })
  y -= 14
  commands.push({ kind: 'text', text: `Tax`, x: 360, y, size: 11, color: textMuted })
  commands.push({ kind: 'text', text: data.tax, x: 480, y, size: 11, color: textDark })
  y -= 14
  commands.push({ kind: 'text', text: `Discount`, x: 360, y, size: 11, color: textMuted })
  commands.push({ kind: 'text', text: data.discount, x: 480, y, size: 11, color: textDark })
  y -= 16
  commands.push({ kind: 'line', x1: 320, y1: y, x2: 560, y2: y, width: 1, color: border })
  y -= 16
  commands.push({ kind: 'text', text: 'Total', x: 360, y, size: 14, color: textDark, bold: true })
  commands.push({ kind: 'text', text: data.total, x: 480, y, size: 14, color: success, bold: true })

  y -= 24
  commands.push({ kind: 'line', x1: 50, y1: y, x2: 560, y2: y, width: 1, color: border })
  y -= 18
  commands.push({ kind: 'text', text: 'PAYMENT', x: 50, y, size: 10, color: textMuted, bold: true })
  y -= 14
  commands.push({ kind: 'text', text: data.paymentMethod || 'N/A', x: 50, y, size: 11, color: textDark, bold: true })
  y -= 13
  for (const line of wrapText(data.paymentInstructions || 'N/A', 92)) {
    commands.push({ kind: 'text', text: line, x: 50, y, size: 10, color: textMuted })
    y -= 12
  }

  y -= 8
  commands.push({ kind: 'line', x1: 50, y1: y, x2: 560, y2: y, width: 1, color: border })
  y -= 18
  commands.push({ kind: 'text', text: 'NOTES', x: 50, y, size: 10, color: textMuted, bold: true })
  y -= 14
  for (const line of wrapText(data.notesToClient || 'N/A', 92)) {
    commands.push({ kind: 'text', text: line, x: 50, y, size: 10, color: textDark })
    y -= 12
  }

  commands.push({ kind: 'text', text: 'Generated with Stacklite', x: 50, y: 36, size: 9, color: textMuted })
  downloadPdf(fileName, commands)
}

export interface ContractPdfData {
  projectName: string
  clientName: string
  status: string
  templateType: string
  scope: string
  deliverables: string[]
  exclusions: string
  timeline: string
  milestones: string[]
  amount: string
  paymentStructure: string
  paymentMethod: string
  paymentTerms: string
  clauses: string[]
}

function getPaymentStructureLabel(paymentStructure: string): string {
  if (paymentStructure === 'full') return 'Full payment upfront'
  if (paymentStructure === 'split') return '50% upfront, 50% on completion'
  if (paymentStructure === 'milestone') return 'Milestone-based payments'
  if (paymentStructure === 'custom') return 'Custom payment terms'
  return paymentStructure || 'Custom payment terms'
}

function parseClause(clause: string): { title: string; body: string } {
  const separatorIndex = clause.indexOf(':')
  if (separatorIndex <= 0) {
    return { title: 'Clause', body: clause }
  }

  const rawKey = clause.slice(0, separatorIndex).trim()
  const body = clause.slice(separatorIndex + 1).trim()
  const titleMap: Record<string, string> = {
    ip: 'Intellectual Property',
    revision: 'Revisions',
    termination: 'Termination',
    confidentiality: 'Confidentiality',
    governingLaw: 'Governing Law',
  }

  return {
    title: titleMap[rawKey] || rawKey,
    body,
  }
}

export function downloadContractPdf(fileName: string, data: ContractPdfData) {
  const textDark: Rgb = [0.102, 0.086, 0.239]
  const textMuted: Rgb = [0.380, 0.455, 0.430]
  const textBody: Rgb = [0.355, 0.420, 0.400]
  const border: Rgb = [0.910, 0.894, 0.965]
  const accent: Rgb = [0.176, 0.541, 0.392]
  const commands: PdfCmd[] = []

  let y = 760
  commands.push({ kind: 'text', text: 'SERVICE AGREEMENT', x: 50, y, size: 10, color: textMuted, bold: true })
  y -= 24
  commands.push({ kind: 'text', text: data.projectName, x: 50, y, size: 22, color: textDark, bold: true })
  y -= 16
  commands.push({ kind: 'text', text: `Between Freelancer and ${data.clientName}`, x: 50, y, size: 11, color: textMuted })
  y -= 16
  commands.push({ kind: 'line', x1: 50, y1: y, x2: 560, y2: y, width: 1, color: border })

  y -= 22
  commands.push({ kind: 'text', text: 'FREELANCER', x: 50, y, size: 9, color: textMuted, bold: true })
  commands.push({ kind: 'text', text: 'CLIENT', x: 300, y, size: 9, color: textMuted, bold: true })
  y -= 14
  commands.push({ kind: 'text', text: 'Siddhartha Dwivedi', x: 50, y, size: 12, color: textDark, bold: true })
  commands.push({ kind: 'text', text: data.clientName, x: 300, y, size: 12, color: textDark, bold: true })
  y -= 12
  commands.push({ kind: 'line', x1: 50, y1: y, x2: 560, y2: y, width: 1, color: border })

  y -= 20
  commands.push({ kind: 'text', text: 'SCOPE OF WORK', x: 50, y, size: 9, color: textMuted, bold: true })
  y -= 14
  for (const line of wrapText(data.scope || 'N/A', 92)) {
    commands.push({ kind: 'text', text: line, x: 50, y, size: 11, color: textBody })
    y -= 12
  }
  y -= 12
  commands.push({ kind: 'line', x1: 50, y1: y, x2: 560, y2: y, width: 1, color: border })

  y -= 20
  commands.push({ kind: 'text', text: 'DELIVERABLES', x: 50, y, size: 9, color: textMuted, bold: true })
  y -= 14
  for (const item of data.deliverables.length > 0 ? data.deliverables : ['N/A']) {
    commands.push({ kind: 'text', text: `- ${item}`, x: 56, y, size: 11, color: textDark })
    commands.push({ kind: 'rect', x: 50, y: y + 3, w: 3, h: 3, fill: accent })
    y -= 12
  }
  y -= 12
  commands.push({ kind: 'line', x1: 50, y1: y, x2: 560, y2: y, width: 1, color: border })

  y -= 20
  commands.push({ kind: 'text', text: 'TIMELINE', x: 50, y, size: 9, color: textMuted, bold: true })
  y -= 14
  commands.push({ kind: 'text', text: data.timeline, x: 50, y, size: 11, color: textDark })
  for (const milestone of data.milestones) {
    y -= 12
    commands.push({ kind: 'text', text: `- ${milestone}`, x: 56, y, size: 10, color: textMuted })
  }
  y -= 12
  commands.push({ kind: 'line', x1: 50, y1: y, x2: 560, y2: y, width: 1, color: border })

  y -= 20
  commands.push({ kind: 'text', text: 'PAYMENT TERMS', x: 50, y, size: 9, color: textMuted, bold: true })
  y -= 14
  commands.push({ kind: 'text', text: data.amount, x: 50, y, size: 17, color: textDark, bold: true })
  y -= 14
  commands.push({ kind: 'text', text: getPaymentStructureLabel(data.paymentStructure), x: 50, y, size: 11, color: textMuted })
  y -= 12
  commands.push({ kind: 'text', text: `Via ${data.paymentMethod || data.paymentTerms || 'Payment method'}.`, x: 50, y, size: 11, color: textMuted })

  y -= 16
  commands.push({ kind: 'line', x1: 50, y1: y, x2: 560, y2: y, width: 1, color: border })

  y -= 20
  commands.push({ kind: 'text', text: 'TERMS & CONDITIONS', x: 50, y, size: 9, color: textMuted, bold: true })
  y -= 14
  const parsedClauses = (data.clauses.length > 0 ? data.clauses : ['No active clauses.'])
    .map(parseClause)

  parsedClauses.forEach((clause, index) => {
    const heading = `${index + 1}. ${clause.title}.`
    const bodyLines = wrapText(clause.body || 'No details provided.', 74)

    commands.push({ kind: 'text', text: heading, x: 50, y, size: 11, color: textDark, bold: true })
    if (bodyLines.length > 0) {
      commands.push({ kind: 'text', text: bodyLines[0], x: 180, y, size: 11, color: textBody })
      for (let i = 1; i < bodyLines.length; i += 1) {
        y -= 12
        commands.push({ kind: 'text', text: bodyLines[i], x: 50, y, size: 11, color: textBody })
      }
    }
    y -= 18
  })

  if (y < 80) {
    y = 80
  }

  commands.push({ kind: 'text', text: 'Generated with Stacklite', x: 50, y: 36, size: 9, color: textMuted })
  downloadPdf(fileName, commands)
}
