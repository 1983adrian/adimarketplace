-- Add translated_content column to messages for storing translations
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS original_language VARCHAR(10);
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS translated_content JSONB DEFAULT '{}';

-- Add preferred_language to profiles if not exists
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(10) DEFAULT 'ro';

-- Add conversation context fields
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS context_type VARCHAR(50) DEFAULT 'product';
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL;
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT false;
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS blocked_by UUID;
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS blocked_at TIMESTAMPTZ;
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS closed_at TIMESTAMPTZ;
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Add admin intervention tracking
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS admin_joined_at TIMESTAMPTZ;
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS admin_id UUID;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_conversations_status ON public.conversations(status);
CREATE INDEX IF NOT EXISTS idx_conversations_context_type ON public.conversations(context_type);
CREATE INDEX IF NOT EXISTS idx_messages_translated ON public.messages USING GIN(translated_content);

-- Update RLS to allow admins to view all conversations
CREATE POLICY "Admins can view all conversations" ON public.conversations
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update all conversations" ON public.conversations
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to view all messages
CREATE POLICY "Admins can view all messages" ON public.messages
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can send messages to any conversation" ON public.messages
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));