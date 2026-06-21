import React from "react";

/**
 * EmptyState — a calm placeholder for empty lists/screens. A muted Material
 * Icon, a serif-free headline (Inter medium), one line of secondary copy, and
 * an optional action slot. No illustration — Arena stays quiet.
 */
export function EmptyState({ icon = "inbox", title, description, action }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        gap: 8,
        padding: "40px 24px",
      }}
    >
      <span
        className="material-icons"
        style={{ fontSize: 32, color: "var(--text-tertiary)", marginBottom: 4 }}
      >
        {icon}
      </span>
      <div
        style={{
          fontFamily: "var(--font-headline)",
          fontWeight: 500,
          fontSize: 16,
          color: "var(--text-body)",
        }}
      >
        {title}
      </div>
      {description && (
        <div
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 14,
            color: "var(--text-secondary)",
            maxWidth: 320,
          }}
        >
          {description}
        </div>
      )}
      {action && <div style={{ marginTop: 8 }}>{action}</div>}
    </div>
  );
}
