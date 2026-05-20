import { create } from 'zustand'
import type { Profile, LoyaltyCardWithBusiness } from '@/types/database'

interface AppState {
  profile: Profile | null
  cards: LoyaltyCardWithBusiness[]
  setProfile: (p: Profile | null) => void
  setCards: (c: LoyaltyCardWithBusiness[]) => void
  updateCardStamps: (cardId: string, stamps: number) => void
}

export const useAppStore = create<AppState>((set) => ({
  profile: null,
  cards: [],
  setProfile: (profile) => set({ profile }),
  setCards: (cards) => set({ cards }),
  updateCardStamps: (cardId, stamps) =>
    set((s) => ({
      cards: s.cards.map((c) => c.id === cardId ? { ...c, current_stamps: stamps } : c),
    })),
}))
