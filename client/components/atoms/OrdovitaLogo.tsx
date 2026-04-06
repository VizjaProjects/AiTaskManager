import { View, Text } from "react-native";

interface OrdovitaLogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

const SIZES = {
  sm: { icon: 24, text: "text-base", dot: 6, bar1: 10, bar2: 7 },
  md: { icon: 32, text: "text-lg", dot: 8, bar1: 14, bar2: 10 },
  lg: { icon: 48, text: "text-2xl", dot: 10, bar1: 18, bar2: 12 },
};

export function OrdovitaLogo({
  size = "md",
  showText = true,
}: OrdovitaLogoProps) {
  const s = SIZES[size];

  return (
    <View className="flex-row items-center gap-2">
      <View
        style={{
          width: s.icon,
          height: s.icon,
          borderRadius: s.icon * 0.25,
          backgroundColor: "#4d41df",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <View style={{ alignItems: "flex-start", gap: 2 }}>
          <View
            style={{
              width: s.bar1,
              height: 3,
              backgroundColor: "#ffffff",
              borderRadius: 1.5,
            }}
          />
          <View
            style={{
              width: s.bar2,
              height: 3,
              backgroundColor: "#a5b4fc",
              borderRadius: 1.5,
            }}
          />
          <View
            style={{
              width: s.dot,
              height: 3,
              backgroundColor: "#fbbf24",
              borderRadius: 1.5,
            }}
          />
        </View>
      </View>
      {showText && (
        <Text className={`text-primary font-headline ${s.text}`}>Ordovita</Text>
      )}
    </View>
  );
}
