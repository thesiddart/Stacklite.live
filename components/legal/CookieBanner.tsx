'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { readCookieConsent, type ConsentValue, writeCookieConsent } from '@/lib/cookieConsent'

export function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!readCookieConsent()) setVisible(true)
  }, [])

  const setConsent = (value: ConsentValue) => {
    writeCookieConsent(value)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[300] md:right-auto md:w-[430px]">
      <div className="rounded-2xl border border-border-base bg-background-highlight p-4 shadow-lg">
        <div className="mb-3 flex items-start gap-3">
          <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-text-brand" aria-hidden="true" />
          <div className="space-y-1">
            <p className="text-sm font-semibold text-text-base">Privacy and session cookies</p>
            <p className="text-sm leading-relaxed text-text-muted">
              We only use a strictly necessary cookie to keep you signed in and your workspace session stable.
              {' '}
              <Link href="/privacy" className="text-text-brand underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-brand">
                Read Privacy Policy
              </Link>
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            onClick={() => setConsent('accepted')}
            className="w-full rounded-lg bg-button-primary px-4 py-2 text-sm font-medium text-button-primary-fg transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-brand sm:w-auto sm:flex-1"
            type="button"
            aria-label="Accept strictly necessary cookie"
          >
            Accept
          </button>
          <button
            onClick={() => setConsent('declined')}
            className="w-full rounded-lg border border-border-base bg-background-base px-4 py-2 text-sm font-medium text-text-base transition-colors hover:bg-background-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-brand sm:w-auto sm:flex-1"
            type="button"
            aria-label="Decline strictly necessary cookie"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  )
}
