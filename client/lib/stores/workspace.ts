import { create } from "zustand";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import type { Workspace, WorkspaceVisibility } from "../types";
import { workspaceApi } from "../api";
import { userApi } from "../api/user";

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
  defaultWorkspaceId: string | null;
  isLoading: boolean;

  fetchWorkspaces: () => Promise<void>;
  setActiveWorkspace: (id: string) => Promise<void>;
  setDefaultWorkspace: (id: string) => Promise<void>;
  createWorkspace: (
    name: string,
    assignedUserIds?: string[],
    visibility?: WorkspaceVisibility,
  ) => Promise<Workspace>;
  setWorkspaceVisibility: (
    id: string,
    visibility: WorkspaceVisibility,
  ) => Promise<void>;
  deleteWorkspace: (id: string) => Promise<void>;
  reset: () => void;
  getActiveWorkspace: () => Workspace | null;
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  workspaces: [],
  activeWorkspaceId: null,
  defaultWorkspaceId: null,
  isLoading: false,

  fetchWorkspaces: async () => {
    set({ isLoading: true });
    try {
      const workspaces = await workspaceApi.getAll();

      // The user's server-side default workspace takes priority on load,
      // then the locally remembered choice, then the first workspace.
      let serverDefaultId: string | null = null;
      try {
        const { data } = await userApi.getMe();
        serverDefaultId = data.defaultWorkspaceId ?? null;
      } catch {
        // Non-fatal: fall back to local/first below.
      }

      const storedId = await loadActiveId();
      const isValid = (id: string | null) =>
        !!id && workspaces.some((w) => w.workspaceId === id);

      const activeWorkspaceId = isValid(serverDefaultId)
        ? serverDefaultId
        : isValid(storedId)
          ? storedId
          : workspaces[0]?.workspaceId ?? null;

      if (activeWorkspaceId) await persistActiveId(activeWorkspaceId);

      set({
        workspaces,
        activeWorkspaceId,
        defaultWorkspaceId: serverDefaultId,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
      throw new Error("Failed to load workspaces");
    }
  },

  setActiveWorkspace: async (id) => {
    await persistActiveId(id);
    set({ activeWorkspaceId: id });
  },

  setDefaultWorkspace: async (id) => {
    await userApi.setDefaultWorkspace(id);
    await persistActiveId(id);
    set({ defaultWorkspaceId: id, activeWorkspaceId: id });
  },

  createWorkspace: async (name, assignedUserIds, visibility = "Private") => {
    const workspace = await workspaceApi.create(
      name,
      assignedUserIds,
      visibility,
    );
    const workspaces = [...get().workspaces, workspace];
    await persistActiveId(workspace.workspaceId);
    set({ workspaces, activeWorkspaceId: workspace.workspaceId });
    return workspace;
  },

  setWorkspaceVisibility: async (id, visibility) => {
    const updated = await workspaceApi.setVisibility(id, visibility);
    set({
      workspaces: get().workspaces.map((w) =>
        w.workspaceId === id ? updated : w,
      ),
    });
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
    set({
      workspaces: [],
      activeWorkspaceId: null,
      defaultWorkspaceId: null,
      isLoading: false,
    });
  },

  getActiveWorkspace: () => {
    const { workspaces, activeWorkspaceId } = get();
    return workspaces.find((w) => w.workspaceId === activeWorkspaceId) ?? null;
  },
}));
