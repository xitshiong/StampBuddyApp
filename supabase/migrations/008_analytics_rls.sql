-- Migration 008: Merchant Analytics Support
-- 1. Add campaign_name and branch_name columns to public.voucher_redemptions
ALTER TABLE "public"."voucher_redemptions"
ADD COLUMN IF NOT EXISTS "campaign_name" text DEFAULT 'Free item',
ADD COLUMN IF NOT EXISTS "branch_name" text DEFAULT 'Main Store';

-- 2. Allow merchants to read voucher redemptions belonging to their business
CREATE POLICY "voucher_redemptions_merchant_select" 
ON public.voucher_redemptions
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.loyalty_cards lc
    JOIN public.businesses b ON lc.business_id = b.id
    WHERE lc.id = voucher_redemptions.loyalty_card_id AND b.owner_id = auth.uid()
  )
);

-- 3. Allow merchants to read customer profiles who hold loyalty cards with them
CREATE POLICY "profiles_merchant_select" 
ON public.profiles
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.loyalty_cards lc
    JOIN public.businesses b ON lc.business_id = b.id
    WHERE lc.user_id = profiles.id AND b.owner_id = auth.uid()
  )
);

-- 4. Re-declare redeem_voucher to automatically log campaign name upon redemption
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

  -- Reset stamps, increment redeemed count
  UPDATE loyalty_cards
  SET current_stamps = 0, total_redeemed = total_redeemed + 1
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
    'expires_at', v_expires_at
  );
END;
$$;
