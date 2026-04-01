'use client'

import React from 'react'
import { Card } from '@/components/ui/Card'
import { ArrowRight2Bold, BuildingBold, CallBold, SmsBold } from 'sicons'
import type { Client } from '@/lib/types/database'

interface ClientItemProps {
  client: Client
  onClick: () => void
  isSelected?: boolean
}

export function ClientItem({ client, onClick, isSelected = false }: ClientItemProps) {
  return (
    <Card
      clickable
      onClick={onClick}
      className={`w-full p-lg text-left ${
        isSelected ? 'border-feedback-success-base bg-background-highlight' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-sm">
            <h3 className="truncate text-base font-semibold text-text-base">{client.name}</h3>
            {!client.is_active && (
              <span className="rounded-sm bg-background-highlight px-sm py-[2px] text-xs font-medium text-text-muted">
                Inactive
              </span>
            )}
          </div>
          
          {client.company_name && (
            <p className="mt-xs flex items-center gap-sm truncate text-sm text-text-muted">
              <BuildingBold className="h-4 w-4 flex-shrink-0" />
              {client.company_name}
            </p>
          )}
          
          <div className="mt-md space-y-xs">
            {client.industry && (
              <p className="truncate text-sm text-text-muted">{client.industry}</p>
            )}
            {client.email && (
              <p className="flex items-center gap-sm truncate text-sm text-text-muted">
                <SmsBold className="h-4 w-4 flex-shrink-0" />
                {client.email}
              </p>
            )}
            
            {client.phone && (
              <p className="flex items-center gap-sm truncate text-sm text-text-muted">
                <CallBold className="h-4 w-4 flex-shrink-0" />
                {client.phone}
              </p>
            )}
          </div>
        </div>
        
        <ArrowRight2Bold className="ml-sm h-5 w-5 flex-shrink-0 text-text-muted" />
      </div>
    </Card>
  )
}
