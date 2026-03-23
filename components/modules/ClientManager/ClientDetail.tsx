'use client'

import React, { useState } from 'react'
import {
  BuildingBold,
  Calendar1Bold,
  CallBold,
  CloseCircleBold,
  EditBold,
  LocationBold,
  SmsBold,
  TrashBold,
} from 'sicons'
import { Button } from '@/components/ui/Button'
import { useDeleteClient } from '@/hooks/useClients'
import { ClientForm } from './ClientForm'
import type { Client } from '@/lib/types/database'

interface ClientDetailProps {
  client: Client
  onClose: () => void
}

export function ClientDetail({ client, onClose }: ClientDetailProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const deleteMutation = useDeleteClient()
  
  const handleDelete = async () => {
    try {
      setDeleteError(null)
      await deleteMutation.mutateAsync(client.id)
      onClose()
    } catch (error: unknown) {
      setDeleteError(error instanceof Error ? error.message : 'Failed to delete client')
    }
  }
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }
  
  return (
    <>
      <div className="space-y-xl">
        <div className="flex items-start justify-between gap-lg">
          <div>
            <h2 className="text-xl font-semibold text-text-base sm:text-2xl">
              {client.name}
            </h2>
            {client.company_name && (
              <p className="mt-xs flex items-center gap-sm text-sm text-text-muted sm:text-base">
                <BuildingBold className="h-4 w-4" />
                {client.company_name}
              </p>
            )}
          </div>
          
          <button
            onClick={onClose}
            className="rounded-md p-sm text-text-muted transition-colors hover:text-text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-brand"
            aria-label="Close client details"
          >
            <CloseCircleBold className="h-5 w-5" />
          </button>
        </div>
        
        <div className="space-y-md">
          <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">
            Contact Information
          </h3>
          
          <div className="grid gap-4">
            {client.email && (
              <div>
                <label className="text-sm font-medium text-text-muted">Email</label>
                <p className="mt-xs flex items-center gap-sm text-base text-text-base">
                  <SmsBold className="h-4 w-4 text-text-muted" />
                  <a href={`mailto:${client.email}`} className="transition-colors hover:text-link-base">
                    {client.email}
                  </a>
                </p>
              </div>
            )}
            
            {client.phone && (
              <div>
                <label className="text-sm font-medium text-text-muted">Phone</label>
                <p className="mt-xs flex items-center gap-sm text-base text-text-base">
                  <CallBold className="h-4 w-4 text-text-muted" />
                  <a href={`tel:${client.phone}`} className="transition-colors hover:text-link-base">
                    {client.phone}
                  </a>
                </p>
              </div>
            )}
            
            {client.address && (
              <div>
                <label className="text-sm font-medium text-text-muted">Address</label>
                <p className="mt-xs flex items-start gap-sm whitespace-pre-line text-base text-text-base">
                  <LocationBold className="mt-[2px] h-4 w-4 flex-shrink-0 text-text-muted" />
                  {client.address}
                </p>
              </div>
            )}

            {(client.country || client.state_province || client.postal_code) && (
              <div>
                <label className="text-sm font-medium text-text-muted">Region</label>
                <p className="mt-xs text-base text-text-base">
                  {[client.state_province, client.country, client.postal_code].filter(Boolean).join(', ')}
                </p>
              </div>
            )}
          </div>
        </div>

        {(client.contact_person_first_name || client.contact_person_last_name) && (
          <div className="space-y-sm">
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">
              Primary Contact
            </h3>
            <p className="text-base text-text-base">
              {[client.contact_person_first_name, client.contact_person_last_name].filter(Boolean).join(' ')}
            </p>
          </div>
        )}

        {(client.company_type || client.industry || client.website || client.tax_id) && (
          <div className="space-y-sm">
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">Company Profile</h3>
            <div className="grid gap-sm text-sm text-text-base">
              {client.company_type && <p>Type: {client.company_type.replaceAll('_', ' ')}</p>}
              {client.industry && <p>Industry: {client.industry}</p>}
              {client.tax_id && <p>Tax ID: {client.tax_id}</p>}
              {client.website && (
                <p>
                  Website:{' '}
                  <a href={client.website} target="_blank" rel="noreferrer" className="transition-colors hover:text-link-base">
                    {client.website}
                  </a>
                </p>
              )}
            </div>
          </div>
        )}

        {(client.payment_currency || client.payment_terms || client.preferred_contact_method || client.tags?.length) && (
          <div className="space-y-sm">
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">Billing and Preferences</h3>
            <div className="grid gap-sm text-sm text-text-base">
              <p>Status: {client.is_active ? 'Active' : 'Inactive'}</p>
              {client.payment_currency && <p>Currency: {client.payment_currency}</p>}
              {client.payment_terms && <p>Terms: {client.payment_terms}</p>}
              {client.preferred_contact_method && <p>Preferred Contact: {client.preferred_contact_method}</p>}
              {client.tags?.length ? <p>Tags: {client.tags.join(', ')}</p> : null}
              {client.last_contacted_at ? <p>Last Contacted: {formatDate(client.last_contacted_at)}</p> : null}
            </div>
          </div>
        )}
        
        {client.notes && (
          <div className="space-y-sm">
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">
              Notes
            </h3>
            <p className="whitespace-pre-line rounded-md bg-background-highlight/50 p-lg text-base text-text-base">
              {client.notes}
            </p>
          </div>
        )}

        {client.metadata && (
          <div className="space-y-sm">
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">Metadata</h3>
            <pre className="overflow-x-auto rounded-md bg-background-highlight/50 p-lg text-xs text-text-base">
              {JSON.stringify(client.metadata, null, 2)}
            </pre>
          </div>
        )}
        
        <div className="space-y-sm border-t border-border-muted pt-lg text-sm text-text-muted">
          <p className="flex items-center gap-sm">
            <Calendar1Bold className="h-4 w-4" />
            Added: {formatDate(client.created_at)}
          </p>
          <p>Last updated: {formatDate(client.updated_at)}</p>
        </div>

        {deleteError && (
          <div className="rounded-md border border-feedback-error-base/40 bg-feedback-error-base/10 p-md text-sm text-feedback-error-text">
            {deleteError}
          </div>
        )}
        
        <div className="flex flex-wrap gap-md pt-sm">
          <Button
            variant="primary"
            onClick={() => setIsEditModalOpen(true)}
            className="flex-1 min-w-[140px]"
          >
            <EditBold className="mr-sm h-4 w-4" />
            Edit Client
          </Button>
          
          {!showDeleteConfirm ? (
            <Button
              variant="danger"
              onClick={() => setShowDeleteConfirm(true)}
              className="min-w-[140px]"
            >
              <TrashBold className="mr-sm h-4 w-4" />
              Delete
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleDelete}
                isLoading={deleteMutation.isPending}
              >
                Confirm Delete
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {isEditModalOpen && (
        <ClientForm
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          client={client}
          mode="edit"
        />
      )}
    </>
  )
}
