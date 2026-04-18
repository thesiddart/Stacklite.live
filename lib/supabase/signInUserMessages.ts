/**
 * Maps Supabase / GoTrue auth errors to clear, user-facing copy.
 * Email/password sign-in intentionally uses one server message for both
 * "wrong password" and "no account" — we replace it with guidance that covers
 * both cases without revealing whether the email exists.
 */
export function getEmailPasswordSignInUserMessage(error: unknown): string | null {
  if (!error || typeof error !== 'object') {
    return null
  }

  const record = error as { message?: string; code?: string }
  const message = record.message ?? ''
  const code = record.code ?? ''

  if (code === 'invalid_credentials' || /invalid login credentials/i.test(message)) {
    return 'We could not sign you in with that email and password. Check for typos, use Forgot your password if you have an account, or create an account if you have not registered yet.'
  }

  if (code === 'over_request_rate_limit' || /too many requests/i.test(message)) {
    return 'Too many sign-in attempts. Please wait a few minutes and try again.'
  }

  if (/email\s+not\s+confirmed/i.test(message)) {
    return null
  }

  return null
}
