import * as React from "react";

/** A calm placeholder for empty lists/screens — muted icon, title, optional action. */
export interface EmptyStateProps {
  /** Material Icons ligature name. */
  icon?: string;
  title: string;
  description?: string;
  /** Optional action node (e.g. a Button). */
  action?: React.ReactNode;
}

export function EmptyState(props: EmptyStateProps): JSX.Element;
