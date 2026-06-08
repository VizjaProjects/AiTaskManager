import { create } from "zustand";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import { ORDOVITA_AI_ID } from "../utils/llmSettings";

const STORAGE_KEY = "activeLlmSettingsId";

async function readStoredId(): Promise<string | null> {
  try {
    if (Platform.OS === "web") {
      return localStorage.getItem(STORAGE_KEY);
    }
    return (await SecureStore.getItemAsync(STORAGE_KEY)) ?? null;
  } catch {
    return null;
  }
}

async function writeStoredId(id: string | null): Promise<void> {
  try {
    if (Platform.OS === "web") {
      if (id) localStorage.setItem(STORAGE_KEY, id);
      else localStorage.removeItem(STORAGE_KEY);
      return;
    }
    if (id) await SecureStore.setItemAsync(STORAGE_KEY, id);
    else await SecureStore.deleteItemAsync(STORAGE_KEY);
  } catch {
    // ignore persistence errors
  }
}

interface LlmSettingsSelectionState {
  activeLlmSettingsId: string | null;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setActiveLlmSettingsId: (id: string | null) => void;
}

export const useLlmSettingsSelectionStore = create<LlmSettingsSelectionState>(
  (set) => ({
    activeLlmSettingsId: null,
    hydrated: false,

    hydrate: async () => {
      const stored = await readStoredId();
      set({
        activeLlmSettingsId: stored ?? ORDOVITA_AI_ID,
        hydrated: true,
      });
    },

    setActiveLlmSettingsId: (id) => {
      void writeStoredId(id);
      set({ activeLlmSettingsId: id });
    },
  }),
);
