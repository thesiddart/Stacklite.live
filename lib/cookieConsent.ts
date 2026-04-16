export const COOKIE_CONSENT_KEY = 'stacklite-cookie-consent'
export const COOKIE_CONSENT_CHANGE_EVENT = 'stacklite:cookie-consent-changed'
export const COOKIE_CONSENT_POLICY_VERSION = '2026-04-06'

export type ConsentValue = 'accepted' | 'declined'

export function readCookieConsent(): ConsentValue | null {
  if (typeof window === 'undefined') return null

  try {
    const value = window.localStorage.getItem(COOKIE_CONSENT_KEY)
    if (value === 'accepted' || value === 'declined') return value
    return null
  } catch {
    return null
  }
}

export function writeCookieConsent(value: ConsentValue): void {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(COOKIE_CONSENT_KEY, value)
    window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_CHANGE_EVENT, { detail: value }))
  } catch {
    // Swallow storage errors to avoid blocking the UI.
  }
}

export function hasAcceptedCookieConsent(): boolean {
  return readCookieConsent() === 'accepted'
}
