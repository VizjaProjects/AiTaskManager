import { create } from "zustand";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import type { User, Role } from "../types";
import { authApi, setAccessToken, clearTokens } from "../api";

function storeUser(user: User) {
  if (Platform.OS === "web") {
    if (typeof window !== "undefined")
      window.localStorage.setItem("user", JSON.stringify(user));
  } else {
    SecureStore.setItemAsync("user", JSON.stringify(user));
  }
}

function removeUser() {
  if (Platform.OS === "web") {
    if (typeof window !== "undefined") window.localStorage.removeItem("user");
  } else {
    SecureStore.deleteItemAsync("user");
  }
}

async function loadUser(): Promise<{ user: User; token: string } | null> {
  if (Platform.OS === "web") {
    if (typeof window === "undefined") return null;
    const stored = window.localStorage.getItem("user");
    const token = window.localStorage.getItem("accessToken");
    if (stored && token) return { user: JSON.parse(stored) as User, token };
    return null;
  }
  const stored = await SecureStore.getItemAsync("user");
  const token = await SecureStore.getItemAsync("accessToken");
  if (stored && token) return { user: JSON.parse(stored) as User, token };
  return null;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (
    fullName: string,
    email: string,
    rawPassword: string,
  ) => Promise<{ userId: string }>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (email, password) => {
    const { data } = await authApi.login({ email, password });
    await setAccessToken(data.accessToken);

    if (Platform.OS !== "web") {
      await SecureStore.setItemAsync("refreshToken", "stored-via-cookie");
    }

    const user: User = {
      userId: data.userId,
      email: data.email,
      fullName: data.fullName,
      role: data.role,
    };

    storeUser(user);
    set({ user, isAuthenticated: true, isLoading: false });
  },

  register: async (fullName, email, rawPassword) => {
    const { data } = await authApi.register({ fullName, email, rawPassword });
    return { userId: data.userId };
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    }
    await clearTokens();
    removeUser();
    set({ user: null, isAuthenticated: false, isLoading: false });
  },

  setUser: (user) => set({ user, isAuthenticated: true }),

  hydrate: async () => {
    try {
      const result = await loadUser();
      if (result) {
        set({ user: result.user, isAuthenticated: true, isLoading: false });
        return;
      }
    } catch {
      // ignore
    }
    set({ isLoading: false });
  },
}));
