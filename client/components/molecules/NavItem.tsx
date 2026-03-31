import { TouchableOpacity, Text } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

interface NavItemProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  active?: boolean;
  onPress?: () => void;
}

export function NavItem({ icon, label, active, onPress }: NavItemProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      className={`flex-row items-center gap-3 px-4 py-3 rounded-lg ${
        active ? "bg-[#f4f2ff] scale-[0.98]" : "hover:bg-[#f4f2ff]"
      }`}
    >
      <MaterialIcons
        name={icon}
        size={22}
        color={active ? "#4d41df" : "#94a3b8"}
      />
      <Text
        className={`text-sm ${
          active ? "text-primary font-headline" : "text-slate-500 font-body"
        }`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
