import { describe, expect, it } from 'vitest'
import {
  manualTimeLogSchema,
  startTimeLogSchema,
  timeLogActionSchema,
  updateTimeLogSchema,
} from '@/lib/validations/timeLog'

describe('time log schemas', () => {
  it('trims and normalizes start payloads', () => {
    const result = startTimeLogSchema.parse({
      taskName: '  Discovery workshop  ',
      clientId: '',
      notes: '  Kickoff call and notes  ',
    })

    expect(result).toEqual({
      taskName: 'Discovery workshop',
      clientId: null,
      notes: 'Kickoff call and notes',
    })
  })

  it('requires positive manual durations', () => {
    expect(() =>
      manualTimeLogSchema.parse({
        taskName: 'Research',
        durationMinutes: 0,
      })
    ).toThrow('Duration must be greater than 0')
  })

  it('validates ids for update and actions', () => {
    expect(() =>
      updateTimeLogSchema.parse({
        id: 'bad-id',
        taskName: 'Research',
      })
    ).toThrow('Invalid time entry')

    expect(() =>
      timeLogActionSchema.parse({
        id: 'still-bad',
      })
    ).toThrow('Invalid time entry')
  })
})
