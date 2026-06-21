import React from "react";

/**
 * Tooltip — a small dark label on hover. Uses the inverse surface so it reads
 * as a floating chip above any background. Wrap any trigger.
 */
export function Tooltip({ label, children, side = "top" }) {
  const [show, setShow] = React.useState(false);
  const pos =
    side === "top"
      ? {
          bottom: "calc(100% + 8px)",
          left: "50%",
          transform: "translateX(-50%)",
        }
      : { top: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)" };
  return (
    <span
      style={{ position: "relative", display: "inline-flex" }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <span
          style={{
            position: "absolute",
            ...pos,
            whiteSpace: "nowrap",
            padding: "5px 8px",
            background: "var(--color-inverse-surface)",
            color: "var(--color-inverse-on-surface)",
            borderRadius: "var(--radius-sm)",
            fontFamily: "var(--font-body)",
            fontSize: 12,
            boxShadow: "var(--shadow-menu)",
            zIndex: 20,
            pointerEvents: "none",
          }}
        >
          {label}
        </span>
      )}
    </span>
  );
}
