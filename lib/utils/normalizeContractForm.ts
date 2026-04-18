import {
  templateTypes,
  type ContractFormData,
  type ContractClauses,
  type TemplateType,
} from '@/lib/validations/contract'
import { DEFAULT_CLAUSES } from '@/stores/contractStore'

const LEGACY_STATUS_MAP: Record<string, ContractFormData['status']> = {
  active: 'sent',
  completed: 'signed',
  cancelled: 'archived',
}

const PAYMENT_STRUCTURES = ['full', 'split', 'milestone', 'custom'] as const

/** Loose check aligned with typical email fields — invalid values become null so Zod optionalEmail passes */
const EMAIL_LIKE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const CLIENT_UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function normalizeStatus(value: unknown): ContractFormData['status'] {
  const raw = typeof value === 'string' ? value.trim().toLowerCase() : ''
  if (raw === 'draft' || raw === 'sent' || raw === 'signed' || raw === 'archived') {
    return raw
  }
  return LEGACY_STATUS_MAP[raw] ?? 'sent'
}

function normalizeCurrency(value: unknown): string {
  const c = typeof value === 'string' ? value.trim().toUpperCase() : ''
  if (c.length === 3 && /^[A-Z]{3}$/.test(c)) return c
  return 'USD'
}

function normalizePaymentStructure(value: unknown): ContractFormData['payment_structure'] {
  const v = typeof value === 'string' ? value.trim() : ''
  if (PAYMENT_STRUCTURES.includes(v as (typeof PAYMENT_STRUCTURES)[number])) {
    return v as ContractFormData['payment_structure']
  }
  return null
}

function normalizeTemplateType(value: unknown): TemplateType | null {
  const v = typeof value === 'string' ? value.trim() : ''
  return templateTypes.includes(v as TemplateType) ? (v as TemplateType) : null
}

/** Invalid UUID strings fail Zod client_id — coerce to null */
function normalizeClientId(value: unknown): string | null {
  if (value === null || value === undefined) return null
  const s = typeof value === 'string' ? value.trim() : ''
  if (s === '') return null
  return CLIENT_UUID.test(s) ? s : null
}

/** Zod optionalEmail rejects non-empty invalid strings — clear bad input */
function sanitizeOptionalEmail(value: unknown): string | null {
  if (value === null || value === undefined) return null
  const s = typeof value === 'string' ? value.trim() : ''
  if (s === '') return null
  return EMAIL_LIKE.test(s) ? s : null
}

function normalizeTotalFee(value: unknown): number | null {
  if (value === null || value === undefined) return null
  if (typeof value === 'number') {
    return Number.isFinite(value) && value >= 0 ? value : null
  }
  const n = Number(value)
  return Number.isFinite(n) && n >= 0 ? n : null
}

function mergeClauses(input: unknown): ContractClauses {
  const base: ContractClauses = {
    revision: { ...DEFAULT_CLAUSES.revision },
    ip: { ...DEFAULT_CLAUSES.ip },
    termination: { ...DEFAULT_CLAUSES.termination },
    confidentiality: { ...DEFAULT_CLAUSES.confidentiality },
    governingLaw: { ...DEFAULT_CLAUSES.governingLaw },
  }

  if (!input || typeof input !== 'object') {
    return base
  }

  const record = input as Record<string, unknown>
  for (const key of Object.keys(base) as Array<keyof ContractClauses>) {
    const value = record[key as string]
    if (!value || typeof value !== 'object') continue
    const clause = value as { on?: unknown; text?: unknown }
    base[key] = {
      on: Boolean(clause.on),
      text: typeof clause.text === 'string' ? clause.text : String(clause.text ?? ''),
    }
  }

  return base
}

function normalizeDeliverables(value: unknown): ContractFormData['deliverables'] {
  if (!Array.isArray(value)) return []

  return value
    .map((item) => {
      if (typeof item === 'string') {
        const text = item.trim()
        return text ? { text } : null
      }
      if (item && typeof item === 'object' && 'text' in item) {
        const text = String((item as { text: unknown }).text ?? '').trim()
        return text ? { text } : null
      }
      return null
    })
    .filter((entry): entry is { text: string } => entry !== null)
}

function normalizeMilestones(value: unknown): ContractFormData['milestones'] {
  if (!Array.isArray(value)) return []

  return value
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const row = item as { label?: unknown; date?: unknown }
      const label = String(row.label ?? '').trim() || 'Milestone'
      const date = String(row.date ?? '').trim() || 'TBD'
      return { label, date }
    })
    .filter((entry): entry is { label: string; date: string } => entry !== null)
}

/**
 * Produces a payload that satisfies contract Zod schemas when saving (filters empty
 * deliverables, ensures clause shape, milestone strings, status mapping).
 */
export function normalizeContractFormForSave(
  formData: Partial<ContractFormData>
): Partial<ContractFormData> {
  return {
    ...formData,
    client_id: normalizeClientId(formData.client_id),
    template_type: normalizeTemplateType(formData.template_type),
    clauses: mergeClauses(formData.clauses),
    deliverables: normalizeDeliverables(formData.deliverables),
    milestones: normalizeMilestones(formData.milestones),
    status: normalizeStatus(formData.status),
    currency: normalizeCurrency(formData.currency),
    payment_structure: normalizePaymentStructure(formData.payment_structure),
    total_fee: normalizeTotalFee(formData.total_fee),
    freelancer_email: sanitizeOptionalEmail(formData.freelancer_email),
    client_email: sanitizeOptionalEmail(formData.client_email),
  }
}
