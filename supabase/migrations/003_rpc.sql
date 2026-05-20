-- Atomic stamp redemption RPC
-- Validates session freshness + pending status, increments stamps, marks session completed
create or replace function public.redeem_stamp_session(
  p_session_id uuid,
  p_loyalty_card_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_session stamp_sessions%rowtype;
  v_card loyalty_cards%rowtype;
  v_business businesses%rowtype;
  v_new_stamps integer;
begin
  -- Lock and fetch session
  select * into v_session
  from stamp_sessions
  where id = p_session_id
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'session_not_found');
  end if;

  -- Validate status
  if v_session.status != 'pending' then
    return jsonb_build_object('ok', false, 'error', 'session_already_used');
  end if;

  -- Validate freshness (60 second window)
  if extract(epoch from (now() - v_session.created_at)) > 60 then
    update stamp_sessions set status = 'expired' where id = p_session_id;
    return jsonb_build_object('ok', false, 'error', 'session_expired');
  end if;

  -- Fetch loyalty card (must belong to calling user)
  select * into v_card
  from loyalty_cards
  where id = p_loyalty_card_id and user_id = auth.uid()
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'card_not_found');
  end if;

  -- Validate card belongs to same business as session
  if v_card.business_id != v_session.business_id then
    return jsonb_build_object('ok', false, 'error', 'business_mismatch');
  end if;

  -- Fetch business for max_stamps
  select * into v_business from businesses where id = v_card.business_id;

  -- Calculate new stamp count (cap at max_stamps)
  v_new_stamps := least(v_card.current_stamps + v_session.stamp_count, v_business.max_stamps);

  -- Atomic update: mark session completed + increment stamps
  update stamp_sessions set status = 'completed' where id = p_session_id;
  update loyalty_cards set current_stamps = v_new_stamps where id = p_loyalty_card_id;

  return jsonb_build_object(
    'ok', true,
    'new_stamps', v_new_stamps,
    'max_stamps', v_business.max_stamps,
    'completed', v_new_stamps >= v_business.max_stamps
  );
end;
$$;

-- Voucher redeem RPC: resets stamps, records redemption with 5-min expiry
create or replace function public.redeem_voucher(
  p_loyalty_card_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_card loyalty_cards%rowtype;
  v_business businesses%rowtype;
  v_expires_at timestamptz;
begin
  select * into v_card
  from loyalty_cards
  where id = p_loyalty_card_id and user_id = auth.uid()
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'card_not_found');
  end if;

  select * into v_business from businesses where id = v_card.business_id;

  if v_card.current_stamps < v_business.max_stamps then
    return jsonb_build_object('ok', false, 'error', 'not_enough_stamps');
  end if;

  v_expires_at := now() + interval '5 minutes';

  -- Reset stamps, increment redeemed count
  update loyalty_cards
  set current_stamps = 0, total_redeemed = total_redeemed + 1
  where id = p_loyalty_card_id;

  -- Record redemption
  insert into voucher_redemptions (loyalty_card_id, expires_at)
  values (p_loyalty_card_id, v_expires_at);

  return jsonb_build_object(
    'ok', true,
    'expires_at', v_expires_at
  );
end;
$$;

-- Auto-expire stale pending sessions (run via pg_cron or edge function)
create or replace function public.expire_stale_sessions()
returns void
language sql
security definer
as $$
  update stamp_sessions
  set status = 'expired'
  where status = 'pending'
    and extract(epoch from (now() - created_at)) > 60;
$$;
