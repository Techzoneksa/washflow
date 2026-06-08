-- ============================================================
-- Wash Flow - Atomic Purchase Creation + Update RPCs
-- Phase 6: Single-transaction purchase operations
-- ============================================================

-- ============================================================
-- 1. create_purchase_with_items RPC
--    Atomically creates a purchase with all items,
--    updates inventory, stock movements, and supplier balance
-- ============================================================
CREATE OR REPLACE FUNCTION create_purchase_with_items(
  p_supplier_id UUID,
  p_supplier_invoice_number TEXT DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_date DATE DEFAULT CURRENT_DATE,
  p_due_date DATE DEFAULT NULL,
  p_subtotal NUMERIC DEFAULT 0,
  p_discount_total NUMERIC DEFAULT 0,
  p_total NUMERIC DEFAULT 0,
  p_payment_status TEXT DEFAULT 'unpaid',
  p_payment_method TEXT DEFAULT NULL,
  p_partial_payment_method TEXT DEFAULT NULL,
  p_remaining_due_date DATE DEFAULT NULL,
  p_paid_amount NUMERIC DEFAULT 0,
  p_remaining_amount NUMERIC DEFAULT 0,
  p_account_id UUID DEFAULT NULL,
  p_attachment_url TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL,
  p_status TEXT DEFAULT 'draft',
  p_items JSONB DEFAULT '[]'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role TEXT;
  v_purchase_id UUID;
  v_purchase_number TEXT;
  v_item JSONB;
  v_inv_item RECORD;
  v_old_qty NUMERIC;
  v_old_avg_cost NUMERIC;
  v_qty_added NUMERIC;
  v_unit_cost NUMERIC;
  v_new_avg_cost NUMERIC;
  v_supplier_balance NUMERIC;
  v_supplier_total NUMERIC;
  v_supplier_count INTEGER;
BEGIN
  -- Verify caller role
  SELECT role INTO v_role FROM profiles WHERE id = auth.uid() AND status = 'active';
  IF v_role IS NULL OR v_role NOT IN ('owner', 'manager', 'accountant') THEN
    RAISE EXCEPTION 'Unauthorized: insufficient permissions';
  END IF;

  -- Verify supplier exists
  IF NOT EXISTS (SELECT 1 FROM suppliers WHERE id = p_supplier_id) THEN
    RAISE EXCEPTION 'Supplier not found';
  END IF;

  -- Generate purchase number
  v_purchase_number := 'PUR-' || LPAD(NEXTVAL('purchase_number_seq')::TEXT, 6, '0');

  -- Insert purchase
  INSERT INTO purchases (
    purchase_number, supplier_id, supplier_invoice_number, description,
    date, due_date, subtotal, discount_total, total,
    payment_status, payment_method, partial_payment_method,
    remaining_due_date, paid_amount, remaining_amount,
    account_id, attachment_url, notes, status, created_by
  ) VALUES (
    v_purchase_number, p_supplier_id, p_supplier_invoice_number, p_description,
    p_date, p_due_date, p_subtotal, p_discount_total, p_total,
    p_payment_status, p_payment_method, p_partial_payment_method,
    p_remaining_due_date, p_paid_amount, p_remaining_amount,
    p_account_id, p_attachment_url, p_notes, p_status, auth.uid()
  )
  RETURNING id INTO v_purchase_id;

  -- Process items
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    INSERT INTO purchase_items (
      purchase_id, inventory_item_id, item_name, description,
      purchase_unit, quantity, conversion_factor, quantity_in_base_unit,
      base_unit, unit_price, discount, total, sort_order
    ) VALUES (
      v_purchase_id,
      (v_item->>'inventory_item_id')::UUID,
      v_item->>'inventory_item_name',
      v_item->>'description',
      v_item->>'purchase_unit',
      COALESCE((v_item->>'quantity')::NUMERIC, 1),
      COALESCE((v_item->>'conversion_factor')::NUMERIC, 1),
      COALESCE((v_item->>'quantity_in_base_unit')::NUMERIC, 0),
      v_item->>'base_unit',
      COALESCE((v_item->>'unit_price')::NUMERIC, 0),
      COALESCE((v_item->>'discount')::NUMERIC, 0),
      COALESCE((v_item->>'total')::NUMERIC, 0),
      COALESCE((v_item->>'sort_order')::INTEGER, 0)
    );

    -- Update inventory if approved
    IF p_status = 'approved' AND (v_item->>'inventory_item_id') IS NOT NULL THEN
      SELECT current_quantity, average_cost
      INTO v_old_qty, v_old_avg_cost
      FROM inventory_items
      WHERE id = (v_item->>'inventory_item_id')::UUID
      FOR UPDATE;

      v_qty_added := COALESCE((v_item->>'quantity_in_base_unit')::NUMERIC, COALESCE((v_item->>'quantity')::NUMERIC, 1));
      v_unit_cost := COALESCE((v_item->>'unit_price')::NUMERIC, 0);

      IF v_old_qty IS NULL THEN
        v_old_qty := 0;
      END IF;
      IF v_old_avg_cost IS NULL THEN
        v_old_avg_cost := 0;
      END IF;

      v_new_avg_cost := CASE
        WHEN (v_old_qty + v_qty_added) > 0
        THEN (v_old_qty * v_old_avg_cost + v_qty_added * v_unit_cost) / (v_old_qty + v_qty_added)
        ELSE v_unit_cost
      END;

      UPDATE inventory_items
      SET current_quantity = current_quantity + v_qty_added,
          average_cost = ROUND(v_new_avg_cost::NUMERIC, 2),
          updated_at = NOW()
      WHERE id = (v_item->>'inventory_item_id')::UUID;

      INSERT INTO stock_movements (
        item_id, type, quantity, unit, reason,
        reference_type, reference_id, created_by
      ) VALUES (
        (v_item->>'inventory_item_id')::UUID,
        'purchase',
        v_qty_added,
        COALESCE(v_item->>'base_unit', v_item->>'purchase_unit', 'قطعة'),
        'فاتورة مشتريات: ' || v_purchase_number || ' - ' || COALESCE(v_item->>'inventory_item_name', ''),
        'purchase',
        v_purchase_id,
        auth.uid()
      );
    END IF;
  END LOOP;

  -- Update supplier totals if approved
  IF p_status = 'approved' THEN
    SELECT balance, total_purchases, invoices_count
    INTO v_supplier_balance, v_supplier_total, v_supplier_count
    FROM suppliers
    WHERE id = p_supplier_id;

    UPDATE suppliers
    SET balance = COALESCE(v_supplier_balance, 0) + COALESCE(p_total, 0) - COALESCE(p_paid_amount, 0),
        total_purchases = COALESCE(v_supplier_total, 0) + COALESCE(p_total, 0),
        invoices_count = COALESCE(v_supplier_count, 0) + 1,
        updated_at = NOW()
    WHERE id = p_supplier_id;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'purchase_id', v_purchase_id,
    'purchase_number', v_purchase_number
  );
END;
$$;
