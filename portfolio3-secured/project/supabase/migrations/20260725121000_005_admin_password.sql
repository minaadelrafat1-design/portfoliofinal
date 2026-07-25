/*
# Admin password moved server-side

Previously the admin password lived in the VITE_ADMIN_PASSWORD env var and
was compared in the browser — meaning it shipped in plaintext inside the
built JS bundle for anyone to read. This migration moves the password behind
a hashed column in the database, verified only through SECURITY DEFINER
Postgres functions. The plaintext password never reaches the client, and the
`admin_auth` table itself has no SELECT/INSERT/UPDATE/DELETE policies for
anon/authenticated, so it cannot be read or written directly with the anon
key — only through the two RPC functions below.

1. New Table
   - `admin_auth` (singleton row): password_hash (bcrypt via pgcrypto),
     failed_attempts, locked_until, updated_at.

2. Functions (SECURITY DEFINER, callable by anon via RPC)
   - `verify_admin_password(p_password text) returns boolean`
     Checks the password against the stored hash. Tracks failed attempts and
     applies a temporary lockout after repeated failures (server-side, so it
     can't be bypassed by calling the RPC directly instead of going through
     the UI).
   - `change_admin_password(p_current text, p_new text) returns boolean`
     Requires the current password to match before setting a new one.
     Requires the new password to be at least 8 characters.

3. IMPORTANT — seed password
   This migration seeds a temporary password: `ChangeMe-Now-2026`
   Log in with it once, then use the admin dashboard's Settings page to set
   your real password immediately. Do not leave the seed password in place.
*/

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS admin_auth (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  password_hash text NOT NULL,
  failed_attempts int NOT NULL DEFAULT 0,
  locked_until timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE admin_auth ENABLE ROW LEVEL SECURITY;
-- Intentionally NO policies: anon/authenticated cannot SELECT/INSERT/UPDATE/
-- DELETE this table directly. All access happens through the SECURITY
-- DEFINER functions below, which run as the table owner and bypass RLS.

-- Seed the singleton row only if it doesn't exist yet.
INSERT INTO admin_auth (password_hash)
SELECT crypt('ChangeMe-Now-2026', gen_salt('bf'))
WHERE NOT EXISTS (SELECT 1 FROM admin_auth);

-- =========================================================
-- verify_admin_password
-- =========================================================
CREATE OR REPLACE FUNCTION verify_admin_password(p_password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rec admin_auth%ROWTYPE;
  ok boolean;
BEGIN
  SELECT * INTO rec FROM admin_auth LIMIT 1;
  IF rec IS NULL THEN
    RETURN false;
  END IF;

  IF rec.locked_until IS NOT NULL AND rec.locked_until > now() THEN
    RETURN false;
  END IF;

  ok := (p_password IS NOT NULL AND rec.password_hash = crypt(p_password, rec.password_hash));

  IF ok THEN
    UPDATE admin_auth SET failed_attempts = 0, locked_until = NULL WHERE id = rec.id;
  ELSE
    UPDATE admin_auth
    SET failed_attempts = rec.failed_attempts + 1,
        locked_until = CASE
          WHEN rec.failed_attempts + 1 >= 5 THEN now() + interval '60 seconds'
          ELSE rec.locked_until
        END
    WHERE id = rec.id;
  END IF;

  RETURN ok;
END;
$$;

REVOKE ALL ON FUNCTION verify_admin_password(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION verify_admin_password(text) TO anon, authenticated;

-- =========================================================
-- change_admin_password
-- =========================================================
CREATE OR REPLACE FUNCTION change_admin_password(p_current text, p_new text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rec admin_auth%ROWTYPE;
BEGIN
  SELECT * INTO rec FROM admin_auth LIMIT 1;
  IF rec IS NULL THEN
    RETURN false;
  END IF;

  IF rec.locked_until IS NOT NULL AND rec.locked_until > now() THEN
    RETURN false;
  END IF;

  IF p_current IS NULL OR rec.password_hash != crypt(p_current, rec.password_hash) THEN
    RETURN false;
  END IF;

  IF p_new IS NULL OR length(p_new) < 8 THEN
    RAISE EXCEPTION 'New password must be at least 8 characters';
  END IF;

  UPDATE admin_auth
  SET password_hash = crypt(p_new, gen_salt('bf')),
      updated_at = now()
  WHERE id = rec.id;

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION change_admin_password(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION change_admin_password(text, text) TO anon, authenticated;
