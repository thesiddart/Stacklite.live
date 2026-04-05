'use client'

import { useEffect, useState } from 'react'

const CONSENT_KEY = 'stacklite-cookie-consent'

type ConsentValue = 'accepted' | 'declined'

function readConsent(): ConsentValue | null {
  if (typeof window === 'undefined') return null
  const value = window.localStorage.getItem(CONSENT_KEY)
  if (value === 'accepted' || value === 'declined') return value
  return null
}

export function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!readConsent()) {
      setVisible(true)
    }
  }, [])

  const setConsent = (value: ConsentValue) => {
    window.localStorage.setItem(CONSENT_KEY, value)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 rounded-xl border border-border-base bg-background-highlight p-4 shadow-lg md:right-auto md:w-[360px]">
      <p className="mb-4 text-sm leading-relaxed text-text-base">
        We use a strictly necessary cookie to keep you signed in. No advertising cookies.
        {' '}
        <a href="/privacy" className="text-text-brand hover:underline">
          Privacy Policy
        </a>
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => setConsent('accepted')}
          className="flex-1 rounded-lg bg-button-primary px-4 py-2 text-sm font-medium text-button-primaryFg"
          type="button"
        >
          Accept
        </button>
        <button
          onClick={() => setConsent('declined')}
          className="flex-1 rounded-lg border border-border-base px-4 py-2 text-sm text-text-muted"
          type="button"
        >
          Decline
        </button>
      </div>
    </div>
  )
}
