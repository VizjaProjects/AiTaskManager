import * as React from "react";

/** The flat Arena container — 1px border, no shadow. Wrap any grouped content. */
export interface CardProps {
  children?: React.ReactNode;
  /** Apply the standard inner gutter (24px). Defaults to true. */
  padded?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function Card(props: CardProps): JSX.Element;
