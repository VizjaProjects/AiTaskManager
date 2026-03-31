import { api } from "./client";
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  TokenResponse,
  RemindPasswordRequest,
  ChangePasswordRequest,
  ChangeFullNameRequest,
} from "../types";

export const authApi = {
  login: (data: LoginRequest) => api.post<LoginResponse>("/auth/login", data),

  register: (data: RegisterRequest) =>
    api.post<RegisterResponse>("/auth/register", data),

  logout: () => api.delete("/auth/logout"),

  refresh: () => api.put<TokenResponse>("/auth/refresh"),

  requestPasswordReset: (email: string) =>
    api.post(`/auth/send/remindPasswordRequest/${encodeURIComponent(email)}`),

  resetPassword: (data: RemindPasswordRequest) =>
    api.put("/auth/remindPassword", data),

  verifyEmail: (userId: string, code: string) =>
    api.put(
      `/emailVerification/verify/user/${encodeURIComponent(userId)}/code/${encodeURIComponent(code)}`,
    ),
};

export const userApi = {
  changePassword: (data: ChangePasswordRequest) =>
    api.put("/user/change/password", data),

  changeFullName: (data: ChangeFullNameRequest) =>
    api.put("/user/change/fullname", data),
};
