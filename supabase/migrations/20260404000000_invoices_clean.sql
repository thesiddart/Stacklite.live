-- Canonical invoices schema.

-- Remove legacy invoice tables and dependent objects before recreating schema.
DROP TABLE IF EXISTS invoice_items CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;

CREATE TABLE invoices (

  -- Identity
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id       uuid        REFERENCES clients(id) ON DELETE SET NULL,
  contract_id     uuid        REFERENCES contracts(id) ON DELETE SET NULL,

  -- Header
  invoice_number  text        NOT NULL,
  issue_date      date        NOT NULL,
  due_date        date        NOT NULL,

  -- Line items
  -- Single source of truth. No invoice_items table.
  -- Shape: [{ id: uuid, description: text, qty: number, rate: number, amount: number }]
  line_items      jsonb       NOT NULL DEFAULT '[]',

  -- Amounts
  subtotal        numeric(10,2) NOT NULL DEFAULT 0,
  tax_rate        numeric(5,2),
  tax_amount      numeric(10,2) NOT NULL DEFAULT 0,
  discount_type   text        CHECK (discount_type IN ('flat', 'percent')),
  discount_value  numeric(10,2),
  total           numeric(10,2) NOT NULL DEFAULT 0,

  -- Payment
  currency        text        NOT NULL DEFAULT 'USD',
  payment_method  text,
  payment_instructions text,

  -- Notes
  notes_to_client text,
  internal_notes  text,

  -- Status
  status          text        NOT NULL DEFAULT 'unpaid'
                  CHECK (status IN ('unpaid', 'paid', 'archived')),
  paid_at         timestamptz,

  -- Sharing
  share_token     uuid        UNIQUE DEFAULT gen_random_uuid(),

  -- Timestamps
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX invoices_user_id_idx     ON invoices (user_id);
CREATE INDEX invoices_client_id_idx   ON invoices (client_id);
CREATE INDEX invoices_contract_id_idx ON invoices (contract_id);
CREATE INDEX invoices_status_idx      ON invoices (status);
CREATE INDEX invoices_share_token_idx ON invoices (share_token);
CREATE INDEX invoices_created_at_idx  ON invoices (created_at DESC);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_invoices"
  ON invoices
  FOR ALL
  USING     (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "public_view_invoice_by_token"
  ON invoices
  FOR SELECT
  USING (
    share_token IS NOT NULL
    AND status IN ('unpaid', 'paid')
  );