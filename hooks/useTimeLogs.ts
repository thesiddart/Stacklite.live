import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
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
import type { ManualTimeLogInput, StartTimeLogInput, UpdateTimeLogInput } from '@/lib/validations/timeLog'

const TIME_LOGS_QUERY_KEY = 'time-logs'

function invalidateTimeLogQueries(queryClient: ReturnType<typeof useQueryClient>) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: [TIME_LOGS_QUERY_KEY] }),
    queryClient.invalidateQueries({ queryKey: [TIME_LOGS_QUERY_KEY, 'active'] }),
    queryClient.invalidateQueries({ queryKey: [TIME_LOGS_QUERY_KEY, 'summary'] }),
  ])
}

export function useTimeLogs() {
  return useQuery({
    queryKey: [TIME_LOGS_QUERY_KEY],
    queryFn: getTimeLogs,
    staleTime: 15 * 1000,
  })
}

export function useActiveTimeLog() {
  return useQuery({
    queryKey: [TIME_LOGS_QUERY_KEY, 'active'],
    queryFn: getActiveTimeLog,
    staleTime: 5 * 1000,
  })
}

export function useTimeLogSummary() {
  return useQuery({
    queryKey: [TIME_LOGS_QUERY_KEY, 'summary'],
    queryFn: getTimeLogSummary,
    staleTime: 5 * 1000,
  })
}

export function useCreateRunningTimeLog() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: StartTimeLogInput) => createRunningTimeLog(data),
    onSuccess: async () => {
      await invalidateTimeLogQueries(queryClient)
    },
  })
}

export function useCreateManualTimeLog() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ManualTimeLogInput) => createManualTimeLog(data),
    onSuccess: async () => {
      await invalidateTimeLogQueries(queryClient)
    },
  })
}

export function useUpdateTimeLog() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateTimeLogInput) => updateTimeLog(data),
    onSuccess: async () => {
      await invalidateTimeLogQueries(queryClient)
    },
  })
}

export function usePauseTimeLog() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => pauseTimeLog(id),
    onSuccess: async () => {
      await invalidateTimeLogQueries(queryClient)
    },
  })
}

export function useResumeTimeLog() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => resumeTimeLog(id),
    onSuccess: async () => {
      await invalidateTimeLogQueries(queryClient)
    },
  })
}

export function useStopTimeLog() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => stopTimeLog(id),
    onSuccess: async () => {
      await invalidateTimeLogQueries(queryClient)
    },
  })
}

export function useDeleteTimeLog() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteTimeLog(id),
    onSuccess: async () => {
      await invalidateTimeLogQueries(queryClient)
    },
  })
}
