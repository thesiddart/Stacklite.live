export const COOKIE_CONSENT_KEY = 'stacklite-cookie-consent'
export const COOKIE_CONSENT_CHANGE_EVENT = 'stacklite:cookie-consent-changed'
export const COOKIE_CONSENT_POLICY_VERSION = '2026-04-06'

export type ConsentValue = 'accepted' | 'declined'

function parseConsentValue(value: string | null): ConsentValue | null {
  if (value === 'accepted' || value === 'declined') return value
  return null
}

function readCookieValue(name: string): string | null {
  if (typeof document === 'undefined') return null
  const parts = document.cookie.split('; ')
  const target = parts.find((part) => part.startsWith(`${name}=`))
  return target ? decodeURIComponent(target.slice(name.length + 1)) : null
}

export function readCookieConsent(): ConsentValue | null {
  if (typeof window === 'undefined') return null

  try {
    const localValue = parseConsentValue(window.localStorage.getItem(COOKIE_CONSENT_KEY))
    if (localValue) return localValue
  } catch {
    // Ignore storage read failures; fallback to cookie below.
  }

  try {
    return parseConsentValue(readCookieValue(COOKIE_CONSENT_KEY))
  } catch {
    return null
  }
}

export function writeCookieConsent(value: ConsentValue): void {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(COOKIE_CONSENT_KEY, value)
  } catch {
    // Ignore storage failures and continue with cookie fallback.
  }

  try {
    document.cookie = `${COOKIE_CONSENT_KEY}=${encodeURIComponent(value)}; path=/; max-age=31536000; SameSite=Lax`
  } catch {
    // Ignore cookie write failures to avoid blocking the UI.
  }

  try {
    window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_CHANGE_EVENT, { detail: value }))
  } catch {
    // Ignore event dispatch failures.
  }
}

export function hasAcceptedCookieConsent(): boolean {
  return readCookieConsent() === 'accepted'
}
