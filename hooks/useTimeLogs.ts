import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { nanoid } from 'nanoid'
import {
  createManualTimeLog,
  createRunningTimeLog,
  deleteTimeLog,
  getActiveTimeLog,
  getTimeLogs,
  getTimeLogSummary,
  pauseTimeLog,
  resumeTimeLog,
  stopTimeLog,
  updateTimeLog,
} from '@/lib/api/timeLogs'
import type { TimeLogSummary } from '@/lib/api/timeLogs'
import { useSessionStore } from '@/stores/sessionStore'
import { useGuestStore } from '@/stores/guestStore'
import { track } from '@/lib/analytics'
import type { GuestTimeEntry } from '@/lib/types/guest'
import type { ManualTimeLogInput, StartTimeLogInput, UpdateTimeLogInput } from '@/lib/validations/timeLog'
import { isSameDay, isSameWeek } from '@/lib/utils/time'

const TIME_LOGS_QUERY_KEY = 'time-logs'

function invalidateTimeLogQueries(queryClient: ReturnType<typeof useQueryClient>) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: [TIME_LOGS_QUERY_KEY] }),
    queryClient.invalidateQueries({ queryKey: [TIME_LOGS_QUERY_KEY, 'active'] }),
    queryClient.invalidateQueries({ queryKey: [TIME_LOGS_QUERY_KEY, 'summary'] }),
  ])
}

/** Convert GuestTimeEntry to TimeLog shape */
function guestToTimeLog(g: GuestTimeEntry) {
  return { ...g, user_id: 'guest' as const }
}

export function useTimeLogs() {
  const isGuest = useSessionStore((s) => s.isGuest)
  const guestEntries = useGuestStore((s) => s.timeEntries)

  return useQuery({
    queryKey: [TIME_LOGS_QUERY_KEY],
    queryFn: isGuest ? () => guestEntries.map(guestToTimeLog) : getTimeLogs,
    staleTime: isGuest ? Infinity : 15 * 1000,
  })
}

export function useActiveTimeLog() {
  const isGuest = useSessionStore((s) => s.isGuest)
  const guestEntries = useGuestStore((s) => s.timeEntries)

  return useQuery({
    queryKey: [TIME_LOGS_QUERY_KEY, 'active'],
    queryFn: isGuest
      ? () => {
          const found = guestEntries.find((e) => e.is_running)
          return found ? guestToTimeLog(found) : null
        }
      : getActiveTimeLog,
    staleTime: isGuest ? Infinity : 5 * 1000,
  })
}

export function useTimeLogSummary() {
  const isGuest = useSessionStore((s) => s.isGuest)
  const guestEntries = useGuestStore((s) => s.timeEntries)

  return useQuery({
    queryKey: [TIME_LOGS_QUERY_KEY, 'summary'],
    queryFn: isGuest
      ? (): TimeLogSummary => {
          const now = Date.now()
          return guestEntries.reduce<TimeLogSummary>(
            (summary, e) => {
              const refTime = new Date(e.start_time).getTime()
              const dur = e.duration_seconds || 0
              if (isSameDay(refTime, now)) summary.todaySeconds += dur
              if (isSameWeek(refTime, now)) summary.weekSeconds += dur
              return summary
            },
            { todaySeconds: 0, weekSeconds: 0 }
          )
        }
      : getTimeLogSummary,
    staleTime: isGuest ? Infinity : 5 * 1000,
  })
}

export function useCreateRunningTimeLog() {
  const queryClient = useQueryClient()
  const isGuest = useSessionStore((s) => s.isGuest)

  return useMutation({
    mutationFn: async (data: StartTimeLogInput) => {
      if (isGuest) {
        const now = new Date().toISOString()
        const entry: GuestTimeEntry = {
          id: nanoid(),
          client_id: data.clientId || null,
          task_name: data.taskName || '',
          notes: data.notes || null,
          start_time: now,
          end_time: null,
          duration_seconds: null,
          is_running: true,
          created_at: now,
          updated_at: now,
        }
        useGuestStore.getState().addTimeEntry(entry)
        return entry
      }
      return createRunningTimeLog(data)
    },
    onSuccess: async () => {
      track('timer_started')
      await invalidateTimeLogQueries(queryClient)
    },
  })
}

export function useCreateManualTimeLog() {
  const queryClient = useQueryClient()
  const isGuest = useSessionStore((s) => s.isGuest)

  return useMutation({
    mutationFn: async (data: ManualTimeLogInput) => {
      if (isGuest) {
        const now = new Date()
        const durationSeconds = Math.floor(data.durationMinutes * 60)
        const startTime = new Date(now.getTime() - durationSeconds * 1000)
        const entry: GuestTimeEntry = {
          id: nanoid(),
          client_id: data.clientId || null,
          task_name: data.taskName || '',
          notes: data.notes || null,
          start_time: startTime.toISOString(),
          end_time: now.toISOString(),
          duration_seconds: durationSeconds,
          is_running: false,
          created_at: now.toISOString(),
          updated_at: now.toISOString(),
        }
        useGuestStore.getState().addTimeEntry(entry)
        return entry
      }
      return createManualTimeLog(data)
    },
    onSuccess: async () => {
      track('timer_stopped')
      await invalidateTimeLogQueries(queryClient)
    },
  })
}

export function useUpdateTimeLog() {
  const queryClient = useQueryClient()
  const isGuest = useSessionStore((s) => s.isGuest)

  return useMutation({
    mutationFn: async (data: UpdateTimeLogInput) => {
      if (isGuest) {
        useGuestStore.getState().updateTimeEntry(data.id, {
          task_name: data.taskName,
          notes: data.notes ?? undefined,
          client_id: data.clientId ?? undefined,
        })
        return useGuestStore.getState().timeEntries.find((e) => e.id === data.id)
      }
      return updateTimeLog(data)
    },
    onSuccess: async () => {
      track('timer_stopped')
      await invalidateTimeLogQueries(queryClient)
    },
  })
}

export function usePauseTimeLog() {
  const queryClient = useQueryClient()
  const isGuest = useSessionStore((s) => s.isGuest)

  return useMutation({
    mutationFn: async (id: string) => {
      if (isGuest) {
        const entry = useGuestStore.getState().timeEntries.find((e) => e.id === id)
        if (entry) {
          const elapsed = Math.floor(
            (Date.now() - new Date(entry.start_time).getTime()) / 1000
          )
          useGuestStore.getState().updateTimeEntry(id, {
            is_running: false,
            duration_seconds: elapsed,
            end_time: null,
          })
        }
        return
      }
      return pauseTimeLog(id)
    },
    onSuccess: async () => {
      await invalidateTimeLogQueries(queryClient)
    },
  })
}

export function useResumeTimeLog() {
  const queryClient = useQueryClient()
  const isGuest = useSessionStore((s) => s.isGuest)

  return useMutation({
    mutationFn: async (id: string) => {
      if (isGuest) {
        useGuestStore.getState().updateTimeEntry(id, {
          is_running: true,
          start_time: new Date().toISOString(),
          end_time: null,
        })
        return
      }
      return resumeTimeLog(id)
    },
    onSuccess: async () => {
      await invalidateTimeLogQueries(queryClient)
    },
  })
}

export function useStopTimeLog() {
  const queryClient = useQueryClient()
  const isGuest = useSessionStore((s) => s.isGuest)

  return useMutation({
    mutationFn: async (id: string) => {
      if (isGuest) {
        const entry = useGuestStore.getState().timeEntries.find((e) => e.id === id)
        if (entry) {
          const elapsed = Math.floor(
            (Date.now() - new Date(entry.start_time).getTime()) / 1000
          )
          useGuestStore.getState().updateTimeEntry(id, {
            is_running: false,
            duration_seconds: elapsed,
            end_time: new Date().toISOString(),
          })
        }
        return
      }
      return stopTimeLog(id)
    },
    onSuccess: async () => {
      await invalidateTimeLogQueries(queryClient)
    },
  })
}

export function useDeleteTimeLog() {
  const queryClient = useQueryClient()
  const isGuest = useSessionStore((s) => s.isGuest)

  return useMutation({
    mutationFn: async (id: string) => {
      if (isGuest) {
        useGuestStore.getState().deleteTimeEntry(id)
        return
      }
      return deleteTimeLog(id)
    },
    onSuccess: async () => {
      await invalidateTimeLogQueries(queryClient)
    },
  })
}
