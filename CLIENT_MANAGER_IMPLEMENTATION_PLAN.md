# Client Manager Implementation Plan

## Objective
Implement a production-ready Client Manager with extended client details, modal-based create/edit UX, and delete support, while preserving security and data isolation via Supabase RLS.

## Scope
- Create client from plus icon in Client Manager
- Edit existing client details
- Delete client with confirmation
- Extended client profile fields
- React Query cache update and UI refresh

## Decisions Locked
- Field scope: Extended client details
- Create UX: Modal
- Phase scope: Create + Edit + Delete (full CRUD)

## Phase 1: Database and Migration
1. Create a new migration that extends `clients` table with fields:
- `contact_person_first_name` (text)
- `contact_person_last_name` (text)
- `company_type` (text/enum-like validation)
- `tax_id` (text)
- `website` (text)
- `industry` (text)
- `preferred_contact_method` (text/enum-like validation)
- `payment_currency` (text, default `USD`)
- `payment_terms` (text)
- `country` (text)
- `state_province` (text)
- `postal_code` (text)
- `is_active` (boolean, default `true`)
- `tags` (text[])
- `metadata` (jsonb)
- `last_contacted_at` (timestamptz)

2. Keep RLS policies unchanged:
- `auth.uid() = user_id`

3. Add indexes only where useful for filtering/search:
- Optional: `is_active`, `company_type`

## Phase 2: Type and Validation Alignment
1. Update database-aligned types in `lib/types/database.ts`.
2. Align domain types in `lib/types/domain.ts` with DB naming conventions.
3. Standardize client schema usage in `lib/validations/client.ts`.
4. Remove/stop using duplicate client schema definitions in `lib/validations/schemas.ts`.

## Phase 3: API and Hook Layer
1. Extend `lib/api/clients.ts` for full CRUD payload support with new fields.
2. Update `hooks/useClients.ts`:
- create mutation
- update mutation
- delete mutation
- stable query invalidation and optimistic UX
3. Keep robust error propagation for form-level error display.

## Phase 4: UI Form and Modal UX
1. Expand `components/modules/ClientManager/ClientForm.tsx` with grouped sections:
- Identity
- Company
- Contact
- Billing and Preferences
- Notes and Metadata

2. Keep modal pattern:
- Plus button opens create modal
- Edit opens in same form component with mode switch

3. Validation behavior:
- Field-level errors
- Submit-level error summary

## Phase 5: List and Detail Integration
1. Update `components/modules/ClientManager/ClientManager.tsx`:
- Ensure plus icon always opens create modal
- Wire mutation states and list refresh behavior

2. Update `components/modules/ClientManager/ClientItem.tsx`:
- Edit and delete actions

3. Update `components/modules/ClientManager/ClientDetail.tsx`:
- Show key extended profile fields clearly

4. Keep search useful and lightweight:
- name, company, email, phone, industry

## Phase 6: Delete Flow and Safety
1. Add delete confirmation modal/dialog.
2. On confirm:
- trigger delete mutation
- handle optimistic remove/rollback
3. Preserve clear failure feedback.

## Phase 7: QA and Security Validation
1. Run TypeScript and lint checks.
2. Verify create/edit/delete lifecycle manually.
3. Verify cache refresh and UI consistency after mutations.
4. Validate RLS isolation with two different user accounts.

## Files to Update
- `supabase/migrations/*new_migration*.sql`
- `lib/types/database.ts`
- `lib/types/domain.ts`
- `lib/validations/client.ts`
- `lib/validations/schemas.ts`
- `lib/api/clients.ts`
- `hooks/useClients.ts`
- `components/modules/ClientManager/ClientForm.tsx`
- `components/modules/ClientManager/ClientManager.tsx`
- `components/modules/ClientManager/ClientItem.tsx`
- `components/modules/ClientManager/ClientDetail.tsx`
- `stores/clientStore.ts`

## Acceptance Criteria
- Plus icon creates a new client through modal flow
- All extended client fields are validated and persisted
- Edit and delete actions are functional and safe
- No cross-user data access under RLS
- No TypeScript or lint errors in touched files

## Out of Scope (For Now)
- Contracts, invoices, time tracker, and income module enhancements
- Advanced tagging UI and metadata editor UX polish
- Bulk import/export
