export const COOKIE_CONSENT_KEY = 'stacklite-cookie-consent'
/** Same-tab session mirror; survives reload in this tab when localStorage/cookie lag or fail. */
export const COOKIE_CONSENT_SESSION_KEY = 'stacklite-cookie-consent-tab'
export const COOKIE_CONSENT_CHANGE_EVENT = 'stacklite:cookie-consent-changed'
export const COOKIE_CONSENT_POLICY_VERSION = '2026-04-06'

export type ConsentValue = 'accepted' | 'declined'

function parseConsentValue(value: string | null): ConsentValue | null {
  if (value === 'accepted' || value === 'declined') return value
  return null
}

function readCookieValue(name: string): string | null {
  if (typeof document === 'undefined') return null
  // Browsers may serialize document.cookie with `;` only (no space). Splitting on `'; '` misses pairs.
  const parts = document.cookie.split(';').map((p) => p.trim())
  const target = parts.find((part) => part.startsWith(`${name}=`))
  return target ? decodeURIComponent(target.slice(name.length + 1)) : null
}

export function readCookieConsent(): ConsentValue | null {
  if (typeof window === 'undefined') return null

  try {
    const sessionRaw = window.sessionStorage.getItem(COOKIE_CONSENT_SESSION_KEY)
    const sessionValue = parseConsentValue(sessionRaw?.trim() ?? null)
    if (sessionValue) return sessionValue
  } catch {
    // sessionStorage can be unavailable; continue.
  }

  try {
    const raw = window.localStorage.getItem(COOKIE_CONSENT_KEY)
    const localValue = parseConsentValue(raw?.trim() ?? null)
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
    window.sessionStorage.setItem(COOKIE_CONSENT_SESSION_KEY, value)
  } catch {
    // Ignore; localStorage/cookie still persist cross-session.
  }

  try {
    window.localStorage.setItem(COOKIE_CONSENT_KEY, value)
  } catch {
    // Ignore storage failures and continue with cookie fallback.
  }

  try {
    const secure =
      typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; Secure' : ''
    document.cookie = `${COOKIE_CONSENT_KEY}=${encodeURIComponent(value)}; path=/; max-age=31536000; SameSite=Lax${secure}`
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
