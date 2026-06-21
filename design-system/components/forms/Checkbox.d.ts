import * as React from "react";

/** A small square checkbox; accent fill when checked. */
export interface CheckboxProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export function Checkbox(props: CheckboxProps): JSX.Element;
