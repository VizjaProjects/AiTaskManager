import { Linking, Platform } from "react-native";
import { getDesktopBridge } from "./desktop";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8080";

export async function startGoogleOAuth(): Promise<void> {
  const desktop = getDesktopBridge();

  if (desktop) {
    await desktop.openOAuth();
    return;
  }

  const url = `${API_URL}/oauth2/authorization/google`;

  if (Platform.OS === "web" && typeof window !== "undefined") {
    window.location.href = url;
    return;
  }

  await Linking.openURL(url);
}
