import { View, Text, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { identityApi } from "@/lib/api";
import { useAuthStore } from "@/lib/stores";

export default function DesktopOAuthCompleteScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ code?: string; error?: string }>();
  const completeOAuthLogin = useAuthStore((s) => s.completeOAuthLogin);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function exchangeCode() {
      if (params.error) {
        setError("Logowanie Google nie powiodło się. Spróbuj ponownie.");
        setTimeout(() => router.replace("/(auth)/login"), 3000);
        return;
      }

      if (!params.code) {
        setError("Brak kodu OAuth do wymiany.");
        setTimeout(() => router.replace("/(auth)/login"), 3000);
        return;
      }

      try {
        const { data } = await identityApi.exchangeDesktopOAuthCode(params.code);
        await completeOAuthLogin(data);
        router.replace("/(app)/tasks");
      } catch {
        setError("Nie udało się wymienić kodu OAuth.");
        setTimeout(() => router.replace("/(auth)/login"), 3000);
      }
    }

    void exchangeCode();
  }, [params, completeOAuthLogin, router]);

  return (
    <View className="flex-1 bg-background justify-center items-center p-6 gap-4">
      {error ? (
        <Text className="text-on-error-container font-body text-center">{error}</Text>
      ) : (
        <>
          <ActivityIndicator size="large" />
          <Text className="text-on-surface-variant font-body text-center">
            Kończenie logowania w aplikacji desktopowej…
          </Text>
        </>
      )}
    </View>
  );
}
