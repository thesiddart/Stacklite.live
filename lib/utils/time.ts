import type { TimeLog } from '@/lib/types/database'

export function getElapsedMilliseconds(elapsedMs: number, startedAt: number | null, now: number) {
  if (startedAt === null) {
    return elapsedMs
  }

  return elapsedMs + Math.max(0, now - startedAt)
}

export function formatDuration(ms: number) {
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return [hours, minutes, seconds].map((value) => String(value).padStart(2, '0')).join(':')
}

export function formatHoursAndMinutes(ms: number) {
  const totalMinutes = Math.floor(ms / 60000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  if (hours === 0) {
    return `${minutes}m`
  }

  return `${hours}h ${minutes}m`
}

export function isSameDay(timestamp: number, now: number) {
  const source = new Date(timestamp)
  const target = new Date(now)

  return (
    source.getFullYear() === target.getFullYear() &&
    source.getMonth() === target.getMonth() &&
    source.getDate() === target.getDate()
  )
}

export function isSameWeek(timestamp: number, now: number) {
  const target = new Date(now)
  const startOfWeek = new Date(target)
  const day = startOfWeek.getDay()
  const diff = day === 0 ? 6 : day - 1

  startOfWeek.setHours(0, 0, 0, 0)
  startOfWeek.setDate(startOfWeek.getDate() - diff)

  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(endOfWeek.getDate() + 7)

  return timestamp >= startOfWeek.getTime() && timestamp < endOfWeek.getTime()
}

export function formatTimestamp(timestamp: number) {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    month: 'short',
    day: 'numeric',
  }).format(timestamp)
}

export function getTimeLogStatus(timeLog: Pick<TimeLog, 'is_running' | 'end_time'>) {
  if (timeLog.is_running) {
    return 'running' as const
  }

  if (timeLog.end_time) {
    return 'completed' as const
  }

  return 'paused' as const
}

export function getTimeLogElapsedMilliseconds(
  timeLog: Pick<TimeLog, 'duration_seconds' | 'is_running' | 'start_time'>,
  now: number
) {
  const persistedMs = (timeLog.duration_seconds ?? 0) * 1000

  if (!timeLog.is_running) {
    return persistedMs
  }

  const startedAt = new Date(timeLog.start_time).getTime()
  return persistedMs + Math.max(0, now - startedAt)
}
