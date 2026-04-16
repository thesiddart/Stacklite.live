import { z } from 'zod'

/**
 * Contract validation schemas
 * Used for form validation and API input sanitization
 */

export const templateTypes = [
  'general',
  'design',
  'development',
  'retainer',
  'blank',
] as const

export type TemplateType = (typeof templateTypes)[number]

const statusValues = ['draft', 'sent', 'signed', 'archived'] as const
const legacyStatusValues = ['active', 'completed', 'cancelled'] as const
const statusInputValues = [...statusValues, ...legacyStatusValues] as const
const paymentStructureValues = ['full', 'split', 'milestone', 'custom'] as const

const normalizeStatus = (status: (typeof statusInputValues)[number]): (typeof statusValues)[number] => {
  if (status === 'active') return 'sent'
  if (status === 'completed') return 'signed'
  if (status === 'cancelled') return 'archived'
  return status
}

const emptyToNull = (value: string | null | undefined) => {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}

const optionalTrimmedString = (max: number, message: string) =>
  z
    .union([z.string().max(max, message), z.null(), z.undefined()])
    .transform((value) => emptyToNull(value))

const optionalEmail = z
  .union([z.string().email('Invalid email address'), z.literal(''), z.null(), z.undefined()])
  .transform((value) => emptyToNull(value))

const deliverableItemSchema = z.object({
  text: z.string().min(1, 'Deliverable text is required'),
})

const milestoneItemSchema = z.object({
  label: z.string().min(1, 'Milestone label is required'),
  date: z.string().min(1, 'Milestone date is required'),
})

const clauseSchema = z.object({
  on: z.boolean(),
  text: z.string(),
})

const clausesSchema = z.object({
  revision: clauseSchema.optional().default({ on: true, text: '' }),
  ip: clauseSchema.optional().default({ on: true, text: '' }),
  termination: clauseSchema.optional().default({ on: true, text: '' }),
  confidentiality: clauseSchema.optional().default({ on: false, text: '' }),
  governingLaw: clauseSchema.optional().default({ on: true, text: '' }),
})

export const contractSchema = z.object({
  client_id: z
    .union([z.string().uuid(), z.null(), z.undefined(), z.literal('')])
    .transform((value) => emptyToNull(value)),

  template_type: z
    .union([z.enum(templateTypes), z.null(), z.undefined()])
    .transform((value) => value ?? null),

  project_name: optionalTrimmedString(255, 'Project name must be less than 255 characters'),

  scope: optionalTrimmedString(10000, 'Scope must be less than 10000 characters'),

  deliverables: z
    .array(deliverableItemSchema)
    .optional()
    .default([]),

  exclusions: optionalTrimmedString(5000, 'Exclusions must be less than 5000 characters'),

  start_date: z
    .union([z.string(), z.null(), z.undefined(), z.literal('')])
    .transform((value) => emptyToNull(value)),

  end_date: z
    .union([z.string(), z.null(), z.undefined(), z.literal('')])
    .transform((value) => emptyToNull(value)),

  milestones: z
    .array(milestoneItemSchema)
    .optional()
    .default([]),

  total_fee: z
    .union([z.number().min(0), z.null(), z.undefined()])
    .transform((value) => value ?? null),

  currency: z
    .string()
    .optional()
    .or(z.literal(''))
    .transform((value) => {
      const trimmed = (value ?? '').trim().toUpperCase()
      return trimmed === '' ? 'USD' : trimmed
    })
    .pipe(z.string().regex(/^[A-Z]{3}$/, 'Currency must be a 3-letter code')),

  payment_structure: z
    .union([z.enum(paymentStructureValues), z.null(), z.undefined(), z.literal('')])
    .transform((value) => (value === '' ? null : value ?? null)),

  payment_method: optionalTrimmedString(500, 'Payment method must be less than 500 characters'),

  clauses: clausesSchema.optional().default({
    revision: { on: true, text: '' },
    ip: { on: true, text: '' },
    termination: { on: true, text: '' },
    confidentiality: { on: false, text: '' },
    governingLaw: { on: true, text: '' },
  }),

  status: z
    .enum(statusInputValues)
    .optional()
    .default('sent')
    .transform((value) => normalizeStatus(value)),

  freelancer_name: optionalTrimmedString(255, 'Freelancer name must be less than 255 characters'),

  freelancer_email: optionalEmail,

  freelancer_location: optionalTrimmedString(255, 'Freelancer location must be less than 255 characters'),

  client_name: optionalTrimmedString(255, 'Client name must be less than 255 characters'),

  client_email: optionalEmail,
})

export const updateContractSchema = contractSchema.partial()

export type ContractFormData = z.infer<typeof contractSchema>
export type UpdateContractFormData = z.infer<typeof updateContractSchema>
export type ContractClauses = z.infer<typeof clausesSchema>
export type PaymentStructure = (typeof paymentStructureValues)[number]
export type ContractStatus = (typeof statusValues)[number]
