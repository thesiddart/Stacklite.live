'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { AddBold, ClockBold, DangerBold, EditBold, KeyboardBold } from 'sicons'
import { Button } from '@/components/ui/Button'
import { KEYBOARD_SHORTCUTS } from '@/lib/constants/design-system'
import { formatDuration, formatHoursAndMinutes, getElapsedMilliseconds, isSameDay, isSameWeek } from '@/lib/utils/time'
import { useTimerStore } from '@/stores/timerStore'
import { TimerEntry } from './TimerEntry'
import { TimerForm } from './TimerForm'

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

export function TimeTracker() {
  const timers = useTimerStore((state) => state.timers)
  const activeTimerId = useTimerStore((state) => state.activeTimerId)
  const pauseTimer = useTimerStore((state) => state.pauseTimer)
  const resumeTimer = useTimerStore((state) => state.resumeTimer)
  const stopTimer = useTimerStore((state) => state.stopTimer)
  const deleteTimer = useTimerStore((state) => state.deleteTimer)
  const clearCompleted = useTimerStore((state) => state.clearCompleted)

  const [now, setNow] = useState(Date.now())
  const [formMode, setFormMode] = useState<'start' | 'manual'>('start')
  const [isFormOpen, setIsFormOpen] = useState(false)

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNow(Date.now())
    }, 1000)

    return () => window.clearInterval(interval)
  }, [])

  const activeTimer = timers.find((timer) => timer.id === activeTimerId) ?? null

  const displayedTimers = useMemo(() => {
    return [...timers].sort((left, right) => right.createdAt - left.createdAt)
  }, [timers])

  const dailyTotal = useMemo(() => {
    return timers.reduce((sum, timer) => {
      if (!isSameDay(timer.createdAt, now)) {
        return sum
      }

      return sum + getElapsedMilliseconds(timer.elapsedMs, timer.startedAt, now)
    }, 0)
  }, [now, timers])

  const weeklyTotal = useMemo(() => {
    return timers.reduce((sum, timer) => {
      if (!isSameWeek(timer.createdAt, now)) {
        return sum
      }

      return sum + getElapsedMilliseconds(timer.elapsedMs, timer.startedAt, now)
    }, 0)
  }, [now, timers])

  const pausedTimer = useMemo(() => {
    return displayedTimers.find((timer) => timer.status === 'paused') ?? null
  }, [displayedTimers])

  const heroTimer = activeTimer ?? pausedTimer
  const heroElapsed = heroTimer
    ? getElapsedMilliseconds(heroTimer.elapsedMs, heroTimer.startedAt, now)
    : 0

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isFormOpen || isTypingTarget(event.target)) {
        return
      }

      if (event.code === 'Space') {
        event.preventDefault()

        if (activeTimer) {
          pauseTimer(activeTimer.id)
          return
        }

        if (pausedTimer) {
          resumeTimer(pausedTimer.id)
          return
        }

        setFormMode('start')
        setIsFormOpen(true)
      }

      if (event.key === 'Escape' && activeTimer) {
        event.preventDefault()
        stopTimer(activeTimer.id)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeTimer, isFormOpen, pauseTimer, pausedTimer, resumeTimer, stopTimer])

  return (
    <>
      <div className="flex h-full flex-col gap-lg">
        <div className="rounded-lg border border-border-muted bg-background-highlight/40 p-lg shadow-sm">
          <div className="flex items-start justify-between gap-md">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-text-muted">Current Focus</p>
              <p className="mt-sm text-sm font-medium text-text-base">
                {heroTimer ? heroTimer.taskName : 'No running timer'}
              </p>
              {heroTimer?.clientName && <p className="mt-xs text-xs text-text-muted">{heroTimer.clientName}</p>}
            </div>

            <ClockBold className="h-5 w-5 text-text-muted" />
          </div>

          <p className="mt-lg font-mono text-3xl font-semibold text-text-base">{formatDuration(heroElapsed)}</p>
          <p className="mt-xs text-sm text-text-muted">
            Today: {formatHoursAndMinutes(dailyTotal)}
            <span className="mx-sm">•</span>
            This week: {formatHoursAndMinutes(weeklyTotal)}
          </p>

          {activeTimer && heroElapsed >= 8 * 60 * 60 * 1000 && (
            <div className="mt-md flex items-start gap-sm rounded-md border border-feedback-warning-base/30 bg-feedback-warning-base/10 p-md text-sm text-feedback-warning-text">
              <DangerBold className="mt-[2px] h-4 w-4 flex-shrink-0" />
              This timer has been running for more than 8 hours.
            </div>
          )}
        </div>

        <div className="grid gap-md sm:grid-cols-2">
          <Button
            type="button"
            onClick={() => {
              setFormMode('start')
              setIsFormOpen(true)
            }}
            className="justify-center"
          >
            <AddBold className="h-4 w-4" />
            Start Timer
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setFormMode('manual')
              setIsFormOpen(true)
            }}
            className="justify-center"
          >
            <EditBold className="h-4 w-4" />
            Log Time
          </Button>
        </div>

        <div className="rounded-md border border-border-muted bg-background-highlight/30 p-md text-xs text-text-muted">
          <div className="flex items-center gap-sm font-medium text-text-base">
            <KeyboardBold className="h-4 w-4" />
            Shortcuts
          </div>
          <p className="mt-sm">{KEYBOARD_SHORTCUTS.timer.start_pause}: start or pause the current timer</p>
          <p className="mt-xs">{KEYBOARD_SHORTCUTS.timer.stop}: stop the active timer</p>
        </div>

        <div className="flex items-center justify-between gap-md">
          <div>
            <p className="text-sm font-semibold text-text-base">Recent Entries</p>
            <p className="text-xs text-text-muted">Running, paused, and completed time entries</p>
          </div>

          <Button type="button" size="sm" variant="ghost" onClick={clearCompleted}>
            Clear Completed
          </Button>
        </div>

        <div className="space-y-md overflow-y-auto pr-xs">
          {displayedTimers.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border-muted bg-background-highlight/30 p-xl text-center">
              <p className="text-base font-medium text-text-base">No time entries yet</p>
              <p className="mt-xs text-sm text-text-muted">Start a timer or log time manually to populate this module.</p>
            </div>
          ) : (
            displayedTimers.map((timer) => (
              <TimerEntry
                key={timer.id}
                entry={timer}
                now={now}
                isActive={timer.id === activeTimerId}
                onPause={() => pauseTimer(timer.id)}
                onResume={() => resumeTimer(timer.id)}
                onStop={() => stopTimer(timer.id)}
                onDelete={() => deleteTimer(timer.id)}
              />
            ))
          )}
        </div>
      </div>

      <TimerForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} mode={formMode} />
    </>
  )
}