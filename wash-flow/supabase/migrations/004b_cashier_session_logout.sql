-- ============================================================
-- Wash Flow - Revoke Cashier Session (Logout)
-- Standalone RPC: token-based session deletion
-- ============================================================

CREATE OR REPLACE FUNCTION revoke_cashier_session(
  p_token TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM cashier_sessions WHERE token = p_token;
  RETURN jsonb_build_object('success', true);
END;
$$;
