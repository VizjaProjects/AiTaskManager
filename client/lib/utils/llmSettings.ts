import { MaterialIcons } from "@expo/vector-icons";
import type { LlmConnectionMode, LlmSettings } from "../types";

export const CUSTOM_CONNECTION = "__custom__";
export const CUSTOM_PROVIDER = "Custom";
export const ORDOVITA_AI_ID = "__ordovita__";

export function isOrdovitaAiSelection(id: string | null | undefined): boolean {
  return id === null || id === undefined || id === ORDOVITA_AI_ID;
}

export interface ProviderVisual {
  icon: keyof typeof MaterialIcons.glyphMap;
  color: string;
  bgColor: string;
  label: string;
}

const PROVIDER_VISUALS: Record<string, ProviderVisual> = {
  Groq: {
    icon: "bolt",
    color: "#F55036",
    bgColor: "#FEF2F2",
    label: "Groq",
  },
  OpenAi: {
    icon: "psychology",
    color: "#10A37F",
    bgColor: "#ECFDF5",
    label: "OpenAI",
  },
  Anthropic: {
    icon: "forum",
    color: "#D4A574",
    bgColor: "#FFFBEB",
    label: "Anthropic",
  },
  AzureOpenAi: {
    icon: "cloud",
    color: "#0078D4",
    bgColor: "#EFF6FF",
    label: "Azure OpenAI",
  },
  Cohere: {
    icon: "hub",
    color: "#39594D",
    bgColor: "#F0FDF4",
    label: "Cohere",
  },
  Google: {
    icon: "auto-awesome",
    color: "#4285F4",
    bgColor: "#EFF6FF",
    label: "Google",
  },
  Custom: {
    icon: "settings-ethernet",
    color: "#6b6965",
    bgColor: "#F3F4F6",
    label: "Custom",
  },
  Unknown: {
    icon: "help-outline",
    color: "#9b9791",
    bgColor: "#F3F4F6",
    label: "Unknown",
  },
};

const CUSTOM_VISUAL: ProviderVisual = {
  icon: "link",
  color: "#6366F1",
  bgColor: "#EEF2FF",
  label: "Custom endpoint",
};

function normalizeProviderKey(provider: string): string {
  return provider.replace(/\s+/g, "");
}

export function getProviderVisual(provider: string | null): ProviderVisual {
  if (!provider) return CUSTOM_VISUAL;

  const direct = PROVIDER_VISUALS[provider];
  if (direct) return direct;

  const normalized = normalizeProviderKey(provider);
  const byKey = PROVIDER_VISUALS[normalized];
  if (byKey) return { ...byKey, label: formatProviderLabel(provider) };

  const lower = provider.toLowerCase();
  if (lower.includes("openai") || lower.includes("open ai")) {
    return { ...PROVIDER_VISUALS.OpenAi, label: formatProviderLabel(provider) };
  }
  if (lower.includes("azure")) {
    return { ...PROVIDER_VISUALS.AzureOpenAi, label: formatProviderLabel(provider) };
  }
  if (lower.includes("groq")) return PROVIDER_VISUALS.Groq;
  if (lower.includes("anthropic")) return PROVIDER_VISUALS.Anthropic;
  if (lower.includes("google")) return PROVIDER_VISUALS.Google;
  if (lower.includes("cohere")) return PROVIDER_VISUALS.Cohere;
  if (lower.includes("custom")) return PROVIDER_VISUALS.Custom;

  return {
    ...PROVIDER_VISUALS.Unknown,
    label: formatProviderLabel(provider),
  };
}

export function formatProviderLabel(provider: string | null): string {
  if (!provider) return "Custom endpoint";
  return provider
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .trim();
}

export function getLlmSettingsLabel(settings: LlmSettings): string {
  const visual = getProviderVisual(settings.provider);
  return `${visual.label} · ${settings.model}`;
}

export function formatPickerLabel(settings: LlmSettings): string {
  const visual = getProviderVisual(settings.provider);
  const model = getShortModelName(settings.model, 36);
  return `${visual.label}: ${model}`;
}

export function partitionSettings(settings: LlmSettings[]): {
  standard: LlmSettings[];
  custom: LlmSettings[];
} {
  return {
    standard: settings.filter((s) => !isCustomLlmSettings(s)),
    custom: settings.filter((s) => isCustomLlmSettings(s)),
  };
}

export function getShortModelName(model: string, max = 18): string {
  const short = model.includes("/") ? model.split("/").pop()! : model;
  if (short.length <= max) return short;
  return `${short.slice(0, max - 1)}…`;
}

export function isCustomLlmSettings(settings: LlmSettings): boolean {
  return (
    !!settings.customUrl ||
    !settings.provider ||
    settings.provider === CUSTOM_PROVIDER
  );
}

export function inferConnectionMode(settings: LlmSettings): LlmConnectionMode {
  return isCustomLlmSettings(settings) ? "custom" : "provider";
}

const PROVIDER_MODEL_PATTERNS: Record<string, string[]> = {
  Groq: ["groq/", "groq:", "llama", "mixtral", "gemma", "gpt-oss"],
  OpenAi: ["openai/", "openai:", "gpt-", "o1-", "o3-", "text-davinci", "chatgpt"],
  Anthropic: ["anthropic/", "anthropic:", "claude"],
  AzureOpenAi: ["azure", "azureopenai"],
  Google: ["google/", "google:", "gemini", "palm"],
  Cohere: ["cohere/", "cohere:", "command"],
  Custom: [],
};

function patternsForProvider(provider: string): string[] {
  const direct = PROVIDER_MODEL_PATTERNS[provider];
  if (direct) return direct;

  const key = provider.replace(/\s+/g, "");
  const byKey = PROVIDER_MODEL_PATTERNS[key];
  if (byKey) return byKey;

  return [provider.toLowerCase()];
}

export function filterModelsForProvider(
  provider: string,
  models: string[],
): string[] {
  if (!provider || models.length === 0) return [];

  const patterns = patternsForProvider(provider);
  return models.filter((model) => {
    const lower = model.toLowerCase();
    return patterns.some(
      (p) =>
        lower.includes(p) ||
        lower.startsWith(`${p}/`) ||
        lower.includes(`/${p}/`) ||
        lower.startsWith(p),
    );
  });
}

export function extractApiErrorMessage(error: unknown): string {
  const err = error as {
    response?: { data?: { title?: string; detail?: string; message?: string } };
    message?: string;
    code?: string;
  };
  if (err.code === "ECONNABORTED") {
    return "AI generation timed out after 5 minutes. Try again or use a faster model.";
  }
  return (
    err.response?.data?.detail ??
    err.response?.data?.title ??
    err.response?.data?.message ??
    err.message ??
    "Something went wrong"
  );
}
