import { useLayoutEffect, useRef, type ReactNode } from "react";
import { Animated, Platform, type ViewStyle } from "react-native";
import { MORPH_EASING } from "./Fold";
import { useReducedMotion } from "@/lib/utils/useReducedMotion";

export type SceneFrom = {
  /** Horizontal offset the new scene slides in from, in px (sign = side). */
  dx?: number;
  /** Starting scale: <1 grows in, >1 settles down. */
  scale?: number;
  /** Where the scale is anchored, e.g. "30%". */
  originX?: string;
  originY?: string;
};

/**
 * Plays an entrance whenever `sceneKey` changes (not on mount). The value is
 * reset in a layout effect so the new scene never paints in its final place first.
 */
export function SceneShift({
  sceneKey,
  from,
  children,
  style,
}: {
  sceneKey: string;
  from: SceneFrom;
  children: ReactNode;
  style?: ViewStyle;
}) {
  const reduced = useReducedMotion();
  const progress = useRef(new Animated.Value(1)).current;
  const played = useRef(from);
  const lastKey = useRef(sceneKey);
  const first = useRef(true);
  if (lastKey.current !== sceneKey) {
    lastKey.current = sceneKey;
    played.current = from;
  }

  useLayoutEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    progress.stopAnimation();
    progress.setValue(0);
    Animated.timing(progress, {
      toValue: 1,
      duration: reduced ? 180 : 300,
      easing: MORPH_EASING,
      useNativeDriver: Platform.OS !== "web",
    }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sceneKey]);

  const f = played.current;
  const transform = reduced
    ? []
    : [
        { translateX: progress.interpolate({ inputRange: [0, 1], outputRange: [f.dx ?? 0, 0] }) },
        { scale: progress.interpolate({ inputRange: [0, 1], outputRange: [f.scale ?? 1, 1] }) },
      ];

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: progress.interpolate({
            inputRange: [0, 1],
            outputRange: [0.3, 1],
          }),
          transform,
          transformOrigin: `${f.originX ?? "50%"} ${f.originY ?? "50%"}`,
        } as any,
      ]}
    >
      {children}
    </Animated.View>
  );
}
