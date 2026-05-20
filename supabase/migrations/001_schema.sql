-- Enable UUID extension
create extension if not exists "pgcrypto";

-- profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  phone text unique not null,
  role text not null check (role in ('customer', 'merchant')),
  created_at timestamptz default now()
);

-- businesses
create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete cascade,
  name text not null,
  description text,
  color text default '#6366f1',
  max_stamps integer not null default 8,
  created_at timestamptz default now()
);

-- loyalty_cards
create table public.loyalty_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,
  current_stamps integer not null default 0,
  total_redeemed integer not null default 0,
  created_at timestamptz default now(),
  unique(user_id, business_id)
);

-- stamp_sessions
create table public.stamp_sessions (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  stamp_count integer not null default 1,
  status text not null default 'pending' check (status in ('pending', 'completed', 'expired')),
  created_at timestamptz default now()
);

-- voucher_redemptions (tracks slide-to-redeem events)
create table public.voucher_redemptions (
  id uuid primary key default gen_random_uuid(),
  loyalty_card_id uuid not null references public.loyalty_cards(id) on delete cascade,
  redeemed_at timestamptz default now(),
  expires_at timestamptz not null
);
