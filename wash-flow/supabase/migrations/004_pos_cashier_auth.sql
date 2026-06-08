-- ============================================================
-- Wash Flow - POS Devices + Cashier Accounts + PIN Auth
-- ============================================================

-- ============================================================
-- 1. Enable pgcrypto for secure PIN hashing
-- ============================================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- 2. POS Devices
-- ============================================================
CREATE TABLE IF NOT EXISTS pos_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pos_code TEXT NOT NULL,
  device_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_pos_devices_code ON pos_devices(pos_code);

-- ============================================================
-- 3. Cashier Accounts
-- ============================================================
CREATE TABLE IF NOT EXISTS cashier_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pos_device_id UUID NOT NULL REFERENCES pos_devices(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  username TEXT NOT NULL,
  full_name TEXT NOT NULL,
  pin_hash TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  failed_attempts INTEGER NOT NULL DEFAULT 0,
  locked_until TIMESTAMPTZ,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(pos_device_id, username)
);

-- ============================================================
-- 4. Cashier Sessions (secure token-based)
-- ============================================================
CREATE TABLE IF NOT EXISTS cashier_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cashier_account_id UUID NOT NULL REFERENCES cashier_accounts(id) ON DELETE CASCADE,
  pos_device_id UUID NOT NULL REFERENCES pos_devices(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  cashier_name TEXT NOT NULL,
  pos_code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '12 hours'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 5. Add cashier/POS fields to orders and invoices
-- ============================================================
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS cashier_account_id UUID REFERENCES cashier_accounts(id),
ADD COLUMN IF NOT EXISTS cashier_name TEXT,
ADD COLUMN IF NOT EXISTS pos_device_id UUID REFERENCES pos_devices(id),
ADD COLUMN IF NOT EXISTS pos_code TEXT;

ALTER TABLE invoices
ADD COLUMN IF NOT EXISTS cashier_account_id UUID REFERENCES cashier_accounts(id),
ADD COLUMN IF NOT EXISTS cashier_name TEXT,
ADD COLUMN IF NOT EXISTS pos_device_id UUID REFERENCES pos_devices(id),
ADD COLUMN IF NOT EXISTS pos_code TEXT;

-- ============================================================
-- 6. Helper: verify cashier session token
-- ============================================================
CREATE OR REPLACE FUNCTION verify_cashier_session(p_token TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_session RECORD;
BEGIN
  SELECT cs.id, cs.cashier_account_id, cs.pos_device_id, cs.cashier_name, cs.pos_code, cs.expires_at
  INTO v_session
  FROM cashier_sessions cs
  WHERE cs.token = p_token AND cs.expires_at > NOW();

  IF v_session.id IS NULL THEN
    RETURN NULL;
  END IF;

  RETURN jsonb_build_object(
    'session_id', v_session.id,
    'cashier_account_id', v_session.cashier_account_id,
    'pos_device_id', v_session.pos_device_id,
    'cashier_name', v_session.cashier_name,
    'pos_code', v_session.pos_code,
    'expires_at', v_session.expires_at
  );
END;
$$;

-- ============================================================
-- 7. Authenticate POS Cashier
-- ============================================================
CREATE OR REPLACE FUNCTION authenticate_pos_cashier(
  p_pos_code TEXT,
  p_username TEXT,
  p_pin TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_device RECORD;
  v_cashier RECORD;
  v_session RECORD;
BEGIN
  -- Find device
  SELECT id, status INTO v_device
  FROM pos_devices
  WHERE pos_code = p_pos_code;

  IF v_device.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'جهاز POS غير موجود');
  END IF;

  IF v_device.status = 'inactive' THEN
    RETURN jsonb_build_object('success', false, 'error', 'جهاز POS غير نشط');
  END IF;

  -- Find cashier account
  SELECT id, pos_device_id, username, full_name, pin_hash, status, failed_attempts, locked_until
  INTO v_cashier
  FROM cashier_accounts
  WHERE pos_device_id = v_device.id AND username = p_username;

  IF v_cashier.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'اسم المستخدم غير صحيح');
  END IF;

  -- Check if locked
  IF v_cashier.locked_until IS NOT NULL AND v_cashier.locked_until > NOW() THEN
    RETURN jsonb_build_object('success', false, 'error', 'الحساب مقفل مؤقتًا، حاول لاحقًا');
  END IF;

  IF v_cashier.status = 'inactive' THEN
    RETURN jsonb_build_object('success', false, 'error', 'حساب الكاشير غير نشط');
  END IF;

  -- Verify PIN
  IF v_cashier.pin_hash != crypt(p_pin, v_cashier.pin_hash) THEN
    -- Increment failed attempts
    UPDATE cashier_accounts
    SET failed_attempts = failed_attempts + 1,
        locked_until = CASE WHEN failed_attempts + 1 >= 5 THEN NOW() + INTERVAL '30 minutes' ELSE NULL END
    WHERE id = v_cashier.id;
    RETURN jsonb_build_object('success', false, 'error', 'PIN غير صحيح');
  END IF;

  -- Reset failed attempts and update last login
  UPDATE cashier_accounts
  SET failed_attempts = 0, locked_until = NULL, last_login_at = NOW()
  WHERE id = v_cashier.id;

  -- Create session
  INSERT INTO cashier_sessions (cashier_account_id, pos_device_id, cashier_name, pos_code)
  VALUES (v_cashier.id, v_device.id, v_cashier.full_name, p_pos_code)
  RETURNING id, token, cashier_name, pos_code, expires_at INTO v_session;

  RETURN jsonb_build_object(
    'success', true,
    'token', v_session.token,
    'cashier_account_id', v_cashier.id,
    'pos_device_id', v_device.id,
    'cashier_name', v_session.cashier_name,
    'pos_code', v_session.pos_code,
    'expires_at', v_session.expires_at
  );
END;
$$;

-- ============================================================
-- 8. Create POS Device (Owner only)
-- ============================================================
CREATE OR REPLACE FUNCTION create_pos_device(
  p_pos_code TEXT,
  p_device_name TEXT,
  p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role TEXT;
  v_device_id UUID;
BEGIN
  SELECT role INTO v_role FROM profiles WHERE id = auth.uid() AND status = 'active';
  IF v_role IS NULL OR v_role != 'owner' THEN
    RAISE EXCEPTION 'Unauthorized: owner only';
  END IF;

  IF EXISTS (SELECT 1 FROM pos_devices WHERE pos_code = p_pos_code) THEN
    RAISE EXCEPTION 'رقم الجهاز موجود مسبقًا';
  END IF;

  INSERT INTO pos_devices (pos_code, device_name, notes)
  VALUES (p_pos_code, p_device_name, p_notes)
  RETURNING id INTO v_device_id;

  RETURN jsonb_build_object('success', true, 'device_id', v_device_id);
END;
$$;

-- ============================================================
-- 9. Update POS Device (Owner only)
-- ============================================================
CREATE OR REPLACE FUNCTION update_pos_device(
  p_device_id UUID,
  p_pos_code TEXT,
  p_device_name TEXT,
  p_status TEXT,
  p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role TEXT;
BEGIN
  SELECT role INTO v_role FROM profiles WHERE id = auth.uid() AND status = 'active';
  IF v_role IS NULL OR v_role != 'owner' THEN
    RAISE EXCEPTION 'Unauthorized: owner only';
  END IF;

  IF EXISTS (SELECT 1 FROM pos_devices WHERE pos_code = p_pos_code AND id != p_device_id) THEN
    RAISE EXCEPTION 'رقم الجهاز موجود مسبقًا';
  END IF;

  UPDATE pos_devices
  SET pos_code = p_pos_code,
      device_name = p_device_name,
      status = p_status,
      notes = p_notes,
      updated_at = NOW()
  WHERE id = p_device_id;

  RETURN jsonb_build_object('success', true);
END;
$$;

-- ============================================================
-- 10. Create Cashier Account (Owner only)
-- ============================================================
CREATE OR REPLACE FUNCTION create_cashier_account(
  p_pos_device_id UUID,
  p_username TEXT,
  p_full_name TEXT,
  p_pin TEXT,
  p_employee_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role TEXT;
  v_account_id UUID;
BEGIN
  SELECT role INTO v_role FROM profiles WHERE id = auth.uid() AND status = 'active';
  IF v_role IS NULL OR v_role != 'owner' THEN
    RAISE EXCEPTION 'Unauthorized: owner only';
  END IF;

  IF EXISTS (SELECT 1 FROM cashier_accounts WHERE pos_device_id = p_pos_device_id AND username = p_username) THEN
    RAISE EXCEPTION 'اسم المستخدم موجود مسبقًا على هذا الجهاز';
  END IF;

  INSERT INTO cashier_accounts (pos_device_id, employee_id, username, full_name, pin_hash)
  VALUES (p_pos_device_id, p_employee_id, p_username, p_full_name, crypt(p_pin, gen_salt('bf')))
  RETURNING id INTO v_account_id;

  RETURN jsonb_build_object('success', true, 'account_id', v_account_id);
END;
$$;

-- ============================================================
-- 11. Update Cashier Account (Owner only)
-- ============================================================
CREATE OR REPLACE FUNCTION update_cashier_account(
  p_account_id UUID,
  p_pos_device_id UUID,
  p_username TEXT,
  p_full_name TEXT,
  p_status TEXT,
  p_employee_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role TEXT;
BEGIN
  SELECT role INTO v_role FROM profiles WHERE id = auth.uid() AND status = 'active';
  IF v_role IS NULL OR v_role != 'owner' THEN
    RAISE EXCEPTION 'Unauthorized: owner only';
  END IF;

  IF EXISTS (SELECT 1 FROM cashier_accounts WHERE pos_device_id = p_pos_device_id AND username = p_username AND id != p_account_id) THEN
    RAISE EXCEPTION 'اسم المستخدم موجود مسبقًا على هذا الجهاز';
  END IF;

  UPDATE cashier_accounts
  SET pos_device_id = p_pos_device_id,
      username = p_username,
      full_name = p_full_name,
      status = p_status,
      employee_id = p_employee_id,
      updated_at = NOW()
  WHERE id = p_account_id;

  RETURN jsonb_build_object('success', true);
END;
$$;

-- ============================================================
-- 12. Change Cashier PIN (Owner only)
-- ============================================================
CREATE OR REPLACE FUNCTION change_cashier_pin(
  p_account_id UUID,
  p_new_pin TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role TEXT;
BEGIN
  SELECT role INTO v_role FROM profiles WHERE id = auth.uid() AND status = 'active';
  IF v_role IS NULL OR v_role != 'owner' THEN
    RAISE EXCEPTION 'Unauthorized: owner only';
  END IF;

  UPDATE cashier_accounts
  SET pin_hash = crypt(p_new_pin, gen_salt('bf')),
      failed_attempts = 0,
      locked_until = NULL,
      updated_at = NOW()
  WHERE id = p_account_id;

  RETURN jsonb_build_object('success', true);
END;
$$;

-- ============================================================
-- 13. Unlock Cashier Account (Owner only)
-- ============================================================
CREATE OR REPLACE FUNCTION unlock_cashier_account(
  p_account_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role TEXT;
BEGIN
  SELECT role INTO v_role FROM profiles WHERE id = auth.uid() AND status = 'active';
  IF v_role IS NULL OR v_role != 'owner' THEN
    RAISE EXCEPTION 'Unauthorized: owner only';
  END IF;

  UPDATE cashier_accounts
  SET failed_attempts = 0,
      locked_until = NULL,
      updated_at = NOW()
  WHERE id = p_account_id;

  RETURN jsonb_build_object('success', true);
END;
$$;

-- ============================================================
-- 14. RLS Policies
-- ============================================================

-- pos_devices: owner and manager can view, owner can manage
ALTER TABLE pos_devices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner and manager can view POS devices"
  ON pos_devices FOR SELECT
  USING (user_has_role(ARRAY['owner', 'manager']));

CREATE POLICY "Owner can insert POS devices"
  ON pos_devices FOR INSERT
  WITH CHECK (user_has_role(ARRAY['owner']));

CREATE POLICY "Owner can update POS devices"
  ON pos_devices FOR UPDATE
  USING (user_has_role(ARRAY['owner']));

-- cashier_accounts: owner only
ALTER TABLE cashier_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can view cashier accounts"
  ON cashier_accounts FOR SELECT
  USING (user_has_role(ARRAY['owner']));

CREATE POLICY "Owner can insert cashier accounts"
  ON cashier_accounts FOR INSERT
  WITH CHECK (user_has_role(ARRAY['owner']));

CREATE POLICY "Owner can update cashier accounts"
  ON cashier_accounts FOR UPDATE
  USING (user_has_role(ARRAY['owner']));

-- cashier_sessions: RPC-only (no direct table access)
ALTER TABLE cashier_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "No direct cashier session access"
  ON cashier_sessions FOR ALL
  USING (false);

-- ============================================================
-- 15. Cashier auth guards (no order/invoice access for cashiers)
--     Already handled by existing RLS policies (cashier role
--     only has orders SELECT/INSERT, no settings access)
-- ============================================================
