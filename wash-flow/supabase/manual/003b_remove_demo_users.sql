-- ============================================================
-- Wash Flow - Remove Demo Users (Manual Cleanup)
-- ============================================================
-- PREREQUISITES:
--   1. Run 003a_preview_demo_users.sql first to review.
--   2. Delete demo users from Supabase Dashboard →
--      Authentication → Users (NOT the real owner).
--   3. Then run this file.
-- ============================================================
-- PERMANENTLY PRESERVED (never deleted):
--   ID:    8c0edf34-8a11-4a62-bc3b-302ce9b46ea3
--   Email: abanurcreate@gmail.com
--   Role:  owner
-- ============================================================
-- USAGE:
--   By default this runs inside a transaction with ROLLBACK.
--   After reviewing the results, change ROLLBACK to COMMIT.
-- ============================================================

BEGIN;

-- Sanity check: never proceed if the real owner is missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = '8c0edf34-8a11-4a62-bc3b-302ce9b46ea3'
      AND role = 'owner'
  ) THEN
    RAISE EXCEPTION 'ABORTING: Real owner (8c0edf34...) not found in profiles';
  END IF;
END $$;

-- Identify demo auth user UUIDs by known demo emails only
-- (not wildcard pattern, exact email list)
CREATE TEMP TABLE demo_auth_users ON COMMIT DROP AS
SELECT id, email
FROM auth.users
WHERE email IN (
  'owner@washflow.sa',
  'manager@washflow.sa',
  'accountant@washflow.sa',
  'cashier@washflow.sa',
  'admin@washflow.sa'
)
AND id <> '8c0edf34-8a11-4a62-bc3b-302ce9b46ea3';

-- ============================================================
-- STEP 1: Delete demo cashier sessions
-- ============================================================
DELETE FROM public.cashier_sessions cs
WHERE cs.cashier_account_id IN (
  SELECT ca.id FROM public.cashier_accounts ca
  WHERE ca.pos_device_id IS NULL
     OR ca.pos_device_id IN (
       SELECT id FROM public.pos_devices
       WHERE device_name ILIKE '%demo%'
          OR device_name ILIKE '%test%'
          OR device_name ILIKE '%تجريبي%'
     )
);

-- ============================================================
-- STEP 2: Delete demo cashier accounts
-- ============================================================
DELETE FROM public.cashier_accounts ca
WHERE ca.pos_device_id IS NULL
   OR ca.pos_device_id IN (
     SELECT id FROM public.pos_devices
     WHERE device_name ILIKE '%demo%'
        OR device_name ILIKE '%test%'
        OR device_name ILIKE '%تجريبي%'
   );

-- ============================================================
-- STEP 3: Delete demo POS devices (name-based only)
-- ============================================================
DELETE FROM public.pos_devices pd
WHERE pd.device_name ILIKE '%demo%'
   OR pd.device_name ILIKE '%test%'
   OR pd.device_name ILIKE '%تجريبي%';

-- ============================================================
-- STEP 4: Delete profiles of demo admin users
-- ============================================================
DELETE FROM public.profiles p
WHERE p.id IN (SELECT id FROM demo_auth_users);

-- ============================================================
-- STEP 5: Delete orphaned profiles
-- ============================================================
DELETE FROM public.profiles p
WHERE p.id <> '8c0edf34-8a11-4a62-bc3b-302ce9b46ea3'
  AND NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = p.id);

-- ============================================================
-- VERIFY RESULTS
-- ============================================================
SELECT '=== REMAINING ADMIN PROFILES ===' AS status;
SELECT p.id, p.full_name, p.role, p.status
FROM public.profiles p
WHERE p.role IN ('owner', 'manager', 'accountant')
ORDER BY p.role, p.full_name;

SELECT '=== REAL OWNER (MUST BE PRESENT) ===' AS status;
SELECT p.id, p.full_name, p.role, p.status
FROM public.profiles p
WHERE p.id = '8c0edf34-8a11-4a62-bc3b-302ce9b46ea3';

SELECT '=== ORPHAN CHECK (should be empty) ===' AS status;
SELECT u.id, u.email
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id)
  AND u.id <> '8c0edf34-8a11-4a62-bc3b-302ce9b46ea3';

SELECT '=== REMAINING CASHIER ACCOUNTS ===' AS status;
SELECT id, full_name, username, pos_device_id
FROM public.cashier_accounts
ORDER BY full_name;

SELECT '=== REMAINING POS DEVICES ===' AS status;
SELECT id, pos_code, device_name, status
FROM public.pos_devices
ORDER BY device_name;

-- ============================================================
-- SAFETY: Default is ROLLBACK for review
-- ============================================================
ROLLBACK;
-- Change ROLLBACK to COMMIT after reviewing results.
-- ============================================================
