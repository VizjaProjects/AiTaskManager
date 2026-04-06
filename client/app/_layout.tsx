import "../global.css";
import { useEffect } from "react";
import { View, Platform } from "react-native";
import { Slot, useRouter, useSegments } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_900Black,
} from "@expo-google-fonts/inter";
import * as SplashScreen from "expo-splash-screen";
import { useAuthStore } from "@/lib/stores";
import { useThemeStore } from "@/lib/stores";
import { setOnRefreshFailed } from "@/lib/api";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 2, staleTime: 5 * 60 * 1000 },
  },
});

function AuthGate() {
  const segments = useSegments();
  const router = useRouter();
  const { isAuthenticated, isLoading, hydrate } = useAuthStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    setOnRefreshFailed(() => {
      useAuthStore.getState().logout();
    });
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";
    const isPublicPage =
      segments[0] === "privacy-policy" || segments[0] === "terms-of-service";

    if (!isAuthenticated && !inAuthGroup && !isPublicPage) {
      router.replace("/(auth)/login");
    } else if (isAuthenticated && inAuthGroup) {
      router.replace("/(app)/dashboard");
    }
  }, [isAuthenticated, isLoading, segments, router]);

  return <Slot />;
}

export default function RootLayout() {
  const mode = useThemeStore((s) => s.mode);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_900Black,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    if (Platform.OS === "web" && typeof document !== "undefined") {
      if (mode === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, [mode]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <StatusBar style={mode === "dark" ? "light" : "dark"} />
        <AuthGate />
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
