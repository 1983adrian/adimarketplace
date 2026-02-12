-- Enable realtime for returns and disputes tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.returns;
ALTER PUBLICATION supabase_realtime ADD TABLE public.disputes;