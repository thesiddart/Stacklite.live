import { useEffect } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { createClient } from '@/lib/supabase/client'
import { getSupabaseEnv } from '@/lib/supabase/env'
import {
  COOKIE_CONSENT_CHANGE_EVENT,
  COOKIE_CONSENT_POLICY_VERSION,
  readCookieConsent,
} from '@/lib/cookieConsent'

export function useAuth() {
  const { user, isLoading, setUser, setLoading } = useAuthStore()

  useEffect(() => {
    if (!getSupabaseEnv().isConfigured) {
      setUser(null)
      setLoading(false)
      return
    }

    const supabase = createClient()

    const persistConsentForUser = async (userId: string | undefined) => {
      if (!userId) return

      const consent = readCookieConsent()
      if (!consent) return

      await supabase
        .from('cookie_consents')
        .upsert(
          {
            user_id: userId,
            consent_status: consent,
            policy_version: COOKIE_CONSENT_POLICY_VERSION,
            source: 'banner',
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        )
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
      void persistConsentForUser(session?.user?.id)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
      void persistConsentForUser(session?.user?.id)
    })

    const handleConsentChanged = () => {
      void supabase.auth.getSession().then(({ data: { session } }) => {
        void persistConsentForUser(session?.user?.id)
      })
    }

    window.addEventListener(COOKIE_CONSENT_CHANGE_EVENT, handleConsentChanged)

    return () => {
      subscription.unsubscribe()
      window.removeEventListener(COOKIE_CONSENT_CHANGE_EVENT, handleConsentChanged)
    }
  }, [setUser, setLoading])

  return { user, isLoading }
}
