'use client'

import React, { useMemo, useState } from 'react'
import { Timer1Bold } from 'sicons'
import { useTimeLogs } from '@/hooks/useTimeLogs'
import { useCurrentTime } from '@/hooks/useCurrentTime'
import {
  formatHoursAndMinutes,
  getTimeLogElapsedMilliseconds,
} from '@/lib/utils/time'
import { DashboardMobileTimerSheet } from './DashboardMobileTimerSheet'

export function DashboardFloatingTimerPill() {
  const { data: timeLogs = [] } = useTimeLogs()
  const now = useCurrentTime()
  const [sheetOpen, setSheetOpen] = useState(false)

  const runningEntry = useMemo(
    () => timeLogs.find((entry) => entry.is_running),
    [timeLogs]
  )

  const elapsedMs = useMemo(() => {
    if (!runningEntry) {
      return 0
    }
    return getTimeLogElapsedMilliseconds(runningEntry, now)
  }, [runningEntry, now])

  const label = runningEntry
    ? formatHoursAndMinutes(elapsedMs)
    : 'Timer'

  return (
    <>
      <button
        type="button"
        onClick={() => setSheetOpen(true)}
        className="fixed bottom-[calc(env(safe-area-inset-bottom,0px)+5.25rem)] right-4 z-40 flex max-w-[min(200px,calc(100vw-2rem))] items-center gap-2 rounded-full border border-border-base bg-background-highlight px-3 py-2 text-left shadow-md md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-brand"
        aria-label={runningEntry ? `Timer running ${label}` : 'Open time tracker'}
      >
        <span
          className={`h-2 w-2 shrink-0 rounded-full ${
            runningEntry ? 'animate-pulse bg-feedback-success-text' : 'bg-text-muted'
          }`}
          aria-hidden
        />
        <Timer1Bold size={16} className="shrink-0 text-text-muted" />
        <span className="truncate font-mono text-xs font-medium tabular-nums text-text-base">{label}</span>
      </button>

      <DashboardMobileTimerSheet isOpen={sheetOpen} onClose={() => setSheetOpen(false)} />
    </>
  )
}
