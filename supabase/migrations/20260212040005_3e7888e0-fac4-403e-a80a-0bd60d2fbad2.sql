-- Enable realtime for notifications table so users receive instant notifications with sounds
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Also enable realtime for messages table (needed for chat sounds)
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Also enable realtime for orders table (needed for order/payout sounds)
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;