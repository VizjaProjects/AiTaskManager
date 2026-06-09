import "../global.css";
import { useEffect, useRef } from "react";
import { View, Platform } from "react-native";
import { Slot, useRouter, usePathname } from "expo-router";
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
import { useAuthStore, useWorkspaceStore } from "@/lib/stores";
import { useThemeStore } from "@/lib/stores";
import { setOnRefreshFailed } from "@/lib/api";
import { startSessionKeepAlive } from "@/lib/session";
import { Role } from "@/lib/types";
import { useSurveyGate } from "@/lib/hooks";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 2, staleTime: 5 * 60 * 1000 },
  },
});

function routeKey(path: string) {
  return path
    .replace(/^\/\(app\)/, "")
    .replace(/^\/\(auth\)/, "")
    .replace(/^\//, "");
}

function AuthGate() {
  const pathname = usePathname();
  const router = useRouter();
  const lastRedirectRef = useRef<string | null>(null);
  const { isAuthenticated, isLoading, hydrate, user } = useAuthStore();
  const workspaces = useWorkspaceStore((s) => s.workspaces);
  const workspaceLoading = useWorkspaceStore((s) => s.isLoading);
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  const { hasPendingSurvey, isLoading: surveyCheckLoading } = useSurveyGate();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    setOnRefreshFailed(() => {
      useAuthStore.getState().logout();
      queryClient.clear();
    });
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    return startSessionKeepAlive();
  }, [isAuthenticated]);

  const wasAuthenticatedRef = useRef(false);
  useEffect(() => {
    if (isAuthenticated) {
      wasAuthenticatedRef.current = true;
      return;
    }
    if (wasAuthenticatedRef.current) {
      queryClient.clear();
      wasAuthenticatedRef.current = false;
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isLoading) return;
    if (isAuthenticated && workspaceLoading) return;
    if (isAuthenticated && user?.role !== Role.ADMIN && surveyCheckLoading) {
      return;
    }

    const inAuthGroup =
      pathname.startsWith("/login") ||
      pathname.startsWith("/register") ||
      pathname.startsWith("/forgot-password");
    const isPublicPage =
      pathname === "/" ||
      pathname.startsWith("/privacy-policy") ||
      pathname.startsWith("/terms-of-service") ||
      pathname.startsWith("/oauth-callback") ||
      pathname.startsWith("/desktop-oauth-complete");
    const isSurveyRoute =
      pathname.includes("survey-onboarding") || pathname.endsWith("/surveys");
    const isWorkspaceSetup =
      pathname.includes("workspace-create") ||
      pathname.endsWith("/workspaces") ||
      pathname.includes("workspace-settings");
    const inAppGroup = isAuthenticated && !inAuthGroup && !isPublicPage;
    const isUser = user?.role !== Role.ADMIN;

    let target: string | null = null;

    if (!isAuthenticated && !inAuthGroup && !isPublicPage) {
      target = "/(auth)/login";
    } else if (isAuthenticated && inAuthGroup) {
      if (isUser && hasPendingSurvey) {
        target = "/(app)/survey-onboarding";
      } else if (workspaces.length === 0) {
        target = "/(app)/workspace-create";
      } else {
        target = "/(app)/dashboard";
      }
    } else if (
      isAuthenticated &&
      isUser &&
      hasPendingSurvey &&
      !surveyCheckLoading &&
      inAppGroup &&
      !isSurveyRoute
    ) {
      target = "/(app)/survey-onboarding";
    } else if (
      isAuthenticated &&
      inAppGroup &&
      !isWorkspaceSetup &&
      !isSurveyRoute &&
      !hasPendingSurvey &&
      workspaces.length === 0
    ) {
      target = "/(app)/workspace-create";
    } else if (
      isAuthenticated &&
      inAppGroup &&
      !isWorkspaceSetup &&
      !isSurveyRoute &&
      !hasPendingSurvey &&
      workspaces.length > 0 &&
      !activeWorkspaceId
    ) {
      target = "/(app)/workspaces";
    }

    if (!target || routeKey(target) === routeKey(pathname)) {
      lastRedirectRef.current = null;
      return;
    }

    if (lastRedirectRef.current === target) {
      return;
    }

    lastRedirectRef.current = target;
    router.replace(target as never);
  }, [
    isAuthenticated,
    isLoading,
    workspaceLoading,
    surveyCheckLoading,
    hasPendingSurvey,
    workspaces.length,
    activeWorkspaceId,
    pathname,
    router,
    user?.role,
  ]);

  useEffect(() => {
    lastRedirectRef.current = null;
  }, [pathname]);

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

  useEffect(() => {
    if (Platform.OS === "web" && typeof document !== "undefined") {
      const el = document.getElementById("ordovita-legal-links");
      if (el) el.remove();
    }
  }, []);

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
