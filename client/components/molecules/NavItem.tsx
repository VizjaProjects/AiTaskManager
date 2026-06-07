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
  const activeIcon = isDark ? "#e8e8e8" : "#111111";
  const inactiveIcon = "#9ca3af";

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      className={`flex-row items-center gap-3 px-4 py-2.5 rounded-xl ${
        active ? "bg-surface-container-low" : ""
      }`}
    >
      <MaterialIcons
        name={icon}
        size={20}
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
        <View className="px-2 py-0.5 rounded-full bg-surface-container-low border border-outline-variant">
          <Text className="text-[10px] font-label text-on-surface-variant">
            {badge}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
