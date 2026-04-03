-- Ensure share tokens are always present for contracts and invoices.
-- Backfills historical rows that were created before share_token defaults were added.

ALTER TABLE public.contracts
  ALTER COLUMN share_token SET DEFAULT gen_random_uuid();

UPDATE public.contracts
SET share_token = gen_random_uuid()
WHERE share_token IS NULL;

DO $$
BEGIN
  IF to_regclass('public.invoices') IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'invoices'
        AND column_name = 'share_token'
    ) THEN
    ALTER TABLE public.invoices
      ALTER COLUMN share_token SET DEFAULT gen_random_uuid();

    UPDATE public.invoices
    SET share_token = gen_random_uuid()
    WHERE share_token IS NULL;
  END IF;
END
$$;
