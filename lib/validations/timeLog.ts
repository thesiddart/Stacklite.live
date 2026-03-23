import { z } from 'zod'

const emptyToNull = (value: string | null | undefined) => {
  if (typeof value !== 'string') {
    return null
  }

  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}

const capitalizeFirstLetter = (value: string) => {
  const trimmed = value.trim()

  if (trimmed === '') {
    return trimmed
  }

  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1)
}

const optionalNullableTrimmedString = (max: number, message: string) =>
  z
    .union([z.string().max(max, message), z.null(), z.undefined(), z.literal('')])
    .transform((value) => emptyToNull(value))

export const timeLogActionSchema = z.object({
  id: z.string().uuid('Invalid time entry'),
})

export const startTimeLogSchema = z.object({
  taskName: z
    .string()
    .min(1, 'Task name is required')
    .max(500, 'Task name must be less than 500 characters')
    .transform((value) => capitalizeFirstLetter(value)),
  clientId: z
    .union([z.string().uuid('Invalid client'), z.null(), z.undefined(), z.literal('')])
    .transform((value) => emptyToNull(value)),
  notes: optionalNullableTrimmedString(2000, 'Notes must be less than 2000 characters'),
})

export const manualTimeLogSchema = startTimeLogSchema.extend({
  durationMinutes: z
    .number()
    .finite('Duration must be a valid number')
    .positive('Duration must be greater than 0'),
})

export const updateTimeLogSchema = startTimeLogSchema.extend({
  id: z.string().uuid('Invalid time entry'),
})

export type StartTimeLogInput = z.infer<typeof startTimeLogSchema>
export type ManualTimeLogInput = z.infer<typeof manualTimeLogSchema>
export type UpdateTimeLogInput = z.infer<typeof updateTimeLogSchema>
export type TimeLogActionInput = z.infer<typeof timeLogActionSchema>
