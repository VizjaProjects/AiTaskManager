import { View, Text } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useThemeStore } from "@/lib/stores";

type StatTone = "default" | "rose" | "amber" | "emerald";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: keyof typeof MaterialIcons.glyphMap;
  tone?: StatTone;
  iconColor?: string;
  iconBg?: string;
}

const TONES: Record<
  StatTone,
  { light: { iconColor: string; iconBg: string }; dark: { iconColor: string; iconBg: string } }
> = {
  default: {
    light: { iconColor: "#111111", iconBg: "#f3f4f6" },
    dark: { iconColor: "#e8e8e8", iconBg: "#2c2c2e" },
  },
  rose: {
    light: { iconColor: "#dc2c4f", iconBg: "#fff0f0" },
    dark: { iconColor: "#f87171", iconBg: "#3a2228" },
  },
  amber: {
    light: { iconColor: "#d97706", iconBg: "#fffbeb" },
    dark: { iconColor: "#fbbf24", iconBg: "#3a3020" },
  },
  emerald: {
    light: { iconColor: "#2E7D52", iconBg: "#ecfdf5" },
    dark: { iconColor: "#34d399", iconBg: "#1a3028" },
  },
};

export function StatCard({
  label,
  value,
  icon,
  tone = "default",
  iconColor,
  iconBg,
}: StatCardProps) {
  const isDark = useThemeStore((s) => s.mode) === "dark";
  const palette = TONES[tone][isDark ? "dark" : "light"];
  const resolvedIconColor = iconColor ?? palette.iconColor;
  const resolvedIconBg = iconBg ?? palette.iconBg;

  return (
    <View className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant min-h-[110px] justify-between">
      <View
        className="w-9 h-9 rounded-lg items-center justify-center"
        style={{ backgroundColor: resolvedIconBg }}
      >
        <MaterialIcons name={icon} size={18} color={resolvedIconColor} />
      </View>
      <View>
        <Text className="text-2xl font-headline text-on-surface">{value}</Text>
        <Text className="text-on-surface-variant font-label text-[11px] mt-1 uppercase tracking-wide">
          {label}
        </Text>
      </View>
    </View>
  );
}
