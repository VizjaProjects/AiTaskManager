import { View } from "react-native";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { InProgressBanner } from "@/components/molecules/InProgressBanner";

export default function OAuthCallbackScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => router.replace("/(auth)/login"), 4000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View className="flex-1 bg-background justify-center p-6">
      <InProgressBanner
        variant="blocked"
        title="OAuth — w przygotowaniu"
        message="Logowanie Google nie jest jeszcze dostępne w backendzie .NET. Za chwilę zostaniesz przekierowany do logowania."
      />
    </View>
  );
}
