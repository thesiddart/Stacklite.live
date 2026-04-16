'use client'

import { readCookieConsent } from '@/lib/cookieConsent'

export function useCookieConsent() {
  if (typeof window === 'undefined') {
    return {
      hasConsented: false,
      hasDeclined: false,
      isPending: true,
    }
  }

  const consent = readCookieConsent()

  return {
    hasConsented: consent === 'accepted',
    hasDeclined: consent === 'declined',
    isPending: !consent,
  }
}
