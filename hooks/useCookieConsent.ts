'use client'

export function useCookieConsent() {
  if (typeof window === 'undefined') {
    return {
      hasConsented: false,
      hasDeclined: false,
      isPending: true,
    }
  }

  const consent = window.localStorage.getItem('stacklite-cookie-consent')

  return {
    hasConsented: consent === 'accepted',
    hasDeclined: consent === 'declined',
    isPending: !consent,
  }
}
