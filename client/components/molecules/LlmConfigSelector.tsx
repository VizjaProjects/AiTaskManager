import { useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { OptionPicker } from "./OptionPicker";
import { useLlmSettings } from "@/lib/hooks";
import { useLlmSettingsSelectionStore } from "@/lib/stores";
import { getLlmSettingsLabel } from "@/lib/utils/llmSettings";
import { useT } from "@/lib/i18n";

interface LlmConfigSelectorProps {
  compact?: boolean;
}

export function LlmConfigSelector({ compact = false }: LlmConfigSelectorProps) {
  const t = useT();
  const router = useRouter();
  const { data: settings = [], isLoading } = useLlmSettings();
  const activeId = useLlmSettingsSelectionStore((s) => s.activeLlmSettingsId);
  const hydrated = useLlmSettingsSelectionStore((s) => s.hydrated);
  const hydrate = useLlmSettingsSelectionStore((s) => s.hydrate);
  const setActiveId = useLlmSettingsSelectionStore((s) => s.setActiveLlmSettingsId);

  useEffect(() => {
    if (!hydrated) void hydrate();
  }, [hydrated, hydrate]);

  useEffect(() => {
    if (!hydrated || settings.length === 0) return;

    const stillValid = settings.some((s) => s.llmSettingsId === activeId);
    if (!stillValid) {
      setActiveId(settings[0]?.llmSettingsId ?? null);
    }
  }, [settings, activeId, hydrated, setActiveId]);

  const options = settings.map((s) => ({
    value: s.llmSettingsId,
    label: getLlmSettingsLabel(s),
  }));

  if (isLoading) {
    return (
      <View className="rounded-xl border border-outline-variant bg-surface-container-low px-4 py-3">
        <Text className="text-on-surface-variant font-body text-sm">
          Loading AI configurations...
        </Text>
      </View>
    );
  }

  if (settings.length === 0) {
    return (
      <View
        className={`rounded-xl border border-dashed border-outline-variant bg-surface-container-low ${
          compact ? "px-4 py-3" : "p-5"
        } gap-3`}
      >
        <View className="flex-row items-start gap-3">
          <View className="w-9 h-9 rounded-full bg-primary-fixed items-center justify-center">
            <MaterialIcons name="psychology" size={18} color="#111111" />
          </View>
          <View className="flex-1 gap-1">
            <Text className="text-on-surface font-headline text-title-lg">
              {t("llm.noConfigTitle")}
            </Text>
            <Text className="text-on-surface-variant font-body text-sm">
              {t("llm.noConfigDesc")}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/(app)/profile?tab=ai")}
          className="self-start flex-row items-center gap-1.5 px-4 py-2.5 rounded-xl bg-action"
        >
          <MaterialIcons name="settings" size={16} color="#f0f0f0" />
          <Text className="text-on-action font-headline text-sm">
            {t("llm.configureAi")}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View
      className={`rounded-xl border border-outline-variant bg-surface-container-lowest ${
        compact ? "px-4 py-3 gap-2" : "p-4 gap-3"
      }`}
    >
      <View className="flex-row items-center justify-between gap-3">
        <View className="flex-row items-center gap-2 flex-1">
          <MaterialIcons name="tune" size={18} color="#9b9791" />
          <Text className="text-on-surface font-headline text-sm">
            {t("llm.activeConfiguration")}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/(app)/profile?tab=ai")}
          className="flex-row items-center gap-1"
        >
          <Text className="text-primary font-headline text-xs">
            {t("llm.manage")}
          </Text>
          <MaterialIcons name="open-in-new" size={14} color="#111111" />
        </TouchableOpacity>
      </View>

      <OptionPicker
        label={t("llm.configuration")}
        value={activeId}
        options={options}
        onChange={setActiveId}
        placeholder={t("llm.chooseConfiguration")}
        searchable={options.length > 6}
      />
    </View>
  );
}
