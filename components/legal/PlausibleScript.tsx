'use client'

import { useEffect, useState } from 'react'
import Script from 'next/script'
import {
  COOKIE_CONSENT_CHANGE_EVENT,
  hasAcceptedCookieConsent,
} from '@/lib/cookieConsent'

export function PlausibleScript() {
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    const refresh = () => {
      setEnabled(hasAcceptedCookieConsent())
    }

    refresh()
    window.addEventListener(COOKIE_CONSENT_CHANGE_EVENT, refresh)
    window.addEventListener('storage', refresh)

    return () => {
      window.removeEventListener(COOKIE_CONSENT_CHANGE_EVENT, refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [])

  if (!enabled) return null

  return (
    <Script
      defer
      data-domain="stacklite.live"
      src="https://plausible.io/js/script.js"
      strategy="afterInteractive"
    />
  )
}
