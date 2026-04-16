-- Persist analytics cookie consent decisions per authenticated user.

CREATE TABLE IF NOT EXISTS cookie_consents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_status text NOT NULL CHECK (consent_status IN ('accepted', 'declined')),
  policy_version text NOT NULL DEFAULT '2026-04-06',
  source text NOT NULL DEFAULT 'banner',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS cookie_consents_user_id_idx ON cookie_consents (user_id);

ALTER TABLE cookie_consents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_own_cookie_consents" ON cookie_consents;
CREATE POLICY "users_own_cookie_consents"
  ON cookie_consents
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
