-- ============================================================
-- Wash Flow - Reset Demo Data (Manual Cleanup)
-- ============================================================
-- HOW TO USE:
-- 1. Run in Supabase Dashboard → SQL Editor
-- 2. This clears all operational data while preserving:
--    - auth.users (real user accounts)
--    - public.profiles (user roles & permissions)
--    - public.company_settings (company name, etc.)
-- 3. Do NOT run automatically during build or deploy.
-- ============================================================

-- Clear in dependency-safe order
-- Child tables first, parent tables last

-- Inventory
DELETE FROM stock_movements;
DELETE FROM inventory_items;

-- Purchases & Suppliers
DELETE FROM purchase_items;
DELETE FROM purchases;
DELETE FROM suppliers;

-- Invoices & Orders
DELETE FROM invoices;
DELETE FROM order_items;
DELETE FROM orders;

-- Employees
DELETE FROM salary_payments;
DELETE FROM employee_advances;
DELETE FROM employees;

-- Other operational data
DELETE FROM audit_logs;
DELETE FROM utility_bills;
DELETE FROM expenses;
DELETE FROM services;
DELETE FROM customers;

-- Reset sequences
ALTER SEQUENCE IF EXISTS order_number_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS invoice_number_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS purchase_number_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS expense_number_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS utility_bill_number_seq RESTART WITH 1;
