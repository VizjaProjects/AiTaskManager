import { useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuthStore } from "@/lib/stores";

export default function OAuthCallbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    token?: string;
    userId?: string;
    email?: string;
    fullName?: string;
    role?: string;
    error?: string;
  }>();

  const loginWithOAuth = useAuthStore((s) => s.loginWithOAuth);

  useEffect(() => {
    async function handleCallback() {
      if (params.error) {
        router.replace("/(auth)/login");
        return;
      }

      if (
        params.token &&
        params.userId &&
        params.email &&
        params.fullName &&
        params.role
      ) {
        await loginWithOAuth(
          params.token,
          params.userId,
          params.email,
          params.fullName,
          params.role,
        );
        router.replace("/(app)/survey-onboarding");
      } else {
        router.replace("/(auth)/login");
      }
    }

    handleCallback();
  }, [params, loginWithOAuth, router]);

  return (
    <View className="flex-1 bg-background items-center justify-center">
      <ActivityIndicator size="large" color="#4d41df" />
      <Text className="text-on-surface-variant font-body text-sm mt-4">
        Logowanie przez Google...
      </Text>
    </View>
  );
}
