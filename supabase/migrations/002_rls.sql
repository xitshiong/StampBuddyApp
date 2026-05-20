-- RLS: profiles
alter table public.profiles enable row level security;
create policy "profiles_self" on public.profiles
  for all using (auth.uid() = id);

-- RLS: businesses
alter table public.businesses enable row level security;
create policy "businesses_read_all" on public.businesses
  for select using (true);
create policy "businesses_owner_write" on public.businesses
  for all using (auth.uid() = owner_id);

-- RLS: loyalty_cards
alter table public.loyalty_cards enable row level security;
create policy "loyalty_cards_owner" on public.loyalty_cards
  for all using (auth.uid() = user_id);
create policy "loyalty_cards_merchant_read" on public.loyalty_cards
  for select using (
    exists (
      select 1 from public.businesses b
      where b.id = loyalty_cards.business_id and b.owner_id = auth.uid()
    )
  );

-- RLS: stamp_sessions
alter table public.stamp_sessions enable row level security;
create policy "stamp_sessions_merchant_insert" on public.stamp_sessions
  for insert with check (
    exists (
      select 1 from public.businesses b
      where b.id = stamp_sessions.business_id and b.owner_id = auth.uid()
    )
  );
create policy "stamp_sessions_merchant_read" on public.stamp_sessions
  for select using (
    exists (
      select 1 from public.businesses b
      where b.id = stamp_sessions.business_id and b.owner_id = auth.uid()
    )
  );
-- Customers can read pending sessions to validate scan
create policy "stamp_sessions_customer_read" on public.stamp_sessions
  for select using (status = 'pending');

-- RLS: voucher_redemptions
alter table public.voucher_redemptions enable row level security;
create policy "voucher_redemptions_owner" on public.voucher_redemptions
  for all using (
    exists (
      select 1 from public.loyalty_cards lc
      where lc.id = voucher_redemptions.loyalty_card_id and lc.user_id = auth.uid()
    )
  );
