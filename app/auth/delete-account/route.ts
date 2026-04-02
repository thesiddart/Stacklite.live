import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { assertSupabaseEnv } from '@/lib/supabase/env'

export async function POST() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { supabaseUrl } = assertSupabaseEnv()
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()

    if (!serviceRoleKey) {
      return NextResponse.json(
        { error: 'Server is not configured for account deletion.' },
        { status: 500 }
      )
    }

    const admin = createAdminClient(supabaseUrl, serviceRoleKey)
    const { error: deleteError } = await admin.auth.admin.deleteUser(user.id)

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    await supabase.auth.signOut()

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete account'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
