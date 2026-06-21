import * as React from "react";

/**
 * A surface text field with a 1px border, optional leading icon, and no focus ring.
 *
 * @startingPoint section="Forms" subtitle="Labeled text field with icon & error" viewport="700x150"
 */
export interface InputProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  /** Leading Material Icons ligature name. */
  icon?: string;
  type?: string;
  label?: string;
  /** Error message; turns the border red and shows the text below. */
  error?: string;
}

export function Input(props: InputProps): JSX.Element;
