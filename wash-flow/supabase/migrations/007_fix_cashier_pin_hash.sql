-- ============================================================
-- Wash Flow - Fix pgcrypto schema qualification for PIN hashing
-- Issue: crypt() / gen_salt() not found (42883 / 404) because
-- pgcrypto lives in extensions schema but functions search
-- only public.
-- Fix: Install pgcrypto in extensions schema, qualify all
-- pgcrypto calls with extensions. prefix, and set safe
-- search_path on all SECURITY DEFINER functions.
-- ============================================================

-- ============================================================
-- 1. Ensure pgcrypto exists in extensions schema
-- ============================================================
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- ============================================================
-- 2. Recreate create_cashier_account
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
SET search_path = public, extensions
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
  VALUES (p_pos_device_id, p_employee_id, p_username, p_full_name, extensions.crypt(p_pin, extensions.gen_salt('bf')))
  RETURNING id INTO v_account_id;

  RETURN jsonb_build_object('success', true, 'account_id', v_account_id);
END;
$$;

-- ============================================================
-- 3. Recreate authenticate_pos_cashier
-- ============================================================
CREATE OR REPLACE FUNCTION authenticate_pos_cashier(
  p_pos_code TEXT,
  p_username TEXT,
  p_pin TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_device RECORD;
  v_cashier RECORD;
  v_session RECORD;
BEGIN
  SELECT id, status INTO v_device
  FROM pos_devices
  WHERE pos_code = p_pos_code;

  IF v_device.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'جهاز POS غير موجود');
  END IF;

  IF v_device.status = 'inactive' THEN
    RETURN jsonb_build_object('success', false, 'error', 'جهاز POS غير نشط');
  END IF;

  SELECT id, pos_device_id, username, full_name, pin_hash, status, failed_attempts, locked_until
  INTO v_cashier
  FROM cashier_accounts
  WHERE pos_device_id = v_device.id AND username = p_username;

  IF v_cashier.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'اسم المستخدم غير صحيح');
  END IF;

  IF v_cashier.locked_until IS NOT NULL AND v_cashier.locked_until > NOW() THEN
    RETURN jsonb_build_object('success', false, 'error', 'الحساب مقفل مؤقتًا، حاول لاحقًا');
  END IF;

  IF v_cashier.status = 'inactive' THEN
    RETURN jsonb_build_object('success', false, 'error', 'حساب الكاشير غير نشط');
  END IF;

  IF v_cashier.pin_hash != extensions.crypt(p_pin, v_cashier.pin_hash) THEN
    UPDATE cashier_accounts
    SET failed_attempts = failed_attempts + 1,
        locked_until = CASE WHEN failed_attempts + 1 >= 5 THEN NOW() + INTERVAL '30 minutes' ELSE NULL END
    WHERE id = v_cashier.id;
    RETURN jsonb_build_object('success', false, 'error', 'PIN غير صحيح');
  END IF;

  UPDATE cashier_accounts
  SET failed_attempts = 0, locked_until = NULL, last_login_at = NOW()
  WHERE id = v_cashier.id;

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
-- 4. Recreate change_cashier_pin
-- ============================================================
CREATE OR REPLACE FUNCTION change_cashier_pin(
  p_account_id UUID,
  p_new_pin TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_role TEXT;
BEGIN
  SELECT role INTO v_role FROM profiles WHERE id = auth.uid() AND status = 'active';
  IF v_role IS NULL OR v_role != 'owner' THEN
    RAISE EXCEPTION 'Unauthorized: owner only';
  END IF;

  UPDATE cashier_accounts
  SET pin_hash = extensions.crypt(p_new_pin, extensions.gen_salt('bf')),
      failed_attempts = 0,
      locked_until = NULL,
      updated_at = NOW()
  WHERE id = p_account_id;

  RETURN jsonb_build_object('success', true);
END;
$$;

-- ============================================================
-- 5. Notify PostgREST to reload schema cache
-- ============================================================
NOTIFY pgrst, 'reload schema';
