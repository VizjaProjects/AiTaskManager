import { TouchableOpacity, Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useThemeStore } from "@/lib/stores";

interface NavItemProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  active?: boolean;
  badge?: string;
  onPress?: () => void;
}

export function NavItem({ icon, label, active, badge, onPress }: NavItemProps) {
  const isDark = useThemeStore((s) => s.mode) === "dark";
  const activeIcon = isDark ? "rgba(255,255,255,0.88)" : "#1a1a18";
  const inactiveIcon = isDark ? "rgba(255,255,255,0.5)" : "#6b6965";

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      className={`flex-row items-center gap-2.5 px-3.5 py-2 rounded-md ${
        active ? "bg-active" : ""
      }`}
    >
      <MaterialIcons
        name={icon}
        size={18}
        color={active ? activeIcon : inactiveIcon}
      />
      <Text
        className={`flex-1 text-body-md ${
          active
            ? "text-on-surface font-headline"
            : "text-on-surface-variant font-body"
        }`}
      >
        {label}
      </Text>
      {badge && (
        <View className="px-2 py-0.5 rounded-sm bg-surface-container-low border border-outline-variant">
          <Text className="text-[10px] font-label text-text-tertiary uppercase tracking-wider">
            {badge}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
