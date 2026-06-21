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
