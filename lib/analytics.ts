import { hasAcceptedCookieConsent } from '@/lib/cookieConsent'

export type TrackEvent =
  | 'contract_created'
  | 'contract_saved'
  | 'contract_shared'
  | 'contract_downloaded'
  | 'invoice_created'
  | 'invoice_saved'
  | 'invoice_shared'
  | 'invoice_downloaded'
  | 'invoice_marked_paid'
  | 'client_added'
  | 'timer_started'
  | 'timer_stopped'
  | 'signup_completed'
  | 'guest_save_prompt_shown'
  | 'guest_converted_to_account'

declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: Record<string, string> }) => void
  }
}

export function track(event: TrackEvent, props?: Record<string, string>) {
  if (
    typeof window !== 'undefined' &&
    hasAcceptedCookieConsent() &&
    typeof window.plausible === 'function'
  ) {
    window.plausible(event, props ? { props } : undefined)
  }
}
