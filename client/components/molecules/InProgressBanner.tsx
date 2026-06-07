import { View, Text } from "react-native";

type Variant = "blocked" | "feature" | "button-disabled";

interface InProgressBannerProps {
  title?: string;
  message: string;
  variant?: Variant;
}

export function InProgressBanner({
  title = "W przygotowaniu",
  message,
  variant = "feature",
}: InProgressBannerProps) {
  if (variant === "button-disabled") {
    return (
      <Text className="text-on-surface-variant font-body text-xs text-center mt-1">
        {message}
      </Text>
    );
  }

  return (
    <View
      className={`bg-primary-fixed rounded-xl p-4 my-2 ${
        variant === "blocked" ? "flex-1 justify-center mx-6" : ""
      }`}
    >
      <Text className="text-primary font-headline text-sm mb-1">{title}</Text>
      <Text className="text-on-surface-variant font-body text-sm leading-5">
        {message}
      </Text>
    </View>
  );
}
