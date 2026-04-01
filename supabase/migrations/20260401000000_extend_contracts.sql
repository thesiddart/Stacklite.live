-- Contract Generator: Extend contracts table for full module
-- Migration: 20260401000000_extend_contracts.sql

-- =====================================================
-- ADD NEW COLUMNS
-- =====================================================

ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS template_type text;
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS project_name text;
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS scope text;
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS exclusions text;
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS milestones jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS total_fee numeric(12,2);
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS payment_structure text;
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS payment_method text;
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS clauses jsonb DEFAULT '{}'::jsonb;
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS share_token uuid DEFAULT gen_random_uuid() UNIQUE;

-- =====================================================
-- CONVERT DELIVERABLES FROM TEXT TO JSONB
-- =====================================================

ALTER TABLE public.contracts
  ALTER COLUMN deliverables TYPE jsonb
  USING CASE
    WHEN deliverables IS NULL THEN '[]'::jsonb
    ELSE jsonb_build_array(jsonb_build_object('text', deliverables))
  END;

ALTER TABLE public.contracts
  ALTER COLUMN deliverables SET DEFAULT '[]'::jsonb;

-- =====================================================
-- UPDATE STATUS CONSTRAINT
-- =====================================================

ALTER TABLE public.contracts DROP CONSTRAINT IF EXISTS contracts_status_check;
ALTER TABLE public.contracts ADD CONSTRAINT contracts_status_check
  CHECK (status IN ('draft', 'sent', 'signed', 'archived'));

-- =====================================================
-- PUBLIC SHARE RLS POLICY
-- =====================================================
-- Allow anyone to read non-draft contracts via share_token
-- (the app queries by share_token, RLS permits the SELECT)

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'contracts' AND policyname = 'public_can_view_by_token'
  ) THEN
    CREATE POLICY "public_can_view_by_token"
      ON public.contracts
      FOR SELECT
      USING (share_token IS NOT NULL AND status != 'draft');
  END IF;
END
$$;

-- =====================================================
-- INDEXES FOR NEW COLUMNS
-- =====================================================

CREATE INDEX IF NOT EXISTS contracts_share_token_idx ON public.contracts(share_token);
CREATE INDEX IF NOT EXISTS contracts_template_type_idx ON public.contracts(template_type);
