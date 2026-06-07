import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { PageLayout } from "./PageLayout";
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useTaskStatuses,
  useCreateTaskStatus,
  useDeleteTaskStatus,
} from "@/lib/hooks";
import { DEFAULT_CATEGORY_COLORS, getCategoryDisplayColor } from "@/lib/utils";
import { useThemeStore } from "@/lib/stores";
import { useState } from "react";
import { Input, Button } from "../atoms";

export function SystemDefinitionsScreen() {
  const isDark = useThemeStore((s) => s.mode) === "dark";
  const { data: categories = [] } = useCategories();
  const { data: statuses = [] } = useTaskStatuses();
  const createCategory = useCreateCategory();
  const deleteCategory = useDeleteCategory();
  const createStatus = useCreateTaskStatus();
  const deleteStatus = useDeleteTaskStatus();

  const [showCatForm, setShowCatForm] = useState(false);
  const [catName, setCatName] = useState("");
  const [catColor, setCatColor] = useState(DEFAULT_CATEGORY_COLORS[0]);
  const [showStatusForm, setShowStatusForm] = useState(false);
  const [statusName, setStatusName] = useState("");
  const [statusColor, setStatusColor] = useState("#3B82F6");

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

        <View className="flex-col md:flex-row gap-5">
          <View className="flex-1 bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant">
            <View className="flex-row items-center justify-between mb-5">
              <View className="flex-row items-center gap-3">
                <View className="w-9 h-9 rounded-full bg-primary-fixed items-center justify-center">
                  <MaterialIcons name="category" size={18} color="#111111" />
                </View>
                <Text className="font-headline text-on-surface text-title-lg">
                  Categories
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowCatForm((v) => !v)}>
                <Text className="text-primary font-headline text-sm">+ Add New</Text>
              </TouchableOpacity>
            </View>

            {showCatForm && (
              <View className="gap-3 mb-5 p-4 bg-surface-container-low rounded-xl">
                <Input
                  label="Name"
                  value={catName}
                  onChangeText={setCatName}
                  placeholder="Design"
                />
                <View className="flex-row flex-wrap gap-2">
                  {DEFAULT_CATEGORY_COLORS.map((c) => (
                    <TouchableOpacity
                      key={c}
                      onPress={() => setCatColor(c)}
                      className={`w-7 h-7 rounded-full ${catColor === c ? "ring-2 ring-primary" : ""}`}
                      style={{ backgroundColor: getCategoryDisplayColor(c, isDark) }}
                    />
                  ))}
                </View>
                <Button
                  label="Create"
                  onPress={() => {
                    if (!catName.trim()) return;
                    createCategory.mutate(
                      { name: catName.trim(), color: catColor },
                      {
                        onSuccess: () => {
                          setCatName("");
                          setShowCatForm(false);
                        },
                      },
                    );
                  }}
                  loading={createCategory.isPending}
                />
              </View>
            )}

            {categories.length === 0 ? (
              <Text className="text-on-surface-variant font-body text-body-md py-4">
                No categories yet. Add one to organize your tasks.
              </Text>
            ) : (
              categories.map((cat) => (
                <View
                  key={cat.categoryId}
                  className="flex-row items-center justify-between py-3"
                >
                  <View className="flex-row items-center gap-3">
                    <View
                      className="w-2.5 h-2.5 rounded-full"
                      style={{
                        backgroundColor: getCategoryDisplayColor(cat.color, isDark),
                      }}
                    />
                    <Text className="text-on-surface font-body text-body-md">
                      {cat.name}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => deleteCategory.mutate(cat.categoryId)}
                  >
                    <MaterialIcons name="close" size={18} color="#777587" />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>

          <View className="flex-1 bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant">
            <View className="flex-row items-center justify-between mb-5">
              <View className="flex-row items-center gap-3">
                <View className="w-9 h-9 rounded-full bg-secondary-fixed items-center justify-center">
                  <MaterialIcons name="toggle-on" size={18} color="#b90538" />
                </View>
                <Text className="font-headline text-on-surface text-title-lg">
                  Statuses
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowStatusForm((v) => !v)}>
                <Text className="text-secondary font-headline text-sm">+ Add New</Text>
              </TouchableOpacity>
            </View>

            {showStatusForm && (
              <View className="gap-3 mb-5 p-4 bg-surface-container-low rounded-xl">
                <Input
                  label="Name"
                  value={statusName}
                  onChangeText={setStatusName}
                  placeholder="To Do"
                />
                <Button
                  label="Create"
                  onPress={() => {
                    if (!statusName.trim()) return;
                    createStatus.mutate(
                      { name: statusName.trim(), color: statusColor },
                      {
                        onSuccess: () => {
                          setStatusName("");
                          setShowStatusForm(false);
                        },
                      },
                    );
                  }}
                  loading={createStatus.isPending}
                />
              </View>
            )}

            {statuses.length === 0 ? (
              <Text className="text-on-surface-variant font-body text-body-md py-4">
                No statuses yet. Add workflow stages for your Kanban board.
              </Text>
            ) : (
              statuses.map((status) => (
                <View
                  key={status.statusId}
                  className="flex-row items-center justify-between py-3"
                >
                  <View className="flex-row items-center gap-3">
                    <View
                      className="w-2.5 h-2.5 rounded-full"
                      style={{
                        backgroundColor: getCategoryDisplayColor(status.color, isDark),
                      }}
                    />
                    <Text className="text-on-surface font-body text-body-md">
                      {status.name}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => deleteStatus.mutate(status.statusId)}
                  >
                    <MaterialIcons name="close" size={18} color="#777587" />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </PageLayout>
  );
}
