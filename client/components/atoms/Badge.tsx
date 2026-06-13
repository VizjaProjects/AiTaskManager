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
    <View className={`px-1.5 py-0.5 rounded-sm ${PRIORITY_BADGE_BG[priority]}`}>
      <Text className={`text-[10px] font-label ${PRIORITY_TEXT[priority]}`}>
        {variant === "soft"
          ? label
          : label === "HIGH"
            ? "HIGH"
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
    <View className="flex-row items-center gap-1.5">
      <View
        className="w-[5px] h-[5px] rounded-full"
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
    <View className="px-2 py-0.5 rounded-sm bg-surface-container-low">
      <Text className="text-xs font-label" style={{ color: displayColor }}>
        {label}
      </Text>
    </View>
  );
}

export function AiSuggestedBadge() {
  return (
    <View className="flex-row items-center gap-1">
      <MaterialIcons name="auto-awesome" size={12} color="#5B4EE0" />
      <Text className="text-[11px] font-label text-[#5B4EE0]">AI</Text>
    </View>
  );
}

export function ProposedBadge() {
  return (
    <View className="px-1.5 py-0.5 rounded-sm bg-surface-container-low border border-outline-variant">
      <Text className="text-[10px] font-label text-text-tertiary uppercase tracking-wider">
        Proposed
      </Text>
    </View>
  );
}
