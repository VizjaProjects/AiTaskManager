import { useEffect } from "react";
import { Linking, Platform, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { Button, OrdovitaLogo } from "@/components/atoms";

function firstParam(value?: string | string[]): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function desktopCallbackUrl(code: string) {
  return `aitaskmanager://oauth-callback?code=${encodeURIComponent(code)}`;
}

async function openDesktopCallback(code: string) {
  const url = desktopCallbackUrl(code);

  if (Platform.OS === "web" && typeof window !== "undefined") {
    window.location.href = url;
    return;
  }

  await Linking.openURL(url);
}

export default function DesktopOAuthCompleteScreen() {
  const params = useLocalSearchParams<{
    code?: string;
    error?: string;
  }>();
  const code = firstParam(params.code);
  const error = firstParam(params.error);

  useEffect(() => {
    if (!code || error) return;

    openDesktopCallback(code).catch(() => {});

    if (Platform.OS === "web" && typeof window !== "undefined") {
      const timer = window.setTimeout(() => {
        window.close();
      }, 1200);

      return () => window.clearTimeout(timer);
    }
  }, [code, error]);

  const success = Boolean(code && !error);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center px-6">
        <View className="w-full max-w-md bg-surface rounded-3xl border border-outline-variant p-8 gap-6 items-center">
          <OrdovitaLogo size="lg" />

          <View className="w-14 h-14 rounded-2xl bg-primary-fixed items-center justify-center">
            <MaterialIcons
              name={success ? "check-circle" : "error-outline"}
              size={30}
              color={success ? "#4d41df" : "#ba1a1a"}
            />
          </View>

          <View className="gap-2">
            <Text className="text-on-surface font-headline text-2xl text-center">
              {success ? "Logowanie zakonczone" : "Logowanie nieudane"}
            </Text>
            <Text className="text-on-surface-variant font-body text-sm leading-6 text-center">
              {success
                ? "Mozesz wrocic do aplikacji Ordovita. Jesli ta karta nie zamknela sie automatycznie, mozesz zamknac ja recznie."
                : "Nie udalo sie dokonczyc logowania Google. Wroc do aplikacji i sprobuj ponownie."}
            </Text>
          </View>

          {success && (
            <Button
              label="Wroc do aplikacji"
              fullWidth
              onPress={() => code && openDesktopCallback(code).catch(() => {})}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
