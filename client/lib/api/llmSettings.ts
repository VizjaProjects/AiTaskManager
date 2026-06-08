import { api } from "./client";
import { normalizeArray } from "./adapters";
import type { CreateLlmSettingsRequest, LlmSettings } from "../types";

function mapCustomUrl(raw: Record<string, unknown>): string | null {
  const value = raw.customUrl ?? raw.cusromUrl;
  if (value === null || value === undefined || value === "") return null;
  return String(value);
}

function mapLlmSettingsDto(raw: Record<string, unknown>): LlmSettings {
  const provider = raw.provider;
  return {
    llmSettingsId: String(raw.llmSettingsId ?? raw.id ?? ""),
    userId: String(raw.userId ?? ""),
    provider:
      provider === null || provider === undefined || provider === ""
        ? null
        : String(provider),
    model: String(raw.model ?? ""),
    customUrl: mapCustomUrl(raw),
  };
}

export const llmSettingsApi = {
  getAll: async () => {
    const { data } = await api.get("/llm-settings/all-llmSettings");
    return {
      settings: normalizeArray(data, mapLlmSettingsDto),
    };
  },

  getById: async (llmSettingsId: string) => {
    const { data } = await api.get(
      `/llm-settings/${encodeURIComponent(llmSettingsId)}`,
    );
    return mapLlmSettingsDto(data as Record<string, unknown>);
  },

  getProviders: async () => {
    const { data } = await api.get<string[]>("/llm-settings/providers");
    return Array.isArray(data) ? data : [];
  },

  getModels: async () => {
    const { data } = await api.get<string[]>("/llm-settings/models");
    return Array.isArray(data) ? data : [];
  },

  create: (payload: CreateLlmSettingsRequest) =>
    api.post("/llm-settings", {
      provider: payload.provider,
      model: payload.model,
      apiKey: payload.apiKey,
      customUrl: payload.customUrl,
    }),

  update: (llmSettingsId: string, payload: CreateLlmSettingsRequest) =>
    api.put(`/llm-settings/edit/${encodeURIComponent(llmSettingsId)}`, {
      provider: payload.provider,
      model: payload.model,
      apiKey: payload.apiKey,
      customUrl: payload.customUrl,
    }),

  delete: (llmSettingsId: string) =>
    api.delete(`/llm-settings/delete/${encodeURIComponent(llmSettingsId)}`),
};
