'use client'

import React, { useMemo, useState } from 'react'
import {
  AddCircleBold,
  Chart2Bold,
  CloseCircleBold,
  DocumentText1Bold,
  PauseCircleBold,
  PeopleBold,
  ProfileAddBold,
  Timer1Bold,
  WalletBold,
} from 'sicons'
import { AppNavbar } from '@/components/layout/AppNavbar'
import { ClientForm } from '@/components/modules/ClientManager/ClientForm'
import { useClients } from '@/hooks/useClients'

export default function DashboardPage() {
  const [isClientsCollapsed, setIsClientsCollapsed] = useState(false)
  const [isTimeTrackerCollapsed, setIsTimeTrackerCollapsed] = useState(false)
  const [activeDockTab, setActiveDockTab] = useState<'contract' | 'invoice' | 'income'>('contract')
  const [isCreateClientOpen, setIsCreateClientOpen] = useState(false)
  const { data: clients = [], isLoading: isClientsLoading } = useClients()

  const newClientsCount = useMemo(() => {
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    return clients.filter((client) => {
      const createdAt = new Date(client.created_at)
      return !Number.isNaN(createdAt.getTime()) && createdAt >= monthStart
    }).length
  }, [clients])

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f4f4f4]">
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
            ? 'left-[71px] top-[calc(50%+188px)] items-start gap-2'
            : 'left-[71px] top-1/2 w-[289px] -translate-y-1/2 items-center gap-4'
        }`}
      >
        {isClientsCollapsed ? (
          <button
            type="button"
            onClick={() => setIsClientsCollapsed(false)}
            className="inline-flex h-8 w-fit items-center gap-1 rounded-[8px] bg-[#f3e8ff] px-2 text-[var(--tertairy,#251f7b)]"
            aria-label="Expand Manage Clients"
          >
            <PeopleBold size={16} />
            <span className="text-[14px] font-medium leading-none">Manage Clients</span>
          </button>
        ) : (
          <>
            <div className="flex h-[264px] w-full flex-col gap-[10px] rounded-[14px] border border-[#e2e2e2] bg-white p-4 shadow-[0_4px_6px_0_rgba(0,0,0,0.1),0_2px_4px_0_rgba(0,0,0,0.06)]">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsClientsCollapsed(true)}
                  className="inline-flex h-8 items-center gap-1 rounded-[8px] bg-[#f3e8ff] px-2 text-[var(--tertairy,#251f7b)]"
                  aria-label="Collapse Manage Clients"
                >
                  <PeopleBold size={16} />
                  <span className="text-[14px] font-medium">Manage Clients</span>
                </button>
                <button
                  type="button"
                  aria-label="Add client"
                  onClick={() => setIsCreateClientOpen(true)}
                  className="text-[var(--tertairy,#251f7b)]"
                >
                  <AddCircleBold size={24} />
                </button>
              </div>
              <div className="h-px w-full bg-[#d8d8d8]" />
              <div className="flex-1 space-y-2 overflow-y-auto rounded-[10px]">
                {isClientsLoading ? (
                  <div className="rounded-[10px] bg-[#f3e8ff]/40 p-3 text-[13px] text-[#7c7288]">
                    Loading clients...
                  </div>
                ) : clients.length === 0 ? (
                  <div className="rounded-[10px] bg-[#f3e8ff]/40 p-3 text-[13px] text-[#7c7288]">
                    No clients yet. Click + to add your first client.
                  </div>
                ) : (
                  clients.map((client) => (
                    <article
                      key={client.id}
                      className="rounded-[10px] border border-[rgba(121,98,244,0.35)] bg-[#f3e8ff]/45 p-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="truncate text-[18px] font-medium text-[#1a163d]">{client.name}</h3>
                          <p className="mt-1 truncate text-[15px] text-[#7c7288]">{client.email || 'No email added'}</p>
                        </div>
                        <button
                          type="button"
                          aria-label={`Edit ${client.name}`}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-[8px] bg-[#1a163d] text-white"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                              d="M12 20h9"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4 12.5-12.5z"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                      </div>

                      {client.tags && client.tags.length > 0 && (
                        <div className="mt-3">
                          <span className="inline-flex rounded-[10px] bg-[var(--primary,#7962f4)] px-3 py-1 text-[14px] font-medium text-white">
                            {client.tags[0].charAt(0).toUpperCase() + client.tags[0].slice(1)}
                          </span>
                        </div>
                      )}
                    </article>
                  ))
                )}
              </div>
            </div>
          </>
        )}

        <div className="inline-flex items-center gap-[2px] rounded-[8px] border border-[#e2e2e2] bg-white px-1">
          <div className="flex h-6 items-center gap-1 px-1 text-[12px] text-[#7c7288]">
            <span>Total Clients:</span>
            <span>{clients.length}</span>
          </div>
          <div className="h-6 w-px bg-[#d8d8d8]" />
          <div className="flex h-6 items-center gap-1 px-1 text-[12px] text-[#7c7288]">
            <span>New Clients:</span>
            <span>{newClientsCount}</span>
          </div>
        </div>
      </section>

      <section className="absolute bottom-28 left-1/2 top-[120px] z-10 flex w-[min(489px,calc(100vw-40px))] -translate-x-1/2 flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="inline-flex w-fit items-center gap-1">
            <div className="inline-flex h-8 w-8 items-center justify-center rounded-[3px] border border-[var(--primary,#7962f4)] bg-[rgba(121,98,244,0.46)] text-[var(--tertairy,#251f7b)]">
              {isCreateClientOpen ? <ProfileAddBold size={18} /> : <DocumentText1Bold size={16} />}
            </div>
            <div className="inline-flex h-8 items-center rounded-[4px] border border-[var(--primary,#7962f4)] bg-[rgba(121,98,244,0.46)] px-4">
              <span className="text-[14px] font-medium text-[var(--tertairy,#251f7b)]">
                {isCreateClientOpen ? 'Add Client' : 'Contract Generator'}
              </span>
            </div>
          </div>

          {isCreateClientOpen && (
            <button
              type="button"
              onClick={() => setIsCreateClientOpen(false)}
              aria-label="Close add client panel"
              className="inline-flex h-8 w-8 items-center justify-center rounded-[3px] border border-[var(--primary,#7962f4)] bg-[rgba(121,98,244,0.46)] text-[var(--tertairy,#251f7b)] transition-colors hover:bg-[rgba(121,98,244,0.6)]"
            >
              <CloseCircleBold size={16} />
            </button>
          )}
        </div>
        <div className="relative flex-1 min-h-0 overflow-visible rounded-[14px] border border-[var(--primary,#7962f4)] bg-[#f3e8ff] shadow-[0_4px_6px_0_rgba(0,0,0,0.1),0_2px_4px_0_rgba(0,0,0,0.06)]">
          <div className="h-full min-h-0 overflow-hidden rounded-[14px]">
            {isCreateClientOpen ? (
              <ClientForm
                isOpen={isCreateClientOpen}
                onClose={() => setIsCreateClientOpen(false)}
                mode="create"
                renderMode="inline"
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center rounded-[10px] border border-[#d8d8d8] bg-white/60 text-center">
                <DocumentText1Bold size={28} className="text-[var(--tertairy,#251f7b)]" />
                <p className="mt-2 text-sm font-medium text-[var(--tertairy,#251f7b)]">Contract Generator</p>
                <p className="mt-1 max-w-[280px] text-xs text-[#5c5c5c]">
                  Select a module from the dock or click Add Client to start client onboarding here.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section
        className={`absolute z-10 flex flex-col ${
          isTimeTrackerCollapsed
            ? 'right-[71px] top-[calc(50%+188px)] items-end gap-2'
            : 'left-[calc(75%+77px)] top-1/2 w-[231px] -translate-y-1/2 items-center gap-[9px]'
        }`}
      >
        {isTimeTrackerCollapsed ? (
          <button
            type="button"
            onClick={() => setIsTimeTrackerCollapsed(false)}
            className="inline-flex h-8 w-fit items-center gap-1 rounded-[8px] bg-[#f3e8ff] px-2 text-[var(--tertairy,#251f7b)]"
            aria-label="Expand Time Tracker"
          >
            <Timer1Bold size={16} />
            <span className="text-[14px] font-medium leading-none">Time Tracker</span>
          </button>
        ) : (
          <>
            <div className="flex h-[341px] w-full flex-col gap-[10px] rounded-[14px] border border-[#e2e2e2] bg-white p-4 shadow-[0_4px_6px_0_rgba(0,0,0,0.1),0_2px_4px_0_rgba(0,0,0,0.06)]">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsTimeTrackerCollapsed(true)}
                  className="inline-flex h-8 w-fit items-center gap-1 whitespace-nowrap rounded-[8px] bg-[#f3e8ff] px-2 text-[var(--tertairy,#251f7b)]"
                  aria-label="Collapse Time Tracker"
                >
                  <Timer1Bold size={16} />
                  <span className="text-[14px] font-medium">Time Tracker</span>
                </button>
                <button type="button" aria-label="Add timer" className="text-[var(--tertairy,#251f7b)]">
                  <AddCircleBold size={24} />
                </button>
              </div>
              <div className="h-px w-full bg-[#d8d8d8]" />
              <div className="space-y-[2px] text-[12px] text-[#7c7288]">
                <p>Task: Design Stacklite Homepage</p>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-px">
                    <Timer1Bold size={12} />
                    <span>00:42:42</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <PauseCircleBold size={12} />
                    <PauseCircleBold size={12} />
                    <PauseCircleBold size={12} />
                  </div>
                </div>
              </div>
              <div className="flex-1" />
            </div>
          </>
        )}

        <div className="inline-flex items-center gap-[2px] rounded-[8px] border border-[#e2e2e2] bg-white px-1">
          <div className="flex h-6 items-center gap-1 px-1 text-[12px] text-[#7c7288]">
            <span>Today:</span>
            <span>3h 5m</span>
          </div>
          <div className="h-6 w-px bg-[#d8d8d8]" />
          <div className="flex h-6 items-center gap-1 px-1 text-[12px] text-[#7c7288]">
            <span>This Week:</span>
            <span>9h 20m</span>
          </div>
        </div>
      </section>

      <footer className="absolute bottom-8 left-1/2 z-10 flex h-12 -translate-x-1/2 items-center gap-[10px] rounded-[14px] bg-white p-2 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)]">
        <button
          type="button"
          onClick={() => setActiveDockTab('contract')}
          aria-pressed={activeDockTab === 'contract'}
          className={`inline-flex h-8 items-center justify-center text-[var(--tertairy,#251f7b)] ${
            activeDockTab === 'contract'
              ? 'gap-1 rounded-[8px] bg-[#f3e8ff] px-2 text-[14px] font-medium'
              : 'w-8'
          }`}
        >
          <DocumentText1Bold size={16} />
          {activeDockTab === 'contract' && 'Contract Generator'}
        </button>

        <div className="h-8 w-px bg-[#d8d8d8]" />

        <button
          type="button"
          onClick={() => setActiveDockTab('invoice')}
          aria-pressed={activeDockTab === 'invoice'}
          className={`inline-flex h-8 items-center justify-center text-[var(--tertairy,#251f7b)] ${
            activeDockTab === 'invoice'
              ? 'gap-1 rounded-[8px] bg-[#f3e8ff] px-2 text-[14px] font-medium'
              : 'w-8'
          }`}
        >
          <WalletBold size={16} />
          {activeDockTab === 'invoice' && 'Invoice Generator'}
        </button>

        <div className="h-8 w-px bg-[#d8d8d8]" />

        <button
          type="button"
          onClick={() => setActiveDockTab('income')}
          aria-pressed={activeDockTab === 'income'}
          className={`inline-flex h-8 items-center justify-center text-[var(--tertairy,#251f7b)] ${
            activeDockTab === 'income'
              ? 'gap-1 rounded-[8px] bg-[#f3e8ff] px-2 text-[14px] font-medium'
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
