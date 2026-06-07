import { create } from "zustand";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import type { Workspace } from "../types";
import { workspaceApi } from "../api";

const STORAGE_KEY = "activeWorkspaceId";

async function persistActiveId(id: string | null): Promise<void> {
  if (Platform.OS === "web") {
    if (typeof window === "undefined") return;
    if (id) window.localStorage.setItem(STORAGE_KEY, id);
    else window.localStorage.removeItem(STORAGE_KEY);
    return;
  }
  if (id) await SecureStore.setItemAsync(STORAGE_KEY, id);
  else await SecureStore.deleteItemAsync(STORAGE_KEY);
}

async function loadActiveId(): Promise<string | null> {
  if (Platform.OS === "web") {
    return typeof window !== "undefined"
      ? window.localStorage.getItem(STORAGE_KEY)
      : null;
  }
  return SecureStore.getItemAsync(STORAGE_KEY);
}

interface WorkspaceState {
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
  isLoading: boolean;

  fetchWorkspaces: () => Promise<void>;
  setActiveWorkspace: (id: string) => Promise<void>;
  createWorkspace: (name: string, assignedUserIds?: string[]) => Promise<Workspace>;
  deleteWorkspace: (id: string) => Promise<void>;
  reset: () => void;
  getActiveWorkspace: () => Workspace | null;
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  workspaces: [],
  activeWorkspaceId: null,
  isLoading: false,

  fetchWorkspaces: async () => {
    set({ isLoading: true });
    try {
      const workspaces = await workspaceApi.getAll();
      const storedId = await loadActiveId();
      const activeWorkspaceId =
        storedId && workspaces.some((w) => w.workspaceId === storedId)
          ? storedId
          : workspaces[0]?.workspaceId ?? null;

      if (activeWorkspaceId) await persistActiveId(activeWorkspaceId);

      set({ workspaces, activeWorkspaceId, isLoading: false });
    } catch {
      set({ isLoading: false });
      throw new Error("Failed to load workspaces");
    }
  },

  setActiveWorkspace: async (id) => {
    await persistActiveId(id);
    set({ activeWorkspaceId: id });
  },

  createWorkspace: async (name, assignedUserIds) => {
    const workspace = await workspaceApi.create(name, assignedUserIds);
    const workspaces = [...get().workspaces, workspace];
    await persistActiveId(workspace.workspaceId);
    set({ workspaces, activeWorkspaceId: workspace.workspaceId });
    return workspace;
  },

  deleteWorkspace: async (id) => {
    await workspaceApi.delete(id);
    const workspaces = get().workspaces.filter((w) => w.workspaceId !== id);
    let activeWorkspaceId = get().activeWorkspaceId;
    if (activeWorkspaceId === id) {
      activeWorkspaceId = workspaces[0]?.workspaceId ?? null;
      await persistActiveId(activeWorkspaceId);
    }
    set({ workspaces, activeWorkspaceId });
  },

  reset: () => {
    set({ workspaces: [], activeWorkspaceId: null, isLoading: false });
  },

  getActiveWorkspace: () => {
    const { workspaces, activeWorkspaceId } = get();
    return workspaces.find((w) => w.workspaceId === activeWorkspaceId) ?? null;
  },
}));
