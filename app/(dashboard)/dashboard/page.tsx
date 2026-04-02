'use client'

import React, { Suspense, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { ClientForm } from '@/components/modules/ClientManager/ClientForm'
import { ContractGenerator } from '@/components/modules/ContractGenerator'
import { InvoiceGenerator } from '@/components/modules/InvoiceGenerator'
import { IncomeTracker } from '@/components/modules/IncomeTracker'
import { TimeTracker } from '@/components/modules/TimeTracker'
import { useClients } from '@/hooks/useClients'
import { useContracts } from '@/hooks/useContracts'
import { useTimeLogs } from '@/hooks/useTimeLogs'
import { useInvoices } from '@/hooks/useInvoices'
import { useAuth } from '@/hooks/useAuth'
import { useSessionStore } from '@/stores/sessionStore'
import { useContractStore } from '@/stores/contractStore'
import { useInvoiceStore } from '@/stores/invoiceStore'
import type { Client } from '@/lib/types/database'
import type { Invoice } from '@/lib/types/database'
import type { InvoiceLineItem } from '@/lib/utils/invoiceCalculations'
import { migrateGuestData } from '@/lib/migration/migrateGuestData'
import { generateClientActivityReportPDF } from '@/lib/pdf/generateClientActivityReportPDF'
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
  const initSession = useSessionStore((s) => s.initSession)
  const contractView = useContractStore((s) => s.view)
  const setContractView = useContractStore((s) => s.setView)
  const invoiceView = useInvoiceStore((s) => s.view)
  const setInvoiceView = useInvoiceStore((s) => s.setView)
  const { data: clients = [], isLoading: isClientsLoading } = useClients()
  const { data: contracts = [] } = useContracts()
  const { data: invoices = [] } = useInvoices()
  const { data: timeLogs = [] } = useTimeLogs()
  const { user, isLoading: isAuthLoading } = useAuth()
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    if (isAuthLoading) {
      return
    }

    initSession(Boolean(user))
  }, [initSession, isAuthLoading, user])

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

  const handleOpenPrivacyPolicy = () => {
    router.push('/privacy')
  }

  const handleDownloadReport = () => {
    void generateClientActivityReportPDF({
      generatedAt: new Date().toISOString(),
      clients,
      contracts,
      invoices,
      timeLogs,
    })
  }

  const openInvoiceFromIncome = (invoiceId: string) => {
    const invoice = invoices.find((entry) => entry.id === invoiceId)

    setActiveDockTab('invoice')

    if (!invoice) {
      setInvoiceView('list')
      return
    }

    useInvoiceStore.getState().resetForm()
    useInvoiceStore.getState().setActiveInvoice(invoice.id)

    useInvoiceStore.getState().updateFormData({
      client_id: invoice.client_id,
      contract_id: invoice.contract_id,
      invoice_number: invoice.invoice_number,
      issue_date: invoice.issue_date,
      due_date: invoice.due_date,
      line_items: Array.isArray(invoice.line_items)
        ? (invoice.line_items as unknown as InvoiceLineItem[])
        : [],
      currency: invoice.currency,
      tax_rate: invoice.tax_rate || null,
      discount_type: (invoice.discount_type as 'flat' | 'percent') || null,
      discount_value: invoice.discount_value || null,
      subtotal: invoice.subtotal,
      total: invoice.total,
      payment_method: invoice.payment_method,
      payment_instructions: invoice.payment_instructions,
      notes_to_client: invoice.notes_to_client,
      internal_notes: invoice.internal_notes,
      status: (invoice.status as 'unpaid' | 'paid' | 'archived') || 'unpaid',
    })

    useInvoiceStore.setState({ isDirty: false })
    setInvoiceView('editor')
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
    <TooltipProvider delayDuration={180}>
    <div className="theme-page-shell">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,var(--dot-color)_1px,transparent_1px)] bg-[length:16px_16px]" />

      <AppNavbar
        topClassName="top-8"
        zClassName="z-40"
        showThemeButton
        showProfileButton
        showProfileDropdown
        showProfileActiveBorder
        onOpenPrivacyPolicy={handleOpenPrivacyPolicy}
        onDownloadReport={handleDownloadReport}
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
                {isClientPanelExpanded ? (
                  <button
                    type="button"
                    aria-label="Close client form"
                    onClick={() => {
                      setIsCreateClientOpen(false)
                      setEditingClient(null)
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
                        aria-label="Add client"
                        onClick={() => {
                          setEditingClient(null)
                          setIsCreateClientOpen(true)
                        }}
                        className="text-[var(--tertiary)]"
                      >
                        <AddCircleBold size={24} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Add client</TooltipContent>
                  </Tooltip>
                )}
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
                      <div className="rounded-[10px] bg-[var(--surface-card-subtle)] p-3 text-[13px] text-text-muted">
                        Loading clients...
                      </div>
                    ) : clients.length === 0 ? (
                      <div className="rounded-[10px] bg-[var(--surface-card-subtle)] p-3 text-[13px] text-text-muted">
                        Add a client to get started. They'll be available across contracts, invoices, and time tracking.
                      </div>
                    ) : (
                      clients.map((client) => (
                        <article
                          key={client.id}
                          className="rounded-[10px] border border-[var(--surface-panel-border)] bg-[var(--surface-panel-strong)] p-3"
                        >
                          <div className="flex flex-col gap-[10px]">
                            <div className="flex w-full items-center justify-between gap-[10px]">
                              <h3 className="min-w-0 flex-1 truncate text-[16px] font-medium leading-none text-text-base">
                                {client.name}
                              </h3>
                              <button
                                type="button"
                                aria-label={`Edit ${client.name}`}
                                onClick={() => {
                                  setIsCreateClientOpen(false)
                                  setEditingClient(client)
                                }}
                                className="inline-flex shrink-0 items-center justify-center text-text-base transition-colors hover:text-[var(--tertiary)]"
                              >
                                <EditBold size={16} />
                              </button>
                            </div>

                            <div className="w-full">
                              <p className="truncate text-[14px] leading-none text-text-muted">
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
                              <span className="truncate text-[12px] leading-none text-text-muted">
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
          <div className="flex h-6 items-center gap-1 px-1 text-[12px] text-text-muted">
            <span>Total Clients:</span>
            <span>{clients.length}</span>
          </div>
          <div className="theme-shell-divider h-6 w-px" />
          <div className="flex h-6 items-center gap-1 px-1 text-[12px] text-text-muted">
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

            {((activeDockTab === 'contract' && contractView === 'editor') ||
              (activeDockTab === 'invoice' && invoiceView === 'editor')) && (
              <button
                type="button"
                onClick={() => {
                  if (activeDockTab === 'contract') {
                    setContractView('list')
                    return
                  }

                  if (activeDockTab === 'invoice') {
                    setInvoiceView('list')
                  }
                }}
                className="theme-shell-chip-strong inline-flex h-8 w-8 items-center justify-center rounded-[3px] text-[var(--tertiary)] transition-colors duration-200 hover:text-[var(--primary)]"
                aria-label={`Close ${centerPanelTitle}`}
              >
                <CloseCircleBold size={16} />
              </button>
            )}

          </div>
          <div className="theme-shell-panel relative flex-1 min-h-0 overflow-visible rounded-[14px] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]">
            <div className="h-full min-h-0 overflow-visible rounded-[14px]">
              {activeDockTab === 'contract' ? (
                <div className="h-full overflow-visible rounded-[10px] border border-[var(--surface-divider)] bg-[var(--surface-overlay)] p-4 theme-scrollbar">
                  <ContractGenerator variant="dashboard" />
                </div>
              ) : activeDockTab === 'invoice' ? (
                <div className="h-full overflow-visible rounded-[10px] border border-[var(--surface-divider)] bg-[var(--surface-overlay)] p-4 theme-scrollbar">
                  <InvoiceGenerator variant="dashboard" />
                </div>
              ) : activeDockTab === 'income' ? (
                <div className="h-full overflow-visible rounded-[10px] border border-[var(--surface-divider)] bg-[var(--surface-overlay)] p-4 theme-scrollbar">
                  <IncomeTracker
                    variant="dashboard"
                    onOpenInvoice={openInvoiceFromIncome}
                    onOpenInvoiceGenerator={() => {
                      setActiveDockTab('invoice')
                      setInvoiceView('list')
                    }}
                  />
                </div>
              ) : (
                <div className="flex h-full flex-col items-center justify-center rounded-[10px] border border-[var(--surface-divider)] bg-[var(--surface-overlay)] text-center">
                  <CenterPanelIcon size={28} className="text-[var(--tertiary)]" />
                  <p className="mt-2 text-sm font-medium text-[var(--tertiary)]">{centerPanelTitle}</p>
                  <p className="mt-1 max-w-[280px] text-xs text-text-muted">
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

      <footer className="theme-shell-card absolute bottom-8 left-1/2 z-10 flex h-12 -translate-x-1/2 items-center gap-[10px] rounded-[14px] p-2">
        {activeDockTab === 'contract' ? (
          <button
            type="button"
            onClick={() => toggleDockTab('contract')}
            aria-pressed
            className="theme-shell-chip inline-flex h-8 items-center justify-center gap-1 overflow-hidden whitespace-nowrap rounded-[8px] px-2 text-[14px] font-medium text-[var(--tertiary)] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
          >
            <DocumentText1Bold size={16} />
            Contract Generator
          </button>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => toggleDockTab('contract')}
                aria-pressed={false}
                className="inline-flex h-8 w-8 items-center justify-center overflow-hidden whitespace-nowrap text-[var(--tertiary)] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
              >
                <DocumentText1Bold size={16} />
              </button>
            </TooltipTrigger>
            <TooltipContent>Contract Generator</TooltipContent>
          </Tooltip>
        )}

        <div className="theme-shell-divider h-8 w-px" />

        {activeDockTab === 'invoice' ? (
          <button
            type="button"
            onClick={() => toggleDockTab('invoice')}
            aria-pressed
            className="theme-shell-chip inline-flex h-8 items-center justify-center gap-1 overflow-hidden whitespace-nowrap rounded-[8px] px-2 text-[14px] font-medium text-[var(--tertiary)] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
          >
            <WalletBold size={16} />
            Invoice Generator
          </button>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => toggleDockTab('invoice')}
                aria-pressed={false}
                className="inline-flex h-8 w-8 items-center justify-center overflow-hidden whitespace-nowrap text-[var(--tertiary)] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
              >
                <WalletBold size={16} />
              </button>
            </TooltipTrigger>
            <TooltipContent>Invoice Generator</TooltipContent>
          </Tooltip>
        )}

        <div className="theme-shell-divider h-8 w-px" />

        {activeDockTab === 'income' ? (
          <button
            type="button"
            onClick={() => toggleDockTab('income')}
            aria-pressed
            className="theme-shell-chip inline-flex h-8 items-center justify-center gap-1 overflow-hidden whitespace-nowrap rounded-[8px] px-2 text-[14px] font-medium text-[var(--tertiary)] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
          >
            <Chart2Bold size={16} />
            Income Tracker
          </button>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => toggleDockTab('income')}
                aria-pressed={false}
                className="inline-flex h-8 w-8 items-center justify-center overflow-hidden whitespace-nowrap text-[var(--tertiary)] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
              >
                <Chart2Bold size={16} />
              </button>
            </TooltipTrigger>
            <TooltipContent>Income Tracker</TooltipContent>
          </Tooltip>
        )}
      </footer>
    </div>
    </TooltipProvider>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={null}>
      <DashboardContent />
    </Suspense>
  )
}
