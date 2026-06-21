import * as React from "react";

/**
 * The Arena action primitive — small radius, Inter-medium label, MaterialIcons.
 *
 * @startingPoint section="Core" subtitle="Primary, secondary, error & AI buttons" viewport="700x150"
 */
export interface ButtonProps {
  /** Visible label text. */
  label: string;
  /**
   * Visual role. `primary` is ink-filled (the dominant action); `secondary`/
   * `outline` are surface + border; `error` is surface + red; `ai` shows the
   * accent `auto_awesome` icon; `text` is bare.
   */
  variant?: "primary" | "secondary" | "outline" | "text" | "error" | "ai";
  /** Material Icons ligature name (ignored for the `ai` variant). */
  icon?: string;
  size?: "sm" | "md";
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  onClick?: () => void;
}

export function Button(props: ButtonProps): JSX.Element;
