'use client'

import React from 'react'
import {
  AddCircleBold,
  CloseCircleBold,
  EditBold,
  PeopleBold,
  TrashBold,
} from 'sicons'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { ClientForm } from '@/components/modules/ClientManager/ClientForm'
import type { Client } from '@/lib/types/database'

function getClientTagBadgeClassName(tag: string): string {
  const normalizedTag = tag.trim().toLowerCase()

  if (normalizedTag === 'design') {
    return 'bg-[var(--color-warning)] text-[var(--color-text-inverse)]'
  }

  if (normalizedTag === 'development' || normalizedTag === 'devlopment') {
    return 'bg-[var(--color-info)] text-[var(--color-text-inverse)]'
  }

  return 'bg-[var(--color-brand-subtle)] text-[var(--color-text-brand)]'
}

export type DashboardClientsPanelProps = {
  formTransitionMs: number
  isClientsPanelCollapsed: boolean
  isClientPanelExpanded: boolean
  isCenterFormActive: boolean
  setIsClientsCollapsed: (collapsed: boolean) => void
  isClientFormMounted: boolean
  isClientFormVisible: boolean
  clientFormContainerRef: React.RefObject<HTMLDivElement | null>
  editingClient: Client | null
  setIsCreateClientOpen: (open: boolean) => void
  setEditingClient: (client: Client | null) => void
  isClientsLoading: boolean
  clients: Client[]
  newClientsCount: number
  taskCountByClientId: Map<string, number>
  onDeleteClient: (client: Client) => void | Promise<void>
}

export function DashboardClientsPanel({
  formTransitionMs,
  isClientsPanelCollapsed,
  isClientPanelExpanded,
  isCenterFormActive,
  setIsClientsCollapsed,
  isClientFormMounted,
  isClientFormVisible,
  clientFormContainerRef,
  editingClient,
  setIsCreateClientOpen,
  setEditingClient,
  isClientsLoading,
  clients,
  newClientsCount,
  taskCountByClientId,
  onDeleteClient,
}: DashboardClientsPanelProps) {
  const isEditingClientOpen = editingClient !== null

  return (
    <section
      className={`absolute z-10 flex flex-col ${
        isClientsPanelCollapsed
          ? 'left-[50px] top-[calc(50%+188px)] items-start gap-2'
          : `bottom-28 left-[50px] items-center gap-4 transition-[bottom,width,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              isClientPanelExpanded
                ? 'w-[400px] translate-y-0'
                : 'w-[289px] translate-y-0'
            }`
      }`}
    >
      {isClientsPanelCollapsed ? (
        <button
          type="button"
          onClick={() => {
            if (isCenterFormActive) {
              return
            }

            setIsClientsCollapsed(false)
          }}
          className="theme-shell-chip inline-flex h-8 w-fit items-center gap-1 rounded-[8px] px-2"
          aria-label="Expand Manage Clients"
        >
          <PeopleBold size={16} />
          <span className="text-[14px] font-medium leading-none">Manage Clients</span>
        </button>
      ) : (
        <>
          <div
            className={`theme-shell-card flex w-full min-h-[341px] flex-col gap-[10px] overflow-hidden rounded-[14px] p-4 transition-[height,max-height] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              isClientPanelExpanded
                ? 'h-[min(640px,calc(100vh-240px))]'
                : 'max-h-[min(600px,calc(100vh-240px))]'
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
                  ref={clientFormContainerRef}
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
                      Add a client to get started. They&apos;ll be available across contracts, invoices, and time tracking.
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
                            <div className="inline-flex items-center gap-2">
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
                              <button
                                type="button"
                                aria-label={`Delete ${client.name}`}
                                onClick={() => {
                                  void onDeleteClient(client)
                                }}
                                className="inline-flex shrink-0 items-center justify-center text-text-base transition-colors hover:text-[var(--tertiary)]"
                              >
                                <TrashBold size={16} />
                              </button>
                            </div>
                          </div>

                          <div className="w-full">
                            <p className="truncate text-[14px] leading-none text-text-muted">
                              {client.email || 'No email added'}
                            </p>
                          </div>

                          <div className="flex w-full items-center justify-between gap-[10px]">
                            {client.tags && client.tags.length > 0 ? (
                              <span
                                className={`inline-flex h-fit w-fit items-center justify-center rounded-[4px] pl-[8px] pr-[8px] pt-[4px] pb-[4px] text-[14px] font-medium leading-none ${getClientTagBadgeClassName(client.tags[0])}`}
                              >
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
  )
}
