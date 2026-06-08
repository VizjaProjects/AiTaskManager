/** Shared minimalist UI tokens — soft gray borders, no harsh black lines */
export const UI = {
  border: "#E5E7EB",
  borderHover: "#D1D5DB",
  borderFocus: "#C7CDD6",
  divider: "#F3F4F6",
  surface: "#FAFAFA",
  surfaceHover: "#F9FAFB",
  selectedBg: "#FAF9FF",
  selectedBorder: "#E8E4F8",
  textMuted: "#9CA3AF",
  textSecondary: "#6B7280",
  shadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
  },
} as const;
