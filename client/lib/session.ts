import { Platform, AppState } from "react-native";
import {
  getRefreshToken,
  identityApi,
  setAccessToken,
  setRefreshToken,
} from "./api";

const REFRESH_INTERVAL_MS = 4 * 60 * 1000;

let keepAliveTimer: ReturnType<typeof setInterval> | null = null;
let visibilityHandler: (() => void) | null = null;
let appStateSubscription: { remove: () => void } | null = null;

export async function refreshSession(): Promise<boolean> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return false;

  try {
    const { data } = await identityApi.refresh(refreshToken);
    await setAccessToken(data.accessToken);
    await setRefreshToken(data.refreshToken);
    return true;
  } catch {
    return false;
  }
}

export async function ensureValidSession(): Promise<boolean> {
  if (!(await getRefreshToken())) return false;
  return refreshSession();
}

function stopSessionKeepAlive() {
  if (keepAliveTimer) {
    clearInterval(keepAliveTimer);
    keepAliveTimer = null;
  }

  if (visibilityHandler && typeof document !== "undefined") {
    document.removeEventListener("visibilitychange", visibilityHandler);
    visibilityHandler = null;
  }

  appStateSubscription?.remove();
  appStateSubscription = null;
}

export function startSessionKeepAlive(): () => void {
  stopSessionKeepAlive();

  keepAliveTimer = setInterval(() => {
    void refreshSession();
  }, REFRESH_INTERVAL_MS);

  if (Platform.OS === "web" && typeof document !== "undefined") {
    visibilityHandler = () => {
      if (document.visibilityState === "visible") void refreshSession();
    };
    document.addEventListener("visibilitychange", visibilityHandler);
  } else {
    appStateSubscription = AppState.addEventListener("change", (state) => {
      if (state === "active") void refreshSession();
    });
  }

  return stopSessionKeepAlive;
}
