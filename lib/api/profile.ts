import { createClient as createSupabaseClient } from '@/lib/supabase/client'
import type { Profile, ProfileUpdate } from '@/lib/types/database'

function toProfileApiError(action: string, message: string): Error {
  if (message.includes("Could not find the table 'public.profiles' in the schema cache")) {
    return new Error(
      "Database is not initialized: 'public.profiles' table is missing. Apply Supabase migrations to your active project and refresh."
    )
  }

  return new Error(`Failed to ${action}: ${message}`)
}

async function ensureAuthenticatedProfile() {
  const supabase = createSupabaseClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error('User not authenticated')
  }

  if (!user.email) {
    throw new Error('Authenticated user email is missing')
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .upsert(
      {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? null,
      },
      { onConflict: 'id' }
    )

  if (profileError) {
    throw toProfileApiError('ensure profile', profileError.message)
  }

  return { supabase, user }
}

export async function getProfile(): Promise<Profile> {
  const { supabase, user } = await ensureAuthenticatedProfile()

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) {
    throw toProfileApiError('fetch profile', error.message)
  }

  return data as Profile
}

export async function updateProfile(formData: ProfileUpdate): Promise<Profile> {
  const { supabase, user } = await ensureAuthenticatedProfile()

  const updateData: ProfileUpdate = {
    ...formData,
    id: user.id,
    email: user.email ?? formData.email,
  }

  const { data, error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', user.id)
    .select()
    .single()

  if (error) {
    throw toProfileApiError('update profile', error.message)
  }

  return data as Profile
}
