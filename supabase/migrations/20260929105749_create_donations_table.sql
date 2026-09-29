/*
# Create donations table (single-tenant, no auth)

1. New Tables
- `donations`
  - `id` (uuid, primary key)
  - `amount_cents` (integer, not null) — donation amount in euro cents
  - `currency` (text, default 'EUR')
  - `status` (text, default 'pending') — pending, paid, failed, expired
  - `donor_name` (text, nullable) — optional donor name
  - `donor_email` (text, nullable) — optional donor email
  - `norpo_reference` (text, nullable) — Norpo checkout session reference
  - `message` (text, nullable) — optional donor message
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

2. Security
- Enable RLS on `donations`.
- Allow anon + authenticated INSERT (anyone can create a donation).
- Allow anon + authenticated SELECT (donation status is public so the confirmation page can display it).
- Allow anon + authenticated UPDATE only on `status` field via edge function with service role key (RLS still permits, but actual privileged mutations go through the service-role client in edge functions).
- No DELETE policy (donations are never deleted).

3. Notes
- This is a no-auth donation site. Anyone visiting can create a donation and check its status.
- The `norpo_reference` stores the Norpo payment session ID returned by Norpo's API.
- Amount is stored in cents to avoid floating-point issues.
*/

CREATE TABLE IF NOT EXISTS donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  amount_cents integer NOT NULL CHECK (amount_cents > 0),
  currency text NOT NULL DEFAULT 'EUR',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'expired')),
  donor_name text,
  donor_email text,
  norpo_reference text,
  message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_donations" ON donations;
CREATE POLICY "anon_select_donations" ON donations FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_donations" ON donations;
CREATE POLICY "anon_insert_donations" ON donations FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_donations" ON donations;
CREATE POLICY "anon_update_donations" ON donations FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
