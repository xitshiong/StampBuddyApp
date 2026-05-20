-- Add voucher_reward to businesses
alter table public.businesses
  add column if not exists voucher_reward text not null default 'Free item';
