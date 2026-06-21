import * as React from "react";

/** A small inverse-surface label shown on hover; wraps any trigger element. */
export interface TooltipProps {
  label: string;
  children?: React.ReactNode;
  side?: "top" | "bottom";
}

export function Tooltip(props: TooltipProps): JSX.Element;
