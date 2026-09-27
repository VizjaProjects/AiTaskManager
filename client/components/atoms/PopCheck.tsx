import { useEffect, useRef } from "react";
import { Animated, Easing, Platform, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useReducedMotion } from "@/lib/utils/useReducedMotion";

/** Check mark that pops in on mount: the confirmation that an action went through. */
export function PopCheck({
  size = 20,
  className = "bg-success",
  color = "#ffffff",
  delay = 0,
}: {
  size?: number;
  /** Circle fill. */
  className?: string;
  color?: string;
  /** Wait for a surrounding reveal, so the pop isn't spent while still invisible. */
  delay?: number;
}) {
  const reduced = useReducedMotion();
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: reduced ? 180 : 420,
      delay,
      easing: reduced ? Easing.out(Easing.quad) : Easing.out(Easing.back(2.2)),
      useNativeDriver: Platform.OS !== "web",
    }).start();
  }, [progress, reduced, delay]);

  return (
    <Animated.View
      style={{
        opacity: progress.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0, 1, 1] }),
        transform: reduced
          ? []
          : [{ scale: progress.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }) }],
      }}
    >
      <View
        className={`${className} items-center justify-center rounded-full`}
        style={{ width: size, height: size }}
      >
        <MaterialIcons name="check" size={Math.round(size * 0.7)} color={color} />
      </View>
    </Animated.View>
  );
}
