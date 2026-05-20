export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Views: Record<string, never>
    Tables: {
      profiles: {
        Row: { id: string; phone: string; role: 'customer' | 'merchant'; created_at: string }
        Insert: { id: string; phone: string; role: 'customer' | 'merchant' }
        Update: { phone?: string; role?: 'customer' | 'merchant' }
        Relationships: []
      }
      businesses: {
        Row: { id: string; owner_id: string; name: string; description: string | null; color: string; max_stamps: number; voucher_reward: string; created_at: string }
        Insert: { owner_id: string; name: string; description?: string; color?: string; max_stamps?: number; voucher_reward: string }
        Update: { name?: string; description?: string; color?: string; max_stamps?: number; voucher_reward?: string }
        Relationships: []
      }
      loyalty_cards: {
        Row: { id: string; user_id: string; business_id: string; current_stamps: number; total_redeemed: number; created_at: string }
        Insert: { user_id: string; business_id: string }
        Update: { current_stamps?: number; total_redeemed?: number }
        Relationships: []
      }
      stamp_sessions: {
        Row: { id: string; business_id: string; stamp_count: number; status: 'pending' | 'completed' | 'expired'; created_at: string }
        Insert: { business_id: string; stamp_count: number }
        Update: { status?: 'pending' | 'completed' | 'expired' }
        Relationships: []
      }
      voucher_redemptions: {
        Row: { id: string; loyalty_card_id: string; redeemed_at: string; expires_at: string }
        Insert: { loyalty_card_id: string; expires_at: string }
        Update: Record<string, never>
        Relationships: []
      }
    }
    Functions: {
      redeem_stamp_session: {
        Args: { p_session_id: string; p_loyalty_card_id: string }
        Returns: Json
      }
      redeem_voucher: {
        Args: { p_loyalty_card_id: string }
        Returns: Json
      }
    }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Business = Database['public']['Tables']['businesses']['Row']
export type LoyaltyCard = Database['public']['Tables']['loyalty_cards']['Row']
export type StampSession = Database['public']['Tables']['stamp_sessions']['Row']
export type VoucherRedemption = Database['public']['Tables']['voucher_redemptions']['Row']

export type LoyaltyCardWithBusiness = LoyaltyCard & { businesses: Business }

export interface RedeemStampResult {
  ok: boolean
  error?: string
  new_stamps?: number
  max_stamps?: number
  completed?: boolean
}

export interface RedeemVoucherResult {
  ok: boolean
  error?: string
  expires_at?: string
}
