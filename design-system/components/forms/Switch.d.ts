import * as React from "react";

/** A pill toggle for settings; accent track when on. */
export interface SwitchProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
}

export function Switch(props: SwitchProps): JSX.Element;
