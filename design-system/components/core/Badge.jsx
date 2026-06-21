import React from "react";

/**
 * Badge — small status/pill label. `tone` selects a semantic color; the
 * default `accent` tone uses the violet tint background. With `ai`, renders the
 * `auto_awesome` glyph + "AI" in accent. Labels are Inter-medium, uppercase
 * tracking, in a pill (rounded-full).
 */
const TONES = {
  accent: { fg: "var(--text-accent)", bg: "var(--color-accent-tint-08)" },
  critical: { fg: "var(--color-critical)", bg: "rgba(192,57,43,0.10)" },
  warning: { fg: "var(--color-warning)", bg: "rgba(183,119,13,0.12)" },
  success: { fg: "var(--color-success)", bg: "rgba(46,125,82,0.12)" },
  events: { fg: "var(--color-events)", bg: "rgba(220,44,79,0.10)" },
  neutral: { fg: "var(--text-secondary)", bg: "var(--surface-active)" },
};

export function Badge({ label, tone = "accent", ai = false, icon }) {
  const t = TONES[tone] || TONES.accent;
  const glyph = ai ? "auto_awesome" : icon;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "2px 8px",
        background: t.bg,
        color: t.fg,
        borderRadius: "var(--radius-full)",
        fontFamily: "var(--font-label)",
        fontWeight: 500,
        fontSize: 11,
        letterSpacing: "0.05em",
        textTransform: "uppercase",
        lineHeight: "16px",
      }}
    >
      {glyph && (
        <span className="material-icons" style={{ fontSize: 12 }}>
          {glyph}
        </span>
      )}
      {ai ? "AI" : label}
    </span>
  );
}
