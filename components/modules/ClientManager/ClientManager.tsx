'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { PeopleBold, SearchNormal1Bold, UserCirlceAddBold } from 'sicons'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useClients } from '@/hooks/useClients'
import { useClientStore } from '@/stores/clientStore'
import { ClientDetail } from './ClientDetail'
import { ClientForm } from './ClientForm'
import { ClientItem } from './ClientItem'
import type { Client } from '@/lib/types/database'

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

  useEffect(() => {
    setStoreClients(clients)
  }, [clients, setStoreClients])

  const selectedClient = useMemo(
    () => clients.find((client) => client.id === selectedClientId) ?? null,
    [clients, selectedClientId]
  )

  const filteredClients = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()

    if (!normalizedQuery) {
      return clients
    }

    return clients.filter((client) => {
      return [client.name, client.company_name, client.email, client.phone, client.industry]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(normalizedQuery))
    })
  }, [clients, searchQuery])

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

  const isPage = variant === 'page'

  return (
    <>
      <div className="flex h-full flex-col gap-lg">
        <div className="flex flex-col gap-md">
          <div className="flex items-start justify-between gap-md">
            <div className="space-y-xs">
              {isPage && <h1 className="text-2xl font-semibold text-text-base">Client Manager</h1>}
              <p className="text-sm text-text-muted">
                Keep client details organized for contracts, invoices, and time logs.
              </p>
            </div>

            <Button type="button" size={isPage ? 'md' : 'sm'} onClick={() => setIsCreateOpen(true)}>
              <UserCirlceAddBold className="h-4 w-4" />
              Add Client
            </Button>
          </div>

          <div className="grid gap-md sm:grid-cols-2">
            <div className="rounded-md border border-border-muted bg-background-highlight/40 p-md">
              <p className="text-xs uppercase tracking-[0.16em] text-text-muted">Total Clients</p>
              <p className="mt-xs text-2xl font-semibold text-text-base">{clients.length}</p>
            </div>
            <div className="rounded-md border border-border-muted bg-background-highlight/40 p-md">
              <p className="text-xs uppercase tracking-[0.16em] text-text-muted">Matching Search</p>
              <p className="mt-xs text-2xl font-semibold text-text-base">{filteredClients.length}</p>
            </div>
          </div>

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
        </div>

        {error && (
          <div className="rounded-md border border-feedback-error-base/40 bg-feedback-error-base/10 p-md text-sm text-feedback-error-text">
            {error instanceof Error ? error.message : 'Unable to load clients.'}
          </div>
        )}

        <div className={`grid flex-1 gap-lg ${isPage ? 'lg:grid-cols-[minmax(320px,420px)_1fr]' : ''}`}>
          <div className="space-y-md overflow-y-auto pr-xs">
            {isLoading ? (
              <div className="rounded-lg border border-border-muted bg-background-highlight/40 p-xl text-sm text-text-muted">
                Loading clients...
              </div>
            ) : filteredClients.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border-muted bg-background-highlight/30 p-xl text-center">
                <PeopleBold className="mx-auto h-10 w-10 text-text-muted" />
                <p className="mt-md text-base font-medium text-text-base">
                  {searchQuery ? 'No clients match this search.' : 'No clients yet.'}
                </p>
                <p className="mt-xs text-sm text-text-muted">
                  Add your first client to start generating contracts and invoices.
                </p>
                {!searchQuery && (
                  <div className="mt-lg">
                    <Button type="button" onClick={() => setIsCreateOpen(true)}>
                      <UserCirlceAddBold className="h-4 w-4" />
                      Add First Client
                    </Button>
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