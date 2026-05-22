import { useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuthStore } from "@/lib/stores";
import { authApi } from "@/lib/api";

function firstParam(value?: string | string[]): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default function OAuthCallbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    token?: string;
    userId?: string;
    email?: string;
    fullName?: string;
    role?: string;
    code?: string;
    error?: string;
  }>();

  const loginWithOAuth = useAuthStore((s) => s.loginWithOAuth);

  useEffect(() => {
    async function handleCallback() {
      if (params.error) {
        router.replace("/(auth)/login");
        return;
      }

      const code = firstParam(params.code);
      if (code) {
        try {
          const { data } = await authApi.exchangeDesktopOAuthCode(code);
          await loginWithOAuth(
            data.accessToken,
            data.userId,
            data.email,
            data.fullName,
            data.role,
          );
          router.replace("/(app)/survey-onboarding");
          return;
        } catch {
          router.replace("/(auth)/login");
          return;
        }
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
