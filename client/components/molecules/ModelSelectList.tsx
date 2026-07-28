import { useMemo } from "react";
import { View, Text } from "react-native";
import { MinimalSelectDropdown } from "./MinimalSelectDropdown";
import { getShortModelName } from "@/lib/utils/llmSettings";
import { getUiTokens } from "@/lib/utils/uiTokens";
import { useThemeStore } from "@/lib/stores";
import { useT } from "@/lib/i18n";

interface ModelSelectListProps {
  provider: string;
  models: string[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function ModelSelectList({
  models,
  value,
  onChange,
  disabled = false,
}: ModelSelectListProps) {
  const t = useT();
  const isDark = useThemeStore((s) => s.mode === "dark");
  const ui = getUiTokens(isDark);
  const options = useMemo(
    () =>
      models.map((model) => ({
        value: model,
        label: getShortModelName(model, 56),
      })),
    [models],
  );

  if (models.length === 0) {
    return (
      <View className="gap-2.5">
        <Text
          className="font-label text-[10px] uppercase tracking-[0.14em]"
          style={{ color: ui.textMuted }}
        >
          Model
        </Text>
        <View
          className="rounded-xl px-4 py-6 items-center"
          style={{ borderWidth: 1, borderColor: ui.border, borderStyle: "dashed" }}
        >
          <Text className="font-body text-sm" style={{ color: ui.textMuted }}>
            No models for this provider.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <MinimalSelectDropdown
      label={t("llm.model")}
      value={models.includes(value) ? value : ""}
      options={options}
      onChange={onChange}
      placeholder={t("llm.chooseModel")}
      searchable
      disabled={disabled}
      pinSelected
    />
  );
}
