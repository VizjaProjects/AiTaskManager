import { useEffect, useRef, useState } from "react";
import { Animated, Platform, Text, View, useWindowDimensions, type TextStyle } from "react-native";
import { MORPH_DURATION, MORPH_EASING, REDUCED_DURATION } from "@/components/molecules/Fold";

/**
 * Screen title that rolls like a date wheel: the new title comes up from below
 * when the user moves deeper into a flow (direction 1) and down from above when
 * going back (-1). The container clips, so only one line of travel is visible.
 * With "reduce motion" the titles cross-fade in place instead of rolling.
 */
export function RollingTitle({
  title,
  direction,
  reduceMotion = false,
  compact = false,
}: {
  title: string;
  direction: 1 | -1;
  reduceMotion?: boolean;
  /** Short windows: a slightly smaller display size. */
  compact?: boolean;
}) {
  const { width } = useWindowDimensions();
  const isWide = Platform.OS === "web" && width >= 1024;
  const [shown, setShown] = useState({ current: title, previous: null as string | null });
  const t = useRef(new Animated.Value(1)).current;
  // A title can wrap to a different number of lines, so the box eases to the new height too.
  const boxHeight = useRef(new Animated.Value(0)).current;
  const [measured, setMeasured] = useState(false);

  function onCurrentLayout(h: number) {
    if (!measured) {
      boxHeight.setValue(h);
      setMeasured(true);
      return;
    }
    Animated.timing(boxHeight, {
      toValue: h,
      duration: reduceMotion ? REDUCED_DURATION : MORPH_DURATION,
      easing: MORPH_EASING,
      useNativeDriver: false,
    }).start();
  }

  useEffect(() => {
    if (title === shown.current) return;
    setShown({ current: title, previous: shown.current });
    t.setValue(0);
    Animated.timing(t, {
      toValue: 1,
      duration: reduceMotion ? 260 : 420,
      easing: MORPH_EASING,
      useNativeDriver: Platform.OS !== "web",
    }).start(({ finished }) => {
      if (finished) setShown((s) => ({ ...s, previous: null }));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title]);

  const size = isWide ? (compact ? 38 : 44) : 32;
  const lineHeight = isWide ? (compact ? 44 : 52) : 38;
  const travel = reduceMotion ? 0 : lineHeight * 0.75;
  const textStyle: TextStyle = { fontSize: size, lineHeight };

  return (
    <Animated.View style={{ overflow: "hidden", height: measured ? boxHeight : undefined }}>
      <Animated.View
        onLayout={(e) => onCurrentLayout(e.nativeEvent.layout.height)}
        style={{
          opacity: t,
          transform: [{ translateY: t.interpolate({ inputRange: [0, 1], outputRange: [direction * travel, 0] }) }],
        }}
      >
        <Text accessibilityRole="header" className="text-brand-ink font-display" style={textStyle}>
          {shown.current}
        </Text>
      </Animated.View>
      {shown.previous && (
        <Animated.View
          aria-hidden
          importantForAccessibility="no-hide-descendants"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            opacity: t.interpolate({ inputRange: [0, 0.6, 1], outputRange: [1, 0, 0] }),
            transform: [{ translateY: t.interpolate({ inputRange: [0, 1], outputRange: [0, -direction * travel] }) }],
          }}
        >
          <Text className="text-brand-ink font-display" style={textStyle}>
            {shown.previous}
          </Text>
        </Animated.View>
      )}
    </Animated.View>
  );
}
