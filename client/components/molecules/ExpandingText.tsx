import { useEffect, useRef, useState, type ReactNode } from "react";
import { Animated, Text } from "react-native";
import { MORPH_EASING } from "./Fold";
import { useReducedMotion } from "@/lib/utils/useReducedMotion";

type Phase = "clamped" | "opening" | "open" | "closing";

/**
 * Text clamped to `lines` that unfolds to its full height and back. At rest it's
 * a plain Text (clamped with an ellipsis, or natural height); only while moving
 * is the height animated.
 */
export function ExpandingText({
  expanded,
  lines,
  lineHeight,
  className,
  children,
}: {
  expanded: boolean;
  lines: number;
  /** Line height of `className` in px, gives the clamped height. */
  lineHeight: number;
  className?: string;
  children: ReactNode;
}) {
  const reduced = useReducedMotion();
  const collapsed = lines * lineHeight;
  const height = useRef(new Animated.Value(collapsed)).current;
  const full = useRef(0);
  const [phase, setPhase] = useState<Phase>(expanded ? "open" : "clamped");

  function run(to: number, end: Phase) {
    Animated.timing(height, {
      toValue: to,
      duration: reduced ? 180 : 320,
      easing: MORPH_EASING,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) setPhase(end);
    });
  }

  useEffect(() => {
    if (expanded && (phase === "clamped" || phase === "closing")) {
      height.stopAnimation();
      if (phase === "clamped") {
        height.setValue(collapsed);
        full.current = 0;
      }
      setPhase("opening");
      // From "closing" the text is already unclamped, so no new layout will come.
      if (phase === "closing" && full.current) run(full.current, "open");
    } else if (!expanded && (phase === "open" || phase === "opening")) {
      height.stopAnimation();
      if (phase === "open") height.setValue(full.current);
      setPhase("closing");
      run(collapsed, "clamped");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expanded]);

  const moving = phase === "opening" || phase === "closing";

  return (
    <Animated.View style={moving ? { height, overflow: "hidden" } : undefined}>
      <Text
        className={className}
        numberOfLines={phase === "clamped" ? lines : undefined}
        onLayout={(e) => {
          if (phase === "clamped") return;
          const h = e.nativeEvent.layout.height;
          const measuredNow = full.current !== h;
          full.current = h;
          if (phase === "opening" && measuredNow) run(h, "open");
        }}
      >
        {children}
      </Text>
    </Animated.View>
  );
}
