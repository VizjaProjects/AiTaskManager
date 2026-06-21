import React from "react";

const SIZES = { sm: 32, md: 40, lg: 56 };
const FONTS = { sm: 12, md: 14, lg: 18 };

function initials(name) {
  return (name || "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || "")
    .join("");
}

/**
 * Avatar — initials in a neutral filled circle (rounded-full). No photos in the
 * Arena system; quiet primary-fixed background with ink initials.
 */
export function Avatar({ name, size = "md" }) {
  const box = SIZES[size];
  return (
    <div
      style={{
        width: box,
        height: box,
        borderRadius: "var(--radius-full)",
        background: "var(--color-primary-fixed)",
        color: "var(--text-body)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-headline)",
        fontWeight: 500,
        fontSize: FONTS[size],
      }}
    >
      {initials(name)}
    </div>
  );
}
