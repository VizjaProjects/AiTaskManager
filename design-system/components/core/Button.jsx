import React from "react";

/**
 * Ordovita Button — the Arena action primitive.
 *
 * Styling references CSS custom properties from styles.css only. Radius is
 * small (md/6px), label is Inter medium (never heavier). Icons are Material
 * Icons ligatures; the `ai` variant always shows `auto_awesome` in accent.
 */
export function Button({
  variant = "primary",
  label,
  icon,
  size = "md",
  disabled = false,
  loading = false,
  fullWidth = false,
  onClick,
  ...rest
}) {
  const pad = size === "sm" ? "8px 14px" : "12px 20px";
  const fontSize = size === "sm" ? 13 : 14;

  const base = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: pad,
    fontFamily: "var(--font-headline)",
    fontWeight: 500,
    fontSize,
    lineHeight: 1,
    borderRadius: "var(--radius-md)",
    borderWidth: 1,
    borderStyle: "solid",
    cursor: disabled || loading ? "not-allowed" : "pointer",
    opacity: disabled || loading ? 0.5 : 1,
    width: fullWidth ? "100%" : "auto",
    boxSizing: "border-box",
    transition: "background 120ms ease, border-color 120ms ease",
  };

  const variants = {
    primary: {
      background: "var(--action-fill)",
      color: "var(--text-on-action)",
      borderColor: "var(--action-fill)",
    },
    secondary: {
      background: "var(--surface-card)",
      color: "var(--text-body)",
      borderColor: "var(--border-card)",
    },
    outline: {
      background: "var(--surface-card)",
      color: "var(--text-body)",
      borderColor: "var(--border-card)",
    },
    text: {
      background: "transparent",
      color: "var(--text-body)",
      borderColor: "transparent",
      padding: size === "sm" ? "8px 8px" : "12px 12px",
    },
    error: {
      background: "var(--surface-card)",
      color: "var(--color-critical)",
      borderColor: "rgba(192,57,43,0.4)",
    },
    ai: {
      background: "var(--surface-card)",
      color: "var(--text-body)",
      borderColor: "var(--border-card)",
    },
  };

  const iconColor =
    variant === "ai"
      ? "var(--text-accent)"
      : variant === "primary"
        ? "var(--text-on-action)"
        : variant === "error"
          ? "var(--color-critical)"
          : "var(--text-body)";

  const leadingIcon = variant === "ai" ? "auto_awesome" : icon || null;

  return (
    <button
      type="button"
      disabled={disabled || loading}
      onClick={onClick}
      style={{ ...base, ...variants[variant] }}
      {...rest}
    >
      {leadingIcon && !loading && (
        <span
          className="material-icons"
          style={{ fontSize: size === "sm" ? 16 : 18, color: iconColor }}
        >
          {leadingIcon}
        </span>
      )}
      {loading ? "…" : label}
    </button>
  );
}
