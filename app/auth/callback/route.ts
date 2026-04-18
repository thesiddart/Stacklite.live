import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getSafePostAuthRedirectPath } from '@/lib/supabase/safeRedirectPath'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = getSafePostAuthRedirectPath(searchParams.get('next'))
  const migrate = searchParams.get('migrate')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const redirectUrl = new URL(next, origin)
      if (migrate === 'true') {
        redirectUrl.searchParams.set('migration', 'pending')
      }
      return NextResponse.redirect(redirectUrl)
    }
  }

  const failureUrl = new URL('/login', origin)
  failureUrl.searchParams.set('error', 'Could not authenticate user')
  return NextResponse.redirect(failureUrl)
}
