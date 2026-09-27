import { useEffect, useRef } from "react";
import { Animated } from "react-native";

const PULSE_MS = 900;
const STILL_PULSE_MS = 1100;

/**
 * A single pulse around an item that has just landed somewhere (place it inside
 * a positioned parent). `still` (reduced motion): the outline lights up and fades
 * in place instead of spreading.
 */
export function LandPulse({
  color,
  radius,
  still = false,
  delay = 0,
}: {
  color: string;
  radius: number;
  still?: boolean;
  delay?: number;
}) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(v, {
      toValue: 1,
      duration: still ? STILL_PULSE_MS : PULSE_MS,
      delay,
      useNativeDriver: false,
    }).start();
  }, [v, still, delay]);
  if (still) {
    return (
      <Animated.View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: -3,
          left: -3,
          right: -3,
          bottom: -3,
          borderWidth: 3,
          borderColor: color,
          borderRadius: radius + 3,
          opacity: v.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0, 0.6, 0] }),
        }}
      />
    );
  }
  const spread = v.interpolate({ inputRange: [0, 1], outputRange: [0, 12] });
  const inset = v.interpolate({ inputRange: [0, 1], outputRange: [0, -12] });
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: "absolute",
        top: inset,
        left: inset,
        right: inset,
        bottom: inset,
        borderWidth: spread,
        borderColor: color,
        borderRadius: v.interpolate({ inputRange: [0, 1], outputRange: [radius, radius + 12] }),
        opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0] }),
      }}
    />
  );
}
