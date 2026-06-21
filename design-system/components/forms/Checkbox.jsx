import React from "react";

/**
 * Checkbox — small square (radius-sm). Checked uses accent fill + ink-on-accent
 * check glyph; unchecked is a bordered surface box. Pairs with a label.
 */
export function Checkbox({
  checked = false,
  onChange,
  label,
  disabled = false,
}) {
  return (
    <label
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
      }}
      onClick={() => !disabled && onChange && onChange(!checked)}
    >
      <span
        style={{
          width: 18,
          height: 18,
          borderRadius: "var(--radius-sm)",
          background: checked ? "var(--text-accent)" : "var(--surface-card)",
          border: `1px solid ${checked ? "var(--text-accent)" : "var(--border-strong)"}`,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {checked && (
          <span
            className="material-icons"
            style={{ fontSize: 14, color: "#ffffff" }}
          >
            check
          </span>
        )}
      </span>
      {label && (
        <span
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 14,
            color: "var(--text-body)",
          }}
        >
          {label}
        </span>
      )}
    </label>
  );
}
