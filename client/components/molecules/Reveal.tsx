import { useEffect, useRef, type ReactNode } from "react";
import { Animated, Platform } from "react-native";
import { MORPH_EASING } from "./Fold";
import { useReducedMotion } from "@/lib/utils/useReducedMotion";

/**
 * Fades (and rises / grows) in once on mount; `animate={false}` renders it in
 * place. `leaving` plays it backwards, for an item on its way out.
 */
export function Reveal({
  children,
  delay = 0,
  rise = 12,
  scale = 1,
  animate = true,
  leaving = false,
}: {
  children: ReactNode;
  delay?: number;
  rise?: number;
  /** Starting scale, e.g. 0.6 for a pop. */
  scale?: number;
  animate?: boolean;
  leaving?: boolean;
}) {
  const reduced = useReducedMotion();
  const progress = useRef(new Animated.Value(animate ? 0 : 1)).current;

  useEffect(() => {
    if (!animate) return;
    Animated.timing(progress, {
      toValue: 1,
      duration: reduced ? 200 : 380,
      delay: reduced ? delay / 2 : delay,
      easing: MORPH_EASING,
      useNativeDriver: Platform.OS !== "web",
    }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!leaving) return;
    Animated.timing(progress, {
      toValue: 0,
      duration: reduced ? 140 : 200,
      easing: MORPH_EASING,
      useNativeDriver: Platform.OS !== "web",
    }).start();
  }, [leaving, progress, reduced]);

  return (
    <Animated.View
      style={{
        opacity: progress,
        transform: reduced
          ? []
          : [
              { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [rise, 0] }) },
              { scale: progress.interpolate({ inputRange: [0, 1], outputRange: [scale, 1] }) },
            ],
      }}
    >
      {children}
    </Animated.View>
  );
}
