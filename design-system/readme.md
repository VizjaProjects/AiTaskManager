# Ordovita Design System — “Arena”

A calm, premium, minimalist design system for **Ordovita**, an AI task &
workspace manager (tasks, calendar, notes, AI planning) for **web, desktop
(Electron) and mobile**. Built with Expo / React Native Web + NativeWind
(Tailwind).

The visual language is **“Arena”**: warm cream paper, near-black ink, a single
violet accent, Playfair Display serif headlines over an Inter UI. The goal is a
product that reads like a well-set document — not a dashboard template, and
never “AI-generated.”

> **Cardinal rule:** never hardcode a raw color — always use a token. Exactly
> one value per role (one accent, one error, one success…). A new hex in a
> component is a bug, not a style choice.

## Products represented

- **Ordovita app** — the dashboard / tasks (Kanban) / calendar / notes / AI-planning product (web + Electron desktop + mobile). → `ui_kits/app/`
- **ordovita.pl marketing site** — the public landing page. → `ui_kits/marketing/`

## Sources (read-only; you may not have access — recorded in case you do)

- **Codebase:** `client/` — Expo / React Native Web app (the source of truth).
  - `client/DESIGN_SYSTEM.md` — the written spec this system is derived from.
  - `client/global.css` — color tokens (`:root` light + `.dark`).
  - `client/tailwind.config.js` — full token scale (colors, fonts, sizes, radius, spacing, shadows).
  - `client/lib/utils/uiTokens.ts` — `getUiTokens(isDark)` for inline RN colors.
  - `client/lib/noteTheme.ts` — the (non-theming) note color palette.
  - `client/components/{atoms,molecules,organisms}` — component patterns.
  - `client/app/index.tsx` — the landing page; `client/app/(app)/*` — app screens.
- No Figma file or slide deck was provided.

---

## Content fundamentals

How Ordovita writes copy.

- **Voice:** clear, confident, minimal. Short declarative sentences. No hype,
  no exclamation stacking, no buzzwords.
- **Casing:** Title Case for product nouns and primary buttons (“Sign Up”,
  “Task Management”, “Smart Calendar”). Sentence case for body copy and
  descriptions. Small section labels are **UPPERCASE** with letter-spacing.
- **Person:** addresses the user as **you / your** (“Your Premium Workspace”,
  “Plan your day with clarity”). The product refers to itself by name
  (“Ordovita”), not “we”.
- **Emoji:** **never.** Not in UI, not in marketing, not in badges. Emphasis
  comes from type and the single accent, never from an emoji or a second color.
- **Vibe:** editorial and reductive — “reduce cognitive load”, “focus on what
  matters”, “without the visual clutter.” The serif headline carries the
  emotion; the sans body stays quiet and factual.
- **Examples**
  - Hero: _“Your Premium Workspace for Ultimate Clarity.”_
  - Sub: _“Minimalist task management. Reduce cognitive load, focus on what matters, and organize your day with clarity.”_
  - Feature: _“Kanban, filters, priorities — all in one place.”_
  - Don't: ~~“🚀 Supercharge your productivity!!”~~ / ~~“The #1 game-changing AI ✨”~~

---

## Visual foundations

- **Color** — One warm neutral family (cream paper `#f5f3ef` → white surfaces in
  light; near-black `#111` → `#1c1c1c` in dark) plus **one** violet accent
  (`#5b4ee0` light / `#9b8cff` dark) used for every highlight: links, selection,
  and all AI. Semantic colors are single-value: error `#ba1a1a`, critical
  `#c0392b`, warning `#b7770d`, success `#2e7d52`, events `#dc2c4f`, notes
  `#006b58`. No second accent, no second gray, no generic Tailwind grays
  (`#9ca3af`/`#6b7280`).
- **Type** — Two families only. **Playfair Display** (serif, 400) for the
  biggest thing on any screen — heroes, page titles, modal titles, big stat
  numbers. **Inter** (≤500) for _all_ UI; weight never exceeds medium. Scale:
  display-lg 48/56 (−0.02em) down to label-md 12/16 (+0.05em, uppercase).
- **Spacing** — Low density by design. 4px base; named rhythm tokens
  (`stack-gap` 16px, `gutter` 24px, `section-gap` 32px). Generous air between
  groups.
- **Backgrounds** — Flat color fields only. **No** images, gradients, textures,
  patterns, or hand-drawn illustrations behind content. The cream paper _is_ the
  texture. (Bluish-purple gradients are explicitly avoided.)
- **Layout** — Centered content capped at a single width (`max-w-5xl` / 64rem)
  so edges align while scrolling; never mix container widths down a page. Fixed
  256px sidebar in the app; page gutters `px-6` → `md:px-12`.
- **Corner radii** — Small and capped: 4 / 6 / 8 / 10px. Nothing reads larger
  than ~10px except `rounded-full` (pills, badges, avatars, the switch). No
  arbitrary radii.
- **Borders** — A 1px border (`outline-variant`) is the primary separator and is
  what **defines a card**. Strong border (`outline`) for emphasis; subtle
  divider for in-card rules.
- **Cards** — Flat: surface fill + 1px border, **no shadow** in-app. (Rounded
  corners ≤10px, never a colored left-border-only accent.)
- **Elevation / shadows** — Reserved for layers that float _above_ the page:
  modals, dropdowns/menus, Kanban cards (rest/hover/drag), and marketing/landing
  cards. Ordinary in-app cards never get a drop shadow.
- **Animation** — Restrained. Short, soft transitions (~120–140ms ease) on
  hover/press and toggles; an AI “analyzing” state uses three quietly pulsing
  dots. No bounces, no springy/playful motion.
- **Hover states** — Surfaces shift to the `hover` neutral (a slightly darker
  paper in light; white-at-4% in dark). Buttons darken/lighten their fill subtly.
  Links/icons may take the accent.
- **Press states** — Light opacity dip (~0.85) via `activeOpacity`; no shrink/
  scale tricks.
- **Transparency & blur** — Minimal. Dark mode uses white-alpha overlays for
  hover/active/borders (e.g. `rgba(255,255,255,0.04)`); accent tints use 6–14%
  alpha for selected rows and pill backgrounds. No glassmorphism / heavy blur.
- **Imagery color vibe** — There is essentially no photography. What imagery
  exists (the logo mark) is monochrome ink on paper — warm, neutral, calm. No
  grain, no duotone, no cool neon.

---

## Iconography

- **One set: Material Icons** (the app’s `@expo/vector-icons` `MaterialIcons`).
  Never mix in Ionicons / FontAwesome / Feather. In these specimens the same set
  is served from the **Google Fonts Material Icons** webfont (ligature names like
  `auto_awesome`, `calendar_today`).
- **AI is always `auto_awesome` in the accent color** — never an emoji ✨, never
  a second color.
- **No emoji as UI icons. No unicode glyphs as icons.** Emphasis is type +
  accent only.
- **Icon color comes from a token**, not a raw hex; typical sizes 13–16 inline,
  18–24 for actions.
- **Brand/provider logos** (e.g. OpenAI) are the only place real brand hexes are
  allowed — out of scope here.
- **Assets copied in:** `assets/logo/ordovita-mark.png` (the isometric cube
  mark, used as favicon + lockup) and `assets/logo/ordovita-icon.png`. No SVG
  icon sprite exists in the codebase (icons are a font), so none was copied; the
  Material Icons webfont is linked from CDN instead.

---

## Index / manifest

Root files:

- `styles.css` — global entry point (imports-only). Consumers link this one file.
- `readme.md` — this guide.
- `SKILL.md` — portable skill description (Agent Skills compatible).
- `tokens/` — `colors.css`, `typography.css`, `spacing.css`, `radius.css`, `elevation.css`, `fonts.css` (`@font-face`).
- `assets/` — `fonts/` (Inter + Playfair woff2), `logo/` (Ordovita mark + icon).
- `guidelines/` — foundation specimen cards (the Design System tab).
- `components/` — reusable primitives (`core/`, `forms/`, `feedback/`).
- `ui_kits/` — full-screen recreations (`app/`, `marketing/`).

Components:

- **core** — `Button`, `IconButton`, `Card`, `Badge`, `Avatar`
- **forms** — `Input`, `Checkbox`, `Switch`, `Select`
- **feedback** — `Toast`, `Tooltip`, `EmptyState`

UI kits:

- **app** — `Sidebar`, `AppShell`, `DashboardScreen`, `TasksScreen`, `AiTaskScreen` (`index.html` is the interactive click-through)
- **marketing** — `LandingScreen` (`index.html`)

Foundation card groups: **Colors**, **Type**, **Spacing**, **Brand**.
