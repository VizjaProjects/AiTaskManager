---
name: ordovita-design-system
description: >-
  Design and build UI for Ordovita — a premium, minimalist AI task & workspace
  manager (tasks, calendar, notes, AI planning) for web, desktop (Electron) and
  mobile. Use this skill whenever creating or reviewing Ordovita screens,
  components, marketing pages, or assets in the "Arena" visual language (warm
  cream paper, near-black ink, one violet accent, Playfair Display over Inter).
  Apply it to enforce the token system, typography, iconography, and flat-card
  rules so output looks on-brand and never generic.
---

# Ordovita Design System — “Arena”

Calm, premium, minimalist. Warm cream paper, near-black ink, **one** violet
accent, **Playfair Display** serif headlines over an **Inter** UI. It should
read like a well-set document, not a dashboard template.

## Golden rules

1. **Never hardcode a hex — always use a token.** A new color is a bug.
2. **Exactly one value per role.** One accent (`#5b4ee0` / dark `#9b8cff`), one
   error `#ba1a1a`, critical `#c0392b`, warning `#b7770d`, success `#2e7d52`,
   events `#dc2c4f`, notes `#006b58`. Never a second accent/red/gray. Never the
   generic Tailwind grays `#9ca3af` / `#6b7280`.
3. **Type:** Playfair Display (400) for the biggest thing on a screen (hero,
   page/modal title, big numbers). Inter (≤500, never heavier) for all UI.
4. **Icons:** Material Icons only; never emoji, never mixed sets. AI is always
   `auto_awesome` in the accent color.
5. **Surfaces are flat:** define cards with a 1px `outline-variant` border, not a
   shadow. Shadow is only for floating layers (modals, menus, Kanban drag,
   landing cards).
6. **Small radii** (≤10px); `rounded-full` only for pills/badges/avatars.
7. **One container width** per page (`max-w-5xl`); generous spacing, low density.
8. **Theme-dependent colors** come from token classes / CSS vars (or
   `getUiTokens(isDark)` for inline RN colors), never inline hex.

## How to use this folder

- **`styles.css`** — the single global entry point (imports-only). Link this to
  pick up every token and webfont.
- **`tokens/`** — CSS custom properties. Build against the semantic layer
  (`--text-body`, `--surface-card`, `--text-accent`, `--border-card`,
  `--shadow-card`…). Light values are on `:root`; dark on `.dark`.
- **`components/`** — reusable React primitives (`core/`, `forms/`, `feedback/`).
  Each is a named PascalCase export styled only with the CSS variables. Read the
  sibling `*.prompt.md` for usage and variants before composing.
- **`ui_kits/`** — full-screen recreations (`app/`, `marketing/`). Compose the
  primitives; don’t re-implement them. `index.html` is an interactive preview.
- **`guidelines/`** — foundation specimen cards (colors, type, spacing, brand).

## Anti-patterns to reject

Second accent/red/gray · generic Tailwind grays · one role in two colors · emoji
or mixed icon sets · a hero set in Inter · heavy Inter weights · drop-shadows on
ordinary in-app cards · radii > 10px or bubble-rounding everything · inline
theme-dependent hex (breaks dark mode) · mixed container widths · bluish-purple
gradients · textured/illustrated backgrounds.

## Source of truth

Derived from the `client/` codebase (`DESIGN_SYSTEM.md`, `global.css`,
`tailwind.config.js`, `lib/utils/uiTokens.ts`, `components/*`, `app/*`). When the
codebase and a screenshot disagree, the codebase wins.
