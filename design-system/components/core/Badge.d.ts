import * as React from "react";

/** Small pill status label; one tone per semantic role, accent tint by default. */
export interface BadgeProps {
  label?: string;
  /** Semantic color role. */
  tone?: "accent" | "critical" | "warning" | "success" | "events" | "neutral";
  /** Render the accent `auto_awesome` glyph + "AI" (overrides label/icon). */
  ai?: boolean;
  /** Optional leading Material Icons ligature. */
  icon?: string;
}

export function Badge(props: BadgeProps): JSX.Element;
