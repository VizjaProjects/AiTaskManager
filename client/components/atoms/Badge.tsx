import { View, Text } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { TaskPriority } from "@/lib/types";
import {
  PRIORITY_BADGE_BG,
  PRIORITY_TEXT,
  PRIORITY_LABEL_SOFT,
  getCategoryDisplayColor,
} from "@/lib/utils";
import { useThemeStore } from "@/lib/stores";

interface BadgeProps {
  priority: TaskPriority;
  variant?: "default" | "soft";
}

export function PriorityBadge({ priority, variant = "default" }: BadgeProps) {
  const label = variant === "soft" ? PRIORITY_LABEL_SOFT[priority] : priority;
  return (
    <View
      className={`px-2.5 py-1 rounded-lg ${PRIORITY_BADGE_BG[priority]} ${
        variant === "soft" ? "" : "rounded-full"
      }`}
    >
      <Text className={`text-xs font-label ${PRIORITY_TEXT[priority]}`}>
        {variant === "soft"
          ? label
          : label === "HIGH"
            ? "HIGH PRIORITY"
            : label === "MEDIUM"
              ? "MEDIUM"
              : label === "LOW"
                ? "LOW"
                : "CRITICAL"}
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
    <View
      className="flex-row items-center gap-1.5 px-2 py-0.5 rounded-lg bg-surface-container-low"
    >
      <View
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: displayColor }}
      />
      <Text className="text-on-surface-variant font-label text-xs">{label}</Text>
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
      className="px-2.5 py-1 rounded-lg bg-surface-container-low"
    >
      <Text className="text-xs font-label" style={{ color: displayColor }}>
        {label}
      </Text>
    </View>
  );
}

export function AiSuggestedBadge() {
  return (
    <View className="flex-row items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200/60">
      <MaterialIcons name="auto-awesome" size={12} color="#d97706" />
      <Text className="text-xs font-label text-amber-700">AI Suggested</Text>
    </View>
  );
}

export function ProposedBadge() {
  return (
    <View className="px-2.5 py-1 rounded-lg bg-surface-container-low border border-outline-variant">
      <Text className="text-xs font-label text-on-surface-variant uppercase">
        Proposed
      </Text>
    </View>
  );
}
