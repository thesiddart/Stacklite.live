import { z } from 'zod'

/**
 * Invoice validation schemas
 * Used for form validation and API input sanitization
 */

const statusValues = ['unpaid', 'paid', 'archived'] as const
const discountTypeValues = ['flat', 'percent'] as const

const emptyToNull = (value: string | null | undefined) => {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}

const optionalTrimmedString = (max: number, message: string) =>
  z
    .union([z.string().max(max, message), z.null(), z.undefined()])
    .transform((value) => emptyToNull(value))

const lineItemSchema = z.object({
  id: z.string(),
  description: z.string().min(1, 'Description is required'),
  qty: z.number().min(0, 'Quantity must be >= 0'),
  rate: z.number().min(0, 'Rate must be >= 0'),
  amount: z.number(),
  timeEntryId: z.string().optional(),
})

export const invoiceSchema = z.object({
  client_id: z
    .union([z.string().uuid(), z.null(), z.undefined(), z.literal('')])
    .transform((value) => emptyToNull(value)),

  contract_id: z
    .union([z.string().uuid(), z.null(), z.undefined(), z.literal('')])
    .transform((value) => emptyToNull(value)),

  invoice_number: z.string().min(1, 'Invoice number is required'),

  issue_date: z.string().min(1, 'Issue date is required'),

  due_date: z.string().min(1, 'Due date is required'),

  line_items: z.array(lineItemSchema).min(1, 'At least one line item is required'),

  currency: z
    .string()
    .optional()
    .or(z.literal(''))
    .transform((value) => {
      const trimmed = (value ?? '').trim().toUpperCase()
      return trimmed === '' ? 'USD' : trimmed
    })
    .pipe(z.string().regex(/^[A-Z]{3}$/, 'Currency must be a 3-letter code')),

  tax_rate: z
    .union([z.number().min(0), z.null(), z.undefined()])
    .transform((value) => value ?? null),

  discount_type: z
    .union([z.enum(discountTypeValues), z.null(), z.undefined(), z.literal('')])
    .transform((value) => (value === '' ? null : value ?? null)),

  discount_value: z
    .union([z.number().min(0), z.null(), z.undefined()])
    .transform((value) => value ?? null),

  subtotal: z.number().min(0),

  total: z.number(),

  payment_method: optionalTrimmedString(500, 'Payment method must be less than 500 characters'),

  payment_instructions: optionalTrimmedString(2000, 'Payment instructions must be less than 2000 characters'),

  notes_to_client: optionalTrimmedString(5000, 'Notes must be less than 5000 characters'),

  internal_notes: optionalTrimmedString(5000, 'Internal notes must be less than 5000 characters'),

  status: z
    .enum(statusValues)
    .optional()
    .default('unpaid'),
})

export const updateInvoiceSchema = invoiceSchema.partial()

export type InvoiceFormData = z.infer<typeof invoiceSchema>
export type UpdateInvoiceFormData = z.infer<typeof updateInvoiceSchema>
export type InvoiceStatus = (typeof statusValues)[number]
export type DiscountType = (typeof discountTypeValues)[number]
