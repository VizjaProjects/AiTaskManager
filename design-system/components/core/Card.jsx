import React from "react";

/**
 * Card — the flat Arena container. Defined by a 1px outline-variant border on
 * the card surface; NO shadow in-app. Use `padded` for the standard gutter.
 */
export function Card({ children, padded = true, className, style, ...rest }) {
  return (
    <div
      className={className}
      style={{
        background: "var(--surface-card)",
        border: "1px solid var(--border-card)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-card)",
        padding: padded ? "var(--gutter)" : 0,
        boxSizing: "border-box",
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}
