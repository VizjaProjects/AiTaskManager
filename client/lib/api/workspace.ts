import { api } from "./client";
import type { Workspace, WorkspaceVisibility } from "../types";

function mapWorkspace(raw: Record<string, unknown>): Workspace {
  const assignedUsers =
    (raw.assignedUsers as Array<Record<string, unknown>>) ?? [];
  return {
    workspaceId: raw.workspaceId as string,
    workspaceName: raw.workspaceName as string,
    createdBy: raw.createdBy as string,
    visibility: (raw.visibility as Workspace["visibility"]) ?? "Private",
    assignedUsers: assignedUsers.map((u) => ({
      userId: u.userId as string,
      email: (u.email as string) ?? null,
      fullName: (u.fullName as string) ?? null,
      assignedAt: new Date(u.assignedAt as string).toISOString(),
    })),
    createdAt: new Date(raw.createdAt as string).toISOString(),
    updatedAt: new Date(raw.updatedAt as string).toISOString(),
  };
}

export const workspaceApi = {
  getAll: async () => {
    const { data } = await api.get<Record<string, unknown>[]>("/workspace/all");
    return (Array.isArray(data) ? data : []).map(mapWorkspace);
  },

  getById: async (workspaceId: string) => {
    const { data } = await api.get<Record<string, unknown>>(
      `/workspace/${encodeURIComponent(workspaceId)}`,
    );
    return mapWorkspace(data);
  },

  create: async (
    workspaceName: string,
    assignedUserIds?: string[],
    visibility: WorkspaceVisibility = "Private",
  ) => {
    const { data } = await api.post<Record<string, unknown>>(
      "/workspace/create",
      { workspaceName, assignedUserIds, visibility },
    );
    return mapWorkspace(data);
  },

  setVisibility: async (
    workspaceId: string,
    visibility: WorkspaceVisibility,
  ) => {
    const { data } = await api.put<Record<string, unknown>>(
      `/workspace/${encodeURIComponent(workspaceId)}/visibility`,
      { visibility },
    );
    return mapWorkspace(data);
  },

  assignUsers: async (workspaceId: string, userIds: string[]) => {
    const { data } = await api.post<Record<string, unknown>>(
      `/workspace/${encodeURIComponent(workspaceId)}/assignUsers`,
      { userIds },
    );
    return mapWorkspace(data);
  },

  assignUsersByEmail: async (workspaceId: string, emails: string[]) => {
    const { data } = await api.post<Record<string, unknown>>(
      `/workspace/${encodeURIComponent(workspaceId)}/assignUsersByEmail`,
      { emails },
    );
    return {
      workspace: mapWorkspace(data.workspace as Record<string, unknown>),
      addedEmails: (data.addedEmails as string[]) ?? [],
      notFoundEmails: (data.notFoundEmails as string[]) ?? [],
      alreadyAssignedEmails: (data.alreadyAssignedEmails as string[]) ?? [],
    };
  },

  removeUsers: async (workspaceId: string, userIds: string[]) => {
    const { data } = await api.patch<Record<string, unknown>>(
      `/workspace/${encodeURIComponent(workspaceId)}/removeUsers`,
      { userIds },
    );
    return mapWorkspace(data);
  },

  delete: (workspaceId: string) =>
    api.delete(`/workspace/delete/${encodeURIComponent(workspaceId)}`),
};
