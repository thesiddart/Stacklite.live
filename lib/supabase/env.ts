const SUPABASE_ENV_ERROR_MESSAGE =
  'Supabase environment variables are not configured.\n\n' +
  'Please follow the setup guide:\n' +
  '1. Read SUPABASE_SETUP.md\n' +
  '2. Create a Supabase project at https://supabase.com\n' +
  '3. Update your deployment environment with the Supabase project credentials\n' +
  '4. Redeploy the application'

function hasPlaceholderValue(value: string, placeholders: string[]) {
  return placeholders.some((placeholder) => value.includes(placeholder))
}

export function getSupabaseEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()

  const isConfigured = Boolean(
    supabaseUrl &&
      supabaseAnonKey &&
      !hasPlaceholderValue(supabaseUrl, ['your-project-id', 'your-project-url', 'your-project']) &&
      !hasPlaceholderValue(supabaseAnonKey, ['your-anon-key'])
  )

  return {
    supabaseUrl,
    supabaseAnonKey,
    isConfigured,
  }
}

export function assertSupabaseEnv() {
  const { supabaseUrl, supabaseAnonKey, isConfigured } = getSupabaseEnv()

  if (!isConfigured || !supabaseUrl || !supabaseAnonKey) {
    throw new Error(SUPABASE_ENV_ERROR_MESSAGE)
  }

  return {
    supabaseUrl,
    supabaseAnonKey,
  }
}

export { SUPABASE_ENV_ERROR_MESSAGE }
