/**
 * Single source of truth for workspace module identity and dashboard deep-links.
 * Use these helpers instead of scattering `?module=` strings across the codebase.
 */

/** Query param key for opening a module on `/dashboard` (must match links and parsing). */
export const WORKSPACE_MODULE_QUERY_PARAM = 'module' as const

/** Canonical module ids accepted in the URL and marketing copy. */
export const WORKSPACE_MODULE_IDS = ['contract', 'invoice', 'time', 'clients', 'income'] as const

export type WorkspaceModuleId = (typeof WORKSPACE_MODULE_IDS)[number]

export type ParsedWorkspaceModule = WorkspaceModuleId | 'invalid' | null

export function isWorkspaceModuleId(value: string): value is WorkspaceModuleId {
  return (WORKSPACE_MODULE_IDS as readonly string[]).includes(value)
}

/**
 * Parse `searchParams.get('module')` (or equivalent) into a canonical id, invalid, or absent.
 */
export function parseWorkspaceModuleQueryParam(
  raw: string | null | undefined
): ParsedWorkspaceModule {
  if (!raw?.trim()) {
    return null
  }

  const key = raw.trim().toLowerCase()
  if (isWorkspaceModuleId(key)) {
    return key
  }

  return 'invalid'
}

/**
 * Initial center dock tab when landing with `?module=` (clients/time use side areas, not center dock).
 */
export function getInitialDockTabForModuleQuery(
  parsed: ParsedWorkspaceModule
): 'contract' | 'invoice' | 'income' | null {
  if (parsed === null || parsed === 'invalid') {
    return 'contract'
  }

  if (parsed === 'contract') {
    return 'contract'
  }

  if (parsed === 'invoice') {
    return 'invoice'
  }

  if (parsed === 'income') {
    return 'income'
  }

  if (parsed === 'clients' || parsed === 'time') {
    return null
  }

  return 'contract'
}

export function buildDashboardUrlWithModule(moduleId: WorkspaceModuleId): string {
  const params = new URLSearchParams()
  params.set(WORKSPACE_MODULE_QUERY_PARAM, moduleId)
  return `/dashboard?${params.toString()}`
}

/** Landing page module cards — copy + ids only; layout lives in `app/page.tsx`. */
export type LandingModuleCard = {
  id: WorkspaceModuleId
  name: string
  description: string
}

/** Map URL `?module=` id to mobile bottom-nav tab (Time → null: use floating timer). */
export type MobileDashboardTabId = 'contracts' | 'invoices' | 'clients' | 'income'

export function workspaceModuleToMobileTab(
  parsed: ParsedWorkspaceModule
): MobileDashboardTabId | null {
  if (parsed === null || parsed === 'invalid' || parsed === 'time') {
    return null
  }

  if (parsed === 'contract') {
    return 'contracts'
  }

  if (parsed === 'invoice') {
    return 'invoices'
  }

  if (parsed === 'clients') {
    return 'clients'
  }

  if (parsed === 'income') {
    return 'income'
  }

  return null
}

export const LANDING_WORKSPACE_MODULE_CARDS: readonly LandingModuleCard[] = [
  {
    id: 'contract',
    name: 'Contract Generator',
    description:
      'Create professional freelance contracts in minutes with share-ready templates.',
  },
  {
    id: 'invoice',
    name: 'Invoice Generator',
    description:
      'Generate and send freelance invoices with line items, tax, discounts, and PDF export.',
  },
  {
    id: 'time',
    name: 'Time Tracker',
    description:
      'Simple freelance time tracking: log hours by client and roll them into invoices.',
  },
  {
    id: 'clients',
    name: 'Client Manager',
    description: 'Freelance client management: store details once and auto-fill across modules.',
  },
  {
    id: 'income',
    name: 'Income Tracker',
    description: 'Monthly earnings, outstanding totals, and trend visibility.',
  },
] as const
