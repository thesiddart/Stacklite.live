'use client'

import { useState } from 'react'
import Image from 'next/image'

type MockTab = 'contracts' | 'invoices' | 'income'

const tabContent: Record<MockTab, { title: string; action: string; rows: string[] }> = {
  contracts: {
    title: 'Contract Generator',
    action: '+ New',
    rows: [
      'Brand Identity Project • Not signed',
      'Web Development • Not signed',
      'April Retainer • Signed',
    ],
  },
  invoices: {
    title: 'Invoice Generator',
    action: '+ New',
    rows: [
      'INV-028 • Kusum Sapkota • Pending',
      'INV-027 • Retainer Co • Paid',
      'INV-026 • Sidd • Overdue',
    ],
  },
  income: {
    title: 'Income Tracker',
    action: 'Month',
    rows: [
      'April • $4,820 • +12%',
      'March • $4,302 • +8%',
      'February • $3,981 • +5%',
    ],
  },
}

export function WorkspaceMock() {
  const [activeTab, setActiveTab] = useState<MockTab>('contracts')
  const active = tabContent[activeTab]

  return (
    <div className="mx-auto mt-10 max-w-[920px] overflow-hidden rounded-2xl border border-button-primary bg-background-base text-text-base shadow-lg">
      <div className="flex items-center justify-between border-b border-border-muted bg-background-highlight px-4 py-3 text-xs text-text-muted">
        <div className="inline-flex items-center gap-2">
          <Image src="/logo-dark.svg" alt="Stacklite" width={76} height={20} style={{ width: 'auto', height: 'auto' }} />
        </div>
        <div className="inline-flex items-center gap-2">
          <span className="rounded-full border border-border-base px-2 py-1">04:40 PM</span>
          <span className="rounded-md bg-button-primary px-2 py-1 text-button-primary-fg text-btn-primaryFg">Sign In</span>
        </div>
      </div>

      <div className="grid gap-3 bg-[var(--color-canvas-bg)] p-3 lg:grid-cols-[160px_minmax(0,1fr)_148px]">
        <article className="rounded-xl border border-border-base bg-background-highlight p-3 text-left">
          <div className="mb-2 flex items-center justify-between">
            <span className="rounded-md border border-border-brand bg-background-muted px-2 py-1 text-[10px] text-text-brand">Manage Clients</span>
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-button-primary text-[11px] text-button-primary-fg">+</span>
          </div>
          <div className="space-y-1 text-[10px] text-text-muted">
            <div className="rounded-md border border-border-muted bg-background-base px-2 py-1.5">Kusum Sapkota</div>
            <div className="rounded-md border border-border-muted bg-background-base px-2 py-1.5">Sidd</div>
            <div className="rounded-md border border-border-muted bg-background-base px-2 py-1.5">Retainer Co</div>
          </div>
          <p className="mt-2 text-[10px] text-text-muted">Total: 3 • New: 1</p>
        </article>

        <article className="rounded-xl border border-border-base bg-background-highlight p-3 text-left">
          <div className="mb-2 flex items-center justify-between">
            <span className="rounded-md border border-border-brand bg-background-muted px-2 py-1 text-[10px] text-text-brand">{active.title}</span>
            <span className="rounded-md bg-button-primary px-2 py-1 text-[10px] text-button-primary-fg">{active.action}</span>
          </div>
          <div className="space-y-1 text-[11px] text-text-muted">
            {active.rows.map((row) => (
              <div key={row} className="rounded-md border border-border-muted bg-background-base px-2 py-1.5">
                {row}
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-xl border border-border-base bg-background-highlight p-3 text-left">
          <div className="mb-2 flex items-center justify-between">
            <span className="rounded-md border border-border-brand bg-background-muted px-2 py-1 text-[10px] text-text-brand">Time Tracker</span>
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-button-primary text-[11px] text-button-primary-fg">+</span>
          </div>
          <p className="text-center text-lg font-semibold tabular-nums text-text-base">01:24:38</p>
          <p className="text-center text-[10px] text-text-muted">Brand Identity</p>
          <p className="mt-2 text-[10px] text-text-muted">Today: 4h • Week: 18h</p>
        </article>
      </div>

      <div className="flex items-center justify-center gap-2 border-t border-border-muted bg-background-highlight px-3 py-2 text-[10px] text-text-muted">
        <button
          type="button"
          onClick={() => setActiveTab('contracts')}
          className={`rounded-full border px-3 py-1 focus-visible:ring-2 focus-visible:ring-text-brand ${
            activeTab === 'contracts'
              ? 'border-border-brand bg-background-muted text-text-brand'
              : 'border-border-base hover:bg-background-muted'
          }`}
        >
          Contract Generator
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('invoices')}
          className={`rounded-md border px-2 py-1 focus-visible:ring-2 focus-visible:ring-text-brand ${
            activeTab === 'invoices'
              ? 'border-border-brand bg-background-muted text-text-brand'
              : 'border-border-base hover:bg-background-muted'
          }`}
        >
          Invoice
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('income')}
          className={`rounded-md border px-2 py-1 focus-visible:ring-2 focus-visible:ring-text-brand ${
            activeTab === 'income'
              ? 'border-border-brand bg-background-muted text-text-brand'
              : 'border-border-base hover:bg-background-muted'
          }`}
        >
          Income
        </button>
      </div>
    </div>
  )
}