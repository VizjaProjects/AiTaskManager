import { Platform } from "react-native";
import { getApiBaseUrl } from "./api";
import { getDesktopBridge } from "./desktop";

export async function startGoogleOAuth(): Promise<void> {
  const desktop = getDesktopBridge();
  if (desktop) {
    await desktop.openOAuth();
    return;
  }

  if (Platform.OS === "web" && typeof window !== "undefined") {
    const url = new URL("/oauth2/authorization/google", getApiBaseUrl());
    window.location.href = url.toString();
    return;
  }

  throw new Error(
    "Logowanie Google jest dostępne tylko w wersji web i desktop.",
  );
}
