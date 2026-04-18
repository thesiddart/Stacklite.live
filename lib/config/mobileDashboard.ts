/**
 * Mobile dashboard layout (see docs/stacklite-mobile-implementation-plan.md).
 *
 * Kill switch: set NEXT_PUBLIC_MOBILE_DASHBOARD_V1=false to force the legacy
 * desktop dashboard at all viewport sizes (instant rollback without code revert).
 * Omit or set to "true" to allow mobile layout when the viewport is narrow.
 */
export function isMobileDashboardKillSwitchActive(): boolean {
  return process.env.NEXT_PUBLIC_MOBILE_DASHBOARD_V1 === 'false'
}
