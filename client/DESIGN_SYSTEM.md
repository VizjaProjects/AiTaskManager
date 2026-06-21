# Ordovita — Design System ("Arena")

Source-of-truth reference for designing and building Ordovita UI. Goal: a calm,
premium, minimalist product. Every rule here exists to keep the product
**consistent** and to avoid generic "AI-generated" looking screens.

> Cardinal rule: **never hardcode a raw color. Use a token.** A new hex in a
> component is a bug, not a style choice. The tokens below are the only palette.

Stack: Expo / React Native Web + `expo-router`, styled with NativeWind
(Tailwind). Targets: web, desktop (Electron), mobile. Tokens are defined as CSS
variables in `global.css` and exposed as Tailwind classes in
`tailwind.config.js`. Theme switches by toggling the `.dark` class on `<html>`.

Key files (the real source of truth — read these before designing):
- `global.css` — color tokens as CSS vars, light (`:root`) + dark (`.dark`)
- `tailwind.config.js` — full token scale: colors, fonts, sizes, radius, spacing, shadows
- `lib/utils/uiTokens.ts` — theme-aware tokens for inline React Native color props (`getUiTokens(isDark)`)
- `components/atoms`, `components/molecules`, `components/organisms` — component patterns

---

## 1. Design DNA

**Arena** = warm cream paper, near-black ink, one restrained violet accent,
elegant **serif** display type over a quiet **sans** UI. It should feel like a
well-set document, not a dashboard template.

- It IS: calm, spacious, editorial, flat, high-contrast text, one accent.
- It is NOT: gradient-heavy, neon, multi-colored, shadow-heavy, rounded-bubble, busy.

Brand voice: clear, confident, minimal. Short sentences. No hype, no emoji in UI.

---

## 2. Color — the only palette

Always prefer the **Tailwind class** (it swaps automatically in dark mode). Use
the raw hex only for things that never theme (brand logos, shadows, the note
color palette) or via `getUiTokens(isDark)` for inline RN `color=` props.

### Neutrals / surfaces

| Role | Token class | Light | Dark |
|---|---|---|---|
| App background (cream paper) | `bg-background` | `#f5f3ef` | `#111111` |
| Card / modal / dropdown surface | `bg-surface` / `bg-surface-container-lowest` | `#ffffff` | `#1c1c1c` |
| Sidebar / muted surface | `bg-surface-dim` | `#eeece8` | `#141414` |
| Hover state | `bg-surface-container-low` | `#eceae6` | `rgba(255,255,255,0.04)` |
| Active state | `bg-surface-container` | `#e8e5e0` | `rgba(255,255,255,0.07)` |

### Text

| Role | Token class | Light | Dark |
|---|---|---|---|
| Primary text (ink) | `text-on-surface` | `#1a1a18` | `rgba(255,255,255,0.88)` |
| Secondary text | `text-on-surface-variant` | `#6b6965` | `rgba(255,255,255,0.50)` |
| Tertiary / placeholder | `text-text-tertiary` | `#9b9791` | `rgba(255,255,255,0.28)` |

### Borders

| Role | Token class | Light | Dark |
|---|---|---|---|
| Default border (defines cards) | `border-outline-variant` | `#e2dfd9` | `rgba(255,255,255,0.11)` |
| Strong border | `border-outline` | `#c8c4be` | `rgba(255,255,255,0.20)` |
| Subtle divider | `border-border-subtle` | `#eceae6` | `rgba(255,255,255,0.05)` |

### Accent & semantic (single value per role)

| Role | Token | Light | Dark | Use for |
|---|---|---|---|---|
| **Accent** (the only highlight color) | `accent` | `#5b4ee0` | `#9b8cff` | links, highlights, AI, selected, primary highlight |
| Brand / action | `action` / `primary` | `#1a1a18` | `rgba(255,255,255,0.92)` | primary buttons, ink |
| Error / destructive | `error` | `#ba1a1a` | — | delete, invalid |
| Critical / high priority | `priority-critical` | `#C0392B` | — | critical/high, recording-active |
| Warning / in-progress | `status-in-progress` | `#B7770D` | — | pending, in-progress |
| Success / done | `success` | `#2E7D52` | — | completed, positive state |
| Events / secondary | `secondary-container` | `#dc2c4f` | — | calendar events |
| Notes accent (teal) | — | `#006b58` | — | note category only |

There is **exactly one** of each. Do not introduce a second red, a second
violet, a second gray. If a color isn't in this table, it doesn't exist.

---

## 3. Typography

Two families only. Display = serif, everything else = Inter.

| Class | Family | Weight | Use for |
|---|---|---|---|
| `font-display` | **Playfair Display** (serif) | 400 | hero titles, page titles, modal titles, big stat numbers |
| `font-headline` | Inter | 500 (medium) | section headings, card titles, buttons, active labels |
| `font-body` | Inter | 400 | body copy, descriptions |
| `font-label` | Inter | 500 | small UPPERCASE labels (with letter-spacing) |

Type scale (`tailwind.config.js`): `display-lg` 48/56 (-0.02em), `headline-lg`
32/40, `headline-md` 24/32, `title-lg` 20/28, `body-lg` 16/24, `body-md` 14/20,
`label-md` 12/16 (+0.05em).

Rules:
- The biggest thing on a screen (hero / page title) is **`font-display`** (serif). Never set a hero in Inter.
- UI never uses heavy Inter weights. Active/buttons cap at medium (500).
- Small section labels: `font-label`, uppercase, tracking — not bold body text.

---

## 4. Iconography

- **Exactly one icon set: `MaterialIcons` from `@expo/vector-icons`.** Never mix in Ionicons / FontAwesome / Feather, etc.
- **Never use an emoji as a UI icon.** (No ✨ in a badge — use `auto-awesome`.)
- Typical sizes: 13–16 inline, 18–24 actions. Icon color comes from a token, not a raw hex.
- AI is always represented by `auto-awesome` in the **accent** color.
- Provider/brand logos (`ProviderBrandIcon.tsx`) are the **only** place real brand hexes (OpenAI black, etc.) are allowed.

---

## 5. Layout & spacing

- Content is centered with a consistent max width: **`max-w-5xl`** for every page section. Don't mix `max-w-4xl` / `max-w-6xl` across sections of one page — edges must align while scrolling.
- Page gutters: `px-6` (mobile) → larger on desktop (`md:px-12`).
- Rhythm tokens: `section-gap` 2rem, `stack-gap` 1rem, `gutter` 1.5rem. Sidebar is `256px`.
- Group related controls; give sections air. Density is low by design.

---

## 6. Elevation & depth

**In-app surfaces are flat by design.** `shadow-card` is intentionally `none`.
Cards are defined by a **1px `border-outline-variant`** on
`bg-surface-container-lowest`, not by a shadow.

Depth (real shadow) is reserved for layers that float above the page:
- Modals → `shadow-modal`
- Dropdowns / menus → soft multi-layer shadow
- Kanban cards (rest/hover/drag) → `shadow-kanban` / `-hover` / `-drag`
- Landing/marketing cards → border + soft shadow (see `app/index.tsx` `cardShadow`)

Don't sprinkle shadows on normal in-app cards — use borders.

---

## 7. Radius

Small radii (Arena). The scale is capped — nothing reads larger than ~10px
except pills.

| Token | px | Use |
|---|---|---|
| `rounded-md` / default | 6 | buttons, inputs, small chips |
| `rounded-lg` / `rounded-xl` | 8 | cards, list rows |
| `rounded-2xl` / `rounded-3xl` | 10 (capped) | larger cards, modals |
| `rounded-input` | 10 | the input/search bar |
| `rounded-full` | — | pills, badges, avatars only |

Avoid arbitrary radii (`rounded-[2px]` etc.).

---

## 8. Dark mode — the rule that prevents the biggest bug

A color that must change between light/dark **must not** be a hardcoded hex in an
inline style. Two correct ways:

1. **Tailwind class** — `text-on-surface`, `bg-surface`, `border-outline-variant`. These resolve to CSS vars that swap on `.dark`. **Prefer this.**
2. **`getUiTokens(isDark)`** (from `lib/utils/uiTokens.ts`) — for inline React Native `color=` / `backgroundColor` props where a class isn't possible. Read theme via `useThemeStore((s) => s.mode === "dark")`.

The only colors allowed as raw inline hex: brand logos, shadows, and the note
color palette (`lib/noteTheme.ts`) — none of those theme.

---

## 9. Component recipes

**Button** (`components/atoms/Button.tsx`) — variants:
- `primary`: `bg-action` (ink), `text-on-action`. The dominant action.
- `outline` / `secondary`: `bg-surface` + `border-outline-variant`, `text-on-surface`.
- `error`: surface + red border, red text.
- `ai`: surface + `auto-awesome` icon. `text`: bare.
- Radius `rounded-md`, label `font-headline text-sm`.

**Card**: `bg-surface-container-lowest` + `border border-outline-variant`,
`rounded-xl`/`2xl`, no shadow in-app.

**Badge / pill**: `rounded-full`, accent-tinted background
(`rgba(91,78,224,0.08)`), `font-label text-label-md` in accent. Icon, not emoji.

**Input**: surface + `border-outline-variant`, `rounded-input`/`full`, no focus
ring (global.css strips outlines). Placeholder = `text-text-tertiary`.

**Dropdown / select**: see `MinimalSelectDropdown` — selected row uses accent
tint bg + accent border; theme-aware via `getUiTokens(isDark)`.

---

## 10. ⚠️ AI-slop anti-pattern checklist

The tells that make UI look auto-generated. Reviewers reject any of these.

**Don't:**
- introduce a hex when a token exists; invent a second accent / red / gray
- use generic Tailwind neutrals (`#9ca3af`, `#6b7280`, gray-400/500) — use `on-surface-variant` / `text-tertiary`
- represent one role with multiple colors (e.g. AI as violet *and* amber)
- use emoji as UI icons, or mix icon families
- set a hero/page title in Inter; use heavy Inter weights for UI
- add drop-shadows to ordinary in-app cards (use borders); reserve shadow for modals/menus/landing
- use large border radii (> ~10px) or bubble-rounded everything
- hardcode a theme-dependent color inline (breaks dark mode)
- mix container widths down a page (ragged edges)

**Do:**
- one accent: `#5b4ee0` (light) / `#9b8cff` (dark)
- semantic tokens / classes everywhere; `getUiTokens(isDark)` for inline colors
- Playfair for hero/titles, Inter for UI
- borders for separation, shadow only for elevated layers
- consistent `max-w-5xl` sections, generous spacing
- MaterialIcons only; AI = `auto-awesome` in accent

---

## 11. Current state & known debt (June 2026)

Cleaned and consistent: design tokens, landing page (`app/index.tsx`), and the
LLM-settings / dropdown cluster (now theme-aware via `getUiTokens`). The app-wide
color palette has been collapsed to the single-value tokens above (one accent,
two grays, one red/green/amber per role).

Remaining debt: many in-app screens still pass these (now canonical) values as
**inline hex** to `color=` props instead of token classes, so their **dark mode
is not yet complete**. Direction of travel: migrate inline hex → token classes /
`getUiTokens`, and add a lint rule that forbids raw hex outside the token files.

When designing anything new: follow this document, not the older screens.
