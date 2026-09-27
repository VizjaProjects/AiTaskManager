import { useEffect, useRef, useState } from "react";
import { Animated, View, Text } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { getUiTokens } from "@/lib/utils/uiTokens";
import { useThemeStore } from "@/lib/stores";
import { useReducedMotion } from "@/lib/utils/useReducedMotion";
import { MORPH_EASING } from "./Fold";

interface PlanUsageBarProps {
  icon?: keyof typeof MaterialIcons.glyphMap;
  label: string;
  used: number;
  limit: number;
  compact?: boolean;
}

/**
 * A single "used / limit" progress row. Accent fill normally, amber when near
 * the limit (>=80%), critical-red when reached. The fill grows to a new value
 * and blends into the new colour instead of jumping.
 */
export function PlanUsageBar({
  icon,
  label,
  used,
  limit,
  compact,
}: PlanUsageBarProps) {
  const isDark = useThemeStore((s) => s.mode === "dark");
  const ui = getUiTokens(isDark);
  const reduced = useReducedMotion();

  const safeLimit = limit > 0 ? limit : 0;
  const ratio = safeLimit > 0 ? Math.min(used / safeLimit, 1) : 0;
  const pct = Math.round(ratio * 100);
  const reached = safeLimit > 0 && used >= safeLimit;
  const near = safeLimit > 0 && used / safeLimit >= 0.8;

  const fillColor = reached ? ui.critical : near ? ui.warning : ui.accent;

  const width = useRef(new Animated.Value(pct)).current;
  const blend = useRef(new Animated.Value(1)).current;
  const [colors, setColors] = useState({ from: fillColor, to: fillColor });

  useEffect(() => {
    Animated.timing(width, {
      toValue: pct,
      duration: reduced ? 200 : 520,
      easing: MORPH_EASING,
      useNativeDriver: false,
    }).start();
  }, [pct, reduced, width]);

  useEffect(() => {
    if (fillColor === colors.to) return;
    setColors({ from: colors.to, to: fillColor });
    blend.setValue(0);
    Animated.timing(blend, {
      toValue: 1,
      duration: reduced ? 200 : 520,
      easing: MORPH_EASING,
      useNativeDriver: false,
    }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fillColor]);

  return (
    <View className="gap-1.5">
      <View className="flex-row items-center gap-2">
        {icon && (
          <MaterialIcons name={icon} size={14} color={ui.textSecondary} />
        )}
        <Text
          className={`font-body flex-1 ${compact ? "text-xs" : "text-body-md"}`}
          style={{ color: ui.textSecondary }}
        >
          {label}
        </Text>
        <Text
          className={`font-headline ${compact ? "text-xs" : "text-body-md"}`}
          style={{ color: reached ? ui.critical : ui.textSecondary }}
        >
          {used}/{safeLimit}
        </Text>
      </View>
      <View
        className="rounded-full overflow-hidden bg-surface-container-low"
        style={{ height: compact ? 6 : 8 }}
      >
        <Animated.View
          style={{
            width: width.interpolate({
              inputRange: [0, 100],
              outputRange: ["0%", "100%"],
              extrapolate: "clamp",
            }),
            height: "100%",
            backgroundColor: blend.interpolate({
              inputRange: [0, 1],
              outputRange: [colors.from, colors.to],
            }),
            borderRadius: 999,
          }}
        />
      </View>
    </View>
  );
}
