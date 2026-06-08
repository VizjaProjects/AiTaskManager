import { useMemo } from "react";
import { View, Text } from "react-native";
import { MinimalSelectDropdown } from "./MinimalSelectDropdown";
import { getShortModelName } from "@/lib/utils/llmSettings";
import { UI } from "@/lib/utils/uiTokens";

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
          style={{ color: UI.textMuted }}
        >
          Model
        </Text>
        <View
          className="rounded-xl px-4 py-6 items-center"
          style={{ borderWidth: 1, borderColor: UI.border, borderStyle: "dashed" }}
        >
          <Text className="font-body text-sm" style={{ color: UI.textMuted }}>
            No models for this provider.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <MinimalSelectDropdown
      label="Model"
      value={models.includes(value) ? value : ""}
      options={options}
      onChange={onChange}
      placeholder="Choose model..."
      searchable
      disabled={disabled}
      pinSelected
    />
  );
}
