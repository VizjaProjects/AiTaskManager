import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8080";

export const api = axios.create({
  baseURL: `${BASE_URL}/v1/api`,
  timeout: 60000,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

let onRefreshFailed: (() => void) | null = null;

export function setOnRefreshFailed(cb: () => void) {
  onRefreshFailed = cb;
}

async function getAccessToken(): Promise<string | null> {
  if (Platform.OS === "web") {
    return typeof window !== "undefined"
      ? window.localStorage.getItem("accessToken")
      : null;
  }
  return SecureStore.getItemAsync("accessToken");
}

async function setAccessToken(token: string): Promise<void> {
  if (Platform.OS === "web") {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("accessToken", token);
    }
    return;
  }
  await SecureStore.setItemAsync("accessToken", token);
}

async function clearTokens(): Promise<void> {
  if (Platform.OS === "web") {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("accessToken");
      window.localStorage.removeItem("refreshToken");
      window.localStorage.removeItem("user");
    }
    return;
  }
  await SecureStore.deleteItemAsync("accessToken");
  await SecureStore.deleteItemAsync("refreshToken");
}

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach((p) => {
    if (error) {
      p.reject(error);
    } else {
      p.resolve(token!);
    }
  });
  failedQueue = [];
}

api.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const { data } = await api.put("/auth/refresh");
      await setAccessToken(data.accessToken);
      processQueue(null, data.accessToken);
      originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      await clearTokens();
      onRefreshFailed?.();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export { getAccessToken, setAccessToken, clearTokens, setOnRefreshFailed };
