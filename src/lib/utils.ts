export const CARD_COLORS = [
  { bg: 'oklch(0.26 0.08 55)',  accent: 'oklch(0.76 0.14 78)'  },  // Amber
  { bg: 'oklch(0.24 0.07 15)',  accent: 'oklch(0.70 0.17 15)'  },  // Rose
  { bg: 'oklch(0.22 0.07 155)', accent: 'oklch(0.66 0.16 155)' },  // Emerald
  { bg: 'oklch(0.22 0.08 260)', accent: 'oklch(0.65 0.18 260)' },  // Indigo
  { bg: 'oklch(0.22 0.08 300)', accent: 'oklch(0.65 0.17 300)' },  // Violet
  { bg: 'oklch(0.22 0.07 210)', accent: 'oklch(0.68 0.15 210)' },  // Cyan
]

export function getCardColor(hex: string) {
  const map: Record<string, (typeof CARD_COLORS)[0]> = {
    '#6366f1': CARD_COLORS[3],  // Indigo
    '#f97316': CARD_COLORS[0],  // Amber (was orange)
    '#22c55e': CARD_COLORS[2],  // Emerald
    '#a855f7': CARD_COLORS[4],  // Violet
    '#06b6d4': CARD_COLORS[5],  // Cyan
  }
  return map[hex] ?? CARD_COLORS[0]
}
