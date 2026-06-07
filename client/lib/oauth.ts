import { Alert, Platform } from "react-native";
import { getDesktopBridge } from "./desktop";

export async function startGoogleOAuth(): Promise<void> {
  const message =
    "Logowanie Google jest w przygotowaniu. Backend .NET nie obsługuje jeszcze OAuth2.";

  if (Platform.OS === "web" && typeof window !== "undefined") {
    window.alert(message);
    return;
  }

  Alert.alert("W przygotowaniu", message);

  const desktop = getDesktopBridge();
  if (desktop) {
    return;
  }
}
