import { View, Text } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: keyof typeof MaterialIcons.glyphMap;
  iconColor?: string;
  variant?: "glass" | "primary";
}

export function StatCard({
  label,
  value,
  icon,
  iconColor = "#4d41df",
  variant = "glass",
}: StatCardProps) {
  const isGlass = variant === "glass";

  return (
    <View
      className={`p-6 rounded-2xl h-32 justify-between ${
        isGlass ? "bg-white/70" : "bg-primary-container shadow-lg"
      }`}
    >
      <View className="flex-row justify-between items-start">
        <Text
          className={`font-label text-xs uppercase tracking-widest ${
            isGlass ? "text-on-surface-variant" : "text-white/80"
          }`}
        >
          {label}
        </Text>
        <MaterialIcons
          name={icon}
          size={22}
          color={isGlass ? iconColor : "#ffffff"}
        />
      </View>
      <Text
        className={`text-4xl font-display-black ${
          isGlass ? "text-on-surface" : "text-white"
        }`}
      >
        {value}
      </Text>
    </View>
  );
}
