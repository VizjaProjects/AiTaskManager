import { View, Text } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { getUiTokens } from "@/lib/utils/uiTokens";
import { useThemeStore } from "@/lib/stores";

interface PlanUsageBarProps {
  icon?: keyof typeof MaterialIcons.glyphMap;
  label: string;
  used: number;
  limit: number;
  compact?: boolean;
}

/**
 * A single "used / limit" progress row. Accent fill normally, amber when near
 * the limit (>=80%), critical-red when reached. Arena tokens only.
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

  const safeLimit = limit > 0 ? limit : 0;
  const ratio = safeLimit > 0 ? Math.min(used / safeLimit, 1) : 0;
  const pct = Math.round(ratio * 100);
  const reached = safeLimit > 0 && used >= safeLimit;
  const near = safeLimit > 0 && used / safeLimit >= 0.8;

  const accent = isDark ? "#9b8cff" : "#5b4ee0";
  const fillColor = reached ? "#C0392B" : near ? "#B7770D" : accent;

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
          style={{ color: reached ? "#C0392B" : ui.textSecondary }}
        >
          {used}/{safeLimit}
        </Text>
      </View>
      <View
        className="rounded-full overflow-hidden bg-surface-container-low"
        style={{ height: compact ? 6 : 8 }}
      >
        <View
          style={{
            width: `${pct}%`,
            height: "100%",
            backgroundColor: fillColor,
            borderRadius: 999,
          }}
        />
      </View>
    </View>
  );
}
