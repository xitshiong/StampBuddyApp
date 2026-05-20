# StampBuddy — Developer Handoff

Digital loyalty wallet PWA. Customers collect stamps at cafes via QR codes. Merchants generate one-time QR sessions. Built with Next.js 15 + Supabase.

---

## Stack

- **Frontend**: Next.js 15 (App Router), React, TypeScript, Framer Motion, Lucide React
- **Backend**: Supabase (PostgreSQL, Auth, RLS, RPC functions)
- **Auth**: Google OAuth (Supabase provider)
- **Styling**: Inline styles + CSS custom properties (no Tailwind classes used at runtime)
- **State**: Zustand (`src/store/app.ts`)
- **PWA**: `manifest.json` + apple-web-app meta

---

## Running locally

```bash
npm run dev   # includes NODE_OPTIONS fix for Node v25 localStorage bug
```

> **Node v25 quirk**: Node v25 exposes a broken `localStorage` global. The `dev` script in `package.json` sets `NODE_OPTIONS='--localstorage-file=/tmp/sb-ls.json'` to fix it. Do not remove this.

App runs at **http://localhost:3000**

---

## Environment

Create `.env.local` (already filled in):

```
NEXT_PUBLIC_SUPABASE_URL=https://uwvikjekkacjtwolyxzx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

---

## Supabase setup

All migrations are in `supabase/migrations/`. Run them in order in the SQL Editor:

| File | What it does |
|------|-------------|
| `001_schema.sql` | All tables: profiles, businesses, loyalty_cards, stamp_sessions, voucher_redemptions |
| `002_rls.sql` | Row Level Security policies for all tables |
| `003_rpc.sql` | `redeem_stamp_session()` and `redeem_voucher()` atomic RPC functions |
| `004_voucher_reward.sql` | Adds `voucher_reward` column to businesses |

**Auth**: Google OAuth enabled in Supabase → Authentication → Providers → Google.

---

## File structure

```
src/
├── app/
│   ├── page.tsx                    ← Landing page (needs redesign — see TODO)
│   ├── auth/
│   │   ├── page.tsx                ← Google sign-in screen
│   │   ├── callback/route.ts       ← OAuth callback, routes by role
│   │   └── role/page.tsx           ← New user role selection (customer/merchant)
│   ├── customer/
│   │   ├── layout.tsx              ← Tab bar (Wallet / Explore)
│   │   ├── page.tsx                ← Wallet home — stacked loyalty cards
│   │   └── search/page.tsx         ← Search + follow businesses
│   └── merchant/
│       ├── layout.tsx
│       ├── page.tsx                ← Numpad + QR generator dashboard
│       └── onboarding/page.tsx     ← Business setup form (new merchants)
├── components/
│   ├── auth/
│   │   └── GoogleAuth.tsx          ← Google OAuth button
│   ├── merchant/
│   │   └── NumPad.tsx              ← Stamp count numpad
│   ├── ui/
│   │   └── Logo.tsx                ← SVG logo (stamp ring + coffee cup)
│   └── wallet/
│       ├── WalletCard.tsx          ← Apple Wallet-style card (expandable)
│       ├── StampGrid.tsx           ← Stamp dot grid
│       ├── VoucherCard.tsx         ← Slide-to-redeem + 5min countdown
│       └── QRScanner.tsx           ← html5-qrcode camera scanner
├── lib/
│   ├── supabase/
│   │   ├── client.ts               ← Browser Supabase client (safe storage shim)
│   │   ├── server.ts               ← Server Supabase client (cookies)
│   │   └── middleware.ts           ← Session refresh + route protection
│   └── utils.ts                    ← getCardColor(), CARD_COLORS
├── store/app.ts                    ← Zustand store (profile, cards)
├── styles/globals.css              ← CSS custom properties, keyframes
├── types/database.ts               ← Full TypeScript types for all tables
└── middleware.ts                   ← Next.js middleware entry
```

---

## Design system

**Palette** — "Midnight Espresso" (warm dark, not cold blue-black):

```css
--bg-base:      oklch(0.09 0.012 55)   /* near-black, warm */
--bg-surface:   oklch(0.13 0.012 55)
--bg-elevated:  oklch(0.17 0.013 55)
--accent:       oklch(0.76 0.14 78)    /* amber — main CTA color */
--accent-text:  oklch(0.18 0.03 55)    /* dark text on amber buttons */
--text-primary: oklch(0.95 0.012 65)
--text-secondary: oklch(0.63 0.022 65)
--text-muted:   oklch(0.40 0.016 65)
```

**Fonts** — Fraunces (display serif, loaded in layout.tsx) + DM Sans (body). Defined as `--font-display` and `--font-body`.

**Card colors** — 6 presets in `src/lib/utils.ts` (`CARD_COLORS`). Mapped from hex DB values via `getCardColor()`.

---

## User flows

### New customer
1. `/` → click "Get started" → `/auth`
2. Google OAuth → `/auth/callback` → `/auth/role`
3. Select "Customer" → `/customer` (wallet home, empty)
4. `/customer/search` → search cafe → Follow → card appears in wallet
5. Tap card → "Scan QR to Stamp" → scan merchant QR → stamps added

### New merchant
1. `/` → `/auth` → Google OAuth → `/auth/role`
2. Select "Merchant" → `/merchant/onboarding`
3. Fill business name, description, voucher reward, stamp count, card color → submit
4. Lands on `/merchant` dashboard
5. Enter stamp count on numpad → Generate QR → customer scans within 60s

### Stamp redemption security
- `stamp_sessions` row created with `status = 'pending'`
- Customer scans → calls `redeem_stamp_session()` RPC
- RPC checks: status == pending AND created_at < 60s ago → atomic update to 'completed'
- Duplicate scans / screenshots → rejected

### Voucher redemption
- When `current_stamps >= max_stamps` → VoucherCard shown
- Slide-to-redeem → calls `redeem_voucher()` RPC
- Resets stamps to 0, inserts `voucher_redemptions` row with `expires_at = now() + 5min`
- Client shows live 5-minute countdown — screenshots useless

---

## TODO / known issues

1. **Landing page needs redesign** — currently basic hero + card stack. User wants:
   - Full marketing page explaining how the model works
   - Distinctive typography 
   - Sections: hero → how it works (3 steps each for customer + merchant) → trust signals → CTA
   - Editorial "menu board" aesthetic — warm, tactile, NOT SaaS dashboard
   - Scroll-triggered reveals with Framer Motion `useInView`
   - Asymmetric layouts, large ruled dividers, numbered steps

2. **PhoneAuth.tsx** — old phone OTP component, now unused (replaced by GoogleAuth). Can be deleted.

3. **Merchant business editing** — no way to edit business details after onboarding. Could add settings page at `/merchant/settings`.

4. **Customer profile** — no profile/settings screen. No way to see total stamps redeemed history.

5. **pg_cron** — `expire_stale_sessions()` RPC exists but isn't scheduled. Set up a Supabase Edge Function cron or pg_cron job to call it periodically.

---

## Key decisions & gotchas

- **`createBrowserClient` storage shim** — `src/lib/supabase/client.ts` passes a custom storage object to avoid Node v25's broken `localStorage` during SSR. Do not simplify this.
- **`dynamic = 'force-dynamic'`** — all `'use client'` pages that call Supabase need this export to prevent static prerendering errors.
- **`voucher_reward` column** — added in migration 004, not in original schema. TypeScript types in `database.ts` include it.
- **Card color mapping** — `businesses.color` stores hex strings in DB. `getCardColor()` maps them to oklch bg/accent pairs. The onboarding page maps oklch values back to hex before inserting.
- **Google OAuth redirect** — must add `http://localhost:3000/auth/callback` to Google Cloud Console → OAuth client → Authorized redirect URIs for local dev.
