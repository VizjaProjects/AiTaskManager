import { api } from "./client";
import type { UserPlanUsage } from "../types";

function mapUserPlanUsage(raw: Record<string, unknown>): UserPlanUsage {
  const n = (v: unknown) => Number(v ?? 0);
  return {
    planId: String(raw.planId ?? ""),
    planName: String(raw.planName ?? ""),
    isActive: Boolean(raw.isActive),
    aiTaskLimit: n(raw.aiTaskLimit),
    aiTaskUsage: n(raw.aiTaskUsage),
    publicWorkspaceLimit: n(raw.publicWorkspaceLimit),
    publicWorkspaceUsage: n(raw.publicWorkspaceUsage),
    privateWorkspaceLimit: n(raw.privateWorkspaceLimit),
    privateWorkspaceUsage: n(raw.privateWorkspaceUsage),
  };
}

export const planApi = {
  /** Current user's plan limits + current usage (e.g. 45/100 AI calls today). */
  getUserPlan: async (): Promise<UserPlanUsage> => {
    const { data } = await api.get("/plan/userPlan");
    return mapUserPlanUsage(data as Record<string, unknown>);
  },
};
