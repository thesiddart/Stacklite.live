'use client'

import React, { Suspense, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  AddCircleBold,
  Chart2Bold,
  CloseCircleBold,
  DocumentText1Bold,
  EditBold,
  PeopleBold,
  Timer1Bold,
  WalletBold,
} from 'sicons'
import { AppNavbar } from '@/components/layout/AppNavbar'
import { ClientForm } from '@/components/modules/ClientManager/ClientForm'
import { ContractGenerator } from '@/components/modules/ContractGenerator'
import { TimeTracker } from '@/components/modules/TimeTracker'
import { useClients } from '@/hooks/useClients'
import { useTimeLogs } from '@/hooks/useTimeLogs'
import { useAuth } from '@/hooks/useAuth'
import type { Client } from '@/lib/types/database'
import { migrateGuestData } from '@/lib/migration/migrateGuestData'
import {
  formatHoursAndMinutes,
  getTimeLogElapsedMilliseconds,
  isSameDay,
  isSameWeek,
} from '@/lib/utils/time'

function DashboardContent() {
  const formTransitionMs = 220
  const [isClientsCollapsed, setIsClientsCollapsed] = useState(false)
  const [isTimeTrackerCollapsed, setIsTimeTrackerCollapsed] = useState(false)
  const [activeDockTab, setActiveDockTab] = useState<'contract' | 'invoice' | 'income' | null>('contract')
  const [isCreateClientOpen, setIsCreateClientOpen] = useState(false)
  const [isClientFormMounted, setIsClientFormMounted] = useState(false)
  const [isClientFormVisible, setIsClientFormVisible] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const { data: clients = [], isLoading: isClientsLoading } = useClients()
  const { data: timeLogs = [] } = useTimeLogs()
  const { user } = useAuth()
  const searchParams = useSearchParams()

  // Migrate guest data on sign-up (triggered by auth callback ?migration=pending)
  useEffect(() => {
    if (searchParams.get('migration') === 'pending' && user?.id) {
      migrateGuestData(user.id).catch((err) => {
        console.error('Migration failed:', err)
        // Guest data is preserved in localStorage — soft warning only
      })
      // Clean up the URL
      window.history.replaceState({}, '', '/dashboard')
    }
  }, [searchParams, user?.id])

  const newClientsCount = useMemo(() => {
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    return clients.filter((client) => {
      const createdAt = new Date(client.created_at)
      return !Number.isNaN(createdAt.getTime()) && createdAt >= monthStart
    }).length
  }, [clients])

  const taskCountByClientId = useMemo(() => {
    const counts = new Map<string, number>()

    for (const timeLog of timeLogs) {
      if (!timeLog.client_id) {
        continue
      }

      counts.set(timeLog.client_id, (counts.get(timeLog.client_id) ?? 0) + 1)
    }

    return counts
  }, [timeLogs])

  const now = Date.now()
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

  const isClientFormOpen = isCreateClientOpen || editingClient !== null
  const isEditingClientOpen = editingClient !== null
  const isClientPanelExpanded = isClientFormOpen || isClientFormMounted
  const shouldShowCenterPanel = !isClientFormOpen && activeDockTab !== null
  const centerPanelTitle = activeDockTab === 'invoice'
        ? 'Invoice Generator'
        : activeDockTab === 'income'
          ? 'Income Tracker'
          : 'Contract Generator'
  const CenterPanelIcon = activeDockTab === 'invoice'
      ? WalletBold
      : activeDockTab === 'income'
        ? Chart2Bold
        : DocumentText1Bold
  const toggleDockTab = (tab: 'contract' | 'invoice' | 'income') => {
    setActiveDockTab((currentTab) => currentTab === tab ? null : tab)
  }

  React.useEffect(() => {
    if (isClientFormOpen) {
      setIsClientFormMounted(true)
      const frameId = window.requestAnimationFrame(() => {
        setIsClientFormVisible(true)
      })

      return () => window.cancelAnimationFrame(frameId)
    }

    setIsClientFormVisible(false)
    if (!isClientFormMounted) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      setIsClientFormMounted(false)
    }, formTransitionMs)

    return () => window.clearTimeout(timeoutId)
  }, [formTransitionMs, isClientFormMounted, isClientFormOpen])

  return (
    <div className="theme-page-shell">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(0,0,0,0.12)_1px,transparent_1px)] bg-[length:16px_16px]" />

      <AppNavbar
        topClassName="top-8"
        zClassName="z-40"
        showThemeButton
        showProfileButton
        showProfileDropdown
        showProfileActiveBorder
      />

      <section
        className={`absolute z-10 flex flex-col ${
          isClientsCollapsed
            ? 'left-[50px] top-[calc(50%+188px)] items-start gap-2'
            : `left-[50px] items-center gap-4 transition-[top,width,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              isClientPanelExpanded
                ? 'top-[112px] w-[400px] translate-y-0'
                : 'top-1/2 w-[289px] -translate-y-1/2'
            }`
        }`}
      >
        {isClientsCollapsed ? (
          <button
            type="button"
            onClick={() => setIsClientsCollapsed(false)}
            className="theme-shell-chip inline-flex h-8 w-fit items-center gap-1 rounded-[8px] px-2"
            aria-label="Expand Manage Clients"
          >
            <PeopleBold size={16} />
            <span className="text-[14px] font-medium leading-none">Manage Clients</span>
          </button>
        ) : (
          <>
            <div
              className={`theme-shell-card flex w-full flex-col gap-[10px] overflow-hidden rounded-[14px] p-4 transition-[height,max-height] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                isClientPanelExpanded ? 'h-[640px]' : 'max-h-[600px]'
              }`}
            >
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsClientsCollapsed(true)}
                  className="theme-shell-chip inline-flex h-8 items-center gap-1 rounded-[8px] px-2"
                  aria-label={isClientPanelExpanded ? 'Collapse Add Clients' : 'Collapse Manage Clients'}
                >
                  {isClientPanelExpanded ? <AddCircleBold size={16} /> : <PeopleBold size={16} />}
                  <span className="text-[14px] font-medium">{isClientPanelExpanded ? 'Add Clients' : 'Manage Clients'}</span>
                </button>
                <button
                  type="button"
                  aria-label={isClientPanelExpanded ? 'Close client form' : 'Add client'}
                  onClick={() => {
                    if (isClientFormOpen) {
                      setIsCreateClientOpen(false)
                      setEditingClient(null)
                      return
                    }

                    setEditingClient(null)
                    setIsCreateClientOpen(true)
                  }}
                  className="text-[var(--tertiary)]"
                >
                  {isClientPanelExpanded ? <CloseCircleBold size={24} /> : <AddCircleBold size={24} />}
                </button>
              </div>
              <div className="theme-shell-divider h-px w-full" />
              <div className="flex-1 min-h-0 overflow-hidden rounded-[10px]">
                {isClientFormMounted ? (
                  <div
                    className={`h-full min-h-0 overflow-hidden transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      isClientFormVisible
                        ? 'translate-y-0 opacity-100'
                        : 'pointer-events-none -translate-y-1 opacity-0'
                    }`}
                    style={{ transitionDuration: `${formTransitionMs}ms` }}
                  >
                    <ClientForm
                      isOpen={isClientFormMounted}
                      onClose={() => {
                        setIsCreateClientOpen(false)
                        setEditingClient(null)
                      }}
                      client={editingClient}
                      mode={isEditingClientOpen ? 'edit' : 'create'}
                      renderMode="inline"
                    />
                  </div>
                ) : (
                  <div className="space-y-2 overflow-y-auto">
                    {isClientsLoading ? (
                      <div className="rounded-[10px] bg-[var(--surface-card-subtle)] p-3 text-[13px] text-[var(--text-soft-muted)]">
                        Loading clients...
                      </div>
                    ) : clients.length === 0 ? (
                      <div className="rounded-[10px] bg-[var(--surface-card-subtle)] p-3 text-[13px] text-[var(--text-soft-muted)]">
                        No clients yet. Click + to add your first client.
                      </div>
                    ) : (
                      clients.map((client) => (
                        <article
                          key={client.id}
                          className="rounded-[10px] border border-[var(--surface-panel-border)] bg-[var(--surface-panel-strong)] p-3"
                        >
                          <div className="flex flex-col gap-[10px]">
                            <div className="flex w-full items-center justify-between gap-[10px]">
                              <h3 className="min-w-0 flex-1 truncate text-[16px] font-medium leading-none text-[var(--text-soft-strong)]">
                                {client.name}
                              </h3>
                              <button
                                type="button"
                                aria-label={`Edit ${client.name}`}
                                onClick={() => {
                                  setIsCreateClientOpen(false)
                                  setEditingClient(client)
                                }}
                                className="inline-flex shrink-0 items-center justify-center text-[var(--text-soft-strong)] transition-colors hover:text-[var(--tertiary)]"
                              >
                                <EditBold size={16} />
                              </button>
                            </div>

                            <div className="w-full">
                              <p className="truncate text-[14px] leading-none text-[var(--text-soft-muted)]">
                                {client.email || 'No email added'}
                              </p>
                            </div>

                            <div className="flex w-full items-center justify-between gap-[10px]">
                              {client.tags && client.tags.length > 0 ? (
                                <span className="inline-flex h-fit w-fit items-center justify-center rounded-[4px] bg-[var(--primary)] pl-[8px] pr-[8px] pt-[4px] pb-[4px] text-[14px] font-medium leading-none text-white">
                                  {client.tags[0].charAt(0).toUpperCase() + client.tags[0].slice(1)}
                                </span>
                              ) : (
                                <span className="invisible inline-flex h-fit w-fit items-center justify-center rounded-[4px] pl-[8px] pr-[8px] pt-[4px] pb-[4px] text-[14px] font-medium leading-none">
                                  Placeholder
                                </span>
                              )}
                              <span className="truncate text-[12px] leading-none text-[var(--text-soft-muted)]">
                                Tasks: {taskCountByClientId.get(client.id) ?? 0}
                              </span>
                            </div>
                          </div>
                        </article>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        <div className="theme-shell-card inline-flex items-center gap-[2px] rounded-[8px] px-1">
          <div className="flex h-6 items-center gap-1 px-1 text-[12px] text-[var(--text-soft-muted)]">
            <span>Total Clients:</span>
            <span>{clients.length}</span>
          </div>
          <div className="theme-shell-divider h-6 w-px" />
          <div className="flex h-6 items-center gap-1 px-1 text-[12px] text-[var(--text-soft-muted)]">
            <span>New Clients:</span>
            <span>{newClientsCount}</span>
          </div>
        </div>
      </section>

      <section
        aria-hidden={!shouldShowCenterPanel}
        className={`absolute bottom-28 left-1/2 top-[120px] z-10 flex w-[min(90%,700px)] -translate-x-1/2 flex-col gap-2 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] max-h-[calc(100vh-200px)] lg:w-[min(50vw,900px)] ${
          shouldShowCenterPanel
            ? 'pointer-events-auto opacity-100 translate-y-0 scale-100'
            : 'pointer-events-none opacity-0 translate-y-3 scale-[0.98]'
        }`}
      >
          <div className="flex items-center justify-between">
            <div className="inline-flex w-fit items-center gap-1">
              <div className="theme-shell-chip-strong inline-flex h-8 w-8 items-center justify-center rounded-[3px] transition-colors duration-200">
                <CenterPanelIcon size={16} />
              </div>
              <div className="theme-shell-chip-strong inline-flex h-8 items-center rounded-[4px] px-4 transition-all duration-200">
                <span className="text-[14px] font-medium">
                  {centerPanelTitle}
                </span>
              </div>
            </div>

          </div>
          <div className="theme-shell-panel relative flex-1 min-h-0 overflow-visible rounded-[14px] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]">
            <div className="h-full min-h-0 overflow-hidden rounded-[14px]">
              {activeDockTab === 'contract' ? (
                <div className="h-full overflow-y-auto rounded-[10px] border border-[var(--surface-divider)] bg-[var(--surface-overlay)] p-4 theme-scrollbar">
                  <ContractGenerator variant="dashboard" />
                </div>
              ) : (
                <div className="flex h-full flex-col items-center justify-center rounded-[10px] border border-[var(--surface-divider)] bg-[var(--surface-overlay)] text-center">
                  <CenterPanelIcon size={28} className="text-[var(--tertiary)]" />
                  <p className="mt-2 text-sm font-medium text-[var(--tertiary)]">{centerPanelTitle}</p>
                  <p className="mt-1 max-w-[280px] text-xs text-[var(--text-soft-subtle)]">
                    This module is coming soon.
                  </p>
                </div>
              )}
            </div>
          </div>
      </section>

      <section
        className={`absolute z-10 flex flex-col ${
          isTimeTrackerCollapsed
            ? 'right-[50px] top-[calc(50%+188px)] items-end gap-2'
            : 'right-[50px] top-1/2 w-[289px] -translate-y-1/2 items-center gap-4 transition-[top,width,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]'
        }`}
      >
        {isTimeTrackerCollapsed ? (
          <button
            type="button"
            onClick={() => setIsTimeTrackerCollapsed(false)}
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
          <div className="flex h-6 items-center gap-1 px-1 text-[12px] text-[var(--text-soft-muted)]">
            <span>Today:</span>
            <span>{formatHoursAndMinutes(dailyTotal)}</span>
          </div>
          <div className="theme-shell-divider h-6 w-px" />
          <div className="flex h-6 items-center gap-1 px-1 text-[12px] text-[var(--text-soft-muted)]">
            <span>This Week:</span>
            <span>{formatHoursAndMinutes(weeklyTotal)}</span>
          </div>
        </div>
      </section>

      <footer className="theme-shell-card absolute bottom-8 left-1/2 z-10 flex h-12 -translate-x-1/2 items-center gap-[10px] rounded-[14px] p-2">
        <button
          type="button"
          onClick={() => toggleDockTab('contract')}
          aria-pressed={activeDockTab === 'contract'}
          className={`inline-flex h-8 items-center justify-center overflow-hidden whitespace-nowrap text-[var(--tertiary)] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            activeDockTab === 'contract'
              ? 'theme-shell-chip gap-1 rounded-[8px] px-2 text-[14px] font-medium'
              : 'w-8'
          }`}
        >
          <DocumentText1Bold size={16} />
          {activeDockTab === 'contract' && 'Contract Generator'}
        </button>

        <div className="theme-shell-divider h-8 w-px" />

        <button
          type="button"
          onClick={() => toggleDockTab('invoice')}
          aria-pressed={activeDockTab === 'invoice'}
          className={`inline-flex h-8 items-center justify-center overflow-hidden whitespace-nowrap text-[var(--tertiary)] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            activeDockTab === 'invoice'
              ? 'theme-shell-chip gap-1 rounded-[8px] px-2 text-[14px] font-medium'
              : 'w-8'
          }`}
        >
          <WalletBold size={16} />
          {activeDockTab === 'invoice' && 'Invoice Generator'}
        </button>

        <div className="theme-shell-divider h-8 w-px" />

        <button
          type="button"
          onClick={() => toggleDockTab('income')}
          aria-pressed={activeDockTab === 'income'}
          className={`inline-flex h-8 items-center justify-center overflow-hidden whitespace-nowrap text-[var(--tertiary)] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            activeDockTab === 'income'
              ? 'theme-shell-chip gap-1 rounded-[8px] px-2 text-[14px] font-medium'
              : 'w-8'
          }`}
        >
          <Chart2Bold size={16} />
          {activeDockTab === 'income' && 'Income Tracker'}
        </button>
      </footer>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={null}>
      <DashboardContent />
    </Suspense>
  )
}
