-- ============================================================
-- Wash Flow - Payment Split Fields + create_pos_order RPC
-- ============================================================

-- ============================================================
-- 1. Add cash_amount and network_amount to orders/invoices
-- ============================================================
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS cash_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS network_amount NUMERIC(12,2) NOT NULL DEFAULT 0;

ALTER TABLE invoices
ADD COLUMN IF NOT EXISTS cash_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS network_amount NUMERIC(12,2) NOT NULL DEFAULT 0;

-- ============================================================
-- 2. Fix payment_method CHECK on orders (remove old methods)
-- ============================================================
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_method_check;
ALTER TABLE orders ADD CONSTRAINT orders_payment_method_check
  CHECK (payment_method IN ('cash', 'network', 'mixed'));

-- ============================================================
-- 3. Add status column to invoices
-- ============================================================
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'completed'
  CHECK (status IN ('completed', 'cancelled', 'refunded'));

-- ============================================================
-- 4. Add cancel/refund metadata columns to orders
-- ============================================================
ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancelled_data JSONB;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS refunded_data JSONB;

-- ============================================================
-- 5. create_pos_order RPC - atomic order + items + invoice
-- ============================================================
CREATE OR REPLACE FUNCTION create_pos_order(
  p_items JSONB,
  p_customer_id UUID,
  p_customer_name TEXT,
  p_customer_phone TEXT,
  p_payment_method TEXT,
  p_cash_amount NUMERIC,
  p_network_amount NUMERIC,
  p_total NUMERIC,
  p_subtotal NUMERIC
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_id UUID;
  v_order_number TEXT;
  v_invoice_number TEXT;
  v_invoice_id UUID;
  v_cashier_name TEXT;
  v_cashier_role TEXT;
  v_item JSONB;
  v_prefix TEXT;
BEGIN
  -- Get cashier info from profile
  SELECT full_name, role INTO v_cashier_name, v_cashier_role
  FROM profiles WHERE id = auth.uid();

  -- Authorisation check
  IF v_cashier_role IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: no active profile found';
  END IF;
  IF v_cashier_role NOT IN ('owner', 'manager', 'cashier') THEN
    RAISE EXCEPTION 'Unauthorized: insufficient permissions';
  END IF;

  -- Get next order number
  v_order_number := get_next_order_number();

  -- Get invoice prefix from company settings
  SELECT COALESCE(invoice_prefix, 'WF') INTO v_prefix
  FROM company_settings LIMIT 1;

  -- Get next invoice number
  v_invoice_number := get_next_invoice_number(v_prefix);

  -- Insert order
  INSERT INTO orders (
    order_number, customer_id, customer_name, customer_phone,
    status, payment_status, subtotal, vat_amount, discount_amount,
    total, payment_method, cash_amount, network_amount, created_by
  ) VALUES (
    v_order_number, p_customer_id, p_customer_name, p_customer_phone,
    'completed', 'paid', p_subtotal, 0, 0,
    p_total, p_payment_method, p_cash_amount, p_network_amount, auth.uid()
  )
  RETURNING id INTO v_order_id;

  -- Insert order items
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    INSERT INTO order_items (
      order_id, service_id, service_name, quantity, unit_price, total
    ) VALUES (
      v_order_id,
      (v_item->>'serviceId')::UUID,
      v_item->>'nameAr',
      (v_item->>'quantity')::INTEGER,
      (v_item->>'price')::NUMERIC,
      (v_item->>'total')::NUMERIC
    );
  END LOOP;

  -- Insert invoice
  INSERT INTO invoices (
    invoice_number, order_id, customer_id, customer_name,
    subtotal, vat_amount, total, payment_method,
    cash_amount, network_amount, status
  ) VALUES (
    v_invoice_number, v_order_id, p_customer_id, p_customer_name,
    p_subtotal, 0, p_total, p_payment_method,
    p_cash_amount, p_network_amount, 'completed'
  )
  RETURNING id INTO v_invoice_id;

  -- Return result
  RETURN jsonb_build_object(
    'order_id', v_order_id,
    'order_number', v_order_number,
    'invoice_id', v_invoice_id,
    'invoice_number', v_invoice_number,
    'cashier_name', v_cashier_name,
    'cashier_role', v_cashier_role
  );
END;
$$;

-- ============================================================
-- 6. cancel_order RPC
-- ============================================================
CREATE OR REPLACE FUNCTION cancel_order(
  p_order_id UUID,
  p_reason TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_number TEXT;
  v_cashier_name TEXT;
  v_role TEXT;
BEGIN
  SELECT role INTO v_role FROM profiles WHERE id = auth.uid();
  IF v_role IS NULL OR v_role NOT IN ('owner', 'manager') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT full_name INTO v_cashier_name FROM profiles WHERE id = auth.uid();

  UPDATE orders
  SET status = 'cancelled',
      cancelled_data = jsonb_build_object(
        'reason', p_reason,
        'cancelled_by', v_cashier_name,
        'cancelled_at', NOW()
      )
  WHERE id = p_order_id AND status = 'completed'
  RETURNING order_number INTO v_order_number;

  IF v_order_number IS NULL THEN
    RAISE EXCEPTION 'Order not found or already cancelled/refunded';
  END IF;

  UPDATE invoices SET status = 'cancelled' WHERE order_id = p_order_id;

  RETURN jsonb_build_object(
    'order_number', v_order_number,
    'cancelled_by', v_cashier_name
  );
END;
$$;

-- ============================================================
-- 7. refund_order RPC
-- ============================================================
CREATE OR REPLACE FUNCTION refund_order(
  p_order_id UUID,
  p_reason TEXT,
  p_amount NUMERIC
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_number TEXT;
  v_order_total NUMERIC;
  v_cashier_name TEXT;
  v_role TEXT;
BEGIN
  SELECT role INTO v_role FROM profiles WHERE id = auth.uid();
  IF v_role IS NULL OR v_role NOT IN ('owner', 'manager') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT full_name INTO v_cashier_name FROM profiles WHERE id = auth.uid();

  SELECT total, order_number INTO v_order_total, v_order_number
  FROM orders
  WHERE id = p_order_id AND status = 'completed';

  IF v_order_number IS NULL THEN
    RAISE EXCEPTION 'Order not found or not completed';
  END IF;

  IF p_amount > v_order_total THEN
    RAISE EXCEPTION 'Refund amount exceeds order total';
  END IF;

  UPDATE orders
  SET status = 'refunded',
      refunded_data = jsonb_build_object(
        'reason', p_reason,
        'refund_amount', p_amount,
        'refunded_by', v_cashier_name,
        'refunded_at', NOW()
      )
  WHERE id = p_order_id;

  UPDATE invoices SET status = 'refunded' WHERE order_id = p_order_id;

  RETURN jsonb_build_object(
    'order_number', v_order_number,
    'refund_amount', p_amount,
    'refunded_by', v_cashier_name
  );
END;
$$;

