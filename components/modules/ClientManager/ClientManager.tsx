'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { AddCircleBold, PeopleBold, SearchNormal1Bold } from 'sicons'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/utils/cn'
import { useClients } from '@/hooks/useClients'
import { useClientStore } from '@/stores/clientStore'
import { ClientDetail } from './ClientDetail'
import { ClientForm } from './ClientForm'
import { ClientItem } from './ClientItem'
import type { Client } from '@/lib/types/database'

/** Matches `DashboardClientsPanel` + desktop workspace strip. */
function ClientStatsStrip({
  className,
  newCount,
  total,
}: {
  className?: string
  newCount: number
  total: number
}) {
  return (
    <div
      className={cn(
        'theme-shell-card inline-flex items-center gap-[2px] rounded-[8px] px-1 shadow-sm',
        className
      )}
    >
      <div className="flex h-6 items-center gap-1 px-1 text-[12px] text-text-muted">
        <span>Total Clients:</span>
        <span>{total}</span>
      </div>
      <div className="theme-shell-divider h-6 w-px" />
      <div className="flex h-6 items-center gap-1 px-1 text-[12px] text-text-muted">
        <span>New Clients:</span>
        <span>{newCount}</span>
      </div>
    </div>
  )
}

/** Primary header action — same as Contract/Invoice module lists (`ContractsList`). */
const MODULE_PRIMARY_ACTION_CLASS =
  'inline-flex items-center gap-1 rounded-[8px] bg-[var(--primary)] px-3 py-1.5 text-[12px] font-medium text-white transition-colors hover:opacity-90'

interface ClientManagerProps {
  variant?: 'dashboard' | 'page'
}

export function ClientManager({ variant = 'dashboard' }: ClientManagerProps) {
  const { data: clients = [], isLoading, error } = useClients()
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)
  const [showDetail, setShowDetail] = useState(false)

  const setStoreClients = useClientStore((state) => state.setClients)
  const selectClient = useClientStore((state) => state.selectClient)

  const newClientsCount = useMemo(() => {
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    return clients.filter((client) => {
      const createdAt = new Date(client.created_at)
      return !Number.isNaN(createdAt.getTime()) && createdAt >= monthStart
    }).length
  }, [clients])

  useEffect(() => {
    setStoreClients(clients)
  }, [clients, setStoreClients])

  const selectedClient = useMemo(
    () => clients.find((client) => client.id === selectedClientId) ?? null,
    [clients, selectedClientId]
  )

  const isPage = variant === 'page'
  const showSearch = isPage

  const filteredClients = useMemo(() => {
    if (!showSearch) {
      return clients
    }

    const normalizedQuery = searchQuery.trim().toLowerCase()

    if (!normalizedQuery) {
      return clients
    }

    return clients.filter((client) => {
      return [client.name, client.company_name, client.email, client.phone, client.industry]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(normalizedQuery))
    })
  }, [clients, searchQuery, showSearch])

  const handleSelectClient = (client: Client) => {
    setSelectedClientId(client.id)
    setShowDetail(true)
    selectClient(client.id)
  }

  const handleCloseDetail = () => {
    setShowDetail(false)
    setSelectedClientId(null)
    selectClient(null)
  }

  const headerNewButton = (
    <button
      type="button"
      onClick={() => setIsCreateOpen(true)}
      className={`${MODULE_PRIMARY_ACTION_CLASS} shrink-0 whitespace-nowrap`}
    >
      <AddCircleBold size={14} />
      New
    </button>
  )

  return (
    <>
      <div className="flex h-full flex-col gap-lg">
        <div className="flex flex-col gap-md">
          <div
            className={`flex items-center justify-between gap-md ${
              isPage ? 'items-start' : 'items-center'
            }`}
          >
            <div className="min-w-0 space-y-xs">
              {isPage ? (
                <>
                  <h1 className="text-2xl font-semibold text-text-base">Client Manager</h1>
                  <p className="text-sm text-text-muted">
                    Keep client details organized for contracts, invoices, and time logs.
                  </p>
                </>
              ) : (
                <h2 className="text-[14px] font-semibold leading-none text-text-base">Client Manager</h2>
              )}
            </div>

            {headerNewButton}
          </div>

          {showSearch ? (
            <div className="relative">
              <SearchNormal1Bold className="pointer-events-none absolute left-md top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <Input
                aria-label="Search clients"
                placeholder="Search by name, company, email, or phone"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="pl-10"
              />
            </div>
          ) : null}
        </div>

        {error && (
          <div className="rounded-md border border-feedback-error-base/40 bg-feedback-error-base/10 p-md text-sm text-feedback-error-text">
            {error instanceof Error ? error.message : 'Unable to load clients.'}
          </div>
        )}

        <div className={`grid flex-1 gap-lg ${isPage ? 'lg:grid-cols-[minmax(320px,420px)_1fr]' : ''}`}>
          <div
            className="flex min-h-0 flex-col gap-md"
          >
            <div className="min-h-0 flex-1 space-y-md overflow-y-auto pr-xs">
              {isLoading ? (
                <div className="rounded-lg border border-border-muted bg-background-highlight/40 p-xl text-sm text-text-muted">
                  Loading clients...
                </div>
              ) : filteredClients.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border-muted bg-background-highlight/30 p-xl text-center">
                  <PeopleBold className="mx-auto h-10 w-10 text-text-muted" />
                  <p className="mt-md text-base font-medium text-text-base">
                    {showSearch && searchQuery ? 'No clients match this search.' : 'Add a client to get started.'}
                  </p>
                  <p className="mt-xs text-sm text-text-muted">
                    They&apos;ll be available across contracts, invoices, and time tracking.
                  </p>
                  {(!showSearch || !searchQuery) && (
                    <div className="mt-lg">
                      <button type="button" onClick={() => setIsCreateOpen(true)} className={MODULE_PRIMARY_ACTION_CLASS}>
                        <AddCircleBold size={14} />
                        New
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                filteredClients.map((client) => (
                  <ClientItem
                    key={client.id}
                    client={client}
                    isSelected={selectedClient?.id === client.id && showDetail}
                    onClick={() => handleSelectClient(client)}
                  />
                ))
              )}
            </div>

            <div className="flex shrink-0 justify-center pt-1">
              <ClientStatsStrip newCount={newClientsCount} total={clients.length} />
            </div>
          </div>

          {(isPage || showDetail) && (
            <div className="rounded-lg border border-border-muted bg-background-base shadow-sm">
              {selectedClient && showDetail ? (
                <div className="p-lg">
                  <ClientDetail client={selectedClient} onClose={handleCloseDetail} />
                </div>
              ) : (
                <div className="flex h-full min-h-[280px] flex-col items-center justify-center p-xl text-center">
                  <PeopleBold className="h-10 w-10 text-text-muted" />
                  <p className="mt-md text-base font-medium text-text-base">Select a client</p>
                  <p className="mt-xs max-w-sm text-sm text-text-muted">
                    Review contact details, update notes, and manage client records from here.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {isCreateOpen && <ClientForm isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} mode="create" />}
    </>
  )
}
