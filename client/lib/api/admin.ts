import { api } from "./client";
import type { AdminUser, CreatePlanRequest, Plan } from "../types";

function mapPlan(raw: Record<string, unknown>): Plan {
  const n = (v: unknown) => Number(v ?? 0);
  return {
    planId: String(raw.planId ?? ""),
    planName: String(raw.planName ?? ""),
    aiTaskLimit: n(raw.aiTaskLimit),
    publicWorkspaceLimit: n(raw.publicWorkspaceLimit),
    privateWorkspaceLimit: n(raw.privateWorkspaceLimit),
    isActive: Boolean(raw.isActive),
  };
}

function mapAdminUser(raw: Record<string, unknown>): AdminUser {
  const n = (v: unknown) => Number(v ?? 0);
  return {
    userId: String(raw.userId ?? ""),
    fullName: String(raw.fullName ?? ""),
    email: String(raw.email ?? ""),
    role: String(raw.role ?? ""),
    isEnable: Boolean(raw.isEnable),
    planId: raw.planId ? String(raw.planId) : null,
    planName: raw.planName ? String(raw.planName) : null,
    planIsActive: Boolean(raw.planIsActive),
    aiTaskUsage: n(raw.aiTaskUsage),
    aiTaskLimit: n(raw.aiTaskLimit),
    publicWorkspaceUsage: n(raw.publicWorkspaceUsage),
    publicWorkspaceLimit: n(raw.publicWorkspaceLimit),
    privateWorkspaceUsage: n(raw.privateWorkspaceUsage),
    privateWorkspaceLimit: n(raw.privateWorkspaceLimit),
  };
}

export const adminApi = {
  getPlans: async (): Promise<Plan[]> => {
    const { data } = await api.get("/admin/plans");
    return Array.isArray(data)
      ? data.map((d) => mapPlan(d as Record<string, unknown>))
      : [];
  },

  createPlan: async (payload: CreatePlanRequest): Promise<Plan> => {
    const { data } = await api.post("/admin/plans", payload);
    return mapPlan(data as Record<string, unknown>);
  },

  getUsers: async (): Promise<AdminUser[]> => {
    const { data } = await api.get("/admin/users");
    return Array.isArray(data)
      ? data.map((d) => mapAdminUser(d as Record<string, unknown>))
      : [];
  },
};
