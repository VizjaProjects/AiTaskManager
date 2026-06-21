import * as React from "react";

/** A bare square tap target wrapping a single Material Icon (toolbar/close/row actions). */
export interface IconButtonProps {
  /** Material Icons ligature name. */
  icon: string;
  size?: "sm" | "md";
  /** Tint the glyph with the accent color. */
  accent?: boolean;
  disabled?: boolean;
  title?: string;
  onClick?: () => void;
}

export function IconButton(props: IconButtonProps): JSX.Element;
