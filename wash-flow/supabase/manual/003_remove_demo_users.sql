-- ============================================================
-- Wash Flow - Remove Demo Users (Manual Cleanup)
-- ============================================================
-- WARNING: This deletes demo profiles. It does NOT delete
-- auth users (use Supabase Dashboard → Authentication for that).
-- ============================================================
-- HOW TO USE:
-- 1. First, delete demo users from Supabase Dashboard →
--    Authentication → Users (NOT the real owner).
-- 2. Then run this SQL to clean up orphaned profiles.
-- ============================================================

-- Step 1: Delete demo cashier sessions
DELETE FROM public.cashier_sessions
WHERE cashier_id IN (
  SELECT id FROM public.cashier_accounts
  WHERE full_name ILIKE '%demo%'
     OR full_name ILIKE '%test%'
);

-- Step 2: Delete demo cashier accounts
DELETE FROM public.cashier_accounts
WHERE full_name ILIKE '%demo%'
   OR full_name ILIKE '%test%';

-- Step 3: Delete demo POS devices (only those with no remaining cashier accounts)
DELETE FROM public.pos_devices
WHERE id NOT IN (SELECT DISTINCT pos_device_id FROM public.cashier_accounts WHERE pos_device_id IS NOT NULL)
  AND (name ILIKE '%demo%' OR name ILIKE '%test%');

-- Step 4: Delete demo profiles (never delete the real owner)
DELETE FROM public.profiles
WHERE id <> '8c0edf34-8a11-4a62-bc3b-302ce9b46ea3'
  AND (
    full_name ILIKE '%demo%'
    OR full_name ILIKE '%test%'
    OR full_name ILIKE '%تجريبي%'
    OR id IN (
      SELECT id FROM public.profiles
      WHERE role IN ('owner', 'manager', 'accountant')
        AND full_name IN ('مالك النظام', 'مدير النظام', 'محاسب النظام')
    )
  );

-- ============================================================
-- Step 5: Verify cleanup
-- ============================================================
-- Remaining admin profiles:
SELECT id, full_name, role, status FROM public.profiles WHERE role IN ('owner', 'manager', 'accountant');
-- Remaining auth users with no profile (should be empty):
-- Note: This check only works if the auth user is still in auth.users.
-- If deleted from Dashboard, these won't show up.
