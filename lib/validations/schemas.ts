import { z } from 'zod'
export { clientSchema } from '@/lib/validations/client'
export type { ClientFormData as ClientInput } from '@/lib/validations/client'
export {
  startTimeLogSchema,
  manualTimeLogSchema,
  timeLogActionSchema,
} from '@/lib/validations/timeLog'
export type {
  StartTimeLogInput,
  ManualTimeLogInput,
  TimeLogActionInput,
} from '@/lib/validations/timeLog'

/**
 * Contract validation schema
 */
export const contractSchema = z.object({
  clientId: z.string().uuid('Invalid client'),
  projectScope: z.string().min(10, 'Project scope must be at least 10 characters').max(2000),
  timeline: z.string().optional(),
  paymentTerms: z.string().min(5, 'Payment terms required'),
  deliverables: z.string().optional(),
  clauses: z.string().optional(),
})

export type ContractInput = z.infer<typeof contractSchema>

/**
 * Invoice validation schema
 */
export const invoiceLineItemSchema = z.object({
  description: z.string().min(1, 'Description required').max(500),
  quantity: z.number().positive('Quantity must be positive'),
  rate: z.number().positive('Rate must be positive'),
})

export const invoiceSchema = z.object({
  clientId: z.string().uuid('Invalid client'),
  invoiceNumber: z.string().min(1, 'Invoice number required'),
  issueDate: z.coerce.date(),
  dueDate: z.coerce.date(),
  lineItems: z.array(invoiceLineItemSchema).min(1, 'At least one line item required'),
  taxRate: z.number().min(0).max(100).default(0),
  discount: z.number().min(0).default(0),
  notes: z.string().optional(),
  terms: z.string().optional(),
})

export type InvoiceInput = z.infer<typeof invoiceSchema>

/**
 * Time entry validation schema
 */
export const timeEntrySchema = z.object({
  clientId: z.string().uuid('Invalid client'),
  task: z.string().min(1, 'Task description required').max(500),
  notes: z.string().optional(),
  duration: z.number().positive('Duration must be positive'),
})

export type TimeEntryInput = z.infer<typeof timeEntrySchema>
