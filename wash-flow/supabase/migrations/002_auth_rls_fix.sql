-- ============================================================
-- Wash Flow - Auth + RLS Fix Migration
-- Phase 3: Realtime Auth & RLS Foundation
-- ============================================================

-- ============================================================
-- 1. Fix get_user_role() - return NULL instead of 'cashier'
--    when auth.uid() is null, so RLS policies fail securely
--    instead of granting default access to unauthenticated users.
-- ============================================================
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN NULL;
  END IF;
  SELECT p.role INTO user_role
  FROM profiles p
  WHERE p.id = auth.uid() AND p.status = 'active';
  RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 2. Drop all existing policies that use the broken default
-- ============================================================

-- Profiles
DROP POLICY IF EXISTS "Public profiles view" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Company Settings
DROP POLICY IF EXISTS "Owner and manager can view settings" ON company_settings;
DROP POLICY IF EXISTS "Owner can update settings" ON company_settings;

-- Customers
DROP POLICY IF EXISTS "All roles can view customers" ON customers;
DROP POLICY IF EXISTS "Owner, manager, accountant, cashier can insert customers" ON customers;
DROP POLICY IF EXISTS "Owner, manager, accountant, cashier can update customers" ON customers;
DROP POLICY IF EXISTS "Owner and manager can delete customers" ON customers;

-- Services
DROP POLICY IF EXISTS "All roles can view services" ON services;
DROP POLICY IF EXISTS "Owner and manager can insert services" ON services;
DROP POLICY IF EXISTS "Owner and manager can update services" ON services;
DROP POLICY IF EXISTS "Owner and manager can delete services" ON services;

-- Orders
DROP POLICY IF EXISTS "Owner, manager, cashier can view orders" ON orders;
DROP POLICY IF EXISTS "Owner, manager, cashier can insert orders" ON orders;
DROP POLICY IF EXISTS "Owner and manager can update orders" ON orders;
DROP POLICY IF EXISTS "Owner and manager can delete orders" ON orders;

-- Order Items
DROP POLICY IF EXISTS "Related order viewers can see items" ON order_items;
DROP POLICY IF EXISTS "Can insert order items" ON order_items;
DROP POLICY IF EXISTS "Owner and manager can update items" ON order_items;

-- Invoices
DROP POLICY IF EXISTS "Owner, manager, accountant, cashier can view invoices" ON invoices;
DROP POLICY IF EXISTS "Owner and manager can insert invoices" ON invoices;
DROP POLICY IF EXISTS "Owner and manager can update invoices" ON invoices;

-- Suppliers
DROP POLICY IF EXISTS "Owner, manager, accountant can view suppliers" ON suppliers;
DROP POLICY IF EXISTS "Owner, manager can insert suppliers" ON suppliers;
DROP POLICY IF EXISTS "Owner, manager can update suppliers" ON suppliers;
DROP POLICY IF EXISTS "Owner can delete suppliers" ON suppliers;

-- Purchases
DROP POLICY IF EXISTS "Owner, manager, accountant can view purchases" ON purchases;
DROP POLICY IF EXISTS "Owner, manager, accountant can insert purchases" ON purchases;
DROP POLICY IF EXISTS "Owner, manager can update purchases" ON purchases;

-- Expenses
DROP POLICY IF EXISTS "Owner, manager, accountant can view expenses" ON expenses;
DROP POLICY IF EXISTS "Owner, manager, accountant can insert expenses" ON expenses;
DROP POLICY IF EXISTS "Owner, manager can update expenses" ON expenses;

-- Utility Bills
DROP POLICY IF EXISTS "Owner, manager, accountant can view utility bills" ON utility_bills;
DROP POLICY IF EXISTS "Owner, manager, accountant can insert utility bills" ON utility_bills;
DROP POLICY IF EXISTS "Owner, manager can update utility bills" ON utility_bills;

-- Employees
DROP POLICY IF EXISTS "Owner, manager can view employees" ON employees;
DROP POLICY IF EXISTS "Owner, manager can insert employees" ON employees;
DROP POLICY IF EXISTS "Owner, manager can update employees" ON employees;
DROP POLICY IF EXISTS "Owner can delete employees" ON employees;

-- Employee Advances
DROP POLICY IF EXISTS "Owner, manager, accountant can view advances" ON employee_advances;
DROP POLICY IF EXISTS "Owner, manager can insert advances" ON employee_advances;
DROP POLICY IF EXISTS "Owner, manager can update advances" ON employee_advances;

-- Salary Payments
DROP POLICY IF EXISTS "Owner, accountant can view salary payments" ON salary_payments;
DROP POLICY IF EXISTS "Owner, accountant can insert salary payments" ON salary_payments;

-- Inventory Items
DROP POLICY IF EXISTS "Owner, manager, accountant can view inventory" ON inventory_items;
DROP POLICY IF EXISTS "Owner, manager can insert inventory" ON inventory_items;
DROP POLICY IF EXISTS "Owner, manager can update inventory" ON inventory_items;
DROP POLICY IF EXISTS "Owner can delete inventory" ON inventory_items;

-- Stock Movements
DROP POLICY IF EXISTS "Owner, manager, accountant can view stock movements" ON stock_movements;
DROP POLICY IF EXISTS "Owner, manager can insert stock movements" ON stock_movements;

-- Audit Logs
DROP POLICY IF EXISTS "Owner and manager can view audit logs" ON audit_logs;
DROP POLICY IF EXISTS "System can insert audit logs" ON audit_logs;

-- ============================================================
-- 3. Create new RLS policies with updated role checks
--    All policies now handle NULL role gracefully -> no access
-- ============================================================

-- Helper function for role checks
CREATE OR REPLACE FUNCTION user_has_role(required_roles TEXT[])
RETURNS BOOLEAN AS $$
BEGIN
  RETURN COALESCE(get_user_role(), '') = ANY(required_roles);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------
-- PROFILES
-- ----------------------------------------
CREATE POLICY "Profiles view own or all for owner/manager"
  ON profiles FOR SELECT
  USING (
    auth.uid() = id OR user_has_role(ARRAY['owner', 'manager'])
  );

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Owner can update any profile"
  ON profiles FOR UPDATE
  USING (user_has_role(ARRAY['owner']));

-- ----------------------------------------
-- COMPANY SETTINGS
-- ----------------------------------------
CREATE POLICY "Owner and manager can view settings"
  ON company_settings FOR SELECT
  USING (user_has_role(ARRAY['owner', 'manager']));

CREATE POLICY "Owner and manager can insert settings"
  ON company_settings FOR INSERT
  WITH CHECK (user_has_role(ARRAY['owner', 'manager']));

CREATE POLICY "Owner and manager can update settings"
  ON company_settings FOR UPDATE
  USING (user_has_role(ARRAY['owner', 'manager']));

-- ----------------------------------------
-- CUSTOMERS
-- ----------------------------------------
CREATE POLICY "All authenticated roles can view customers"
  ON customers FOR SELECT
  USING (user_has_role(ARRAY['owner', 'manager', 'accountant', 'cashier']));

CREATE POLICY "All authenticated roles can insert customers"
  ON customers FOR INSERT
  WITH CHECK (user_has_role(ARRAY['owner', 'manager', 'accountant', 'cashier']));

CREATE POLICY "All authenticated roles can update customers"
  ON customers FOR UPDATE
  USING (user_has_role(ARRAY['owner', 'manager', 'accountant', 'cashier']));

CREATE POLICY "Owner and manager can delete customers"
  ON customers FOR DELETE
  USING (user_has_role(ARRAY['owner', 'manager']));

-- ----------------------------------------
-- SERVICES
-- ----------------------------------------
CREATE POLICY "All authenticated roles can view services"
  ON services FOR SELECT
  USING (user_has_role(ARRAY['owner', 'manager', 'accountant', 'cashier']));

CREATE POLICY "Owner and manager can insert services"
  ON services FOR INSERT
  WITH CHECK (user_has_role(ARRAY['owner', 'manager']));

CREATE POLICY "Owner and manager can update services"
  ON services FOR UPDATE
  USING (user_has_role(ARRAY['owner', 'manager']));

CREATE POLICY "Owner and manager can delete services"
  ON services FOR DELETE
  USING (user_has_role(ARRAY['owner', 'manager']));

-- ----------------------------------------
-- ORDERS
-- ----------------------------------------
CREATE POLICY "Owner, manager, cashier can view orders"
  ON orders FOR SELECT
  USING (user_has_role(ARRAY['owner', 'manager', 'cashier']));

CREATE POLICY "Owner, manager, cashier can insert orders"
  ON orders FOR INSERT
  WITH CHECK (user_has_role(ARRAY['owner', 'manager', 'cashier']));

CREATE POLICY "Owner and manager can update orders"
  ON orders FOR UPDATE
  USING (user_has_role(ARRAY['owner', 'manager']));

CREATE POLICY "Owner and manager can delete orders"
  ON orders FOR DELETE
  USING (user_has_role(ARRAY['owner', 'manager']));

-- ----------------------------------------
-- ORDER ITEMS
-- ----------------------------------------
CREATE POLICY "Related order viewers can see items"
  ON order_items FOR SELECT
  USING (user_has_role(ARRAY['owner', 'manager', 'cashier']));

CREATE POLICY "Can insert order items"
  ON order_items FOR INSERT
  WITH CHECK (user_has_role(ARRAY['owner', 'manager', 'cashier']));

CREATE POLICY "Owner and manager can update items"
  ON order_items FOR UPDATE
  USING (user_has_role(ARRAY['owner', 'manager']));

-- ----------------------------------------
-- INVOICES
-- ----------------------------------------
CREATE POLICY "Owner, manager, accountant, cashier can view invoices"
  ON invoices FOR SELECT
  USING (user_has_role(ARRAY['owner', 'manager', 'accountant', 'cashier']));

CREATE POLICY "Owner and manager can insert invoices"
  ON invoices FOR INSERT
  WITH CHECK (user_has_role(ARRAY['owner', 'manager']));

CREATE POLICY "Owner and manager can update invoices"
  ON invoices FOR UPDATE
  USING (user_has_role(ARRAY['owner', 'manager']));

-- ----------------------------------------
-- SUPPLIERS
-- ----------------------------------------
CREATE POLICY "Owner, manager, accountant can view suppliers"
  ON suppliers FOR SELECT
  USING (user_has_role(ARRAY['owner', 'manager', 'accountant']));

CREATE POLICY "Owner, manager can insert suppliers"
  ON suppliers FOR INSERT
  WITH CHECK (user_has_role(ARRAY['owner', 'manager']));

CREATE POLICY "Owner, manager can update suppliers"
  ON suppliers FOR UPDATE
  USING (user_has_role(ARRAY['owner', 'manager']));

CREATE POLICY "Owner can delete suppliers"
  ON suppliers FOR DELETE
  USING (user_has_role(ARRAY['owner']));

-- ----------------------------------------
-- PURCHASES
-- ----------------------------------------
CREATE POLICY "Owner, manager, accountant can view purchases"
  ON purchases FOR SELECT
  USING (user_has_role(ARRAY['owner', 'manager', 'accountant']));

CREATE POLICY "Owner, manager, accountant can insert purchases"
  ON purchases FOR INSERT
  WITH CHECK (user_has_role(ARRAY['owner', 'manager', 'accountant']));

CREATE POLICY "Owner, manager can update purchases"
  ON purchases FOR UPDATE
  USING (user_has_role(ARRAY['owner', 'manager']));

-- ----------------------------------------
-- PURCHASE ITEMS
-- ----------------------------------------
CREATE POLICY "Owner, manager, accountant can view purchase items"
  ON purchase_items FOR SELECT
  USING (user_has_role(ARRAY['owner', 'manager', 'accountant']));

CREATE POLICY "Owner, manager, accountant can insert purchase items"
  ON purchase_items FOR INSERT
  WITH CHECK (user_has_role(ARRAY['owner', 'manager', 'accountant']));

-- ----------------------------------------
-- EXPENSES
-- ----------------------------------------
CREATE POLICY "Owner, manager, accountant can view expenses"
  ON expenses FOR SELECT
  USING (user_has_role(ARRAY['owner', 'manager', 'accountant']));

CREATE POLICY "Owner, manager, accountant can insert expenses"
  ON expenses FOR INSERT
  WITH CHECK (user_has_role(ARRAY['owner', 'manager', 'accountant']));

CREATE POLICY "Owner, manager can update expenses"
  ON expenses FOR UPDATE
  USING (user_has_role(ARRAY['owner', 'manager']));

-- ----------------------------------------
-- UTILITY BILLS
-- ----------------------------------------
CREATE POLICY "Owner, manager, accountant can view utility bills"
  ON utility_bills FOR SELECT
  USING (user_has_role(ARRAY['owner', 'manager', 'accountant']));

CREATE POLICY "Owner, manager, accountant can insert utility bills"
  ON utility_bills FOR INSERT
  WITH CHECK (user_has_role(ARRAY['owner', 'manager', 'accountant']));

CREATE POLICY "Owner, manager can update utility bills"
  ON utility_bills FOR UPDATE
  USING (user_has_role(ARRAY['owner', 'manager']));

-- ----------------------------------------
-- EMPLOYEES
-- ----------------------------------------
CREATE POLICY "Owner, manager can view employees"
  ON employees FOR SELECT
  USING (user_has_role(ARRAY['owner', 'manager']));

CREATE POLICY "Owner, manager can insert employees"
  ON employees FOR INSERT
  WITH CHECK (user_has_role(ARRAY['owner', 'manager']));

CREATE POLICY "Owner, manager can update employees"
  ON employees FOR UPDATE
  USING (user_has_role(ARRAY['owner', 'manager']));

CREATE POLICY "Owner can delete employees"
  ON employees FOR DELETE
  USING (user_has_role(ARRAY['owner']));

-- ----------------------------------------
-- EMPLOYEE ADVANCES
-- ----------------------------------------
CREATE POLICY "Owner, manager, accountant can view advances"
  ON employee_advances FOR SELECT
  USING (user_has_role(ARRAY['owner', 'manager', 'accountant']));

CREATE POLICY "Owner, manager can insert advances"
  ON employee_advances FOR INSERT
  WITH CHECK (user_has_role(ARRAY['owner', 'manager']));

CREATE POLICY "Owner, manager can update advances"
  ON employee_advances FOR UPDATE
  USING (user_has_role(ARRAY['owner', 'manager']));

-- ----------------------------------------
-- SALARY PAYMENTS
-- ----------------------------------------
CREATE POLICY "Owner, accountant can view salary payments"
  ON salary_payments FOR SELECT
  USING (user_has_role(ARRAY['owner', 'accountant']));

CREATE POLICY "Owner, accountant can insert salary payments"
  ON salary_payments FOR INSERT
  WITH CHECK (user_has_role(ARRAY['owner', 'accountant']));

-- ----------------------------------------
-- INVENTORY ITEMS
-- ----------------------------------------
CREATE POLICY "Owner, manager, accountant can view inventory"
  ON inventory_items FOR SELECT
  USING (user_has_role(ARRAY['owner', 'manager', 'accountant']));

CREATE POLICY "Owner, manager can insert inventory"
  ON inventory_items FOR INSERT
  WITH CHECK (user_has_role(ARRAY['owner', 'manager']));

CREATE POLICY "Owner, manager can update inventory"
  ON inventory_items FOR UPDATE
  USING (user_has_role(ARRAY['owner', 'manager']));

CREATE POLICY "Owner can delete inventory"
  ON inventory_items FOR DELETE
  USING (user_has_role(ARRAY['owner']));

-- ----------------------------------------
-- STOCK MOVEMENTS
-- ----------------------------------------
CREATE POLICY "Owner, manager, accountant can view stock movements"
  ON stock_movements FOR SELECT
  USING (user_has_role(ARRAY['owner', 'manager', 'accountant']));

CREATE POLICY "Owner, manager can insert stock movements"
  ON stock_movements FOR INSERT
  WITH CHECK (user_has_role(ARRAY['owner', 'manager']));

-- ----------------------------------------
-- AUDIT LOGS
-- ----------------------------------------
CREATE POLICY "Owner and manager can view audit logs"
  ON audit_logs FOR SELECT
  USING (user_has_role(ARRAY['owner', 'manager']));

CREATE POLICY "System can insert audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (user_has_role(ARRAY['owner', 'manager', 'accountant', 'cashier']));


