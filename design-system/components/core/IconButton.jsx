import React from "react";

/**
 * IconButton — a bare, square tap target for a single Material Icon. Used for
 * toolbar actions, close buttons, row affordances. No fill at rest; surface
 * hover.
 */
export function IconButton({
  icon,
  size = "md",
  accent = false,
  disabled = false,
  onClick,
  title,
  ...rest
}) {
  const box = size === "sm" ? 32 : 36;
  const glyph = size === "sm" ? 18 : 20;
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      style={{
        width: box,
        height: box,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        background: "transparent",
        border: "none",
        borderRadius: "var(--radius-md)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
        color: accent ? "var(--text-accent)" : "var(--text-secondary)",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.background = "var(--surface-hover)")
      }
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      {...rest}
    >
      <span className="material-icons" style={{ fontSize: glyph }}>
        {icon}
      </span>
    </button>
  );
}
