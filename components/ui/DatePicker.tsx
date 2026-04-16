import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils/cn'

interface DatePickerProps {
  name: string
  label?: string
  value: string
  onChange: (nextValue: string) => void
  error?: string
  hint?: string
  required?: boolean
  placeholder?: string
  className?: string
  containerClassName?: string
  disabled?: boolean
}

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const

const WEEK_DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'] as const

function parseISODate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null

  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) return null

  const parsed = new Date(year, month - 1, day)
  if (parsed.getFullYear() !== year || parsed.getMonth() !== month - 1 || parsed.getDate() !== day) {
    return null
  }

  return parsed
}

function toISODate(date: Date): string {
  const y = String(date.getFullYear())
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function formatDisplayDate(value: string): string {
  const date = parseISODate(value)
  if (!date) return ''

  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const year = date.getFullYear()
  return `${month}/${day}/${year}`
}

function getMonthGrid(viewDate: Date): Date[] {
  const start = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1)
  const mondayFirstOffset = (start.getDay() + 6) % 7
  start.setDate(start.getDate() - mondayFirstOffset)

  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(start)
    day.setDate(start.getDate() + index)
    return day
  })
}

export function DatePicker({
  name,
  label,
  value,
  onChange,
  error,
  hint,
  required,
  placeholder = 'mm/dd/yyyy',
  className,
  containerClassName,
  disabled,
}: DatePickerProps) {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const popupRef = useRef<HTMLDivElement | null>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const selectedDate = useMemo(() => parseISODate(value), [value])

  const [isOpen, setIsOpen] = useState(false)
  const [showMonthMenu, setShowMonthMenu] = useState(false)
  const [showYearMenu, setShowYearMenu] = useState(false)
  const [viewDate, setViewDate] = useState<Date>(() => selectedDate ?? new Date())
  const [popupPosition, setPopupPosition] = useState<{ top: number; left: number } | null>(null)
  const isMounted = typeof window !== 'undefined'

  const updatePopupPosition = () => {
    if (!triggerRef.current || typeof window === 'undefined') return

    const rect = triggerRef.current.getBoundingClientRect()
    const popupWidth = 320
    const popupHeight = 360
    const popupGap = 8
    const viewportPadding = 8
    const nextLeft = Math.min(
      Math.max(viewportPadding, rect.left),
      window.innerWidth - popupWidth - viewportPadding
    )

    const canOpenBelow = rect.bottom + popupGap + popupHeight <= window.innerHeight - viewportPadding
    const canOpenAbove = rect.top - popupGap - popupHeight >= viewportPadding

    let nextTop = rect.bottom + popupGap

    if (!canOpenBelow && canOpenAbove) {
      nextTop = rect.top - popupHeight - popupGap
    } else if (!canOpenBelow && !canOpenAbove) {
      nextTop = Math.max(viewportPadding, window.innerHeight - popupHeight - viewportPadding)
    }

    setPopupPosition({
      top: nextTop,
      left: nextLeft,
    })
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!rootRef.current) return
      const targetNode = event.target as Node
      const clickedInsideTrigger = rootRef.current.contains(targetNode)
      const clickedInsidePopup = popupRef.current?.contains(targetNode) ?? false

      if (!clickedInsideTrigger && !clickedInsidePopup) {
        setIsOpen(false)
        setShowMonthMenu(false)
        setShowYearMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (!isOpen) return

    updatePopupPosition()

    const handleReposition = () => updatePopupPosition()

    window.addEventListener('resize', handleReposition)
    window.addEventListener('scroll', handleReposition, true)

    return () => {
      window.removeEventListener('resize', handleReposition)
      window.removeEventListener('scroll', handleReposition, true)
    }
  }, [isOpen])

  const monthGrid = useMemo(() => getMonthGrid(viewDate), [viewDate])

  const currentMonth = viewDate.getMonth()
  const currentYear = viewDate.getFullYear()
  const yearOptions = useMemo(() => {
    const start = currentYear - 20
    const end = currentYear + 20
    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
  }, [currentYear])

  const buttonBaseClass =
    'theme-shell-field h-9 w-full rounded-[6px] border border-[var(--surface-input-border)] bg-[var(--surface-input)] px-4 py-1 text-left text-[14px] leading-5 text-text-base transition-colors focus-visible:border-[var(--primary)] focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:shadow-none disabled:cursor-not-allowed disabled:opacity-70'

  const moveMonth = (delta: number) => {
    const next = new Date(viewDate)
    next.setMonth(next.getMonth() + delta)
    setViewDate(next)
  }

  const handleSelectDay = (day: Date) => {
    onChange(toISODate(day))
    setIsOpen(false)
    setShowMonthMenu(false)
    setShowYearMenu(false)
  }

  const handleSelectMonth = (monthIndex: number) => {
    setViewDate((prev) => new Date(prev.getFullYear(), monthIndex, 1))
    setShowMonthMenu(false)
  }

  const handleSelectYear = (year: number) => {
    setViewDate((prev) => new Date(year, prev.getMonth(), 1))
    setShowYearMenu(false)
  }

  return (
    <div className={cn('w-full', containerClassName)} ref={rootRef}>
      {label && (
        <label htmlFor={name} className="mb-2 block text-sm font-medium text-text-base">
          {label}
          {required && <span className="ml-1 text-text-brand">*</span>}
        </label>
      )}

      <div className="relative">
        <button
          id={name}
          ref={triggerRef}
          type="button"
          disabled={disabled}
          className={cn(buttonBaseClass, className)}
          onClick={() => {
            if (!isOpen) {
              setViewDate(selectedDate ?? new Date())
            }
            setIsOpen((prev) => {
              const nextOpen = !prev
              if (nextOpen) {
                updatePopupPosition()
              }
              return nextOpen
            })
            setShowMonthMenu(false)
            setShowYearMenu(false)
          }}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
        >
          <span className={value ? 'text-text-base' : 'text-text-placeholder'}>
            {value ? formatDisplayDate(value) : placeholder}
          </span>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-muted" aria-hidden>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M8 2.75V5.25" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M16 2.75V5.25" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <rect x="3.25" y="4.75" width="17.5" height="16" rx="2.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M3.5 8.75H20.5" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </span>
        </button>

        {isMounted &&
          isOpen &&
          popupPosition &&
          createPortal(
            <div
              ref={popupRef}
              data-floating-ui="true"
              className="fixed z-[120] w-[320px] rounded-xl border border-border-base bg-background-base p-3 shadow-lg"
              style={{ top: popupPosition.top, left: popupPosition.left }}
            >
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowMonthMenu((prev) => !prev)
                    setShowYearMenu(false)
                  }}
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium text-text-base hover:bg-background-muted"
                >
                  <span>{MONTHS[currentMonth]}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                {showMonthMenu && (
                  <div className="absolute left-0 top-[calc(100%+4px)] z-[130] max-h-48 w-40 overflow-y-auto rounded-md border border-border-base bg-background-base p-1 shadow-md">
                    {MONTHS.map((monthName, index) => (
                      <button
                        key={monthName}
                        type="button"
                        onClick={() => handleSelectMonth(index)}
                        className={cn(
                          'flex w-full items-center rounded-md px-2 py-1.5 text-sm text-left',
                          index === currentMonth
                            ? 'bg-button-primary text-button-primary-fg'
                            : 'text-text-base hover:bg-background-muted'
                        )}
                      >
                        {monthName}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowYearMenu((prev) => !prev)
                    setShowMonthMenu(false)
                  }}
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium text-text-base hover:bg-background-muted"
                >
                  <span>{currentYear}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                {showYearMenu && (
                  <div className="absolute right-0 top-[calc(100%+4px)] z-[130] max-h-48 w-24 overflow-y-auto rounded-md border border-border-base bg-background-base p-1 shadow-md">
                    {yearOptions.map((year) => (
                      <button
                        key={year}
                        type="button"
                        onClick={() => handleSelectYear(year)}
                        className={cn(
                          'flex w-full items-center justify-center rounded-md px-2 py-1.5 text-sm',
                          year === currentYear
                            ? 'bg-button-primary text-button-primary-fg'
                            : 'text-text-base hover:bg-background-muted'
                        )}
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="ml-auto inline-flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => moveMonth(-1)}
                  className="rounded-md p-1.5 text-text-muted hover:bg-background-muted hover:text-text-base"
                  aria-label="Previous month"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => moveMonth(1)}
                  className="rounded-md p-1.5 text-text-muted hover:bg-background-muted hover:text-text-base"
                  aria-label="Next month"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 pb-1">
              {WEEK_DAYS.map((day) => (
                <div key={day} className="flex h-7 items-center justify-center text-xs font-medium text-text-muted">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {monthGrid.map((day) => {
                const isCurrentMonth = day.getMonth() === currentMonth
                const isSelected = Boolean(
                  selectedDate &&
                    day.getFullYear() === selectedDate.getFullYear() &&
                    day.getMonth() === selectedDate.getMonth() &&
                    day.getDate() === selectedDate.getDate()
                )

                return (
                  <button
                    key={`${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`}
                    type="button"
                    onClick={() => handleSelectDay(day)}
                    className={cn(
                      'h-9 rounded-md text-sm transition-colors',
                      isSelected
                        ? 'bg-button-primary text-button-primary-fg'
                        : isCurrentMonth
                          ? 'text-text-base hover:bg-background-muted'
                          : 'text-text-disabled hover:bg-background-muted'
                    )}
                  >
                    {day.getDate()}
                  </button>
                )
              })}
            </div>

            <div className="mt-3 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  onChange('')
                  setIsOpen(false)
                  setShowMonthMenu(false)
                  setShowYearMenu(false)
                }}
                className="rounded-md px-2 py-1 text-sm text-text-muted hover:bg-background-muted hover:text-text-base"
              >
                Clear
              </button>

              <button
                type="button"
                onClick={() => handleSelectDay(new Date())}
                className="rounded-md px-2 py-1 text-sm text-text-brand hover:bg-background-muted"
              >
                Today
              </button>
            </div>
            </div>,
            document.body
          )}
      </div>

      {error && <p className="mt-1 text-sm text-feedback-error-text">{error}</p>}
      {hint && !error && <p className="mt-1 text-sm text-text-muted">{hint}</p>}
    </div>
  )
}
