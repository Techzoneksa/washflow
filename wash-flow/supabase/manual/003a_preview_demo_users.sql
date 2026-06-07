-- ============================================================
-- Wash Flow - Preview Demo Users Before Deletion
-- ============================================================
-- Run this first to see what will be deleted.
-- After reviewing, run 003b_remove_demo_users.sql if correct.
-- ============================================================
-- PERMANENTLY PRESERVED (never deleted):
--   ID:    8c0edf34-8a11-4a62-bc3b-302ce9b46ea3
--   Email: abanurcreate@gmail.com
--   Role:  owner
-- ============================================================

-- ============================================================
-- List of known demo email addresses to remove
-- ============================================================
-- These are deleted from Supabase Dashboard → Authentication manually.
-- This script only shows the related data that will be cleaned up.

WITH demo_auth_users AS (
  SELECT id, email
  FROM auth.users
  WHERE email IN (
    'owner@washflow.sa',
    'manager@washflow.sa',
    'accountant@washflow.sa',
    'cashier@washflow.sa',
    'admin@washflow.sa'
  )
  AND id <> '8c0edf34-8a11-4a62-bc3b-302ce9b46ea3'
),
orphaned_profiles AS (
  SELECT p.id, p.full_name, p.role, p.status, p.created_at
  FROM public.profiles p
  WHERE p.id <> '8c0edf34-8a11-4a62-bc3b-302ce9b46ea3'
    AND NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = p.id)
),
demo_pos_devices AS (
  SELECT id, pos_code, device_name, status, created_at
  FROM public.pos_devices
  WHERE device_name ILIKE '%demo%'
     OR device_name ILIKE '%test%'
     OR device_name ILIKE '%تجريبي%'
),
demo_cashier_accounts AS (
  SELECT ca.id, ca.full_name, ca.username, ca.status, ca.pos_device_id, ca.created_at
  FROM public.cashier_accounts ca
  WHERE ca.pos_device_id IS NULL
     OR ca.pos_device_id IN (SELECT id FROM demo_pos_devices)
)
SELECT '=== 1. TARGETED DEMO AUTH USERS (delete from Dashboard manually) ===' AS section;
SELECT id, email FROM demo_auth_users ORDER BY email;

SELECT '=== 2. PROFILES TO DELETE (linked to demo auth users) ===' AS section;
SELECT p.id, p.full_name, p.role, p.status, p.created_at
FROM public.profiles p
WHERE p.id IN (SELECT id FROM demo_auth_users)
ORDER BY p.role, p.full_name;

SELECT '=== 3. ORPHANED PROFILES TO DELETE (auth user already deleted) ===' AS section;
SELECT id, full_name, role, status, created_at
FROM orphaned_profiles
ORDER BY role, full_name;

SELECT '=== 4. DEMO POS DEVICES TO DELETE ===' AS section;
SELECT id, pos_code, device_name, status, created_at
FROM demo_pos_devices
ORDER BY device_name;

SELECT '=== 5. DEMO CASHIER ACCOUNTS TO DELETE ===' AS section;
SELECT ca.id, ca.full_name, ca.username, ca.status, pd.pos_code, pd.device_name
FROM demo_cashier_accounts ca
LEFT JOIN public.pos_devices pd ON pd.id = ca.pos_device_id
ORDER BY ca.full_name;

SELECT '=== 6. DEMO CASHIER SESSIONS TO DELETE ===' AS section;
SELECT cs.id, cs.cashier_name, cs.pos_code, cs.created_at, cs.expires_at
FROM public.cashier_sessions cs
WHERE cs.cashier_account_id IN (SELECT id FROM demo_cashier_accounts)
ORDER BY cs.created_at;

SELECT '=== 7. REAL OWNER (PRESERVED - NOT DELETED) ===' AS section;
SELECT p.id, p.full_name, p.role, p.status, p.created_at
FROM public.profiles p
WHERE p.id = '8c0edf34-8a11-4a62-bc3b-302ce9b46ea3';

SELECT '=== SUMMARY ===' AS section;
SELECT 'Demo auth users to delete (from Dashboard)' AS item, COUNT(*)::TEXT AS count FROM demo_auth_users
UNION ALL
SELECT 'Profiles to delete (linked to demo auth)', COUNT(*)::TEXT FROM public.profiles WHERE id IN (SELECT id FROM demo_auth_users)
UNION ALL
SELECT 'Orphaned profiles to delete (no auth user)', COUNT(*)::TEXT FROM orphaned_profiles
UNION ALL
SELECT 'Demo POS devices to delete', COUNT(*)::TEXT FROM demo_pos_devices
UNION ALL
SELECT 'Demo cashier accounts to delete', COUNT(*)::TEXT FROM demo_cashier_accounts
UNION ALL
SELECT 'Demo cashier sessions to delete', COUNT(*)::TEXT FROM public.cashier_sessions WHERE cashier_account_id IN (SELECT id FROM demo_cashier_accounts);
