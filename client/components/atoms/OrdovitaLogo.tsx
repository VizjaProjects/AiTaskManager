import { View, Text, Image } from "react-native";

const FAVICON = require("../../assets/favicon.png");

interface OrdovitaLogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  showTagline?: boolean;
  variant?: "horizontal" | "stacked";
}

const SIZES = {
  sm: { box: 28, letter: "text-base", tagline: "text-[10px]" },
  md: { box: 36, letter: "text-lg", tagline: "text-xs" },
  lg: { box: 48, letter: "text-2xl", tagline: "text-sm" },
};

export function OrdovitaLogo({
  size = "md",
  showText = true,
  showTagline = false,
  variant = "horizontal",
}: OrdovitaLogoProps) {
  const s = SIZES[size];

  const iconBox = (
    <Image
      source={FAVICON}
      style={{
        width: s.box,
        height: s.box,
        borderRadius: s.box * 0.22,
      }}
      resizeMode="cover"
    />
  );

  const textBlock = showText && (
    <View className={variant === "stacked" ? "items-center" : ""}>
      <Text className={`text-on-surface font-display ${s.letter}`}>
        Ordovita
      </Text>
      {showTagline && (
        <Text className={`text-text-tertiary font-body ${s.tagline} mt-0.5`}>
          Premium AI Workspace
        </Text>
      )}
    </View>
  );

  if (variant === "stacked") {
    return (
      <View className="items-center gap-2">
        {iconBox}
        {textBlock}
      </View>
    );
  }

  return (
    <View className="flex-row items-center gap-2.5">
      {iconBox}
      {textBlock}
    </View>
  );
}
