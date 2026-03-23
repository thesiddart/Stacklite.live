import { z } from 'zod'

/**
 * Client validation schemas
 * Used for form validation and API input sanitization
 */

const companyTypeValues = [
  'individual',
  'sole_proprietorship',
  'llc',
  'corporation',
  'partnership',
  'nonprofit',
  'agency',
  'other',
] as const

const contactMethodValues = ['email', 'phone', 'sms', 'whatsapp', 'none'] as const

const emptyToNull = (value: string | null | undefined) => {
  if (typeof value !== 'string') {
    return null
  }

  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}

const optionalTrimmedString = (max: number, message: string) =>
  z
    .union([
      z.string().max(max, message),
      z.null(),
      z.undefined(),
    ])
    .transform((value) => emptyToNull(value))

const nullableMetadataSchema = z
  .union([
    z.record(z.unknown()),
    z
      .string()
      .optional()
      .or(z.literal(''))
      .refine((value) => {
        const parsed = emptyToNull(value)
        if (!parsed) return true
        try {
          JSON.parse(parsed)
          return true
        } catch {
          return false
        }
      }, 'Metadata must be valid JSON')
      .transform((value) => {
        const parsed = emptyToNull(value)
        if (!parsed) return null
        return JSON.parse(parsed) as Record<string, unknown>
      }),
  ])
  .nullable()
  .optional()
  .transform((value) => value ?? null)

export const clientSchema = z.object({
  name: z
    .string()
    .min(1, 'Client name is required')
    .max(255, 'Client name must be less than 255 characters')
    .transform((value) => value.trim()),
  
  email: z
    .union([
      z.string().email('Invalid email address'),
      z.null(),
      z.undefined(),
      z.literal(''),
    ])
    .transform((value) => emptyToNull(value)),
  
  phone: optionalTrimmedString(50, 'Phone number must be less than 50 characters'),
  
  company_name: optionalTrimmedString(255, 'Company name must be less than 255 characters'),
  
  address: optionalTrimmedString(500, 'Address must be less than 500 characters'),

  contact_person_first_name: optionalTrimmedString(
    120,
    'Contact first name must be less than 120 characters'
  ),

  contact_person_last_name: optionalTrimmedString(
    120,
    'Contact last name must be less than 120 characters'
  ),

  company_type: z
    .union([z.enum(companyTypeValues), z.null(), z.undefined(), z.literal('')])
    .transform((value) => (value === '' ? null : value)),

  tax_id: optionalTrimmedString(100, 'Tax ID must be less than 100 characters'),

  website: z
    .union([
      z.string().url('Website must be a valid URL'),
      z.null(),
      z.undefined(),
      z.literal(''),
    ])
    .transform((value) => emptyToNull(value)),

  industry: optionalTrimmedString(120, 'Industry must be less than 120 characters'),

  preferred_contact_method: z
    .union([z.enum(contactMethodValues), z.null(), z.undefined(), z.literal('')])
    .transform((value) => (value === '' ? null : value)),

  payment_currency: z
    .string()
    .optional()
    .or(z.literal(''))
    .transform((value) => {
      const trimmed = value.trim().toUpperCase()
      return trimmed === '' ? 'USD' : trimmed
    })
    .pipe(z.string().regex(/^[A-Z]{3}$/, 'Payment currency must be a 3-letter currency code')),

  payment_terms: optionalTrimmedString(255, 'Payment terms must be less than 255 characters'),

  country: optionalTrimmedString(120, 'Country must be less than 120 characters'),

  state_province: optionalTrimmedString(120, 'State/Province must be less than 120 characters'),

  postal_code: optionalTrimmedString(30, 'Postal code must be less than 30 characters'),

  is_active: z.boolean().optional().default(true),

  tags: z
    .union([
      z.array(z.string()),
      z.null(),
      z.string().optional().or(z.literal('')),
    ])
    .optional()
    .transform((value) => {
      if (value === null) {
        return null
      }

      if (Array.isArray(value)) {
        const cleaned = value.map((item) => item.trim()).filter(Boolean)
        return cleaned.length ? cleaned : null
      }

      const parsed = emptyToNull(value ?? '')
      if (!parsed) return null

      const cleaned = parsed
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)

      return cleaned.length ? cleaned : null
    }),

  metadata: nullableMetadataSchema,

  last_contacted_at: z
    .union([z.string(), z.null(), z.undefined(), z.literal('')])
    .refine((value) => {
      const parsed = emptyToNull(value)
      if (!parsed) return true
      return !Number.isNaN(new Date(parsed).getTime())
    }, 'Last contacted date is invalid')
    .transform((value) => {
      const parsed = emptyToNull(value)
      if (!parsed) return null
      return new Date(parsed).toISOString()
    }),
  
  notes: optionalTrimmedString(2000, 'Notes must be less than 2000 characters'),
})

export const updateClientSchema = clientSchema.partial()

export type ClientFormData = z.infer<typeof clientSchema>
export type UpdateClientFormData = z.infer<typeof updateClientSchema>
