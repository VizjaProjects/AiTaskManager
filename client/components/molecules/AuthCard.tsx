import { View, Text, Platform, useWindowDimensions } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { OrdovitaLogo } from "../atoms/OrdovitaLogo";

interface AuthCardProps {
  children: React.ReactNode;
  showIllustration?: boolean;
}

function AuthIllustration() {
  return (
    <View className="flex-1 max-w-lg h-96 rounded-2xl bg-surface-container-low items-center justify-center p-10 gap-6">
      <OrdovitaLogo size="lg" variant="stacked" />
      <View className="gap-4 w-full">
        {[
          { icon: "checklist" as const, text: "Organize tasks & priorities" },
          { icon: "calendar-today" as const, text: "Plan your day with events" },
          { icon: "auto-awesome" as const, text: "AI-powered suggestions" },
        ].map((item) => (
          <View key={item.text} className="flex-row items-center gap-3">
            <View className="w-8 h-8 rounded-lg bg-surface-container-lowest items-center justify-center">
              <MaterialIcons name={item.icon} size={16} color="#888888" />
            </View>
            <Text className="text-on-surface-variant font-body text-body-md flex-1">
              {item.text}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export function AuthCard({ children, showIllustration = true }: AuthCardProps) {
  const { width } = useWindowDimensions();
  const isWide = Platform.OS === "web" && width >= 1024;

  if (isWide && showIllustration) {
    return (
      <View className="flex-1 flex-row items-center justify-center px-8 py-12 gap-12 bg-background">
        <View className="flex-1 max-w-md bg-surface-container-lowest rounded-2xl p-10 border border-outline-variant">
          {children}
        </View>
        <AuthIllustration />
      </View>
    );
  }

  return (
    <View className="flex-1 items-center justify-center px-6 py-12 bg-background">
      <View className="w-full max-w-md bg-surface-container-lowest rounded-2xl p-8 border border-outline-variant">
        {children}
      </View>
    </View>
  );
}

export function AuthHeader({
  title,
  subtitle,
}: {
  title?: string;
  subtitle?: string;
}) {
  return (
    <View className="items-center gap-3 mb-8">
      <OrdovitaLogo size="lg" variant="stacked" />
      {title && (
        <Text className="text-on-surface font-headline text-headline-md text-center">
          {title}
        </Text>
      )}
      {subtitle && (
        <Text className="text-on-surface-variant font-body text-body-md text-center">
          {subtitle}
        </Text>
      )}
    </View>
  );
}
