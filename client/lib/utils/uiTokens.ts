/**
 * Shared UI tokens aligned to the Arena design system.
 *
 * Light values mirror the `:root` CSS variables and dark values mirror the
 * `.dark` variables in global.css, so inline React Native colors adapt to the
 * active theme. Use `getUiTokens(isDark)` in components; `UI` remains as a
 * light-mode alias for back-compat with call sites that don't read the theme.
 */

type ShadowToken = {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
};

export interface UiTokens {
  border: string;
  borderHover: string;
  borderFocus: string;
  divider: string;
  surface: string;
  surfaceHover: string;
  selectedBg: string;
  selectedBorder: string;
  textMuted: string;
  textSecondary: string;
  /** on-surface */
  text: string;
  /** Quiet icons (meta rows, toolbar chevrons). */
  iconMuted: string;
  accent: string;
  /** Icon/text on bg-action. */
  onAction: string;
  critical: string;
  warning: string;
  /** Same in both themes, matches the `success` class. */
  success: string;
  shadow: ShadowToken;
}

const LIGHT: UiTokens = {
  border: "#E2DFD9", // outline-variant
  borderHover: "#C8C4BE", // outline
  borderFocus: "#C8C4BE", // outline
  divider: "#ECEAE6", // border-subtle
  surface: "#FFFFFF", // surface
  surfaceHover: "#ECEAE6", // hover
  selectedBg: "rgba(91,78,224,0.06)", // accent tint
  selectedBorder: "rgba(91,78,224,0.28)", // accent edge
  textMuted: "#9b9791", // text-tertiary
  textSecondary: "#6b6965", // on-surface-variant
  text: "#1a1a18", // on-surface
  iconMuted: "#9b9791", // text-tertiary
  accent: "#5b4ee0",
  onAction: "#ffffff", // on-action
  critical: "#c0392b",
  warning: "#b7770d",
  success: "#2e7d52",
  shadow: {
    shadowColor: "#101828",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
  },
};

const DARK: UiTokens = {
  border: "rgba(255,255,255,0.11)", // outline-variant (dark)
  borderHover: "rgba(255,255,255,0.20)", // outline (dark)
  borderFocus: "rgba(255,255,255,0.20)", // outline (dark)
  divider: "rgba(255,255,255,0.06)", // border-subtle (dark)
  surface: "#1c1c1c", // surface (dark)
  surfaceHover: "rgba(255,255,255,0.04)", // hover (dark)
  selectedBg: "rgba(155,140,255,0.14)", // dark accent tint
  selectedBorder: "rgba(155,140,255,0.38)", // dark accent edge
  textMuted: "rgba(255,255,255,0.28)", // text-tertiary (dark)
  textSecondary: "rgba(255,255,255,0.50)", // on-surface-variant (dark)
  text: "rgba(255,255,255,0.88)", // on-surface (dark)
  iconMuted: "rgba(255,255,255,0.45)",
  accent: "#9b8cff",
  onAction: "#111111", // on-action (dark)
  critical: "#e07a6f",
  warning: "#d6a23e",
  success: "#2e7d52",
  shadow: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 4,
  },
};

/** Theme-aware UI tokens. Prefer this in components that can read the theme. */
export function getUiTokens(isDark: boolean): UiTokens {
  return isDark ? DARK : LIGHT;
}

/** Back-compat light-mode alias. Prefer getUiTokens(isDark) in new code. */
export const UI = LIGHT;

/**
 * Landing page and login tokens. Since 2026-09-27 they are the Arena palette
 * (`--color-brand-*` in global.css alias the app tokens), kept as a separate
 * set for props that can't take a class (icon colors, placeholder text, shadows).
 */
export interface BrandTokens {
  paper: string;
  surface: string;
  ink: string;
  muted: string;
  field: string;
  accent: string;
  onAccent: string;
  accentText: string;
  success: string;
  error: string;
  proposal: string;
  proposalEdge: string;
  shadow: string;
}

const BRAND_LIGHT: BrandTokens = {
  paper: "#f5f3ef",
  surface: "#ffffff",
  ink: "#1a1a18",
  muted: "#6b6965",
  field: "#8a8680",
  accent: "#1a1a18",
  onAccent: "#ffffff",
  accentText: "#1a1a18",
  success: "#2e7d52",
  error: "#b3261e",
  proposal: "#ffffff",
  proposalEdge: "#c8c4be",
  shadow: "0 40px 80px -48px rgba(26,26,24,0.32)",
};

const BRAND_DARK: BrandTokens = {
  paper: "#111111",
  surface: "#1c1c1c",
  ink: "rgba(255,255,255,0.88)",
  muted: "rgba(255,255,255,0.5)",
  field: "#75726e",
  accent: "rgba(255,255,255,0.92)",
  onAccent: "#111111",
  accentText: "rgba(255,255,255,0.88)",
  success: "#6cc095",
  error: "#f2867a",
  proposal: "#1c1c1c",
  proposalEdge: "rgba(255,255,255,0.2)",
  shadow: "0 40px 80px -48px rgba(0,0,0,0.8)",
};

export function getBrandTokens(isDark: boolean): BrandTokens {
  return isDark ? BRAND_DARK : BRAND_LIGHT;
}
