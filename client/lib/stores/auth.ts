import { create } from "zustand";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import type { User, Role, LoginResponse } from "../types";
import {
  identityApi,
  setAccessToken,
  setRefreshToken,
  clearTokens,
  getRefreshToken,
  getAccessToken,
} from "../api";
import { ensureValidSession } from "../session";
import { useWorkspaceStore } from "./workspace";

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
  loginWithOAuth: (
    token: string,
    userId: string,
    email: string,
    fullName: string,
    role: string,
    refreshToken?: string,
  ) => Promise<void>;
  completeOAuthLogin: (data: LoginResponse) => Promise<void>;
  register: (
    fullName: string,
    email: string,
    password: string,
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
    const { data } = await identityApi.login({ email, password });
    await setAccessToken(data.accessToken);
    await setRefreshToken(data.refreshToken);

    const user: User = {
      userId: data.userId,
      email: data.email,
      fullName: data.fullName,
      role: data.role as Role,
    };

    storeUser(user);
    set({ user, isAuthenticated: true, isLoading: false });
    await useWorkspaceStore.getState().fetchWorkspaces();
  },

  loginWithOAuth: async (token, userId, email, fullName, role, refreshToken?) => {
    await setAccessToken(token);
    if (refreshToken) await setRefreshToken(refreshToken);
    const user: User = {
      userId,
      email,
      fullName,
      role: role as Role,
    };
    storeUser(user);
    set({ user, isAuthenticated: true, isLoading: false });
    await useWorkspaceStore.getState().fetchWorkspaces();
  },

  completeOAuthLogin: async (data) => {
    await setAccessToken(data.accessToken);
    await setRefreshToken(data.refreshToken);
    const user: User = {
      userId: data.userId,
      email: data.email,
      fullName: data.fullName,
      role: data.role as Role,
    };
    storeUser(user);
    set({ user, isAuthenticated: true, isLoading: false });
    await useWorkspaceStore.getState().fetchWorkspaces();
  },

  register: async (fullName, email, password) => {
    const { data } = await identityApi.register({ fullName, email, password });
    return { userId: data.userId };
  },

  logout: async () => {
    await clearTokens();
    removeUser();
    useWorkspaceStore.getState().reset();
    set({ user: null, isAuthenticated: false, isLoading: false });
  },

  setUser: (user) => {
    storeUser(user);
    set({ user });
  },

  hydrate: async () => {
    const stored = await loadUser();
    if (!stored) {
      set({ isLoading: false });
      return;
    }

    const refreshToken = await getRefreshToken();
    if (refreshToken) {
      const refreshed = await ensureValidSession();
      if (!refreshed) {
        const accessToken = await getAccessToken();
        if (!accessToken) {
          await clearTokens();
          removeUser();
          set({ user: null, isAuthenticated: false, isLoading: false });
          return;
        }
      }
    }

    set({
      user: stored.user,
      isAuthenticated: true,
      isLoading: false,
    });
    try {
      await useWorkspaceStore.getState().fetchWorkspaces();
    } catch {
      // workspace fetch may fail if token expired — interceptor handles refresh
    }
  },
}));
