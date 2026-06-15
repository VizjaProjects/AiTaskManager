import { api } from "./client";
import type { ChangeFullNameRequest, User } from "../types";

export const userApi = {
  getMe: () =>
    api.get<{
      userId: string;
      email: string;
      fullName: string;
      role: string;
      defaultWorkspaceId: string | null;
    }>("/user/me"),

  changeFullName: (data: ChangeFullNameRequest) =>
    api.post("/user/fullname", null, {
      params: { newFullName: data.newFullName },
    }),

  setDefaultWorkspace: (workspaceId: string) =>
    api.put(`/user/defaultWorkspace/${encodeURIComponent(workspaceId)}`),

  deleteAccount: () => api.get<User>("/user/delete"),
};
