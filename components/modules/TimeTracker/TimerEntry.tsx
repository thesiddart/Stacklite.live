'use client'

import React from 'react'
import { EditBold, PauseCircleBold, PlayBold, TickCircleBold, WatchBold } from 'sicons'
import { Button } from '@/components/ui/Button'
import type { TimeLog } from '@/lib/types/database'
import { formatDuration, getTimeLogElapsedMilliseconds, getTimeLogStatus } from '@/lib/utils/time'

const CLIENT_CHIP_COLOR_CLASSES = [
  'bg-[var(--primary)] text-[var(--button-primary-fg)]',
  'bg-feedback-info-base text-[var(--color-text-inverse)]',
  'bg-[var(--color-warning)] text-[var(--color-text-inverse)]',
  'bg-feedback-success-base text-[var(--color-text-inverse)]',
  'bg-[var(--color-brand-active)] text-[var(--color-text-inverse)]',
]

function getDeterministicChipColor(seed: string): string {
  let hash = 0
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0
  }

  return CLIENT_CHIP_COLOR_CLASSES[hash % CLIENT_CHIP_COLOR_CLASSES.length]
}

interface TimerEntryProps {
  entry: TimeLog
  clientName?: string | null
  now: number
  onEdit: () => void
  onPause: () => void
  onResume: () => void
  onStop: () => void
  isPending?: boolean
}

export function TimerEntry({
  entry,
  clientName,
  now,
  onEdit,
  onPause,
  onResume,
  onStop,
  isPending = false,
}: TimerEntryProps) {
  const elapsed = getTimeLogElapsedMilliseconds(entry, now)
  const status = getTimeLogStatus(entry)
  const isRunning = status === 'running'
  const isPaused = status === 'paused'
  const clientChipColorClassName = getDeterministicChipColor(`${entry.id}-${clientName ?? ''}`)

  return (
    <article className="rounded-[10px] border border-[var(--surface-panel-border)] bg-[var(--surface-panel-strong)] p-3">
      <div className="flex flex-col items-start gap-2">
        <div className="flex w-full items-center justify-center gap-[10px]">
          <h3 className="min-w-0 flex-1 text-[14px] font-medium leading-normal text-text-base">
            <span className="block truncate">{entry.task_name}</span>
          </h3>

          <button
            type="button"
            aria-label={`Edit ${entry.task_name}`}
            onClick={onEdit}
            disabled={isPending}
            className="inline-flex shrink-0 items-center justify-center text-text-base transition-colors hover:text-[var(--tertiary)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <EditBold size={16} />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-px">
            <WatchBold className="h-4 w-4 flex-shrink-0 text-text-muted" />
            <span className="text-[12px] font-medium leading-normal whitespace-nowrap text-text-muted">
              {formatDuration(elapsed)}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {isRunning ? (
              <>
                <Button
                  type="button"
                  size="sm"
                  onClick={onPause}
                  isLoading={isPending}
                  className="h-auto rounded-[4px] bg-[var(--surface-chip)] pl-[8px] pr-[8px] pt-[4px] pb-[4px] text-[12px] font-normal leading-[12px] text-[var(--tertiary)] hover:bg-[var(--surface-chip-strong)]"
                >
                  <PauseCircleBold className="h-4 w-4" />
                  Pause
                </Button>
                <button
                  type="button"
                  aria-label={`Complete ${entry.task_name}`}
                  onClick={onStop}
                  disabled={isPending}
                  className="inline-flex items-center justify-center text-text-muted transition-colors hover:text-text-base disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <TickCircleBold size={16} />
                </button>
              </>
            ) : isPaused ? (
              <>
                <Button
                  type="button"
                  size="sm"
                  onClick={onResume}
                  isLoading={isPending}
                  className="h-auto rounded-[4px] bg-[var(--surface-chip)] pl-[8px] pr-[8px] pt-[4px] pb-[4px] text-[12px] font-normal leading-[12px] text-[var(--tertiary)] hover:bg-[var(--surface-chip-strong)]"
                >
                  <PlayBold className="h-4 w-4" />
                  Resume
                </Button>
                <button
                  type="button"
                  aria-label={`Complete ${entry.task_name}`}
                  onClick={onStop}
                  disabled={isPending}
                  className="inline-flex items-center justify-center text-text-muted transition-colors hover:text-text-base disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <TickCircleBold size={16} />
                </button>
              </>
            ) : (
              <span className="inline-flex items-center justify-center rounded-[4px] bg-[var(--primary)] pl-[8px] pr-[8px] pt-[4px] pb-[4px] text-[12px] font-normal leading-[12px] text-[var(--button-primary-fg)]">
                Completed
              </span>
            )}
          </div>
        </div>

        {clientName && (
          <span className={`inline-flex h-fit w-fit items-center justify-center rounded-[4px] pl-[8px] pr-[8px] pt-[4px] pb-[4px] text-[14px] font-medium leading-none ${clientChipColorClassName}`}>
            {clientName}
          </span>
        )}

        {entry.notes && !clientName && (
          <p className="line-clamp-2 text-[12px] leading-normal text-text-muted">
            {entry.notes}
          </p>
        )}
      </div>
    </article>
  )
}
