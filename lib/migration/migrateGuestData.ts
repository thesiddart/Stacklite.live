/**
 * Guest Data Migration
 * Migrates all localStorage guest data to Supabase on sign-up.
 * 
 * CRITICAL RULES:
 * - Never clear guestStore unless ALL inserts succeed
 * - Build a client ID map since guest IDs are nanoid, Supabase uses UUIDs
 * - Runs client-side (guestStore is in localStorage, not accessible server-side)
 */

import { createClient } from '@/lib/supabase/client'
import { useGuestStore } from '@/stores/guestStore'
import { useSessionStore } from '@/stores/sessionStore'
import { track } from '@/lib/analytics'

export async function migrateGuestData(userId: string): Promise<void> {
  const supabase = createClient()
  const guest = useGuestStore.getState()

  try {
    // Build a client ID map (guest nanoid → new Supabase UUID)
    const clientIdMap = new Map<string, string>()

    // 1. Migrate clients first (contracts & time entries reference them)
    if (guest.clients.length > 0) {
      const { data: insertedClients, error } = await supabase
        .from('clients')
        .insert(
          guest.clients.map((c) => ({
            user_id: userId,
            name: c.name,
            email: c.email,
            phone: c.phone,
            company_name: c.company_name,
            address: c.address,
            notes: c.notes,
            tags: c.tags,
            is_active: c.is_active,
          }))
        )
        .select('id')

      if (error) throw new Error(`Client migration failed: ${error.message}`)

      // Map old guest IDs to new Supabase IDs
      guest.clients.forEach((c, i) => {
        if (insertedClients?.[i]) {
          clientIdMap.set(c.id, insertedClients[i].id)
        }
      })
    }

    // 2. Migrate contracts
    if (guest.contracts.length > 0) {
      const { error } = await supabase
        .from('contracts')
        .insert(
          guest.contracts.map((c) => ({
            user_id: userId,
            client_id: c.client_id ? clientIdMap.get(c.client_id) || null : null,
            template_type: c.template_type,
            project_name: c.project_name,
            scope: c.scope,
            deliverables: c.deliverables,
            exclusions: c.exclusions,
            start_date: c.start_date,
            end_date: c.end_date,
            milestones: c.milestones,
            total_fee: c.total_fee,
            currency: c.currency,
            payment_structure: c.payment_structure,
            payment_method: c.payment_method,
            clauses: c.clauses,
            status: c.status,
          }))
        )

      if (error) throw new Error(`Contract migration failed: ${error.message}`)
    }

    // 3. Migrate time entries
    if (guest.timeEntries.length > 0) {
      const { error } = await supabase
        .from('time_logs')
        .insert(
          guest.timeEntries.map((e) => ({
            user_id: userId,
            client_id: e.client_id ? clientIdMap.get(e.client_id) || null : null,
            task_name: e.task_name,
            notes: e.notes,
            start_time: e.start_time,
            end_time: e.end_time,
            duration_seconds: e.duration_seconds,
            is_running: false, // Stop any running timers
          }))
        )

      if (error) throw new Error(`Time entry migration failed: ${error.message}`)
    }

    // 4. All done — clear guest data and exit guest mode
    guest.clearAll()
    useSessionStore.getState().setGuest(false)
    track('guest_converted_to_account')

    // Remove guest cookie
    document.cookie = 'stacklite-guest=; path=/; max-age=0; SameSite=Lax'

  } catch (err) {
    // Migration failed — do NOT clear guest data
    // User's work is preserved in localStorage
    console.error('Guest migration error:', err)
    throw err
  }
}
