'use client'

import React from 'react'
import { Timer1Bold } from 'sicons'
import { TimeTracker } from '@/components/modules/TimeTracker'
import { formatHoursAndMinutes } from '@/lib/utils/time'

export type DashboardTimePanelProps = {
  isTimeTrackerPanelCollapsed: boolean
  isCenterFormActive: boolean
  dailyTotal: number
  weeklyTotal: number
  setIsTimeTrackerCollapsed: (collapsed: boolean) => void
}

export function DashboardTimePanel({
  isTimeTrackerPanelCollapsed,
  isCenterFormActive,
  dailyTotal,
  weeklyTotal,
  setIsTimeTrackerCollapsed,
}: DashboardTimePanelProps) {
  return (
    <section
      className={`absolute z-[5] flex flex-col ${
        isTimeTrackerPanelCollapsed
          ? 'right-[50px] top-[calc(50%+188px)] items-end gap-2'
          : 'bottom-28 right-[50px] w-[289px] translate-y-0 items-center gap-4 transition-[bottom,width,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]'
      }`}
    >
      {isTimeTrackerPanelCollapsed ? (
        <button
          type="button"
          onClick={() => {
            if (isCenterFormActive) {
              return
            }

            setIsTimeTrackerCollapsed(false)
          }}
          className="theme-shell-chip inline-flex h-8 w-fit items-center gap-1 rounded-[8px] px-2"
          aria-label="Expand Time Tracker"
        >
          <Timer1Bold size={16} />
          <span className="text-[14px] font-medium leading-none">Time Tracker</span>
        </button>
      ) : (
        <>
          <TimeTracker
            variant="dashboard"
            onCollapse={() => setIsTimeTrackerCollapsed(true)}
          />
        </>
      )}

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
    </section>
  )
}
