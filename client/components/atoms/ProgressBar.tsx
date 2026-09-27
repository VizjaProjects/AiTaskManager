import { useEffect, useRef } from "react";
import { Animated, View } from "react-native";
import { MORPH_EASING } from "@/components/molecules/Fold";
import { useReducedMotion } from "@/lib/utils/useReducedMotion";

/** Fill that grows from the previous value to the new one; the first render is static. */
export function ProgressBar({
  value,
  className = "h-1.5 rounded-full bg-surface-container",
  fillClassName = "bg-primary",
}: {
  /** 0–100 */
  value: number;
  className?: string;
  fillClassName?: string;
}) {
  const reduced = useReducedMotion();
  const width = useRef(new Animated.Value(value)).current;

  useEffect(() => {
    Animated.timing(width, {
      toValue: value,
      duration: reduced ? 200 : 420,
      easing: MORPH_EASING,
      useNativeDriver: false,
    }).start();
  }, [value, reduced, width]);

  return (
    <View className={`${className} overflow-hidden`}>
      <Animated.View
        style={{
          height: "100%",
          width: width.interpolate({
            inputRange: [0, 100],
            outputRange: ["0%", "100%"],
            extrapolate: "clamp",
          }),
        }}
      >
        <View className={`flex-1 rounded-full ${fillClassName}`} />
      </Animated.View>
    </View>
  );
}
