-- Migration 009: Rollover Stamps Support
-- Re-declares public.redeem_stamp_session and public.redeem_voucher to support rollover/overflow of stamps when a card is complete.

-- 1. Update redeem_stamp_session to remove capping and support stamp overflow
CREATE OR REPLACE FUNCTION public.redeem_stamp_session(
  p_session_id uuid,
  p_loyalty_card_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_session stamp_sessions%ROWTYPE;
  v_card loyalty_cards%ROWTYPE;
  v_business businesses%ROWTYPE;
  v_new_stamps integer;
BEGIN
  -- Lock and fetch session
  SELECT * INTO v_session
  FROM stamp_sessions
  WHERE id = p_session_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'session_not_found');
  END IF;

  -- Validate status
  IF v_session.status != 'pending' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'session_already_used');
  END IF;

  -- Validate freshness (60 second window)
  IF extract(epoch from (now() - v_session.created_at)) > 60 THEN
    UPDATE stamp_sessions SET status = 'expired' WHERE id = p_session_id;
    RETURN jsonb_build_object('ok', false, 'error', 'session_expired');
  END IF;

  -- Fetch loyalty card (must belong to calling user)
  SELECT * INTO v_card
  FROM loyalty_cards
  WHERE id = p_loyalty_card_id AND user_id = auth.uid()
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'card_not_found');
  END IF;

  -- Validate card belongs to same business as session
  IF v_card.business_id != v_session.business_id THEN
    RETURN jsonb_build_object('ok', false, 'error', 'business_mismatch');
  END IF;

  -- Fetch business details
  SELECT * INTO v_business FROM businesses WHERE id = v_card.business_id;

  -- Calculate new stamp count (removed least() capping to support stamp overflow)
  v_new_stamps := v_card.current_stamps + v_session.stamp_count;

  -- Atomic update: mark session completed and update stamps count
  UPDATE stamp_sessions SET status = 'completed' WHERE id = p_session_id;
  UPDATE loyalty_cards SET current_stamps = v_new_stamps WHERE id = p_loyalty_card_id;

  RETURN jsonb_build_object(
    'ok', true,
    'new_stamps', v_new_stamps,
    'max_stamps', v_business.max_stamps,
    'completed', v_new_stamps >= v_business.max_stamps
  );
END;
$$;

-- 2. Update redeem_voucher to subtract max_stamps from current_stamps instead of resetting to 0
CREATE OR REPLACE FUNCTION public.redeem_voucher(
  p_loyalty_card_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_card loyalty_cards%ROWTYPE;
  v_business businesses%ROWTYPE;
  v_expires_at timestamptz;
  v_new_stamps integer;
BEGIN
  -- Lock and fetch loyalty card
  SELECT * INTO v_card
  FROM loyalty_cards
  WHERE id = p_loyalty_card_id AND user_id = auth.uid()
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'card_not_found');
  END IF;

  -- Fetch business details
  SELECT * INTO v_business FROM businesses WHERE id = v_card.business_id;

  -- Verify stamps count
  IF v_card.current_stamps < v_business.max_stamps THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_enough_stamps');
  END IF;

  v_expires_at := now() + INTERVAL '5 minutes';
  v_new_stamps := v_card.current_stamps - v_business.max_stamps;

  -- Subtract max_stamps, increment redeemed count
  UPDATE loyalty_cards
  SET current_stamps = v_new_stamps, total_redeemed = total_redeemed + 1
  WHERE id = p_loyalty_card_id;

  -- Record redemption with captured campaign name
  INSERT INTO voucher_redemptions (loyalty_card_id, expires_at, campaign_name, branch_name)
  VALUES (
    p_loyalty_card_id, 
    v_expires_at, 
    COALESCE(v_business.voucher_reward, 'Free item'), 
    'Main Store'
  );

  RETURN jsonb_build_object(
    'ok', true,
    'expires_at', v_expires_at,
    'new_stamps', v_new_stamps
  );
END;
$$;
