'use client'

import React from 'react'
import { EditBold, PauseCircleBold, PlayBold, TickCircleBold, WatchBold } from 'sicons'
import { Button } from '@/components/ui/Button'
import type { TimeLog } from '@/lib/types/database'
import { formatDuration, getTimeLogElapsedMilliseconds, getTimeLogStatus } from '@/lib/utils/time'

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

  return (
    <article className="rounded-[10px] border border-[rgba(121,98,244,0.35)] bg-[#f3e8ff]/45 p-3">
      <div className="flex flex-col items-start gap-2">
        <div className="flex w-full items-center justify-center gap-[10px]">
          <h3 className="min-w-0 flex-1 text-[14px] font-medium leading-normal text-[#010102]">
            <span className="block truncate">{entry.task_name}</span>
          </h3>

          <button
            type="button"
            aria-label={`Edit ${entry.task_name}`}
            onClick={onEdit}
            disabled={isPending}
            className="inline-flex shrink-0 items-center justify-center text-[#1a163d] transition-colors hover:text-[#2a245e] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <EditBold size={16} />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-px">
            <WatchBold className="h-4 w-4 flex-shrink-0 text-[#7c7288]" />
            <span className="font-medium leading-normal text-[#7c7288] text-[12px] whitespace-nowrap">
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
                  className="h-auto rounded-[4px] bg-[#f3e8ff] pl-[8px] pr-[8px] pt-[4px] pb-[4px] text-[12px] font-normal leading-[12px] text-[#251f7b] hover:bg-[#ead8ff]"
                >
                  <PauseCircleBold className="h-4 w-4" />
                  Pause
                </Button>
                <button
                  type="button"
                  aria-label={`Complete ${entry.task_name}`}
                  onClick={onStop}
                  disabled={isPending}
                  className="inline-flex items-center justify-center text-[#8b819d] transition-colors hover:text-[#7c7288] disabled:cursor-not-allowed disabled:opacity-60"
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
                  className="h-auto rounded-[4px] bg-[#f3e8ff] pl-[8px] pr-[8px] pt-[4px] pb-[4px] text-[12px] font-normal leading-[12px] text-[#251f7b] hover:bg-[#ead8ff]"
                >
                  <PlayBold className="h-4 w-4" />
                  Resume
                </Button>
                <button
                  type="button"
                  aria-label={`Complete ${entry.task_name}`}
                  onClick={onStop}
                  disabled={isPending}
                  className="inline-flex items-center justify-center text-[#8b819d] transition-colors hover:text-[#7c7288] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <TickCircleBold size={16} />
                </button>
              </>
            ) : (
              <span className="inline-flex items-center justify-center rounded-[4px] bg-[#22c55e] pl-[8px] pr-[8px] pt-[4px] pb-[4px] text-[12px] font-normal leading-[12px] text-white">
                Completed
              </span>
            )}
          </div>
        </div>

        {clientName && (
          <span className="inline-flex h-fit w-fit items-center justify-center rounded-[4px] bg-[var(--primary,#7962f4)] pl-[8px] pr-[8px] pt-[4px] pb-[4px] text-[14px] font-medium leading-none text-white">
            {clientName}
          </span>
        )}

        {entry.notes && !clientName && (
          <p className="line-clamp-2 text-[12px] leading-normal text-[#7c7288]">
            {entry.notes}
          </p>
        )}
      </div>
    </article>
  )
}
