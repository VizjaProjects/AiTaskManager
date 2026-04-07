import { View, Text } from "react-native";
import { TaskPriority } from "@/lib/types";
import {
  PRIORITY_BADGE_BG,
  PRIORITY_TEXT,
  getCategoryDisplayColor,
} from "@/lib/utils";
import { useThemeStore } from "@/lib/stores";

interface BadgeProps {
  priority: TaskPriority;
}

export function PriorityBadge({ priority }: BadgeProps) {
  return (
    <View className={`px-2 py-0.5 rounded-full ${PRIORITY_BADGE_BG[priority]}`}>
      <Text
        className={`text-[10px] font-headline uppercase ${PRIORITY_TEXT[priority]}`}
      >
        {priority}
      </Text>
    </View>
  );
}

interface ColorBadgeProps {
  label: string;
  color: string;
}

export function ColorBadge({ label, color }: ColorBadgeProps) {
  const isDark = useThemeStore((s) => s.mode) === "dark";
  const displayColor = getCategoryDisplayColor(color, isDark);
  return (
    <View className="flex-row items-center gap-1.5">
      <View
        className="w-2.5 h-2.5 rounded-full"
        style={{ backgroundColor: displayColor }}
      />
      <Text className="text-on-surface-variant font-body text-xs">{label}</Text>
    </View>
  );
}

interface StatusBadgeProps {
  label: string;
  color: string;
}

export function StatusBadge({ label, color }: StatusBadgeProps) {
  const isDark = useThemeStore((s) => s.mode) === "dark";
  const displayColor = getCategoryDisplayColor(color, isDark);
  return (
    <View
      className="px-2.5 py-1 rounded-full"
      style={{ backgroundColor: `${displayColor}20` }}
    >
      <Text className="text-xs font-label" style={{ color: displayColor }}>
        {label}
      </Text>
    </View>
  );
}
