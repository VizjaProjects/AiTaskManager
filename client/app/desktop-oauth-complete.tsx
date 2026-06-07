import { View } from "react-native";
import { InProgressBanner } from "@/components/molecules/InProgressBanner";

export default function DesktopOAuthCompleteScreen() {
  return (
    <View className="flex-1 bg-background justify-center p-6">
      <InProgressBanner
        variant="blocked"
        title="Desktop OAuth — w przygotowaniu"
        message="Wymiana kodu OAuth dla aplikacji desktopowej nie jest jeszcze zaimplementowana w backendzie .NET."
      />
    </View>
  );
}
