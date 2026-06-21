import * as React from "react";

export interface SelectOption {
  value: string;
  label: string;
}

/** A minimal dropdown; bordered trigger, soft-shadowed floating menu, accent-tinted selected row. */
export interface SelectProps {
  value?: string;
  options: SelectOption[];
  onChange?: (value: string) => void;
  placeholder?: string;
  /** Optional leading Material Icons ligature on the trigger. */
  icon?: string;
}

export function Select(props: SelectProps): JSX.Element;
