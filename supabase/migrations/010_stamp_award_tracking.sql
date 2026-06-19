-- Migration 010: Track who received stamps and when

ALTER TABLE public.stamp_sessions
  ADD COLUMN IF NOT EXISTS loyalty_card_id uuid REFERENCES public.loyalty_cards(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS redeemed_at timestamptz;

CREATE INDEX IF NOT EXISTS stamp_sessions_redeemed_at_idx
  ON public.stamp_sessions (business_id, redeemed_at DESC)
  WHERE status = 'completed';

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
  SELECT * INTO v_session
  FROM stamp_sessions
  WHERE id = p_session_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'session_not_found');
  END IF;

  IF v_session.status != 'pending' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'session_already_used');
  END IF;

  IF extract(epoch from (now() - v_session.created_at)) > 60 THEN
    UPDATE stamp_sessions SET status = 'expired' WHERE id = p_session_id;
    RETURN jsonb_build_object('ok', false, 'error', 'session_expired');
  END IF;

  SELECT * INTO v_card
  FROM loyalty_cards
  WHERE id = p_loyalty_card_id AND user_id = auth.uid()
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'card_not_found');
  END IF;

  IF v_card.business_id != v_session.business_id THEN
    RETURN jsonb_build_object('ok', false, 'error', 'business_mismatch');
  END IF;

  SELECT * INTO v_business FROM businesses WHERE id = v_card.business_id;

  v_new_stamps := v_card.current_stamps + v_session.stamp_count;

  UPDATE stamp_sessions
  SET
    status = 'completed',
    loyalty_card_id = p_loyalty_card_id,
    redeemed_at = now()
  WHERE id = p_session_id;

  UPDATE loyalty_cards SET current_stamps = v_new_stamps WHERE id = p_loyalty_card_id;

  RETURN jsonb_build_object(
    'ok', true,
    'new_stamps', v_new_stamps,
    'max_stamps', v_business.max_stamps,
    'completed', v_new_stamps >= v_business.max_stamps
  );
END;
$$;
