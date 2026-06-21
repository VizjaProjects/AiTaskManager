import React from "react";

/**
 * Switch — a pill toggle. On uses accent fill; off uses a neutral active track.
 * Knob is a white circle that slides. Used for settings (theme, visibility).
 */
export function Switch({ checked = false, onChange, disabled = false }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange && onChange(!checked)}
      style={{
        width: 40,
        height: 24,
        borderRadius: "var(--radius-full)",
        border: "none",
        padding: 2,
        background: checked ? "var(--text-accent)" : "var(--surface-active)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        display: "inline-flex",
        alignItems: "center",
        transition: "background 140ms ease",
      }}
    >
      <span
        style={{
          width: 20,
          height: 20,
          borderRadius: "var(--radius-full)",
          background: "#ffffff",
          boxShadow: "0 1px 2px rgba(16,24,40,0.2)",
          transform: checked ? "translateX(16px)" : "translateX(0)",
          transition: "transform 140ms ease",
        }}
      />
    </button>
  );
}
