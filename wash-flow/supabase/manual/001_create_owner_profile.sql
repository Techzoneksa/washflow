-- ============================================================
-- Wash Flow - Create Owner Profile (Manual Setup)
-- ============================================================
-- HOW TO USE:
-- 1. Go to Supabase Dashboard → Authentication → Users → Add User
--    Create a user with the owner's email.
--    Copy the generated UUID.
-- 2. Replace 'USER_UUID_FROM_AUTH' below with the actual UUID.
-- 3. Run this SQL in Supabase Dashboard → SQL Editor.
-- ============================================================

-- Create the owner profile
INSERT INTO public.profiles (id, full_name, role, status)
VALUES (
  'USER_UUID_FROM_AUTH',  -- ← REPLACE with actual UUID from Auth Users
  'مالك النظام',
  'owner',
  'active'
)
ON CONFLICT (id) DO UPDATE
SET full_name = 'مالك النظام',
    role = 'owner',
    status = 'active';

-- ============================================================
-- Create initial company settings (optional)
-- ============================================================
INSERT INTO public.company_settings (company_name_ar, phone, address)
VALUES ('فال المستقبل', '', '')
ON CONFLICT DO NOTHING;

-- ============================================================
-- To create additional users (manager, accountant):
-- 1. Create user via Supabase Dashboard → Authentication → Add User
-- 2. Copy UUID
-- 3. Run INSERT with appropriate role
-- ============================================================
-- Example:
-- INSERT INTO public.profiles (id, full_name, role, status)
-- VALUES ('USER_UUID', 'اسم المستخدم', 'manager', 'active');
