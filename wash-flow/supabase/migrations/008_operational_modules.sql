-- Migration 008: Operational Modules
-- Expenses, Utility Bills, Suppliers, Inventory, Waste, Adjustments
-- Self-contained: CREATE TABLE IF NOT EXISTS for all tables
-- Column names match src/lib/data/*.ts data layer mappings

-- ──────────────────────────────────────────────────────────────────
-- Helper: update_updated_at() if not exists
-- ──────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ──────────────────────────────────────────────────────────────────
-- Sequences for auto-numbering
-- ──────────────────────────────────────────────────────────────────
CREATE SEQUENCE IF NOT EXISTS expense_number_seq START 1;

CREATE SEQUENCE IF NOT EXISTS utility_bill_number_seq START 1;

-- ──────────────────────────────────────────────────────────────────
-- A. suppliers
-- ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS suppliers (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name              TEXT NOT NULL,
  phone             TEXT,
  representative_name TEXT,
  vat_number        TEXT,
  cr_number         TEXT,
  email             TEXT,
  address           TEXT,
  balance           NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_purchases   NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_paid        NUMERIC(12,2) NOT NULL DEFAULT 0,
  invoices_count    INTEGER NOT NULL DEFAULT 0,
  status            TEXT NOT NULL DEFAULT 'active',
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT suppliers_status_check CHECK (status IN ('active', 'inactive'))
);

DROP TRIGGER IF EXISTS update_suppliers_updated_at ON suppliers;
CREATE TRIGGER update_suppliers_updated_at
  BEFORE UPDATE ON suppliers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ──────────────────────────────────────────────────────────────────
-- B. expenses
-- ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS expenses (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  expense_number  TEXT NOT NULL UNIQUE DEFAULT 'EXP-' || LPAD(NEXTVAL('expense_number_seq')::TEXT, 3, '0'),
  type            TEXT NOT NULL,
  title           TEXT NOT NULL,
  description     TEXT,
  amount          NUMERIC(12,2) NOT NULL DEFAULT 0,
  vat_amount      NUMERIC(12,2) NOT NULL DEFAULT 0,
  total           NUMERIC(12,2) NOT NULL DEFAULT 0,
  payment_method  TEXT,
  account_name    TEXT,
  date            DATE NOT NULL DEFAULT CURRENT_DATE,
  attachment_url  TEXT,
  notes           TEXT,
  created_by      UUID REFERENCES profiles(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT expenses_amount_check CHECK (amount >= 0),
  CONSTRAINT expenses_total_check CHECK (total >= 0)
);

DROP TRIGGER IF EXISTS update_expenses_updated_at ON expenses;
CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON expenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_type ON expenses(type);

-- ──────────────────────────────────────────────────────────────────
-- C. utility_bills
-- ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS utility_bills (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bill_number             TEXT NOT NULL UNIQUE DEFAULT 'UB-' || LPAD(NEXTVAL('utility_bill_number_seq')::TEXT, 3, '0'),
  type                    TEXT NOT NULL,
  provider                TEXT NOT NULL,
  provider_account_number TEXT,
  issue_date              DATE NOT NULL,
  due_date                DATE NOT NULL,
  amount                  NUMERIC(12,2) NOT NULL DEFAULT 0,
  vat_amount              NUMERIC(12,2) NOT NULL DEFAULT 0,
  total                   NUMERIC(12,2) NOT NULL DEFAULT 0,
  status                  TEXT NOT NULL DEFAULT 'unpaid',
  payment_method          TEXT,
  paid_at                 TIMESTAMPTZ,
  attachment_url          TEXT,
  notes                   TEXT,
  created_by              UUID REFERENCES profiles(id),
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT utility_bills_amount_check CHECK (amount >= 0),
  CONSTRAINT utility_bills_total_check CHECK (total >= 0),
  CONSTRAINT utility_bills_status_check CHECK (status IN ('paid', 'unpaid', 'overdue', 'partial'))
);

DROP TRIGGER IF EXISTS update_utility_bills_updated_at ON utility_bills;
CREATE TRIGGER update_utility_bills_updated_at
  BEFORE UPDATE ON utility_bills
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS idx_utility_bills_status ON utility_bills(status);
CREATE INDEX IF NOT EXISTS idx_utility_bills_due_date ON utility_bills(due_date);

-- ──────────────────────────────────────────────────────────────────
-- D. inventory_items
-- ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS inventory_items (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name              TEXT NOT NULL,
  category          TEXT NOT NULL,
  unit              TEXT NOT NULL DEFAULT 'قطعة',
  base_unit         TEXT,
  purchase_unit     TEXT,
  conversion_factor NUMERIC(12,3) NOT NULL DEFAULT 1,
  current_quantity  NUMERIC(10,2) NOT NULL DEFAULT 0,
  minimum_quantity  NUMERIC(10,2) NOT NULL DEFAULT 0,
  average_cost      NUMERIC(10,2) NOT NULL DEFAULT 0,
  supplier_id       UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  status            TEXT NOT NULL DEFAULT 'active',
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT inventory_status_check CHECK (status IN ('active', 'inactive', 'discontinued')),
  CONSTRAINT inventory_quantity_check CHECK (current_quantity >= 0),
  CONSTRAINT inventory_min_qty_check CHECK (minimum_quantity >= 0),
  CONSTRAINT inventory_cost_check CHECK (average_cost >= 0),
  CONSTRAINT inventory_conversion_check CHECK (conversion_factor > 0)
);

DROP TRIGGER IF EXISTS update_inventory_items_updated_at ON inventory_items;
CREATE TRIGGER update_inventory_items_updated_at
  BEFORE UPDATE ON inventory_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS idx_inventory_items_category ON inventory_items(category);

-- ──────────────────────────────────────────────────────────────────
-- E. stock_movements
-- ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS stock_movements (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id        UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  type           TEXT NOT NULL,
  quantity       NUMERIC(10,2) NOT NULL,
  unit           TEXT DEFAULT 'قطعة',
  reason         TEXT,
  reference_type TEXT,
  reference_id   UUID,
  created_by     UUID REFERENCES profiles(id),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT stock_movements_type_check CHECK (
    type IN ('purchase', 'consumption', 'waste', 'adjustment', 'return', 'reversal')
  ),
  CONSTRAINT stock_movements_unique UNIQUE (item_id, reference_type, reference_id, type)
);

CREATE INDEX IF NOT EXISTS idx_stock_movements_item ON stock_movements(item_id);

-- ──────────────────────────────────────────────────────────────────
-- F. waste_entries (NEW)
-- ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS waste_entries (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id    UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  quantity   NUMERIC(10,2) NOT NULL,
  unit       TEXT NOT NULL DEFAULT 'قطعة',
  reason     TEXT NOT NULL,
  date       DATE NOT NULL DEFAULT CURRENT_DATE,
  notes      TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT waste_quantity_check CHECK (quantity > 0)
);

-- ──────────────────────────────────────────────────────────────────
-- G. stock_adjustments (NEW)
-- ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS stock_adjustments (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id         UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  system_quantity NUMERIC(10,2) NOT NULL,
  actual_quantity NUMERIC(10,2) NOT NULL,
  difference      NUMERIC(10,2) NOT NULL,
  reason          TEXT NOT NULL,
  date            DATE NOT NULL DEFAULT CURRENT_DATE,
  notes           TEXT,
  created_by      UUID REFERENCES profiles(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT adjustment_after_check CHECK (actual_quantity >= 0)
);

-- ──────────────────────────────────────────────────────────────────
-- RPC: create_waste_entry
-- Atomic: insert waste_entry + stock_movement + update inventory quantity
-- ──────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION create_waste_entry(
  p_item_id    UUID,
  p_quantity   NUMERIC,
  p_unit       TEXT,
  p_reason     TEXT,
  p_date       DATE,
  p_notes      TEXT DEFAULT NULL,
  p_created_by UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_current_qty NUMERIC;
  v_waste_id    UUID;
  v_count       INTEGER;
BEGIN
  -- Lock the inventory item row to prevent race conditions
  SELECT current_quantity INTO v_current_qty
  FROM inventory_items
  WHERE id = p_item_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Item not found');
  END IF;

  IF v_current_qty < p_quantity THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient stock');
  END IF;

  -- Insert waste entry
  INSERT INTO waste_entries (item_id, quantity, unit, reason, date, notes, created_by)
  VALUES (p_item_id, p_quantity, p_unit, p_reason, p_date, p_notes, p_created_by)
  RETURNING id INTO v_waste_id;

  -- Insert stock movement (waste type)
  INSERT INTO stock_movements (item_id, type, quantity, unit, reason, reference_type, reference_id, created_by)
  VALUES (p_item_id, 'waste', p_quantity, p_unit, p_reason, 'waste', v_waste_id, p_created_by);

  -- Decrease inventory quantity
  UPDATE inventory_items
  SET current_quantity = GREATEST(0, current_quantity - p_quantity),
      updated_at = NOW()
  WHERE id = p_item_id;

  RETURN jsonb_build_object('success', true, 'waste_id', v_waste_id);
END;
$$;

REVOKE ALL ON FUNCTION create_waste_entry FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION create_waste_entry TO authenticated;

-- ──────────────────────────────────────────────────────────────────
-- RPC: create_stock_adjustment
-- Atomic: insert stock_adjustment + stock_movement + update inventory
-- ──────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION create_stock_adjustment(
  p_item_id         UUID,
  p_system_quantity NUMERIC,
  p_actual_quantity NUMERIC,
  p_reason          TEXT,
  p_date            DATE,
  p_notes           TEXT DEFAULT NULL,
  p_created_by      UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_diff      NUMERIC;
  v_adj_id    UUID;
  v_mvt_type  TEXT;
BEGIN
  -- Lock row
  PERFORM current_quantity FROM inventory_items WHERE id = p_item_id FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Item not found');
  END IF;

  v_diff := p_actual_quantity - p_system_quantity;
  v_mvt_type := CASE
    WHEN v_diff > 0 THEN 'adjustment'
    WHEN v_diff < 0 THEN 'adjustment'
    ELSE 'adjustment'
  END;

  -- Insert stock adjustment record
  INSERT INTO stock_adjustments (item_id, system_quantity, actual_quantity, difference, reason, date, notes, created_by)
  VALUES (p_item_id, p_system_quantity, p_actual_quantity, v_diff, p_reason, p_date, p_notes, p_created_by)
  RETURNING id INTO v_adj_id;

  -- Insert stock movement
  INSERT INTO stock_movements (item_id, type, quantity, unit, reason, reference_type, reference_id, created_by)
  VALUES (p_item_id, v_mvt_type, ABS(v_diff), '', p_reason, 'adjustment', v_adj_id, p_created_by);

  -- Set inventory to actual quantity
  UPDATE inventory_items
  SET current_quantity = GREATEST(0, p_actual_quantity),
      updated_at = NOW()
  WHERE id = p_item_id;

  RETURN jsonb_build_object('success', true, 'adjustment_id', v_adj_id, 'difference', v_diff);
END;
$$;

REVOKE ALL ON FUNCTION create_stock_adjustment FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION create_stock_adjustment TO authenticated;

-- ──────────────────────────────────────────────────────────────────
-- RPC: record_utility_bill_payment
-- Updates bill with payment info
-- ──────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION record_utility_bill_payment(
  p_bill_id        UUID,
  p_payment_method TEXT,
  p_paid_at        TIMESTAMPTZ,
  p_notes          TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_bill_total NUMERIC;
BEGIN
  SELECT total INTO v_bill_total
  FROM utility_bills WHERE id = p_bill_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Bill not found');
  END IF;

  UPDATE utility_bills
  SET status = 'paid',
      payment_method = p_payment_method,
      paid_at = p_paid_at,
      notes = COALESCE(p_notes, notes),
      updated_at = NOW()
  WHERE id = p_bill_id;

  RETURN jsonb_build_object('success', true);
END;
$$;

REVOKE ALL ON FUNCTION record_utility_bill_payment FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION record_utility_bill_payment TO authenticated;

-- ──────────────────────────────────────────────────────────────────
-- RLS: Enable row-level security on all tables
-- ──────────────────────────────────────────────────────────────────
ALTER TABLE IF EXISTS expenses       ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS utility_bills  ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS suppliers      ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS waste_entries   ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS stock_adjustments ENABLE ROW LEVEL SECURITY;

-- ──────────────────────────────────────────────────────────────────
-- RLS Policies: expenses
-- Owner/Manager/Accountant: SELECT, INSERT
-- Owner/Manager: UPDATE
-- ──────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS expenses_select ON expenses;
CREATE POLICY expenses_select ON expenses
  FOR SELECT USING (user_has_role(ARRAY['owner', 'manager', 'accountant']));

DROP POLICY IF EXISTS expenses_insert ON expenses;
CREATE POLICY expenses_insert ON expenses
  FOR INSERT WITH CHECK (user_has_role(ARRAY['owner', 'manager', 'accountant']));

DROP POLICY IF EXISTS expenses_update ON expenses;
CREATE POLICY expenses_update ON expenses
  FOR UPDATE USING (user_has_role(ARRAY['owner', 'manager']));

-- ──────────────────────────────────────────────────────────────────
-- RLS Policies: utility_bills
-- Owner/Manager/Accountant: SELECT, INSERT
-- Owner/Manager: UPDATE
-- ──────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS utility_bills_select ON utility_bills;
CREATE POLICY utility_bills_select ON utility_bills
  FOR SELECT USING (user_has_role(ARRAY['owner', 'manager', 'accountant']));

DROP POLICY IF EXISTS utility_bills_insert ON utility_bills;
CREATE POLICY utility_bills_insert ON utility_bills
  FOR INSERT WITH CHECK (user_has_role(ARRAY['owner', 'manager', 'accountant']));

DROP POLICY IF EXISTS utility_bills_update ON utility_bills;
CREATE POLICY utility_bills_update ON utility_bills
  FOR UPDATE USING (user_has_role(ARRAY['owner', 'manager']));

-- ──────────────────────────────────────────────────────────────────
-- RLS Policies: suppliers
-- Owner/Manager/Accountant: SELECT
-- Owner/Manager: INSERT, UPDATE
-- Owner: DELETE
-- ──────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS suppliers_select ON suppliers;
CREATE POLICY suppliers_select ON suppliers
  FOR SELECT USING (user_has_role(ARRAY['owner', 'manager', 'accountant']));

DROP POLICY IF EXISTS suppliers_insert ON suppliers;
CREATE POLICY suppliers_insert ON suppliers
  FOR INSERT WITH CHECK (user_has_role(ARRAY['owner', 'manager']));

DROP POLICY IF EXISTS suppliers_update ON suppliers;
CREATE POLICY suppliers_update ON suppliers
  FOR UPDATE USING (user_has_role(ARRAY['owner', 'manager']));

DROP POLICY IF EXISTS suppliers_delete ON suppliers;
CREATE POLICY suppliers_delete ON suppliers
  FOR DELETE USING (user_has_role(ARRAY['owner']));

-- ──────────────────────────────────────────────────────────────────
-- RLS Policies: inventory_items
-- Owner/Manager/Accountant: SELECT
-- Owner/Manager: INSERT, UPDATE
-- Owner: DELETE
-- ──────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS inventory_items_select ON inventory_items;
CREATE POLICY inventory_items_select ON inventory_items
  FOR SELECT USING (user_has_role(ARRAY['owner', 'manager', 'accountant']));

DROP POLICY IF EXISTS inventory_items_insert ON inventory_items;
CREATE POLICY inventory_items_insert ON inventory_items
  FOR INSERT WITH CHECK (user_has_role(ARRAY['owner', 'manager']));

DROP POLICY IF EXISTS inventory_items_update ON inventory_items;
CREATE POLICY inventory_items_update ON inventory_items
  FOR UPDATE USING (user_has_role(ARRAY['owner', 'manager']));

DROP POLICY IF EXISTS inventory_items_delete ON inventory_items;
CREATE POLICY inventory_items_delete ON inventory_items
  FOR DELETE USING (user_has_role(ARRAY['owner']));

-- ──────────────────────────────────────────────────────────────────
-- RLS Policies: stock_movements
-- Owner/Manager/Accountant: SELECT
-- Owner/Manager: INSERT
-- ──────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS stock_movements_select ON stock_movements;
CREATE POLICY stock_movements_select ON stock_movements
  FOR SELECT USING (user_has_role(ARRAY['owner', 'manager', 'accountant']));

DROP POLICY IF EXISTS stock_movements_insert ON stock_movements;
CREATE POLICY stock_movements_insert ON stock_movements
  FOR INSERT WITH CHECK (user_has_role(ARRAY['owner', 'manager']));

-- ──────────────────────────────────────────────────────────────────
-- RLS Policies: waste_entries (NEW)
-- Owner/Manager/Accountant: SELECT
-- Owner/Manager: INSERT (via RPC or direct)
-- ──────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS waste_entries_select ON waste_entries;
CREATE POLICY waste_entries_select ON waste_entries
  FOR SELECT USING (user_has_role(ARRAY['owner', 'manager', 'accountant']));

DROP POLICY IF EXISTS waste_entries_insert ON waste_entries;
CREATE POLICY waste_entries_insert ON waste_entries
  FOR INSERT WITH CHECK (user_has_role(ARRAY['owner', 'manager']));

-- ──────────────────────────────────────────────────────────────────
-- RLS Policies: stock_adjustments (NEW)
-- Owner/Manager/Accountant: SELECT
-- Owner/Manager: INSERT (via RPC or direct)
-- ──────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS stock_adjustments_select ON stock_adjustments;
CREATE POLICY stock_adjustments_select ON stock_adjustments
  FOR SELECT USING (user_has_role(ARRAY['owner', 'manager', 'accountant']));

DROP POLICY IF EXISTS stock_adjustments_insert ON stock_adjustments;
CREATE POLICY stock_adjustments_insert ON stock_adjustments
  FOR INSERT WITH CHECK (user_has_role(ARRAY['owner', 'manager']));
