import { create } from "zustand";
import { Platform } from "react-native";
import { DEFAULT_LANG, isLang, type Lang } from "./config";

const STORAGE_KEY = "appLanguage";

function loadSavedLang(): Lang {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (isLang(saved)) return saved;
  }
  return DEFAULT_LANG;
}

function persistLang(lang: Lang) {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, lang);
  }
}

interface LanguageState {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

export const useLanguageStore = create<LanguageState>((set) => ({
  lang: loadSavedLang(),
  setLang: (lang) => {
    persistLang(lang);
    set({ lang });
  },
}));
