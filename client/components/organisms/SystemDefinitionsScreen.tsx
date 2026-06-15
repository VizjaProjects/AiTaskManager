import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  Pressable,
  useWindowDimensions,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { PageLayout } from "./PageLayout";
import {
  useCategories,
  useCreateCategory,
  useEditCategory,
  useDeleteCategory,
  useTaskStatuses,
  useCreateTaskStatus,
  useEditTaskStatus,
  useDeleteTaskStatus,
} from "@/lib/hooks";
import { DEFAULT_CATEGORY_COLORS, getCategoryDisplayColor } from "@/lib/utils";
import { useThemeStore } from "@/lib/stores";
import { useEffect, useState } from "react";
import { Input, Button } from "../atoms";

type DefinitionKind = "category" | "status";

interface FormTarget {
  kind: DefinitionKind;
  id: string | null;
  name: string;
  color: string;
}

function DefinitionFormModal({
  target,
  isDark,
  saving,
  onClose,
  onSubmit,
}: {
  target: FormTarget | null;
  isDark: boolean;
  saving: boolean;
  onClose: () => void;
  onSubmit: (name: string, color: string) => void;
}) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(DEFAULT_CATEGORY_COLORS[0]);

  useEffect(() => {
    if (target) {
      setName(target.name);
      setColor(target.color || DEFAULT_CATEGORY_COLORS[0]);
    }
  }, [target]);

  if (!target) return null;

  const isEdit = target.id != null;
  const noun = target.kind === "category" ? "Category" : "Status";
  const title = `${isEdit ? "Edit" : "New"} ${noun}`;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        className="flex-1 bg-black/50 items-center justify-center p-6"
        onPress={onClose}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="bg-surface-container-lowest rounded-2xl w-full max-w-md border border-outline-variant p-5 gap-4"
        >
          <View className="flex-row items-center justify-between">
            <Text className="text-on-surface font-headline text-title-lg">
              {title}
            </Text>
            <TouchableOpacity onPress={onClose} className="p-1">
              <MaterialIcons name="close" size={22} color="#888888" />
            </TouchableOpacity>
          </View>

          <Input
            label="Name"
            value={name}
            onChangeText={setName}
            placeholder={target.kind === "category" ? "Design" : "To Do"}
            autoFocus
          />

          <View className="gap-2">
            <Text className="text-on-surface-variant font-label text-xs uppercase tracking-widest">
              Color
            </Text>
            <View className="flex-row flex-wrap gap-2.5">
              {DEFAULT_CATEGORY_COLORS.map((c) => (
                <TouchableOpacity
                  key={c}
                  onPress={() => setColor(c)}
                  className={`w-8 h-8 rounded-full ${color === c ? "ring-2 ring-primary" : ""}`}
                  style={{
                    backgroundColor: getCategoryDisplayColor(c, isDark),
                  }}
                />
              ))}
            </View>
          </View>

          <View className="flex-row gap-2 mt-1">
            <View className="flex-1">
              <Button label="Cancel" variant="outline" onPress={onClose} />
            </View>
            <View className="flex-1">
              <Button
                label={isEdit ? "Save" : "Create"}
                loading={saving}
                disabled={!name.trim()}
                onPress={() => {
                  if (!name.trim()) return;
                  onSubmit(name.trim(), color);
                }}
              />
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export function SystemDefinitionsScreen() {
  const isDark = useThemeStore((s) => s.mode) === "dark";
  const { width } = useWindowDimensions();
  const stacked = width < 768;
  const { data: categories = [] } = useCategories();
  const { data: statuses = [] } = useTaskStatuses();
  const createCategory = useCreateCategory();
  const editCategory = useEditCategory();
  const deleteCategory = useDeleteCategory();
  const createStatus = useCreateTaskStatus();
  const editStatus = useEditTaskStatus();
  const deleteStatus = useDeleteTaskStatus();

  const [form, setForm] = useState<FormTarget | null>(null);

  const saving =
    createCategory.isPending ||
    editCategory.isPending ||
    createStatus.isPending ||
    editStatus.isPending;

  function openCreate(kind: DefinitionKind) {
    setForm({ kind, id: null, name: "", color: DEFAULT_CATEGORY_COLORS[0] });
  }

  function openEdit(
    kind: DefinitionKind,
    id: string,
    name: string,
    color: string,
  ) {
    setForm({ kind, id, name, color });
  }

  function handleSubmit(name: string, color: string) {
    if (!form) return;
    const onSuccess = () => setForm(null);
    if (form.kind === "category") {
      if (form.id) {
        editCategory.mutate(
          { categoryId: form.id, data: { name, color } },
          { onSuccess },
        );
      } else {
        createCategory.mutate({ name, color }, { onSuccess });
      }
    } else {
      if (form.id) {
        editStatus.mutate(
          { statusId: form.id, data: { name, color } },
          { onSuccess },
        );
      } else {
        createStatus.mutate({ name, color }, { onSuccess });
      }
    }
  }

  return (
    <PageLayout>
      <ScrollView contentContainerStyle={{ gap: 24, paddingBottom: 32 }}>
        <View>
          <Text className="text-on-surface font-headline text-headline-md">
            Categories & Statuses
          </Text>
          <Text className="text-on-surface-variant font-body text-body-md mt-1">
            Organize your tasks with custom labels and workflow stages.
          </Text>
        </View>

        <View
          className="gap-5"
          style={{ flexDirection: stacked ? "column" : "row" }}
        >
          <View
            className={`bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant ${
              stacked ? "w-full" : "flex-1"
            }`}
          >
            <View className="flex-row items-center justify-between mb-5 gap-2">
              <View className="flex-row items-center gap-3 flex-1 min-w-0">
                <View className="w-9 h-9 rounded-full bg-primary-fixed items-center justify-center">
                  <MaterialIcons name="category" size={18} color="#111111" />
                </View>
                <Text className="font-headline text-on-surface text-title-lg">
                  Categories
                </Text>
              </View>
              <TouchableOpacity onPress={() => openCreate("category")}>
                <Text className="text-primary font-headline text-sm">
                  + Add New
                </Text>
              </TouchableOpacity>
            </View>

            {categories.length === 0 ? (
              <Text className="text-on-surface-variant font-body text-body-md py-4">
                No categories yet. Add one to organize your tasks.
              </Text>
            ) : (
              categories.map((cat) => (
                <View
                  key={cat.categoryId}
                  className="flex-row items-center justify-between py-3 gap-2"
                >
                  <View className="flex-row items-center gap-3 flex-1 min-w-0">
                    <View
                      className="w-2.5 h-2.5 rounded-full"
                      style={{
                        backgroundColor: getCategoryDisplayColor(
                          cat.color,
                          isDark,
                        ),
                      }}
                    />
                    <Text
                      className="text-on-surface font-body text-body-md flex-1"
                      numberOfLines={1}
                    >
                      {cat.name}
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-1">
                    <TouchableOpacity
                      onPress={() =>
                        openEdit(
                          "category",
                          cat.categoryId,
                          cat.name,
                          cat.color,
                        )
                      }
                      className="p-1"
                    >
                      <MaterialIcons name="edit" size={18} color="#777587" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => deleteCategory.mutate(cat.categoryId)}
                      className="p-1"
                    >
                      <MaterialIcons name="close" size={18} color="#777587" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>

          <View
            className={`bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant ${
              stacked ? "w-full" : "flex-1"
            }`}
          >
            <View className="flex-row items-center justify-between mb-5 gap-2">
              <View className="flex-row items-center gap-3 flex-1 min-w-0">
                <View className="w-9 h-9 rounded-full bg-secondary-fixed items-center justify-center">
                  <MaterialIcons name="toggle-on" size={18} color="#b90538" />
                </View>
                <Text className="font-headline text-on-surface text-title-lg">
                  Statuses
                </Text>
              </View>
              <TouchableOpacity onPress={() => openCreate("status")}>
                <Text className="text-secondary font-headline text-sm">
                  + Add New
                </Text>
              </TouchableOpacity>
            </View>

            {statuses.length === 0 ? (
              <Text className="text-on-surface-variant font-body text-body-md py-4">
                No statuses yet. Add workflow stages for your Kanban board.
              </Text>
            ) : (
              statuses.map((status) => (
                <View
                  key={status.statusId}
                  className="flex-row items-center justify-between py-3 gap-2"
                >
                  <View className="flex-row items-center gap-3 flex-1 min-w-0">
                    <View
                      className="w-2.5 h-2.5 rounded-full"
                      style={{
                        backgroundColor: getCategoryDisplayColor(
                          status.color,
                          isDark,
                        ),
                      }}
                    />
                    <Text
                      className="text-on-surface font-body text-body-md flex-1"
                      numberOfLines={1}
                    >
                      {status.name}
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-1">
                    <TouchableOpacity
                      onPress={() =>
                        openEdit(
                          "status",
                          status.statusId,
                          status.name,
                          status.color,
                        )
                      }
                      className="p-1"
                    >
                      <MaterialIcons name="edit" size={18} color="#777587" />
                    </TouchableOpacity>
                    {status.isDefault ? (
                      <View className="p-1">
                        <MaterialIcons name="lock" size={16} color="#9ca3af" />
                      </View>
                    ) : (
                      <TouchableOpacity
                        onPress={() => deleteStatus.mutate(status.statusId)}
                        className="p-1"
                      >
                        <MaterialIcons name="close" size={18} color="#777587" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      <DefinitionFormModal
        target={form}
        isDark={isDark}
        saving={saving}
        onClose={() => setForm(null)}
        onSubmit={handleSubmit}
      />
    </PageLayout>
  );
}
