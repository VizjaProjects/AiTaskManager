import { api } from "./client";
import type { ChangeFullNameRequest, User } from "../types";

export const userApi = {
  getMe: () =>
    api.get<{
      userId: string;
      email: string;
      fullName: string;
      role: string;
    }>("/user/me"),

  changeFullName: (data: ChangeFullNameRequest) =>
    api.post("/user/fullname", null, {
      params: { newFullName: data.newFullName },
    }),

  deleteAccount: () => api.get<User>("/user/delete"),
};
