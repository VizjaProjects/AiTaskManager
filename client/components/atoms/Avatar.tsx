import { View, Text } from "react-native";
import { getInitials } from "@/lib/utils";

interface AvatarProps {
  fullName: string;
  size?: "sm" | "md" | "lg";
}

const SIZES = {
  sm: { container: "w-8 h-8", text: "text-xs" },
  md: { container: "w-10 h-10", text: "text-sm" },
  lg: { container: "w-14 h-14", text: "text-lg" },
};

export function Avatar({ fullName, size = "md" }: AvatarProps) {
  const s = SIZES[size];

  return (
    <View
      className={`${s.container} rounded-full bg-primary-fixed items-center justify-center`}
    >
      <Text className={`${s.text} font-headline text-primary`}>
        {getInitials(fullName)}
      </Text>
    </View>
  );
}
