import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export type TimerStatus = 'running' | 'paused' | 'completed'

export interface TimerEntry {
  id: string
  taskName: string
  clientId: string | null
  clientName: string | null
  notes: string | null
  createdAt: number
  startedAt: number | null
  elapsedMs: number
  status: TimerStatus
  stoppedAt: number | null
}

interface StartTimerInput {
  taskName: string
  clientId?: string | null
  clientName?: string | null
  notes?: string | null
}

interface ManualTimerInput {
  taskName: string
  clientId?: string | null
  clientName?: string | null
  notes?: string | null
  durationMinutes: number
}

interface TimerState {
  timers: TimerEntry[]
  activeTimerId: string | null
  startTimer: (input: StartTimerInput) => void
  addManualEntry: (input: ManualTimerInput) => void
  pauseTimer: (timerId: string) => void
  resumeTimer: (timerId: string) => void
  stopTimer: (timerId: string) => void
  deleteTimer: (timerId: string) => void
  clearCompleted: () => void
}

function createTimerId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `timer-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function pauseRunningTimer(timer: TimerEntry, now: number): TimerEntry {
  if (timer.status !== 'running' || timer.startedAt === null) {
    return timer
  }

  return {
    ...timer,
    elapsedMs: timer.elapsedMs + (now - timer.startedAt),
    startedAt: null,
    status: 'paused',
  }
}

export const useTimerStore = create<TimerState>()(
  persist(
    (set, get) => ({
      timers: [],
      activeTimerId: null,

      startTimer: ({ taskName, clientId = null, clientName = null, notes = null }) => {
        const now = Date.now()
        const { activeTimerId, timers } = get()
        const nextTimers = activeTimerId
          ? timers.map((timer) =>
              timer.id === activeTimerId ? pauseRunningTimer(timer, now) : timer
            )
          : timers

        const nextTimer: TimerEntry = {
          id: createTimerId(),
          taskName,
          clientId,
          clientName,
          notes,
          createdAt: now,
          startedAt: now,
          elapsedMs: 0,
          status: 'running',
          stoppedAt: null,
        }

        set({
          timers: [nextTimer, ...nextTimers],
          activeTimerId: nextTimer.id,
        })
      },

      addManualEntry: ({
        taskName,
        clientId = null,
        clientName = null,
        notes = null,
        durationMinutes,
      }) => {
        const now = Date.now()
        const durationMs = Math.max(durationMinutes, 0) * 60 * 1000

        const manualEntry: TimerEntry = {
          id: createTimerId(),
          taskName,
          clientId,
          clientName,
          notes,
          createdAt: now,
          startedAt: null,
          elapsedMs: durationMs,
          status: 'completed',
          stoppedAt: now,
        }

        set((state) => ({
          timers: [manualEntry, ...state.timers],
        }))
      },

      pauseTimer: (timerId) => {
        const now = Date.now()

        set((state) => ({
          timers: state.timers.map((timer) =>
            timer.id === timerId ? pauseRunningTimer(timer, now) : timer
          ),
          activeTimerId: state.activeTimerId === timerId ? null : state.activeTimerId,
        }))
      },

      resumeTimer: (timerId) => {
        const now = Date.now()
        const { activeTimerId, timers } = get()
        const activeTimer = activeTimerId ? timers.find((timer) => timer.id === activeTimerId) : null

        set((state) => ({
          timers: state.timers.map((timer) => {
            if (activeTimer && timer.id === activeTimer.id) {
              return pauseRunningTimer(timer, now)
            }

            if (timer.id === timerId && timer.status === 'paused') {
              return {
                ...timer,
                startedAt: now,
                stoppedAt: null,
                status: 'running',
              }
            }

            return timer
          }),
          activeTimerId: timerId,
        }))
      },

      stopTimer: (timerId) => {
        const now = Date.now()

        set((state) => ({
          timers: state.timers.map((timer) => {
            if (timer.id !== timerId) {
              return timer
            }

            const elapsedMs =
              timer.status === 'running' && timer.startedAt !== null
                ? timer.elapsedMs + (now - timer.startedAt)
                : timer.elapsedMs

            return {
              ...timer,
              elapsedMs,
              startedAt: null,
              stoppedAt: now,
              status: 'completed',
            }
          }),
          activeTimerId: state.activeTimerId === timerId ? null : state.activeTimerId,
        }))
      },

      deleteTimer: (timerId) => {
        set((state) => ({
          timers: state.timers.filter((timer) => timer.id !== timerId),
          activeTimerId: state.activeTimerId === timerId ? null : state.activeTimerId,
        }))
      },

      clearCompleted: () => {
        set((state) => ({
          timers: state.timers.filter((timer) => timer.status !== 'completed'),
        }))
      },
    }),
    {
      name: 'stacklite-timer-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        timers: state.timers,
        activeTimerId: state.activeTimerId,
      }),
    }
  )
)