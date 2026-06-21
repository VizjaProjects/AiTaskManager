import * as React from "react";

/** A transient floating notice; one tone per intent, leading icon takes the tone color. */
export interface ToastProps {
  message: string;
  tone?: "success" | "error" | "info";
  onDismiss?: () => void;
}

export function Toast(props: ToastProps): JSX.Element;
