-- Add connected app email and timestamp to public.users
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS connected_app_email text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS connected_app_at timestamptz;
