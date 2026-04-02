'use client'

import React, { useMemo, useState } from 'react'
import { AddCircleBold, CloseCircleBold, Timer1Bold } from 'sicons'
import { useCurrentTime } from '@/hooks/useCurrentTime'
import { useClients } from '@/hooks/useClients'
import {
  useActiveTimeLog,
  usePauseTimeLog,
  useResumeTimeLog,
  useStopTimeLog,
  useTimeLogs,
} from '@/hooks/useTimeLogs'
import {
  formatHoursAndMinutes,
  getTimeLogElapsedMilliseconds,
  getTimeLogStatus,
  isSameDay,
  isSameWeek,
} from '@/lib/utils/time'
import type { TimeLog } from '@/lib/types/database'
import { TimerEntry } from './TimerEntry'
import { TimerForm } from './TimerForm'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement ||
    target.isContentEditable
  )
}

interface TimeTrackerProps {
  variant?: 'dashboard' | 'page'
  onCollapse?: () => void
}

export function TimeTracker({ variant = 'page', onCollapse }: TimeTrackerProps) {
  const formTransitionMs = 220
  const { data: timeLogs = [], isLoading, error } = useTimeLogs()
  const { data: activeTimer } = useActiveTimeLog()
  const { data: clients = [] } = useClients()
  const pauseTimeLog = usePauseTimeLog()
  const resumeTimeLog = useResumeTimeLog()
  const stopTimeLog = useStopTimeLog()

  const now = useCurrentTime()
  const [formMode, setFormMode] = useState<'start' | 'manual' | 'edit'>('start')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isFormMounted, setIsFormMounted] = useState(false)
  const [isFormVisible, setIsFormVisible] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [editingEntry, setEditingEntry] = useState<TimeLog | null>(null)

  const displayedTimers = useMemo(() => {
    return [...timeLogs].sort(
      (left, right) =>
        new Date(right.created_at).getTime() - new Date(left.created_at).getTime()
    )
  }, [timeLogs])

  const clientsById = useMemo(
    () => new Map(clients.map((client) => [client.id, client.name])),
    [clients]
  )

  const dailyTotal = useMemo(() => {
    return timeLogs.reduce((sum, timeLog) => {
      const referenceTime = new Date(timeLog.start_time).getTime()

      if (!isSameDay(referenceTime, now)) {
        return sum
      }

      return sum + getTimeLogElapsedMilliseconds(timeLog, now)
    }, 0)
  }, [now, timeLogs])

  const weeklyTotal = useMemo(() => {
    return timeLogs.reduce((sum, timeLog) => {
      const referenceTime = new Date(timeLog.start_time).getTime()

      if (!isSameWeek(referenceTime, now)) {
        return sum
      }

      return sum + getTimeLogElapsedMilliseconds(timeLog, now)
    }, 0)
  }, [now, timeLogs])

  const pausedTimer = useMemo(() => {
    return displayedTimers.find((timer) => getTimeLogStatus(timer) === 'paused') ?? null
  }, [displayedTimers])

  React.useEffect(() => {
    const handleKeyDown = async (event: KeyboardEvent) => {
      if (isFormOpen || isTypingTarget(event.target)) {
        return
      }

      try {
        if (event.code === 'Space') {
          event.preventDefault()

          if (activeTimer) {
            await pauseTimeLog.mutateAsync(activeTimer.id)
            return
          }

          if (pausedTimer) {
            await resumeTimeLog.mutateAsync(pausedTimer.id)
          }
        }

        if (event.key === 'Escape' && activeTimer) {
          event.preventDefault()
          await stopTimeLog.mutateAsync(activeTimer.id)
        }
      } catch (action) {
        setActionError(action instanceof Error ? action.message : 'Timer action failed.')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeTimer, isFormOpen, pauseTimeLog, pausedTimer, resumeTimeLog, stopTimeLog])

  React.useEffect(() => {
    if (isFormOpen) {
      setIsFormMounted(true)
      const frameId = window.requestAnimationFrame(() => {
        setIsFormVisible(true)
      })

      return () => window.cancelAnimationFrame(frameId)
    }

    setIsFormVisible(false)
    if (!isFormMounted) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      setIsFormMounted(false)
      setEditingEntry(null)
    }, formTransitionMs)

    return () => window.clearTimeout(timeoutId)
  }, [isFormMounted, isFormOpen])

  const runAction = async (action: () => Promise<unknown>) => {
    setActionError(null)
    try {
      await action()
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Timer action failed.')
    }
  }

  const isMutating =
    pauseTimeLog.isPending || resumeTimeLog.isPending || stopTimeLog.isPending
  const isTrackerFormExpanded = isFormOpen || isFormMounted
  const shouldShowList = !isFormMounted

  const trackerIcon = isTrackerFormExpanded ? AddCircleBold : Timer1Bold
  const trackerTitle = isTrackerFormExpanded ? 'Add Task' : 'Time Tracker'
  const TrackerIcon = trackerIcon

  const trackerLabel = onCollapse ? (
    <button
      type="button"
      onClick={onCollapse}
      className="theme-shell-chip inline-flex h-8 items-center gap-1 rounded-[8px] px-2"
      aria-label={isTrackerFormExpanded ? 'Collapse Add Task' : 'Collapse Time Tracker'}
    >
      <TrackerIcon size={16} />
      <span className="text-[14px] font-medium">{trackerTitle}</span>
    </button>
  ) : (
    <div className="theme-shell-chip inline-flex h-8 items-center gap-1 rounded-[8px] px-2">
      <TrackerIcon size={16} />
      <span className="text-[14px] font-medium">{trackerTitle}</span>
    </div>
  )

  return (
    <TooltipProvider delayDuration={180}>
      <div
        className={
          variant === 'page'
            ? 'mx-auto flex max-w-[820px] flex-col items-center gap-[9px]'
            : 'flex w-full flex-col items-center transition-[width,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]'
        }
      >
        <div
          className={`theme-shell-card flex w-full flex-col rounded-[14px] p-4 transition-[height] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            variant === 'dashboard' ? 'h-[341px]' : 'min-h-[520px]'
          }`}
        >
          <div className="flex items-center justify-between">
            {trackerLabel}
            {isTrackerFormExpanded ? (
              <button
                type="button"
                aria-label="Close add task form"
                onClick={() => {
                  setIsFormOpen(false)
                }}
                className="text-[var(--tertiary)]"
              >
                <CloseCircleBold size={24} />
              </button>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    aria-label="Add time entry"
                    onClick={() => {
                      setEditingEntry(null)
                      setFormMode('start')
                      setIsFormOpen(true)
                    }}
                    className="text-[var(--tertiary)]"
                  >
                    <AddCircleBold size={24} />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Add time entry</TooltipContent>
              </Tooltip>
            )}
          </div>

          <div className="theme-shell-divider mt-[10px] h-px w-full" />

          {error && (
            <div className="mt-4 rounded-[10px] bg-feedback-error-bg px-3 py-2 text-[13px] text-feedback-error-text">
              {error instanceof Error ? error.message : 'Failed to load time entries.'}
            </div>
          )}

          {actionError && (
            <div className="mt-4 rounded-[10px] bg-feedback-error-bg px-3 py-2 text-[13px] text-feedback-error-text">
              {actionError}
            </div>
          )}

          <div className="theme-scrollbar mt-4 min-h-0 flex-1 overflow-y-auto pr-1">
            {isFormMounted ? (
              <div
                className={`transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  isFormVisible
                    ? 'translate-y-0 opacity-100'
                    : 'pointer-events-none -translate-y-1 opacity-0'
                }`}
                style={{ transitionDuration: `${formTransitionMs}ms` }}
              >
                <TimerForm
                  isOpen={isFormMounted}
                  onClose={() => {
                    setIsFormOpen(false)
                  }}
                  mode={formMode}
                  entry={editingEntry}
                  renderMode="inline"
                />
              </div>
            ) : isLoading ? (
              <div className="rounded-[10px] bg-[var(--surface-card-subtle)] p-3 text-[13px] text-text-muted">
                Loading time entries...
              </div>
            ) : shouldShowList && displayedTimers.length === 0 ? (
              <div className="rounded-[10px] bg-[var(--surface-card-subtle)] p-3 text-[13px] text-text-muted">
                No time entries yet. Click + to start your first timer.
              </div>
            ) : shouldShowList ? (
              <div className="flex flex-col gap-[8px]">
                {displayedTimers.map((timer) => (
                  <TimerEntry
                    key={timer.id}
                    entry={timer}
                    clientName={timer.client_id ? clientsById.get(timer.client_id) ?? null : null}
                    now={now}
                    onEdit={() => {
                      setEditingEntry(timer)
                      setFormMode('edit')
                      setIsFormOpen(true)
                    }}
                    onPause={() => void runAction(() => pauseTimeLog.mutateAsync(timer.id))}
                    onResume={() => void runAction(() => resumeTimeLog.mutateAsync(timer.id))}
                    onStop={() => void runAction(() => stopTimeLog.mutateAsync(timer.id))}
                    isPending={isMutating}
                  />
                ))}
              </div>
            ) : null}
          </div>
        </div>

        {variant === 'page' && (
          <div className="theme-shell-card inline-flex items-center gap-[2px] rounded-[8px] px-1">
            <div className="flex h-6 items-center gap-1 px-1 text-[12px] text-text-muted">
              <span>Today:</span>
              <span>{formatHoursAndMinutes(dailyTotal)}</span>
            </div>
            <div className="theme-shell-divider h-6 w-px" />
            <div className="flex h-6 items-center gap-1 px-1 text-[12px] text-text-muted">
              <span>This Week:</span>
              <span>{formatHoursAndMinutes(weeklyTotal)}</span>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}
