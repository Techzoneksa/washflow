-- ============================================================
-- Wash Flow - Payment Split Fields Migration
-- Phase 3: Add cash_amount and network_amount to orders/invoices
-- ============================================================

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS cash_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS network_amount NUMERIC(12,2) NOT NULL DEFAULT 0;

ALTER TABLE invoices
ADD COLUMN IF NOT EXISTS cash_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS network_amount NUMERIC(12,2) NOT NULL DEFAULT 0;
