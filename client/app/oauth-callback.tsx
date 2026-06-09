import { View, Text, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/stores";

export default function OAuthCallbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    token?: string;
    refreshToken?: string;
    userId?: string;
    email?: string;
    fullName?: string;
    role?: string;
    error?: string;
  }>();
  const loginWithOAuth = useAuthStore((s) => s.loginWithOAuth);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function completeLogin() {
      if (params.error) {
        setError("Logowanie Google nie powiodło się. Spróbuj ponownie.");
        setTimeout(() => router.replace("/(auth)/login"), 3000);
        return;
      }

      const { token, refreshToken, userId, email, fullName, role } = params;
      if (!token || !userId || !email || !fullName || !role) {
        setError("Brak danych logowania w odpowiedzi OAuth.");
        setTimeout(() => router.replace("/(auth)/login"), 3000);
        return;
      }

      try {
        await loginWithOAuth(
          token,
          userId,
          email,
          fullName,
          role,
          refreshToken,
        );
        router.replace("/(app)/tasks");
      } catch {
        setError("Nie udało się zakończyć logowania Google.");
        setTimeout(() => router.replace("/(auth)/login"), 3000);
      }
    }

    void completeLogin();
  }, [params, loginWithOAuth, router]);

  return (
    <View className="flex-1 bg-background justify-center items-center p-6 gap-4">
      {error ? (
        <Text className="text-on-error-container font-body text-center">{error}</Text>
      ) : (
        <>
          <ActivityIndicator size="large" />
          <Text className="text-on-surface-variant font-body text-center">
            Kończenie logowania Google…
          </Text>
        </>
      )}
    </View>
  );
}
