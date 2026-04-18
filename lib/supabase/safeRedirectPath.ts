/**
 * Validates a post-auth redirect target (OAuth `next` query, login `redirectedFrom`).
 * Prevents open redirects and auth-loop paths.
 */
export function getSafePostAuthRedirectPath(path: string | null): string {
  if (!path) return '/dashboard'
  const trimmed = path.trim()
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) return '/dashboard'
  if (trimmed.startsWith('/auth/')) return '/dashboard'
  return trimmed
}
