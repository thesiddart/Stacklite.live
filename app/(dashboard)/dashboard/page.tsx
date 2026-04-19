'use client'

import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AppNavbar } from '@/components/layout/AppNavbar'
import {
  DashboardShell,
  DashboardClientsPanel,
  DashboardCenterPanel,
  DashboardTimePanel,
  DashboardDockControls,
  DashboardMobileModuleView,
  DashboardMobileDockControls,
  DashboardFloatingTimerPill,
} from '@/components/workspace/dashboard'
import { useClients } from '@/hooks/useClients'
import { useDeleteClient } from '@/hooks/useClients'
import { useContracts } from '@/hooks/useContracts'
import { useTimeLogs } from '@/hooks/useTimeLogs'
import { useInvoices } from '@/hooks/useInvoices'
import { useAuth } from '@/hooks/useAuth'
import { useCurrentTime } from '@/hooks/useCurrentTime'
import { useDashboardDeepLink } from '@/hooks/useDashboardDeepLink'
import { useMobileDashboardLayout } from '@/hooks/useMobileDashboardLayout'
import { useSessionStore } from '@/stores/sessionStore'
import { useContractStore } from '@/stores/contractStore'
import { useInvoiceStore } from '@/stores/invoiceStore'
import type { Client } from '@/lib/types/database'
import type { InvoiceLineItem } from '@/lib/utils/invoiceCalculations'
import { migrateGuestData } from '@/lib/migration/migrateGuestData'
import { generateClientActivityReportPDF } from '@/lib/pdf/generateClientActivityReportPDF'
import {
  getTimeLogElapsedMilliseconds,
  isSameDay,
  isSameWeek,
} from '@/lib/utils/time'
import {
  parseWorkspaceModuleQueryParam,
  workspaceModuleToMobileTab,
  WORKSPACE_MODULE_QUERY_PARAM,
} from '@/lib/navigation/workspaceModules'
import { useMobileNavStore } from '@/stores/mobileNavStore'

function DashboardContent() {
  const formTransitionMs = 220
  const searchParams = useSearchParams()
  const router = useRouter()
  const initSession = useSessionStore((s) => s.initSession)
  const contractView = useContractStore((s) => s.view)
  const setContractView = useContractStore((s) => s.setView)
  const invoiceView = useInvoiceStore((s) => s.view)
  const setInvoiceView = useInvoiceStore((s) => s.setView)
  const { data: clients = [], isLoading: isClientsLoading } = useClients()
  const deleteClientMutation = useDeleteClient()
  const { data: contracts = [] } = useContracts()
  const { data: invoices = [] } = useInvoices()
  const { data: timeLogs = [] } = useTimeLogs()
  const { user, isLoading: isAuthLoading } = useAuth()
  const { initialDockTab } = useDashboardDeepLink({
    contractsCount: contracts.length,
    setContractView,
    setInvoiceView,
  })

  const mobileLayout = useMobileDashboardLayout()

  const [isClientsCollapsed, setIsClientsCollapsed] = useState(false)
  const [isTimeTrackerCollapsed, setIsTimeTrackerCollapsed] = useState(false)
  const [activeDockTab, setActiveDockTab] = useState<'contract' | 'invoice' | 'income' | null>(() => initialDockTab)
  const [isCreateClientOpen, setIsCreateClientOpen] = useState(false)
  const [isClientFormMounted, setIsClientFormMounted] = useState(false)
  const [isClientFormVisible, setIsClientFormVisible] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const clientFormContainerRef = useRef<HTMLDivElement | null>(null)

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

  const now = useCurrentTime()
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
  const isClientPanelExpanded = isClientFormOpen || isClientFormMounted
  const shouldShowCenterPanel = !isClientFormOpen && activeDockTab !== null
  const isCenterFormActive =
    (activeDockTab === 'contract' && contractView === 'editor') ||
    (activeDockTab === 'invoice' && invoiceView === 'editor')
  const isClientsPanelCollapsed = isCenterFormActive || isClientsCollapsed
  const isTimeTrackerPanelCollapsed = isCenterFormActive || isTimeTrackerCollapsed

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

  const handleDeleteClient = async (client: Client) => {
    const confirmed = window.confirm(
      `Delete ${client.name}? This will also remove all associated time tasks.`
    )

    if (!confirmed) {
      return
    }

    await deleteClientMutation.mutateAsync(client.id)
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

  useEffect(() => {
    if (!isClientFormOpen) {
      return
    }

    const handlePointerDown = (event: PointerEvent) => {
      const container = clientFormContainerRef.current
      const target = event.target

      if (!container || !(target instanceof Node)) {
        return
      }

      if (target instanceof Element && target.closest('[data-floating-ui="true"]')) {
        return
      }

      if (container.contains(target)) {
        return
      }

      setIsCreateClientOpen(false)
      setEditingClient(null)
    }

    document.addEventListener('pointerdown', handlePointerDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [isClientFormOpen])

  useEffect(() => {
    if (!mobileLayout) {
      return
    }

    const parsed = parseWorkspaceModuleQueryParam(searchParams.get(WORKSPACE_MODULE_QUERY_PARAM))
    const mobileTab = workspaceModuleToMobileTab(parsed)

    if (mobileTab) {
      useMobileNavStore.getState().setActiveTab(mobileTab)
    }
  }, [mobileLayout, searchParams])

  const handleMobileOpenInvoiceFromIncome = (invoiceId: string) => {
    useMobileNavStore.getState().setActiveTab('invoices')
    openInvoiceFromIncome(invoiceId)
  }

  const handleMobileOpenInvoiceGenerator = () => {
    useMobileNavStore.getState().setActiveTab('invoices')
    setActiveDockTab('invoice')
    setInvoiceView('list')
  }

  if (mobileLayout) {
    return (
      <TooltipProvider delayDuration={180}>
        <div className="theme-page-shell flex h-dvh flex-col overflow-hidden">
          <div className="dots-background" aria-hidden />

          <div className="relative z-10 flex min-h-0 flex-1 flex-col bg-[var(--surface-page)]">
            <AppNavbar
              compactForMobile
              stackedLayout
              topClassName="top-8"
              zClassName="z-40"
              showThemeButton
              showProfileButton
              showProfileDropdown
              showProfileActiveBorder
              onOpenPrivacyPolicy={handleOpenPrivacyPolicy}
              onDownloadReport={handleDownloadReport}
            />

            {/* Doc: module → gap → bottom dock (same chip nav as desktop). px-4 = 16px inset; gap-4 = 16px above dock. */}
            <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))]">
              <DashboardMobileModuleView
                onOpenInvoiceFromIncome={handleMobileOpenInvoiceFromIncome}
                onOpenInvoiceGenerator={handleMobileOpenInvoiceGenerator}
              />

              <DashboardMobileDockControls />
            </div>

            <DashboardFloatingTimerPill />
          </div>
        </div>
      </TooltipProvider>
    )
  }

  return (
    <TooltipProvider delayDuration={180}>
      <DashboardShell
        onOpenPrivacyPolicy={handleOpenPrivacyPolicy}
        onDownloadReport={handleDownloadReport}
      >
        <DashboardClientsPanel
          formTransitionMs={formTransitionMs}
          isClientsPanelCollapsed={isClientsPanelCollapsed}
          isClientPanelExpanded={isClientPanelExpanded}
          isCenterFormActive={isCenterFormActive}
          setIsClientsCollapsed={setIsClientsCollapsed}
          isClientFormMounted={isClientFormMounted}
          isClientFormVisible={isClientFormVisible}
          clientFormContainerRef={clientFormContainerRef}
          editingClient={editingClient}
          setIsCreateClientOpen={setIsCreateClientOpen}
          setEditingClient={setEditingClient}
          isClientsLoading={isClientsLoading}
          clients={clients}
          newClientsCount={newClientsCount}
          taskCountByClientId={taskCountByClientId}
          onDeleteClient={handleDeleteClient}
        />

        <DashboardCenterPanel
          shouldShowCenterPanel={shouldShowCenterPanel}
          isCenterFormActive={isCenterFormActive}
          activeDockTab={activeDockTab}
          contractView={contractView}
          invoiceView={invoiceView}
          setContractView={setContractView}
          setInvoiceView={setInvoiceView}
          setActiveDockTab={setActiveDockTab}
          onOpenInvoiceFromIncome={openInvoiceFromIncome}
        />

        <DashboardTimePanel
          isTimeTrackerPanelCollapsed={isTimeTrackerPanelCollapsed}
          isCenterFormActive={isCenterFormActive}
          dailyTotal={dailyTotal}
          weeklyTotal={weeklyTotal}
          setIsTimeTrackerCollapsed={setIsTimeTrackerCollapsed}
        />

        <DashboardDockControls
          activeDockTab={activeDockTab}
          toggleDockTab={toggleDockTab}
        />
      </DashboardShell>
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
