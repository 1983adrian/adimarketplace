-- Add 'payment_pending' to order_status enum (needed for PayPal flow)
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'payment_pending' BEFORE 'pending';
