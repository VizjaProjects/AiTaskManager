import React from "react";

/**
 * Toast — a transient floating notice. Elevated (soft menu shadow). A leading
 * Material Icon takes the tone color; the rest stays ink. One tone per intent.
 */
const TONES = {
  success: { icon: "check_circle", color: "var(--color-success)" },
  error: { icon: "error", color: "var(--color-error)" },
  info: { icon: "auto_awesome", color: "var(--text-accent)" },
};

export function Toast({ message, tone = "info", onDismiss }) {
  const t = TONES[tone] || TONES.info;
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 12px",
        background: "var(--surface-card)",
        border: "1px solid var(--border-card)",
        borderRadius: "var(--radius-md)",
        boxShadow: "var(--shadow-menu)",
        maxWidth: 360,
      }}
    >
      <span className="material-icons" style={{ fontSize: 18, color: t.color }}>
        {t.icon}
      </span>
      <span
        style={{
          flex: 1,
          fontFamily: "var(--font-body)",
          fontSize: 14,
          color: "var(--text-body)",
        }}
      >
        {message}
      </span>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          style={{
            border: "none",
            background: "transparent",
            cursor: "pointer",
            color: "var(--text-tertiary)",
            display: "inline-flex",
          }}
        >
          <span className="material-icons" style={{ fontSize: 18 }}>
            close
          </span>
        </button>
      )}
    </div>
  );
}
