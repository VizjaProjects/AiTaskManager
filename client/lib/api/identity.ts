import { api } from "./client";
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  ResetPasswordRequest,
  TokenResponse,
} from "../types";

export const identityApi = {
  login: (data: LoginRequest) =>
    api.post<LoginResponse>("/identity/login", data),

  register: (data: RegisterRequest) =>
    api.post<RegisterResponse>("/identity/register", {
      fullName: data.fullName,
      email: data.email,
      password: data.password,
    }),

  refresh: (refreshToken: string) =>
    api.post<TokenResponse>("/identity/refresh", { refreshToken }),

  forgotPassword: (email: string) =>
    api.post("/identity/forgotPassword", { email }),

  resetPassword: (data: ResetPasswordRequest) =>
    api.post("/identity/resetPassword", {
      email: data.email,
      resetCode: data.resetCode,
      newPassword: data.newPassword,
    }),

  changePassword: (oldPassword: string, newPassword: string) =>
    api.post("/identity/restartPassword", {
      oldPassword,
      newPassword,
    }),

  resendConfirmationEmail: (email: string) =>
    api.post("/identity/resendConfirmationEmail", { email }),

  exchangeDesktopOAuthCode: (code: string) =>
    api.post<LoginResponse>("/identity/oauth2/desktop/exchange", { code }),
};

/** @deprecated Use identityApi — kept for gradual migration */
export const authApi = {
  login: identityApi.login,
  register: identityApi.register,
  refresh: (refreshToken: string) => identityApi.refresh(refreshToken),
  logout: async () => {
    // Server logout not implemented in .NET yet — client-only
    return Promise.resolve();
  },
  exchangeDesktopOAuthCode: (code: string) =>
    identityApi.exchangeDesktopOAuthCode(code),
  requestPasswordReset: identityApi.forgotPassword,
  resetPassword: identityApi.resetPassword,
  verifyEmail: async (_userId: string, _code: string) => {
    throw new Error("Email verification via code is not available yet");
  },
};
