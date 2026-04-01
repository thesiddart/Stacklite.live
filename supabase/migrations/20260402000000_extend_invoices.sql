-- Invoice Generator: Extend invoices table for full module
-- Migration: 20260402000000_extend_invoices.sql

-- =====================================================
-- ADD NEW COLUMNS
-- =====================================================

ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS contract_id uuid REFERENCES public.contracts(id) ON DELETE SET NULL;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS line_items jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS discount_type text;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS discount_value numeric(12,2);
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS payment_method text;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS payment_instructions text;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS notes_to_client text;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS internal_notes text;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS share_token uuid DEFAULT gen_random_uuid() UNIQUE;

-- =====================================================
-- UPDATE STATUS CONSTRAINT
-- =====================================================
-- Remove old constraint and add new one
-- 'overdue' is computed at render time — never stored

ALTER TABLE public.invoices DROP CONSTRAINT IF EXISTS invoices_status_check;
ALTER TABLE public.invoices ADD CONSTRAINT invoices_status_check
  CHECK (status IN ('draft', 'unpaid', 'paid', 'archived'));

-- =====================================================
-- PUBLIC SHARE RLS POLICY
-- =====================================================
-- Allow anyone to read non-draft invoices via share_token

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'invoices' AND policyname = 'public_view_invoice_by_token'
  ) THEN
    CREATE POLICY "public_view_invoice_by_token"
      ON public.invoices
      FOR SELECT
      USING (share_token IS NOT NULL AND status != 'draft');
  END IF;
END
$$;

-- =====================================================
-- INDEXES FOR NEW COLUMNS
-- =====================================================

CREATE INDEX IF NOT EXISTS invoices_share_token_idx ON public.invoices(share_token);
CREATE INDEX IF NOT EXISTS invoices_contract_id_idx ON public.invoices(contract_id);
