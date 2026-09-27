import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Animated,
  Easing,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { MORPH_EASING } from "@/components/molecules/Fold";
import { useReducedMotion } from "@/lib/utils/useReducedMotion";

/** Animates only on change; the first render shows the current state as is. */
function useToggleValue(on: boolean, run: (v: Animated.Value, on: boolean) => void) {
  const value = useRef(new Animated.Value(on ? 1 : 0)).current;
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    run(value, on);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [on]);
  return value;
}

/** Square checkbox whose fill grows from the centre and whose check pops in. */
export function StepCheckbox({
  checked,
  size = 20,
  radius = 4,
  disabled,
  onPress,
  accessibilityLabel,
}: {
  checked: boolean;
  size?: number;
  radius?: number;
  disabled?: boolean;
  onPress: (event: any) => void;
  accessibilityLabel?: string;
}) {
  const reduced = useReducedMotion();
  const v = useToggleValue(checked, (value, on) => {
    Animated.timing(value, {
      toValue: on ? 1 : 0,
      duration: on ? (reduced ? 160 : 340) : reduced ? 120 : 180,
      easing: on && !reduced ? Easing.out(Easing.back(1.8)) : Easing.out(Easing.quad),
      useNativeDriver: Platform.OS !== "web",
    }).start();
  });
  const scale = (from: number) =>
    reduced ? [] : [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [from, 1] }) }];

  return (
    <TouchableOpacity
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      onPress={onPress}
      className={`border items-center justify-center overflow-hidden ${
        checked ? "border-primary" : "border-outline bg-surface"
      }`}
      style={{ width: size, height: size, borderRadius: radius }}
    >
      {/* className isn't applied to Animated.View here, so colour lives on a plain child. */}
      <Animated.View
        style={{
          ...StyleSheet.absoluteFillObject,
          opacity: v.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0, 1, 1], extrapolate: "clamp" }),
          transform: scale(0.35),
        }}
      >
        <View className="flex-1 bg-primary" />
      </Animated.View>
      <Animated.View
        style={{
          opacity: v.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 0, 1], extrapolate: "clamp" }),
          transform: scale(0.4),
        }}
      >
        <MaterialIcons name="check" size={Math.round(size * 0.62)} color="#ffffff" />
      </Animated.View>
    </TouchableOpacity>
  );
}

/**
 * Step title that fades when done; on a single line the strike is drawn across
 * it from the left, then handed over to a regular line-through.
 */
export function StrikeText({
  done,
  children,
  className,
  lineHeight,
  numberOfLines,
  doneOpacity = 0.6,
}: {
  done: boolean;
  children: ReactNode;
  className?: string;
  /** Line height of `className`, to tell a single line from a wrapped one. */
  lineHeight: number;
  numberOfLines?: number;
  doneOpacity?: number;
}) {
  const reduced = useReducedMotion();
  const [box, setBox] = useState<{ w: number; h: number } | null>(null);
  const [drawing, setDrawing] = useState(false);
  const prevDone = useRef(done);
  const line = useRef(new Animated.Value(0)).current;

  const fade = useToggleValue(done, (value, on) => {
    Animated.timing(value, {
      toValue: on ? 1 : 0,
      duration: reduced ? 160 : 280,
      easing: MORPH_EASING,
      useNativeDriver: Platform.OS !== "web",
    }).start();
  });

  const singleLine = !!box && box.h < lineHeight * 1.5;
  // The render where `done` flips must not flash the static strike before drawing starts.
  const justDone = done && !prevDone.current && singleLine && !reduced;

  useEffect(() => {
    const was = prevDone.current;
    prevDone.current = done;
    if (!done) line.setValue(0);
    if (!done || was || !singleLine || reduced) return;
    setDrawing(true);
    Animated.timing(line, {
      toValue: 1,
      duration: 300,
      delay: 60,
      easing: MORPH_EASING,
      useNativeDriver: false,
    }).start(() => setDrawing(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  return (
    <View className="flex-1 min-w-0" style={{ alignItems: "flex-start" }}>
      <Animated.View
        style={{
          maxWidth: "100%",
          opacity: fade.interpolate({ inputRange: [0, 1], outputRange: [1, doneOpacity] }),
        }}
        onLayout={(e) => setBox({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}
      >
        <Text
          className={className}
          numberOfLines={numberOfLines}
          style={{
            textDecorationLine: done && !drawing && !justDone ? "line-through" : "none",
          }}
        >
          {children}
        </Text>
        {(drawing || justDone) && box ? (
          <Animated.View
            pointerEvents="none"
            style={{
              position: "absolute",
              left: 0,
              top: Math.round(box.h / 2),
              height: 1,
              width: line.interpolate({ inputRange: [0, 1], outputRange: [0, box.w] }),
            }}
          >
            <View className="flex-1 bg-on-surface" />
          </Animated.View>
        ) : null}
      </Animated.View>
    </View>
  );
}
