import { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Platform,
  Alert,
  TextInput,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Card, Button, Input } from "../atoms";
import { ProviderBrandIcon } from "../atoms/ProviderBrandIcon";
import { ProviderSelectList } from "../molecules/ProviderSelectList";
import { ModelSelectList } from "../molecules/ModelSelectList";
import {
  useCreateLlmSettings,
  useDeleteLlmSettings,
  useLlmModels,
  useLlmProviders,
  useLlmSettings,
  useUpdateLlmSettings,
} from "@/lib/hooks";
import type { LlmConnectionMode, LlmSettings } from "@/lib/types";
import {
  CUSTOM_CONNECTION,
  CUSTOM_PROVIDER,
  extractApiErrorMessage,
  filterModelsForProvider,
  getProviderVisual,
  getShortModelName,
  inferConnectionMode,
} from "@/lib/utils/llmSettings";
import { UI } from "@/lib/utils/uiTokens";

const NO_OUTLINE =
  Platform.OS === "web" ? ({ outlineStyle: "none" } as const) : undefined;

type FormState = {
  connectionMode: LlmConnectionMode;
  provider: string;
  model: string;
  customModel: string;
  customUrl: string;
  apiKey: string;
};

const EMPTY_FORM: FormState = {
  connectionMode: "provider",
  provider: "",
  model: "",
  customModel: "",
  customUrl: "",
  apiKey: "",
};

function SectionLabel({ children }: { children: string }) {
  return (
    <Text
      className="font-label text-[10px] uppercase tracking-[0.14em] mb-2"
      style={{ color: UI.textMuted }}
    >
      {children}
    </Text>
  );
}

function ApiKeyField({
  value,
  onChangeText,
  placeholder,
}: {
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
}) {
  const [hidden, setHidden] = useState(true);

  return (
    <View className="gap-2.5">
      <SectionLabel>API key</SectionLabel>
      <View
        className="flex-row items-center px-4 rounded-full"
        style={{
          borderWidth: 1,
          borderColor: UI.border,
          backgroundColor: "#FFFFFF",
          height: 44,
        }}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={UI.textMuted}
          secureTextEntry={hidden}
          autoCapitalize="none"
          className="flex-1 text-on-surface font-body text-sm"
          style={[NO_OUTLINE, { borderWidth: 0 }]}
        />
        <TouchableOpacity onPress={() => setHidden((v) => !v)} hitSlop={8}>
          <MaterialIcons
            name={hidden ? "visibility" : "visibility-off"}
            size={18}
            color={UI.textMuted}
          />
        </TouchableOpacity>
      </View>
      <Text className="font-body text-xs" style={{ color: UI.textMuted }}>
        Stored securely. Never shown again after saving.
      </Text>
    </View>
  );
}

function ConfigFormModal({
  visible,
  editing,
  onClose,
}: {
  visible: boolean;
  editing: LlmSettings | null;
  onClose: () => void;
}) {
  const { data: providers = [] } = useLlmProviders();
  const { data: models = [] } = useLlmModels();
  const createSettings = useCreateLlmSettings();
  const updateSettings = useUpdateLlmSettings();

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    if (editing) {
      const mode = inferConnectionMode(editing);
      setForm({
        connectionMode: mode,
        provider: editing.provider ?? "",
        model: mode === "provider" ? editing.model : "",
        customModel: mode === "custom" ? editing.model : "",
        customUrl: editing.customUrl ?? "",
        apiKey: "",
      });
    } else {
      const firstProvider = providers[0] ?? "";
      const firstModels = filterModelsForProvider(firstProvider, models);
      setForm({
        ...EMPTY_FORM,
        provider: firstProvider,
        model: firstModels[0] ?? "",
      });
    }
    setError(null);
  }, [visible, editing, providers, models]);

  const filteredModels = useMemo(() => {
    if (form.connectionMode !== "provider" || !form.provider) return [];
    const filtered = filterModelsForProvider(form.provider, models);
    if (form.model && !filtered.includes(form.model)) {
      return [form.model, ...filtered];
    }
    return filtered;
  }, [form.connectionMode, form.provider, form.model, models]);

  const pickerValue =
    form.connectionMode === "custom" ? CUSTOM_CONNECTION : form.provider;

  const saving = createSettings.isPending || updateSettings.isPending;

  function patchForm(patch: Partial<FormState>) {
    setForm((prev) => ({ ...prev, ...patch }));
  }

  function handleProviderChange(value: string) {
    if (value === CUSTOM_CONNECTION) {
      patchForm({ connectionMode: "custom", model: "" });
      return;
    }
    const next = filterModelsForProvider(value, models);
    patchForm({
      connectionMode: "provider",
      provider: value,
      model: next[0] ?? "",
    });
  }

  async function handleSave() {
    setError(null);
    if (!form.apiKey.trim()) {
      setError("API key is required.");
      return;
    }

    let payload: {
      provider: string | null;
      model: string;
      apiKey: string;
      customUrl: string | null;
    };

    if (form.connectionMode === "custom") {
      if (!form.customUrl.trim() || !form.customModel.trim()) {
        setError("URL and model name are required.");
        return;
      }
      payload = {
        provider: CUSTOM_PROVIDER,
        model: form.customModel.trim(),
        apiKey: form.apiKey.trim(),
        customUrl: form.customUrl.trim(),
      };
    } else {
      if (!form.provider || !form.model) {
        setError("Select provider and model.");
        return;
      }
      payload = {
        provider: form.provider,
        model: form.model,
        apiKey: form.apiKey.trim(),
        customUrl: null,
      };
    }

    try {
      if (editing) {
        await updateSettings.mutateAsync({
          llmSettingsId: editing.llmSettingsId,
          data: payload,
        });
      } else {
        await createSettings.mutateAsync(payload);
      }
      onClose();
    } catch (e) {
      setError(extractApiErrorMessage(e));
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.25)" }}>
        <View
          className="bg-surface-container-lowest rounded-2xl w-full max-w-md max-h-[88%] overflow-hidden"
          style={{ borderWidth: 1, borderColor: UI.border, ...UI.shadow }}
        >
          <View className="flex-row items-center justify-between px-5 py-4">
            <Text className="text-on-surface font-headline text-title-lg">
              {editing ? "Edit model" : "Add model"}
            </Text>
            <TouchableOpacity onPress={onClose} hitSlop={8}>
              <MaterialIcons name="close" size={22} color={UI.textMuted} />
            </TouchableOpacity>
          </View>
          <View style={{ height: 1, backgroundColor: UI.divider, marginHorizontal: 20 }} />

          <ScrollView
            contentContainerStyle={{ gap: 20, padding: 20, paddingBottom: 24 }}
            showsVerticalScrollIndicator={false}
          >
            <ProviderSelectList
              providers={providers}
              value={pickerValue}
              onChange={handleProviderChange}
            />

            {form.connectionMode === "provider" ? (
              <ModelSelectList
                key={form.provider}
                provider={form.provider}
                models={filteredModels}
                value={form.model}
                onChange={(v) => patchForm({ model: v })}
              />
            ) : (
              <View className="gap-4">
                <View>
                  <SectionLabel>Endpoint URL</SectionLabel>
                  <Input
                    value={form.customUrl}
                    onChangeText={(v) => patchForm({ customUrl: v })}
                    placeholder="https://api.example.com/v1"
                    autoCapitalize="none"
                  />
                </View>
                <View>
                  <SectionLabel>Model name</SectionLabel>
                  <Input
                    value={form.customModel}
                    onChangeText={(v) => patchForm({ customModel: v })}
                    placeholder="my-model-id"
                    autoCapitalize="none"
                  />
                </View>
              </View>
            )}

            <ApiKeyField
              value={form.apiKey}
              onChangeText={(v) => patchForm({ apiKey: v })}
              placeholder={editing ? "Re-enter key" : "sk-..."}
            />

            {error ? (
              <View className="bg-error-container rounded-xl px-4 py-3">
                <Text className="text-on-error-container font-body text-sm">
                  {error}
                </Text>
              </View>
            ) : null}

            <View className="flex-row gap-3 justify-end pt-1">
              <Button variant="outline" label="Cancel" onPress={onClose} />
              <Button
                label={editing ? "Save" : "Add"}
                loading={saving}
                onPress={handleSave}
              />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function ConfigRow({
  item,
  onEdit,
  onDelete,
}: {
  item: LlmSettings;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const visual = getProviderVisual(item.provider);

  return (
    <View
      className="flex-row items-center gap-2 px-4 py-3.5 rounded-xl"
      style={{
        borderWidth: 1,
        borderColor: UI.border,
        backgroundColor: "#FFFFFF",
      }}
    >
      <TouchableOpacity
        onPress={onEdit}
        activeOpacity={0.7}
        className="flex-row items-center gap-3 flex-1 min-w-0"
      >
        <ProviderBrandIcon provider={item.provider} size="md" />
        <View className="flex-1 min-w-0">
          <Text className="text-on-surface font-headline text-sm" numberOfLines={1}>
            {visual.label}
          </Text>
          <Text
            className="font-body text-xs mt-0.5"
            style={{ color: UI.textSecondary }}
            numberOfLines={1}
          >
            {item.customUrl
              ? item.customUrl
              : getShortModelName(item.model, 40)}
          </Text>
        </View>
        <MaterialIcons name="chevron-right" size={18} color={UI.textMuted} />
      </TouchableOpacity>
      <TouchableOpacity onPress={onDelete} hitSlop={8} className="p-1.5">
        <MaterialIcons name="delete-outline" size={17} color="#ba1a1a" />
      </TouchableOpacity>
    </View>
  );
}

export function LlmSettingsPanel() {
  const { data: settings = [], isLoading } = useLlmSettings();
  const deleteSettings = useDeleteLlmSettings();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<LlmSettings | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(item: LlmSettings) {
    setEditing(item);
    setModalOpen(true);
  }

  function confirmDelete(item: LlmSettings) {
    const run = async () => {
      setActionError(null);
      try {
        await deleteSettings.mutateAsync(item.llmSettingsId);
      } catch (e) {
        setActionError(extractApiErrorMessage(e));
      }
    };
    if (Platform.OS === "web") {
      if (window.confirm("Remove this model configuration?")) void run();
      return;
    }
    Alert.alert("Remove model", "Remove this configuration?", [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => void run() },
    ]);
  }

  return (
    <View className="gap-4">
      <View>
        <Text className="text-on-surface font-headline text-title-lg">
          Your models
        </Text>
        <Text className="font-body text-body-md mt-1" style={{ color: UI.textSecondary }}>
          Add an API key for the provider you want to use in AI Task.
        </Text>
      </View>

      <Card variant="elevated">
        {actionError ? (
          <View className="bg-error-container rounded-xl px-4 py-3 mb-4">
            <Text className="text-on-error-container font-body text-sm">
              {actionError}
            </Text>
          </View>
        ) : null}

        {isLoading ? (
          <Text className="font-body text-sm py-6 text-center" style={{ color: UI.textMuted }}>
            Loading...
          </Text>
        ) : settings.length === 0 ? (
          <View className="py-8 items-center gap-3">
            <View
              className="w-12 h-12 rounded-xl items-center justify-center"
              style={{
                borderWidth: 1,
                borderColor: UI.border,
                backgroundColor: UI.surface,
              }}
            >
              <MaterialIcons name="psychology" size={22} color={UI.textMuted} />
            </View>
            <Text className="font-body text-sm text-center" style={{ color: UI.textSecondary }}>
              No models configured yet.
            </Text>
          </View>
        ) : (
          <View className="gap-2.5">
            {settings.map((item) => (
              <ConfigRow
                key={item.llmSettingsId}
                item={item}
                onEdit={() => openEdit(item)}
                onDelete={() => confirmDelete(item)}
              />
            ))}
          </View>
        )}

        <View className="mt-5">
          <TouchableOpacity
            onPress={openCreate}
            className="flex-row items-center justify-center gap-2 py-3 rounded-full"
            style={{
              borderWidth: 1,
              borderColor: UI.border,
              borderStyle: "dashed",
              backgroundColor: UI.surface,
            }}
          >
            <MaterialIcons name="add" size={18} color={UI.textSecondary} />
            <Text className="font-body text-sm" style={{ color: UI.textSecondary }}>
              Add model
            </Text>
          </TouchableOpacity>
        </View>
      </Card>

      <ConfigFormModal
        visible={modalOpen}
        editing={editing}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
      />
    </View>
  );
}
