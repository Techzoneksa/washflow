-- ============================================================
-- Wash Flow - Service Consumption Recipe System
-- Phase 5: Recipes, stock consumption, and unit conversion
-- ============================================================

-- ============================================================
-- 1. Add unit conversion columns to inventory_items
-- ============================================================
ALTER TABLE inventory_items
  ADD COLUMN IF NOT EXISTS base_unit TEXT,
  ADD COLUMN IF NOT EXISTS purchase_unit TEXT,
  ADD COLUMN IF NOT EXISTS conversion_factor NUMERIC(12,3) NOT NULL DEFAULT 1;

-- Backfill base_unit from existing unit column
UPDATE inventory_items SET base_unit = unit WHERE base_unit IS NULL;

-- ============================================================
-- 2. Update stock_movements type CHECK to include 'reversal'
-- ============================================================
ALTER TABLE stock_movements DROP CONSTRAINT IF EXISTS stock_movements_type_check;
ALTER TABLE stock_movements ADD CONSTRAINT stock_movements_type_check
  CHECK (type IN ('purchase', 'consumption', 'adjustment', 'reversal'));

-- Add UNIQUE constraint to prevent duplicate deductions
ALTER TABLE stock_movements DROP CONSTRAINT IF EXISTS stock_movements_unique;
ALTER TABLE stock_movements ADD CONSTRAINT stock_movements_unique
  UNIQUE (item_id, reference_type, reference_id, type);

-- ============================================================
-- 3. Create service_recipes table
-- ============================================================
CREATE TABLE IF NOT EXISTS service_recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  notes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT service_recipes_service_id_unique UNIQUE (service_id)
);

CREATE TRIGGER update_service_recipes_updated_at
  BEFORE UPDATE ON service_recipes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 4. Create service_recipe_items table
-- ============================================================
CREATE TABLE IF NOT EXISTS service_recipe_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES service_recipes(id) ON DELETE CASCADE,
  inventory_item_id UUID NOT NULL REFERENCES inventory_items(id),
  quantity NUMERIC(12,3) NOT NULL CHECK (quantity > 0),
  unit TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT service_recipe_items_recipe_item_unique UNIQUE (recipe_id, inventory_item_id)
);

CREATE TRIGGER update_service_recipe_items_updated_at
  BEFORE UPDATE ON service_recipe_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 5. RLS on service_recipes
-- ============================================================
ALTER TABLE service_recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner, manager, accountant can view recipes"
  ON service_recipes FOR SELECT
  USING (user_has_role(ARRAY['owner', 'manager', 'accountant']));

CREATE POLICY "Owner and manager can insert recipes"
  ON service_recipes FOR INSERT
  WITH CHECK (user_has_role(ARRAY['owner', 'manager']));

CREATE POLICY "Owner and manager can update recipes"
  ON service_recipes FOR UPDATE
  USING (user_has_role(ARRAY['owner', 'manager']));

CREATE POLICY "Owner and manager can delete recipes"
  ON service_recipes FOR DELETE
  USING (user_has_role(ARRAY['owner', 'manager']));

-- ============================================================
-- 6. RLS on service_recipe_items
-- ============================================================
ALTER TABLE service_recipe_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner, manager, accountant can view recipe items"
  ON service_recipe_items FOR SELECT
  USING (user_has_role(ARRAY['owner', 'manager', 'accountant']));

CREATE POLICY "Owner and manager can insert recipe items"
  ON service_recipe_items FOR INSERT
  WITH CHECK (user_has_role(ARRAY['owner', 'manager']));

CREATE POLICY "Owner and manager can update recipe items"
  ON service_recipe_items FOR UPDATE
  USING (user_has_role(ARRAY['owner', 'manager']));

CREATE POLICY "Owner and manager can delete recipe items"
  ON service_recipe_items FOR DELETE
  USING (user_has_role(ARRAY['owner', 'manager']));

-- ============================================================
-- 7. complete_order_with_consumption RPC
--    Atoms order completion + inventory deduction
-- ============================================================
CREATE OR REPLACE FUNCTION complete_order_with_consumption(
  p_order_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role TEXT;
  v_item RECORD;
  v_order_item RECORD;
  v_recipe RECORD;
  v_recipe_item RECORD;
  v_consumed_qty NUMERIC;
  v_available_qty NUMERIC;
  v_item_name TEXT;
  v_result JSONB;
  v_has_error BOOLEAN DEFAULT false;
  v_error_msg TEXT DEFAULT '';
BEGIN
  -- Verify caller role
  SELECT role INTO v_role FROM profiles WHERE id = auth.uid();
  IF v_role IS NULL OR v_role NOT IN ('owner', 'manager', 'cashier') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Verify order exists and is completed
  IF NOT EXISTS (SELECT 1 FROM orders WHERE id = p_order_id AND status = 'completed') THEN
    RAISE EXCEPTION 'Order not found or not in completed status';
  END IF;

  -- Process each order item
  FOR v_order_item IN
    SELECT oi.id AS order_item_id, oi.service_id, oi.service_name, oi.quantity
    FROM order_items oi
    WHERE oi.order_id = p_order_id
  LOOP
    -- Find active recipe for this service
    SELECT sr.id, sr.status INTO v_recipe
    FROM service_recipes sr
    WHERE sr.service_id = v_order_item.service_id AND sr.status = 'active'
    LIMIT 1;

    -- Skip if no recipe
    IF v_recipe.id IS NULL THEN
      CONTINUE;
    END IF;

    -- Process each recipe item
    FOR v_recipe_item IN
      SELECT sri.inventory_item_id, sri.quantity, sri.unit, ii.name AS item_name, ii.current_quantity
      FROM service_recipe_items sri
      JOIN inventory_items ii ON ii.id = sri.inventory_item_id
      WHERE sri.recipe_id = v_recipe.id
    LOOP
      v_consumed_qty := v_recipe_item.quantity * v_order_item.quantity;
      v_available_qty := v_recipe_item.current_quantity;

      -- Check sufficient stock
      IF v_available_qty < v_consumed_qty THEN
        v_has_error := true;
        v_error_msg := v_recipe_item.item_name || '||' || COALESCE(v_available_qty::TEXT, '0') || '||' || v_consumed_qty::TEXT;
        RAISE EXCEPTION 'Insufficient stock for % (available: %, required: %)',
          v_recipe_item.item_name, v_available_qty, v_consumed_qty;
      END IF;

      -- Insert stock movement (idempotent via UNIQUE constraint)
      INSERT INTO stock_movements (
        item_id, type, quantity, unit, reason,
        reference_type, reference_id, created_by
      ) VALUES (
        v_recipe_item.inventory_item_id, 'consumption', -v_consumed_qty,
        v_recipe_item.unit,
        'استهلاك: ' || v_order_item.service_name || ' (x' || v_order_item.quantity || ')',
        'order_item', v_order_item.order_item_id, auth.uid()
      )
      ON CONFLICT ON CONSTRAINT stock_movements_unique DO NOTHING;

      -- Update inventory quantity (only if movement was inserted)
      IF FOUND THEN
        UPDATE inventory_items
        SET current_quantity = current_quantity - v_consumed_qty,
            updated_at = NOW()
        WHERE id = v_recipe_item.inventory_item_id;
      END IF;
    END LOOP;
  END LOOP;

  RETURN jsonb_build_object('success', true, 'order_id', p_order_id);
END;
$$;

-- ============================================================
-- 8. revert_order_consumption RPC
--    Admin-only reversal when a cancelled order needs inventory restored
-- ============================================================
CREATE OR REPLACE FUNCTION revert_order_consumption(
  p_order_item_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role TEXT;
  v_mov RECORD;
  v_restored_qty NUMERIC;
BEGIN
  -- Verify caller is owner or manager
  SELECT role INTO v_role FROM profiles WHERE id = auth.uid();
  IF v_role IS NULL OR v_role NOT IN ('owner', 'manager') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Find consumption movements for this order_item
  FOR v_mov IN
    SELECT id, item_id, quantity, unit
    FROM stock_movements
    WHERE reference_type = 'order_item'
      AND reference_id = p_order_item_id
      AND type = 'consumption'
  LOOP
    v_restored_qty := ABS(v_mov.quantity);

    -- Insert reversal movement
    INSERT INTO stock_movements (
      item_id, type, quantity, unit, reason,
      reference_type, reference_id, created_by
    ) VALUES (
      v_mov.item_id, 'reversal', v_restored_qty, v_mov.unit,
      'إعادة مخزون: إلغاء طلب',
      'order_item', p_order_item_id, auth.uid()
    );

    -- Restore inventory
    UPDATE inventory_items
    SET current_quantity = current_quantity + v_restored_qty,
        updated_at = NOW()
    WHERE id = v_mov.item_id;
  END LOOP;

  RETURN jsonb_build_object('success', true, 'order_item_id', p_order_item_id);
END;
$$;

-- ============================================================
-- 9. Helper RPC: get_service_recipe (fetches recipe + items)
-- ============================================================
CREATE OR REPLACE FUNCTION get_service_recipe(
  p_service_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_recipe JSONB;
  v_items JSONB;
BEGIN
  -- Get recipe
  SELECT jsonb_build_object(
    'id', sr.id,
    'service_id', sr.service_id,
    'status', sr.status,
    'notes', sr.notes,
    'created_by', sr.created_by,
    'created_at', sr.created_at,
    'updated_at', sr.updated_at
  ) INTO v_recipe
  FROM service_recipes sr
  WHERE sr.service_id = p_service_id;

  -- Get items if recipe exists
  IF v_recipe IS NOT NULL THEN
    SELECT jsonb_agg(
      jsonb_build_object(
        'id', sri.id,
        'recipe_id', sri.recipe_id,
        'inventory_item_id', sri.inventory_item_id,
        'name', ii.name,
        'category', ii.category,
        'quantity', sri.quantity,
        'unit', sri.unit,
        'unit_cost', ii.average_cost,
        'line_cost', sri.quantity * ii.average_cost,
        'current_quantity', ii.current_quantity,
        'status', ii.status,
        'sort_order', sri.sort_order
      ) ORDER BY sri.sort_order
    ) INTO v_items
    FROM service_recipe_items sri
    JOIN inventory_items ii ON ii.id = sri.inventory_item_id
    WHERE sri.recipe_id = (v_recipe->>'id')::UUID;

    v_recipe := v_recipe || jsonb_build_object('items', COALESCE(v_items, '[]'::JSONB));
  END IF;

  RETURN v_recipe;
END;
$$;

-- ============================================================
-- 10. Helper RPC: get_inventory_items_for_recipe
--     Returns active items with current_quantity and average_cost
-- ============================================================
CREATE OR REPLACE FUNCTION get_inventory_items_for_recipe()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', ii.id,
      'name', ii.name,
      'category', ii.category,
      'base_unit', COALESCE(ii.base_unit, ii.unit),
      'current_quantity', ii.current_quantity,
      'average_cost', ii.average_cost,
      'status', ii.status
    ) ORDER BY ii.name
  ) INTO v_result
  FROM inventory_items ii
  WHERE ii.status = 'active';

  RETURN COALESCE(v_result, '[]'::JSONB);
END;
$$;

-- ============================================================
-- 11. Helper RPC: save_service_recipe
--     Atomically saves recipe + items (delete stale, insert new)
--     Enforces max 5 items per recipe
-- ============================================================
CREATE OR REPLACE FUNCTION save_service_recipe(
  p_service_id UUID,
  p_status TEXT,
  p_notes TEXT,
  p_items JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_recipe_id UUID;
  v_role TEXT;
  v_item JSONB;
  v_item_count INTEGER;
BEGIN
  -- Verify caller
  SELECT role INTO v_role FROM profiles WHERE id = auth.uid();
  IF v_role IS NULL OR v_role NOT IN ('owner', 'manager') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Validate items array
  v_item_count := jsonb_array_length(p_items);
  IF v_item_count > 5 THEN
    RAISE EXCEPTION 'Maximum 5 materials per recipe';
  END IF;

  -- Upsert recipe
  INSERT INTO service_recipes (service_id, status, notes, created_by)
  VALUES (p_service_id, p_status, p_notes, auth.uid())
  ON CONFLICT (service_id)
  DO UPDATE SET status = EXCLUDED.status, notes = EXCLUDED.notes, updated_at = NOW()
  RETURNING id INTO v_recipe_id;

  -- Delete removed items
  DELETE FROM service_recipe_items
  WHERE recipe_id = v_recipe_id
    AND inventory_item_id NOT IN (
      SELECT (item->>'inventory_item_id')::UUID
      FROM jsonb_array_elements(p_items) AS item
      WHERE (item->>'inventory_item_id') IS NOT NULL
    );

  -- Upsert items
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    INSERT INTO service_recipe_items (recipe_id, inventory_item_id, quantity, unit, sort_order)
    VALUES (
      v_recipe_id,
      (v_item->>'inventory_item_id')::UUID,
      (v_item->>'quantity')::NUMERIC,
      v_item->>'unit',
      COALESCE((v_item->>'sort_order')::INTEGER, 0)
    )
    ON CONFLICT (recipe_id, inventory_item_id)
    DO UPDATE SET quantity = EXCLUDED.quantity, unit = EXCLUDED.unit,
                  sort_order = EXCLUDED.sort_order, updated_at = NOW();
  END LOOP;

  RETURN jsonb_build_object('success', true, 'recipe_id', v_recipe_id);
END;
$$;

-- ============================================================
-- 12. Helper RPC: get_services_without_recipe
--     Returns services that have no active recipe
-- ============================================================
CREATE OR REPLACE FUNCTION get_services_without_recipe()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', s.id,
      'name_ar', s.name_ar,
      'category', s.category,
      'price', s.price
    ) ORDER BY s.name_ar
  ) INTO v_result
  FROM services s
  WHERE s.is_active = true
    AND NOT EXISTS (
      SELECT 1 FROM service_recipes sr
      WHERE sr.service_id = s.id AND sr.status = 'active'
    );

  RETURN COALESCE(v_result, '[]'::JSONB);
END;
$$;

-- ============================================================
-- 13. Helper RPC: get_dashboard_consumption_stats
--     Returns daily consumption summary for dashboard widgets
-- ============================================================
CREATE OR REPLACE FUNCTION get_dashboard_consumption_stats()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_today_start TIMESTAMPTZ;
  v_month_start TIMESTAMPTZ;
  v_today_qty NUMERIC;
  v_today_cost NUMERIC;
  v_monthly_top JSONB;
  v_no_recipe_count INTEGER;
  v_low_stock_count INTEGER;
  v_today_revenue NUMERIC;
  v_today_orders INTEGER;
  v_today_expenses NUMERIC;
BEGIN
  v_today_start := date_trunc('day', NOW());
  v_month_start := date_trunc('month', NOW());

  -- Today's consumption quantity
  SELECT COALESCE(SUM(ABS(quantity)), 0) INTO v_today_qty
  FROM stock_movements
  WHERE type = 'consumption' AND created_at >= v_today_start;

  -- Today's consumption cost (via average_cost)
  SELECT COALESCE(SUM(ABS(sm.quantity) * ii.average_cost), 0) INTO v_today_cost
  FROM stock_movements sm
  JOIN inventory_items ii ON ii.id = sm.item_id
  WHERE sm.type = 'consumption' AND sm.created_at >= v_today_start;

  -- Top consumed material this month
  SELECT jsonb_build_object(
    'name', ii.name,
    'quantity', sub.qty,
    'unit', sub.unit
  ) INTO v_monthly_top
  FROM (
    SELECT sm.item_id, SUM(ABS(sm.quantity)) AS qty, MAX(sm.unit) AS unit
    FROM stock_movements sm
    WHERE sm.type = 'consumption' AND sm.created_at >= v_month_start
    GROUP BY sm.item_id
    ORDER BY qty DESC
    LIMIT 1
  ) sub
  JOIN inventory_items ii ON ii.id = sub.item_id;

  -- Services without active recipe
  SELECT COUNT(*) INTO v_no_recipe_count
  FROM services s
  WHERE s.is_active = true
    AND NOT EXISTS (
      SELECT 1 FROM service_recipes sr
      WHERE sr.service_id = s.id AND sr.status = 'active'
    );

  -- Low stock materials (current <= minimum)
  SELECT COUNT(*) INTO v_low_stock_count
  FROM inventory_items
  WHERE status = 'active'
    AND current_quantity > 0
    AND current_quantity <= minimum_quantity;

  -- Today's revenue
  SELECT COALESCE(SUM(total), 0) INTO v_today_revenue
  FROM orders
  WHERE status = 'completed' AND created_at >= v_today_start;

  -- Today's orders count
  SELECT COUNT(*) INTO v_today_orders
  FROM orders
  WHERE created_at >= v_today_start;

  -- Today's expenses
  SELECT COALESCE(SUM(total), 0) INTO v_today_expenses
  FROM expenses
  WHERE created_at >= v_today_start;

  RETURN jsonb_build_object(
    'today_consumption_qty', v_today_qty,
    'today_consumption_cost', v_today_cost,
    'top_consumed_material', v_monthly_top,
    'services_without_recipe', v_no_recipe_count,
    'low_stock_materials', v_low_stock_count,
    'today_revenue', v_today_revenue,
    'today_orders', v_today_orders,
    'today_expenses', v_today_expenses
  );
END;
$$;
