-- ============================================================
-- Wash Flow - Initial Database Schema
-- Phase 1: Core tables for Real Backend Migration
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'manager', 'accountant', 'cashier')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- COMPANY SETTINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS company_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name_ar TEXT NOT NULL DEFAULT 'مغسلة السيارات',
  company_name_en TEXT DEFAULT 'Car Wash',
  logo_url TEXT,
  vat_number TEXT,
  cr_number TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  invoice_prefix TEXT DEFAULT 'INV',
  vat_rate NUMERIC(5,2) DEFAULT 15.00,
  currency TEXT DEFAULT 'SAR',
  language TEXT DEFAULT 'ar',
  settings_json JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- CUSTOMERS
-- ============================================================
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT,
  phone TEXT,
  car_plate TEXT,
  car_type TEXT,
  notes TEXT,
  orders_count INTEGER NOT NULL DEFAULT 0,
  total_spent NUMERIC(12,2) NOT NULL DEFAULT 0,
  last_visit_at DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT customers_phone_unique UNIQUE (phone) WHERE phone IS NOT NULL AND phone != ''
);

CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);

-- ============================================================
-- SERVICES
-- ============================================================
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_ar TEXT NOT NULL,
  name_en TEXT,
  category TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  duration_minutes INTEGER DEFAULT 30,
  description TEXT,
  icon TEXT DEFAULT 'car',
  is_active BOOLEAN NOT NULL DEFAULT true,
  show_in_pos BOOLEAN NOT NULL DEFAULT true,
  is_taxable BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);
CREATE INDEX IF NOT EXISTS idx_services_show_in_pos ON services(show_in_pos) WHERE show_in_pos = true;

-- ============================================================
-- ORDERS
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT NOT NULL UNIQUE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  customer_name TEXT,
  customer_phone TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'completed', 'cancelled', 'refunded')),
  payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('paid', 'unpaid', 'partial', 'overdue')),
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  vat_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  payment_method TEXT CHECK (payment_method IN ('cash', 'card', 'transfer', 'mada', 'mixed')),
  created_by UUID REFERENCES profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- ============================================================
-- ORDER ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  service_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  snapshot_json JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- ============================================================
-- INVOICES
-- ============================================================
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number TEXT NOT NULL UNIQUE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  customer_name TEXT,
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  vat_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  payment_method TEXT,
  zatca_status TEXT DEFAULT 'not_enabled' CHECK (zatca_status IN ('not_enabled', 'pending', 'approved', 'rejected')),
  zatca_uuid TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoices_order ON invoices(order_id);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);

-- ============================================================
-- SUPPLIERS
-- ============================================================
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT,
  representative_name TEXT,
  vat_number TEXT,
  cr_number TEXT,
  email TEXT,
  address TEXT,
  balance NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_purchases NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_paid NUMERIC(12,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PURCHASES
-- ============================================================
CREATE TABLE IF NOT EXISTS purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  purchase_number TEXT NOT NULL UNIQUE,
  supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE RESTRICT,
  supplier_invoice_number TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  vat_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('paid', 'unpaid', 'partial')),
  payment_method TEXT,
  paid_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  remaining_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  attachment_url TEXT,
  notes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_purchases_supplier ON purchases(supplier_id);
CREATE INDEX IF NOT EXISTS idx_purchases_date ON purchases(date DESC);

-- ============================================================
-- PURCHASE ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS purchase_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  purchase_id UUID NOT NULL REFERENCES purchases(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  quantity NUMERIC(10,2) NOT NULL DEFAULT 1,
  unit TEXT DEFAULT 'قطعة',
  unit_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  inventory_item_id UUID,
  affects_inventory BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_purchase_items_purchase ON purchase_items(purchase_id);

-- ============================================================
-- EXPENSES
-- ============================================================
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  expense_number TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  vat_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  payment_method TEXT,
  account_name TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  attachment_url TEXT,
  notes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_type ON expenses(type);

-- ============================================================
-- UTILITY BILLS
-- ============================================================
CREATE TABLE IF NOT EXISTS utility_bills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bill_number TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL,
  provider TEXT NOT NULL,
  provider_account_number TEXT,
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  vat_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'unpaid' CHECK (status IN ('paid', 'unpaid', 'overdue')),
  payment_method TEXT,
  paid_at TIMESTAMPTZ,
  attachment_url TEXT,
  notes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_utility_bills_status ON utility_bills(status);
CREATE INDEX IF NOT EXISTS idx_utility_bills_due_date ON utility_bills(due_date);

-- ============================================================
-- EMPLOYEES
-- ============================================================
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  national_id TEXT UNIQUE,
  nationality TEXT,
  birth_date DATE,
  join_date DATE NOT NULL DEFAULT CURRENT_DATE,
  job_title TEXT NOT NULL,
  monthly_salary NUMERIC(10,2) NOT NULL DEFAULT 0,
  phone TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- EMPLOYEE ADVANCES
-- ============================================================
CREATE TABLE IF NOT EXISTS employee_advances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  reason TEXT,
  payment_method TEXT,
  deduct_from_salary BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'deducted', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_employee_advances_employee ON employee_advances(employee_id);

-- ============================================================
-- SALARY PAYMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS salary_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  month DATE NOT NULL,
  base_salary NUMERIC(10,2) NOT NULL DEFAULT 0,
  advances_deducted NUMERIC(10,2) NOT NULL DEFAULT 0,
  other_deductions NUMERIC(10,2) NOT NULL DEFAULT 0,
  net_salary NUMERIC(10,2) NOT NULL DEFAULT 0,
  payment_method TEXT,
  paid_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_salary_payments_employee ON salary_payments(employee_id);

-- ============================================================
-- INVENTORY ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS inventory_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  unit TEXT DEFAULT 'قطعة',
  current_quantity NUMERIC(10,2) NOT NULL DEFAULT 0,
  minimum_quantity NUMERIC(10,2) NOT NULL DEFAULT 0,
  average_cost NUMERIC(10,2) NOT NULL DEFAULT 0,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'discontinued')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inventory_items_category ON inventory_items(category);

-- ============================================================
-- STOCK MOVEMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS stock_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('purchase', 'consumption', 'waste', 'adjustment', 'return')),
  quantity NUMERIC(10,2) NOT NULL,
  unit TEXT DEFAULT 'قطعة',
  reason TEXT,
  reference_type TEXT,
  reference_id UUID,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stock_movements_item ON stock_movements(item_id);

-- ============================================================
-- AUDIT LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- ============================================================
-- SEQUENCES for document numbers
-- ============================================================
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;
CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START 1;
CREATE SEQUENCE IF NOT EXISTS purchase_number_seq START 1;
CREATE SEQUENCE IF NOT EXISTS expense_number_seq START 1;
CREATE SEQUENCE IF NOT EXISTS utility_bill_number_seq START 1;

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Function to get next order number
CREATE OR REPLACE FUNCTION get_next_order_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'ORD-' || LPAD(NEXTVAL('order_number_seq')::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Function to get next invoice number
CREATE OR REPLACE FUNCTION get_next_invoice_number(prefix TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN prefix || '-' || LPAD(NEXTVAL('invoice_number_seq')::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_company_settings_updated_at BEFORE UPDATE ON company_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_purchases_updated_at BEFORE UPDATE ON purchases FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON inventory_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update customer stats after order
CREATE OR REPLACE FUNCTION update_customer_order_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.customer_id IS NOT NULL THEN
    UPDATE customers
    SET orders_count = orders_count + 1,
        total_spent = total_spent + NEW.total,
        last_visit_at = CURRENT_DATE,
        updated_at = NOW()
    WHERE id = NEW.customer_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_customer_stats
AFTER INSERT ON orders
FOR EACH ROW EXECUTE FUNCTION update_customer_order_stats();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE utility_bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_advances ENABLE ROW LEVEL SECURITY;
ALTER TABLE salary_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT p.role INTO user_role
  FROM profiles p
  WHERE p.id = auth.uid();
  RETURN COALESCE(user_role, 'cashier');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PROFILES policies
CREATE POLICY "Public profiles view" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- COMPANY SETTINGS policies
CREATE POLICY "Owner and manager can view settings" ON company_settings FOR SELECT
  USING (get_user_role() IN ('owner', 'manager'));
CREATE POLICY "Owner can update settings" ON company_settings FOR UPDATE
  USING (get_user_role() = 'owner');

-- CUSTOMERS policies
CREATE POLICY "All roles can view customers" ON customers FOR SELECT
  USING (get_user_role() IN ('owner', 'manager', 'accountant', 'cashier'));
CREATE POLICY "Owner, manager, accountant, cashier can insert customers" ON customers FOR INSERT
  WITH CHECK (get_user_role() IN ('owner', 'manager', 'accountant', 'cashier'));
CREATE POLICY "Owner, manager, accountant, cashier can update customers" ON customers FOR UPDATE
  USING (get_user_role() IN ('owner', 'manager', 'accountant', 'cashier'));
CREATE POLICY "Owner and manager can delete customers" ON customers FOR DELETE
  USING (get_user_role() IN ('owner', 'manager'));

-- SERVICES policies
CREATE POLICY "All roles can view services" ON services FOR SELECT
  USING (get_user_role() IN ('owner', 'manager', 'accountant', 'cashier'));
CREATE POLICY "Owner and manager can insert services" ON services FOR INSERT
  WITH CHECK (get_user_role() IN ('owner', 'manager'));
CREATE POLICY "Owner and manager can update services" ON services FOR UPDATE
  USING (get_user_role() IN ('owner', 'manager'));
CREATE POLICY "Owner and manager can delete services" ON services FOR DELETE
  USING (get_user_role() IN ('owner', 'manager'));

-- ORDERS policies
CREATE POLICY "Owner, manager, cashier can view orders" ON orders FOR SELECT
  USING (get_user_role() IN ('owner', 'manager', 'cashier'));
CREATE POLICY "Owner, manager, cashier can insert orders" ON orders FOR INSERT
  WITH CHECK (get_user_role() IN ('owner', 'manager', 'cashier'));
CREATE POLICY "Owner and manager can update orders" ON orders FOR UPDATE
  USING (get_user_role() IN ('owner', 'manager'));
CREATE POLICY "Owner and manager can delete orders" ON orders FOR DELETE
  USING (get_user_role() IN ('owner', 'manager'));

-- ORDER ITEMS policies
CREATE POLICY "Related order viewers can see items" ON order_items FOR SELECT
  USING (get_user_role() IN ('owner', 'manager', 'cashier'));
CREATE POLICY "Can insert order items" ON order_items FOR INSERT
  WITH CHECK (get_user_role() IN ('owner', 'manager', 'cashier'));
CREATE POLICY "Owner and manager can update items" ON order_items FOR UPDATE
  USING (get_user_role() IN ('owner', 'manager'));

-- INVOICES policies
CREATE POLICY "Owner, manager, accountant, cashier can view invoices" ON invoices FOR SELECT
  USING (get_user_role() IN ('owner', 'manager', 'accountant', 'cashier'));
CREATE POLICY "Owner and manager can insert invoices" ON invoices FOR INSERT
  WITH CHECK (get_user_role() IN ('owner', 'manager'));
CREATE POLICY "Owner and manager can update invoices" ON invoices FOR UPDATE
  USING (get_user_role() IN ('owner', 'manager'));

-- SUPPLIERS policies
CREATE POLICY "Owner, manager, accountant can view suppliers" ON suppliers FOR SELECT
  USING (get_user_role() IN ('owner', 'manager', 'accountant'));
CREATE POLICY "Owner, manager can insert suppliers" ON suppliers FOR INSERT
  WITH CHECK (get_user_role() IN ('owner', 'manager'));
CREATE POLICY "Owner, manager can update suppliers" ON suppliers FOR UPDATE
  USING (get_user_role() IN ('owner', 'manager'));
CREATE POLICY "Owner can delete suppliers" ON suppliers FOR DELETE
  USING (get_user_role() = 'owner');

-- PURCHASES policies
CREATE POLICY "Owner, manager, accountant can view purchases" ON purchases FOR SELECT
  USING (get_user_role() IN ('owner', 'manager', 'accountant'));
CREATE POLICY "Owner, manager, accountant can insert purchases" ON purchases FOR INSERT
  WITH CHECK (get_user_role() IN ('owner', 'manager', 'accountant'));
CREATE POLICY "Owner, manager can update purchases" ON purchases FOR UPDATE
  USING (get_user_role() IN ('owner', 'manager'));

-- EXPENSES policies
CREATE POLICY "Owner, manager, accountant can view expenses" ON expenses FOR SELECT
  USING (get_user_role() IN ('owner', 'manager', 'accountant'));
CREATE POLICY "Owner, manager, accountant can insert expenses" ON expenses FOR INSERT
  WITH CHECK (get_user_role() IN ('owner', 'manager', 'accountant'));
CREATE POLICY "Owner, manager can update expenses" ON expenses FOR UPDATE
  USING (get_user_role() IN ('owner', 'manager'));

-- UTILITY BILLS policies
CREATE POLICY "Owner, manager, accountant can view utility bills" ON utility_bills FOR SELECT
  USING (get_user_role() IN ('owner', 'manager', 'accountant'));
CREATE POLICY "Owner, manager, accountant can insert utility bills" ON utility_bills FOR INSERT
  WITH CHECK (get_user_role() IN ('owner', 'manager', 'accountant'));
CREATE POLICY "Owner, manager can update utility bills" ON utility_bills FOR UPDATE
  USING (get_user_role() IN ('owner', 'manager'));

-- EMPLOYEES policies
CREATE POLICY "Owner, manager can view employees" ON employees FOR SELECT
  USING (get_user_role() IN ('owner', 'manager'));
CREATE POLICY "Owner, manager can insert employees" ON employees FOR INSERT
  WITH CHECK (get_user_role() IN ('owner', 'manager'));
CREATE POLICY "Owner, manager can update employees" ON employees FOR UPDATE
  USING (get_user_role() IN ('owner', 'manager'));
CREATE POLICY "Owner can delete employees" ON employees FOR DELETE
  USING (get_user_role() = 'owner');

-- EMPLOYEE ADVANCES policies
CREATE POLICY "Owner, manager, accountant can view advances" ON employee_advances FOR SELECT
  USING (get_user_role() IN ('owner', 'manager', 'accountant'));
CREATE POLICY "Owner, manager can insert advances" ON employee_advances FOR INSERT
  WITH CHECK (get_user_role() IN ('owner', 'manager'));
CREATE POLICY "Owner, manager can update advances" ON employee_advances FOR UPDATE
  USING (get_user_role() IN ('owner', 'manager'));

-- SALARY PAYMENTS policies
CREATE POLICY "Owner, accountant can view salary payments" ON salary_payments FOR SELECT
  USING (get_user_role() IN ('owner', 'accountant'));
CREATE POLICY "Owner, accountant can insert salary payments" ON salary_payments FOR INSERT
  WITH CHECK (get_user_role() IN ('owner', 'accountant'));

-- INVENTORY ITEMS policies
CREATE POLICY "Owner, manager, accountant can view inventory" ON inventory_items FOR SELECT
  USING (get_user_role() IN ('owner', 'manager', 'accountant'));
CREATE POLICY "Owner, manager can insert inventory" ON inventory_items FOR INSERT
  WITH CHECK (get_user_role() IN ('owner', 'manager'));
CREATE POLICY "Owner, manager can update inventory" ON inventory_items FOR UPDATE
  USING (get_user_role() IN ('owner', 'manager'));
CREATE POLICY "Owner can delete inventory" ON inventory_items FOR DELETE
  USING (get_user_role() = 'owner');

-- STOCK MOVEMENTS policies
CREATE POLICY "Owner, manager, accountant can view stock movements" ON stock_movements FOR SELECT
  USING (get_user_role() IN ('owner', 'manager', 'accountant'));
CREATE POLICY "Owner, manager can insert stock movements" ON stock_movements FOR INSERT
  WITH CHECK (get_user_role() IN ('owner', 'manager'));

-- AUDIT LOGS policies
CREATE POLICY "Owner and manager can view audit logs" ON audit_logs FOR SELECT
  USING (get_user_role() IN ('owner', 'manager'));
CREATE POLICY "System can insert audit logs" ON audit_logs FOR INSERT
  WITH CHECK (true);

-- ============================================================
-- Grant auth.users to profiles
-- ============================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;