import { useEffect, useRef, useState, type ReactNode } from "react";
import { Animated, Easing, View } from "react-native";

export const MORPH_EASING = Easing.bezier(0.2, 0.7, 0.2, 1);
export const MORPH_DURATION = 320;
/** "Reduce motion" still eases between states, just shorter and without travel. */
export const REDUCED_DURATION = 200;
const START_DELAY = 48;

type Phase = "open" | "opening" | "closing" | "closed";

/**
 * Section that unfolds in place. While at rest it has natural height (so error
 * messages inside can grow); closed content is unmounted, so hidden fields are
 * out of the tab order and the accessibility tree.
 */
export function Fold({
  open,
  children,
  gap = 0,
  reduceMotion = false,
  appear = false,
}: {
  open: boolean;
  children: ReactNode;
  /** Space above the content, folded together with it. */
  gap?: number;
  /** System "reduce motion": shorter easing, never an instant jump. */
  reduceMotion?: boolean;
  /** Mounted open, but unfold from closed (an item that just arrived). */
  appear?: boolean;
}) {
  const [phase, setPhase] = useState<Phase>(open && !appear ? "open" : "closed");
  const progress = useRef(new Animated.Value(open ? 1 : 0)).current;
  const height = useRef<number | null>(null);
  const [measured, setMeasured] = useState(0);
  const triggeredAt = useRef(0);

  function run(to: 0 | 1) {
    // Opening sections need a layout pass to measure themselves. Every fold starts
    // moving at the same moment after the change, so fields between a closing and
    // an opening section slide once instead of jumping.
    const delay = Math.max(0, START_DELAY - (Date.now() - triggeredAt.current));
    Animated.timing(progress, {
      toValue: to,
      duration: reduceMotion ? REDUCED_DURATION : MORPH_DURATION,
      delay,
      easing: MORPH_EASING,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) setPhase(to ? "open" : "closed");
    });
  }

  useEffect(() => {
    triggeredAt.current = Date.now();
    if (open && (phase === "closed" || phase === "closing")) {
      progress.stopAnimation();
      if (phase === "closed") {
        progress.setValue(0);
        height.current = null;
      }
      setPhase("opening");
      // Opening waits for the first measurement in onLayout (unless already known).
      if (phase === "closing" && height.current) run(1);
    } else if (!open && (phase === "open" || phase === "opening")) {
      progress.stopAnimation();
      setPhase("closing");
      run(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (phase === "closed") return null;

  const animating = phase === "opening" || phase === "closing";
  const style = animating
    ? {
        overflow: "hidden" as const,
        height: progress.interpolate({ inputRange: [0, 1], outputRange: [0, measured] }),
        // Content fades in once there is room for it, and fades out first when closing.
        opacity: progress.interpolate({ inputRange: [0, 0.45, 1], outputRange: [0, 0, 1] }),
      }
    : null;

  return (
    <Animated.View style={style} pointerEvents={phase === "closing" ? "none" : "auto"}>
      <View
        style={{ paddingTop: gap }}
        onLayout={(e) => {
          const h = e.nativeEvent.layout.height;
          const first = height.current == null;
          height.current = h;
          setMeasured(h);
          if (phase === "opening" && first) run(1);
        }}
      >
        {children}
      </View>
    </Animated.View>
  );
}
