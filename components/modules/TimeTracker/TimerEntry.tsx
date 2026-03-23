'use client'

import React from 'react'
import { PauseBold, PlayBold, StopBold, TrashBold } from 'sicons'
import { Button } from '@/components/ui/Button'
import type { TimerEntry as TimerEntryType } from '@/stores/timerStore'
import { formatDuration, formatHoursAndMinutes, formatTimestamp, getElapsedMilliseconds } from '@/lib/utils/time'

interface TimerEntryProps {
  entry: TimerEntryType
  now: number
  isActive: boolean
  onPause: () => void
  onResume: () => void
  onStop: () => void
  onDelete: () => void
}

export function TimerEntry({ entry, now, isActive, onPause, onResume, onStop, onDelete }: TimerEntryProps) {
  const elapsed = getElapsedMilliseconds(entry.elapsedMs, entry.startedAt, now)

  return (
    <div className="rounded-lg border border-border-muted bg-background-highlight/35 p-md shadow-sm">
      <div className="flex items-start justify-between gap-md">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-sm">
            <p className="truncate text-sm font-semibold text-text-base">{entry.taskName}</p>
            <span
              className={`rounded-full px-sm py-[2px] text-[10px] font-semibold uppercase tracking-[0.16em] ${
                entry.status === 'running'
                  ? 'bg-feedback-success-base/15 text-feedback-success-text'
                  : entry.status === 'paused'
                    ? 'bg-feedback-warning-base/15 text-feedback-warning-text'
                    : 'bg-background-muted/20 text-text-muted'
              }`}
            >
              {entry.status}
            </span>
          </div>

          {entry.clientName && <p className="mt-xs text-xs text-text-muted">{entry.clientName}</p>}
          {entry.notes && <p className="mt-sm line-clamp-2 text-xs text-text-muted">{entry.notes}</p>}

          <div className="mt-md flex items-center justify-between gap-md">
            <div>
              <p className="font-mono text-lg font-semibold text-text-base">{formatDuration(elapsed)}</p>
              <p className="text-xs text-text-muted">
                {entry.status === 'completed' ? formatTimestamp(entry.stoppedAt ?? entry.createdAt) : formatHoursAndMinutes(elapsed)}
              </p>
            </div>

            <div className="flex items-center gap-sm">
              {entry.status === 'running' && (
                <Button type="button" size="sm" variant="secondary" onClick={onPause}>
                  <PauseBold className="h-4 w-4" />
                </Button>
              )}

              {entry.status === 'paused' && (
                <Button type="button" size="sm" variant="secondary" onClick={onResume}>
                  <PlayBold className="h-4 w-4" />
                </Button>
              )}

              {(entry.status === 'running' || entry.status === 'paused') && (
                <Button type="button" size="sm" variant="outline" onClick={onStop}>
                  <StopBold className="h-4 w-4" />
                </Button>
              )}

              {(entry.status === 'completed' || !isActive) && (
                <Button type="button" size="sm" variant="ghost" onClick={onDelete}>
                  <TrashBold className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}