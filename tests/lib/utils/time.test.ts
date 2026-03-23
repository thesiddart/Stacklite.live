import { describe, expect, it } from 'vitest'
import {
  formatDuration,
  formatHoursAndMinutes,
  getElapsedMilliseconds,
  getTimeLogElapsedMilliseconds,
  getTimeLogStatus,
  isSameDay,
  isSameWeek,
} from '@/lib/utils/time'

describe('time utils', () => {
  it('formats full durations as hh:mm:ss', () => {
    expect(formatDuration(3_661_000)).toBe('01:01:01')
    expect(formatDuration(59_000)).toBe('00:00:59')
  })

  it('formats summary durations as hours and minutes', () => {
    expect(formatHoursAndMinutes(45 * 60 * 1000)).toBe('45m')
    expect(formatHoursAndMinutes((2 * 60 + 15) * 60 * 1000)).toBe('2h 15m')
  })

  it('calculates elapsed milliseconds from a persisted baseline', () => {
    expect(getElapsedMilliseconds(30_000, null, 100_000)).toBe(30_000)
    expect(getElapsedMilliseconds(30_000, 80_000, 100_000)).toBe(50_000)
  })

  it('checks same-day and same-week boundaries', () => {
    const mondayMorning = new Date(2026, 2, 23, 9, 0, 0, 0).getTime()
    const mondayEvening = new Date(2026, 2, 23, 18, 0, 0, 0).getTime()
    const sundayEvening = new Date(2026, 2, 29, 18, 0, 0, 0).getTime()
    const nextMonday = new Date(2026, 2, 30, 9, 0, 0, 0).getTime()

    expect(isSameDay(mondayMorning, mondayEvening)).toBe(true)
    expect(isSameDay(mondayMorning, nextMonday)).toBe(false)
    expect(isSameWeek(mondayMorning, sundayEvening)).toBe(true)
    expect(isSameWeek(mondayMorning, nextMonday)).toBe(false)
  })

  it('derives time log status and elapsed time correctly', () => {
    const runningLog = {
      duration_seconds: 90,
      is_running: true,
      start_time: '2026-03-23T10:00:00.000Z',
      end_time: null,
    }
    const pausedLog = {
      duration_seconds: 120,
      is_running: false,
      start_time: '2026-03-23T10:00:00.000Z',
      end_time: null,
    }
    const completedLog = {
      duration_seconds: 150,
      is_running: false,
      start_time: '2026-03-23T10:00:00.000Z',
      end_time: '2026-03-23T10:05:00.000Z',
    }

    expect(getTimeLogStatus(runningLog)).toBe('running')
    expect(getTimeLogStatus(pausedLog)).toBe('paused')
    expect(getTimeLogStatus(completedLog)).toBe('completed')

    expect(
      getTimeLogElapsedMilliseconds(runningLog, new Date('2026-03-23T10:01:00.000Z').getTime())
    ).toBe(150_000)
    expect(getTimeLogElapsedMilliseconds(pausedLog, Date.now())).toBe(120_000)
  })
})
