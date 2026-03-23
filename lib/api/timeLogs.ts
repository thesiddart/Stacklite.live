import { createClient as createSupabaseClient } from '@/lib/supabase/client'
import type { TimeLog, TimeLogInsert, TimeLogUpdate } from '@/lib/types/database'
import {
  manualTimeLogSchema,
  startTimeLogSchema,
  timeLogActionSchema,
  updateTimeLogSchema,
  type ManualTimeLogInput,
  type StartTimeLogInput,
  type UpdateTimeLogInput,
} from '@/lib/validations/timeLog'
import { isSameDay, isSameWeek } from '@/lib/utils/time'

export interface TimeLogSummary {
  todaySeconds: number
  weekSeconds: number
}

function toTimeLogApiError(action: string, message: string): Error {
  if (message.includes("Could not find the table 'public.time_logs' in the schema cache")) {
    return new Error(
      "Database is not initialized: 'public.time_logs' table is missing. Apply Supabase migrations to your active project and refresh."
    )
  }

  if (message.includes('time_logs_user_id_fkey')) {
    return new Error(
      "Your profile record is missing. Please refresh and try again; we'll create your profile automatically before creating a time entry."
    )
  }

  return new Error(`Failed to ${action}: ${message}`)
}

function getDurationSeconds(timeLog: Pick<TimeLog, 'duration_seconds'>) {
  return timeLog.duration_seconds ?? 0
}

function getRunningDurationSeconds(timeLog: Pick<TimeLog, 'duration_seconds' | 'start_time'>, now: Date) {
  const startedAt = new Date(timeLog.start_time)
  const elapsedSeconds = Math.max(
    0,
    Math.floor((now.getTime() - startedAt.getTime()) / 1000)
  )

  return getDurationSeconds(timeLog) + elapsedSeconds
}

async function getAuthenticatedUser() {
  const supabase = createSupabaseClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    throw new Error('User not authenticated')
  }

  if (!user.email) {
    throw new Error('Authenticated user email is missing')
  }

  return { supabase, user }
}

async function ensureProfile() {
  const { supabase, user } = await getAuthenticatedUser()
  const { error } = await supabase
    .from('profiles')
    .upsert(
      {
        id: user.id,
        email: user.email,
      },
      { onConflict: 'id' }
    )

  if (error) {
    throw new Error(`Failed to ensure profile: ${error.message}`)
  }

  return { supabase, user }
}

async function getTimeLogById(id: string) {
  const { supabase } = await getAuthenticatedUser()
  const { data, error } = await supabase.from('time_logs').select('*').eq('id', id).single()

  if (error) {
    throw toTimeLogApiError('fetch time entry', error.message)
  }

  return { supabase, timeLog: data as TimeLog }
}

async function pauseRunningLogs(excludeId?: string) {
  const { supabase } = await getAuthenticatedUser()
  let query = supabase.from('time_logs').select('*').eq('is_running', true)

  if (excludeId) {
    query = query.neq('id', excludeId)
  }

  const { data, error } = await query

  if (error) {
    throw toTimeLogApiError('fetch running time entries', error.message)
  }

  const runningLogs = (data ?? []) as TimeLog[]

  if (runningLogs.length === 0) {
    return
  }

  const now = new Date()

  await Promise.all(
    runningLogs.map(async (timeLog) => {
      const durationSeconds = getRunningDurationSeconds(timeLog, now)
      const { error: updateError } = await supabase
        .from('time_logs')
        .update({
          duration_seconds: durationSeconds,
          is_running: false,
          end_time: null,
        })
        .eq('id', timeLog.id)

      if (updateError) {
        throw toTimeLogApiError('pause running time entry', updateError.message)
      }
    })
  )
}

export async function getTimeLogs(): Promise<TimeLog[]> {
  const { supabase } = await getAuthenticatedUser()
  const { data, error } = await supabase
    .from('time_logs')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw toTimeLogApiError('fetch time entries', error.message)
  }

  return (data ?? []) as TimeLog[]
}

export async function getActiveTimeLog(): Promise<TimeLog | null> {
  const { supabase } = await getAuthenticatedUser()
  const { data, error } = await supabase
    .from('time_logs')
    .select('*')
    .eq('is_running', true)
    .order('updated_at', { ascending: false })
    .limit(1)

  if (error) {
    throw toTimeLogApiError('fetch active time entry', error.message)
  }

  return ((data ?? [])[0] as TimeLog | undefined) ?? null
}

export async function createRunningTimeLog(formData: StartTimeLogInput): Promise<TimeLog> {
  const validated = startTimeLogSchema.parse(formData)
  const { supabase, user } = await ensureProfile()
  await pauseRunningLogs()

  const insertData: TimeLogInsert = {
    user_id: user.id,
    client_id: validated.clientId,
    task_name: validated.taskName,
    start_time: new Date().toISOString(),
    end_time: null,
    duration_seconds: null,
    notes: validated.notes,
    is_running: true,
  }

  const { data, error } = await supabase
    .from('time_logs')
    .insert(insertData)
    .select()
    .single()

  if (error) {
    throw toTimeLogApiError('create running time entry', error.message)
  }

  return data as TimeLog
}

export async function createManualTimeLog(formData: ManualTimeLogInput): Promise<TimeLog> {
  const validated = manualTimeLogSchema.parse(formData)
  const { supabase, user } = await ensureProfile()
  const endTime = new Date()
  const durationSeconds = Math.floor(validated.durationMinutes * 60)
  const startTime = new Date(endTime.getTime() - durationSeconds * 1000)

  const insertData: TimeLogInsert = {
    user_id: user.id,
    client_id: validated.clientId,
    task_name: validated.taskName,
    start_time: startTime.toISOString(),
    end_time: endTime.toISOString(),
    duration_seconds: durationSeconds,
    notes: validated.notes,
    is_running: false,
  }

  const { data, error } = await supabase
    .from('time_logs')
    .insert(insertData)
    .select()
    .single()

  if (error) {
    throw toTimeLogApiError('create manual time entry', error.message)
  }

  return data as TimeLog
}

export async function updateTimeLog(formData: UpdateTimeLogInput): Promise<TimeLog> {
  const validated = updateTimeLogSchema.parse(formData)
  const { supabase } = await getAuthenticatedUser()

  const updateData: TimeLogUpdate = {
    task_name: validated.taskName,
    client_id: validated.clientId,
    notes: validated.notes,
  }

  const { data, error } = await supabase
    .from('time_logs')
    .update(updateData)
    .eq('id', validated.id)
    .select()
    .single()

  if (error) {
    throw toTimeLogApiError('update time entry', error.message)
  }

  return data as TimeLog
}

export async function pauseTimeLog(id: string): Promise<TimeLog> {
  const validated = timeLogActionSchema.parse({ id })
  const { supabase, timeLog } = await getTimeLogById(validated.id)

  if (!timeLog.is_running) {
    return timeLog
  }

  const durationSeconds = getRunningDurationSeconds(timeLog, new Date())
  const { data, error } = await supabase
    .from('time_logs')
    .update({
      duration_seconds: durationSeconds,
      is_running: false,
      end_time: null,
    })
    .eq('id', timeLog.id)
    .select()
    .single()

  if (error) {
    throw toTimeLogApiError('pause time entry', error.message)
  }

  return data as TimeLog
}

export async function resumeTimeLog(id: string): Promise<TimeLog> {
  const validated = timeLogActionSchema.parse({ id })
  const { supabase, timeLog } = await getTimeLogById(validated.id)

  if (timeLog.is_running) {
    return timeLog
  }

  if (timeLog.end_time) {
    throw new Error('Completed time entries cannot be resumed')
  }

  await pauseRunningLogs(timeLog.id)

  const { data, error } = await supabase
    .from('time_logs')
    .update({
      start_time: new Date().toISOString(),
      is_running: true,
      end_time: null,
    })
    .eq('id', timeLog.id)
    .select()
    .single()

  if (error) {
    throw toTimeLogApiError('resume time entry', error.message)
  }

  return data as TimeLog
}

export async function stopTimeLog(id: string): Promise<TimeLog> {
  const validated = timeLogActionSchema.parse({ id })
  const { supabase, timeLog } = await getTimeLogById(validated.id)
  const now = new Date()
  const durationSeconds = timeLog.is_running
    ? getRunningDurationSeconds(timeLog, now)
    : getDurationSeconds(timeLog)

  const { data, error } = await supabase
    .from('time_logs')
    .update({
      duration_seconds: durationSeconds,
      is_running: false,
      end_time: now.toISOString(),
    })
    .eq('id', timeLog.id)
    .select()
    .single()

  if (error) {
    throw toTimeLogApiError('stop time entry', error.message)
  }

  return data as TimeLog
}

export async function deleteTimeLog(id: string): Promise<void> {
  const validated = timeLogActionSchema.parse({ id })
  const { supabase } = await getAuthenticatedUser()
  const { error } = await supabase.from('time_logs').delete().eq('id', validated.id)

  if (error) {
    throw toTimeLogApiError('delete time entry', error.message)
  }
}

export async function getTimeLogSummary(): Promise<TimeLogSummary> {
  const timeLogs = await getTimeLogs()
  const now = Date.now()

  return timeLogs.reduce<TimeLogSummary>(
    (summary, timeLog) => {
      const referenceTime = new Date(timeLog.start_time).getTime()
      const durationSeconds = timeLog.is_running
        ? getRunningDurationSeconds(timeLog, new Date(now))
        : getDurationSeconds(timeLog)

      if (isSameDay(referenceTime, now)) {
        summary.todaySeconds += durationSeconds
      }

      if (isSameWeek(referenceTime, now)) {
        summary.weekSeconds += durationSeconds
      }

      return summary
    },
    { todaySeconds: 0, weekSeconds: 0 }
  )
}
