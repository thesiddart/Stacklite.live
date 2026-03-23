import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-project-id') || supabaseAnonKey.includes('your-anon-key')) {
    throw new Error(
      '❌ Supabase environment variables are not configured.\n\n' +
      'Please follow the setup guide:\n' +
      '1. Read SUPABASE_SETUP.md\n' +
      '2. Create a Supabase project at https://supabase.com\n' +
      '3. Update .env.local with your project credentials\n' +
      '4. Restart the dev server'
    )
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
