import { create } from "zustand";
import { Platform } from "react-native";

type ThemeMode = "light" | "dark";

function loadSavedMode(): ThemeMode {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    const saved = window.localStorage.getItem("themeMode");
    if (saved === "light" || saved === "dark") return saved;
  }
  return "light";
}

function persistMode(mode: ThemeMode) {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    window.localStorage.setItem("themeMode", mode);
  }
}

interface ThemeState {
  mode: ThemeMode;
  toggle: () => void;
  setMode: (mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  mode: loadSavedMode(),

  toggle: () =>
    set((state) => {
      const next = state.mode === "light" ? "dark" : "light";
      persistMode(next);
      return { mode: next };
    }),

  setMode: (mode) => {
    persistMode(mode);
    set({ mode });
  },
}));
