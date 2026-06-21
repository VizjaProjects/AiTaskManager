import * as React from "react";

/** Initials in a neutral filled circle — the Arena identity chip. */
export interface AvatarProps {
  /** Full name; first two initials are shown. */
  name: string;
  size?: "sm" | "md" | "lg";
}

export function Avatar(props: AvatarProps): JSX.Element;
