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
 * Brand palette used by the landing page and login. Mirrors the
 * `--color-brand-*` variables in global.css, for props that can't take a class
 * (icon colors, placeholder text, shadows).
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
  error: string;
  proposal: string;
  proposalEdge: string;
  shadow: string;
}

const BRAND_LIGHT: BrandTokens = {
  paper: "#f3f5f2",
  surface: "#ffffff",
  ink: "#1c2321",
  muted: "#56605c",
  field: "#7f8a85",
  accent: "#006b58",
  onAccent: "#ffffff",
  accentText: "#006b58",
  error: "#b3261e",
  proposal: "#fbf1df",
  proposalEdge: "#b7770d",
  shadow: "0 40px 80px -48px rgba(28,35,33,0.35)",
};

const BRAND_DARK: BrandTokens = {
  paper: "#101513",
  surface: "#18201d",
  ink: "#e7ece9",
  muted: "#a3aeaa",
  field: "#6f7c77",
  accent: "#4cb99a",
  onAccent: "#0b1210",
  accentText: "#5cc4a6",
  error: "#f2867a",
  proposal: "#2a2216",
  proposalEdge: "#c98a22",
  shadow: "0 40px 80px -48px rgba(0,0,0,0.8)",
};

export function getBrandTokens(isDark: boolean): BrandTokens {
  return isDark ? BRAND_DARK : BRAND_LIGHT;
}
