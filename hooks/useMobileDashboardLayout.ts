'use client'

import { isMobileDashboardKillSwitchActive } from '@/lib/config/mobileDashboard'
import { useMediaQuery } from '@/hooks/useMediaQuery'

/** Plan: &lt;768px = mobile layout; ≥768px = desktop canvas. */
const MOBILE_MEDIA_QUERY = '(max-width: 767px)'

export function useMobileDashboardLayout(): boolean {
  const killSwitch = isMobileDashboardKillSwitchActive()
  const isNarrow = useMediaQuery(MOBILE_MEDIA_QUERY)

  if (killSwitch) {
    return false
  }

  return isNarrow
}
