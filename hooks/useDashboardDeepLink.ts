'use client'

import { useEffect, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  getInitialDockTabForModuleQuery,
  parseWorkspaceModuleQueryParam,
  WORKSPACE_MODULE_QUERY_PARAM,
  type ParsedWorkspaceModule,
} from '@/lib/navigation/workspaceModules'

type UseDashboardDeepLinkOptions = {
  contractsCount: number
  setContractView: (view: 'templates' | 'list' | 'editor') => void
  setInvoiceView: (view: 'list' | 'editor') => void
}

type UseDashboardDeepLinkResult = {
  incomingModule: ParsedWorkspaceModule
  initialDockTab: 'contract' | 'invoice' | 'income' | null
}

/**
 * Owns dashboard module deep-link parsing (`?module=`) and normalization.
 * Keeps query/route concerns out of the dashboard layout component.
 */
export function useDashboardDeepLink({
  contractsCount,
  setContractView,
  setInvoiceView,
}: UseDashboardDeepLinkOptions): UseDashboardDeepLinkResult {
  const searchParams = useSearchParams()
  const router = useRouter()

  const incomingModule = useMemo<ParsedWorkspaceModule>(
    () => parseWorkspaceModuleQueryParam(searchParams.get(WORKSPACE_MODULE_QUERY_PARAM)),
    [searchParams]
  )

  const initialDockTab = useMemo(
    () => getInitialDockTabForModuleQuery(incomingModule),
    [incomingModule]
  )

  useEffect(() => {
    if (!incomingModule) {
      return
    }

    if (incomingModule === 'invalid') {
      router.replace('/dashboard', { scroll: false })
      return
    }

    if (incomingModule === 'contract') {
      setContractView(contractsCount > 0 ? 'list' : 'templates')
    } else if (incomingModule === 'invoice') {
      setInvoiceView('list')
    }

    router.replace('/dashboard', { scroll: false })
  }, [incomingModule, router, contractsCount, setContractView, setInvoiceView])

  return {
    incomingModule,
    initialDockTab,
  }
}
