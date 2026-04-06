import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import { PageLayout } from "@/components/organisms";
import { Button, Input, Card, EmptyState } from "@/components/atoms";
import {
  useTaskStatuses,
  useCreateTaskStatus,
  useDeleteTaskStatus,
} from "@/lib/hooks";
import { DEFAULT_CATEGORY_COLORS } from "@/lib/utils";

export default function StatusesScreen() {
  const { data: statuses, isLoading } = useTaskStatuses();
  const createStatus = useCreateTaskStatus();
  const deleteStatus = useDeleteTaskStatus();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState("#3B82F6");

  async function handleCreate() {
    if (!name.trim()) return;
    await createStatus.mutateAsync({ name: name.trim(), color: selectedColor });
    setName("");
    setShowForm(false);
  }

  function handleDelete(statusId: string) {
    Alert.alert("Usuń status", "Czy na pewno chcesz usunąć ten status?", [
      { text: "Anuluj", style: "cancel" },
      {
        text: "Usuń",
        style: "destructive",
        onPress: () => deleteStatus.mutate(statusId),
      },
    ]);
  }

  return (
    <PageLayout title="Statuses">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ gap: 16, paddingBottom: 32 }}
      >
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-on-surface font-headline text-lg">
              Statusy
            </Text>
            <Text className="text-on-surface-variant font-body text-sm">
              Zarządzaj statusami zadań
            </Text>
          </View>
          <Button label="Nowy status" onPress={() => setShowForm(!showForm)} />
        </View>

        {showForm && (
          <Card variant="surface">
            <View className="gap-4">
              <Input
                label="Nazwa statusu"
                placeholder="np. Do zrobienia, W trakcie..."
                value={name}
                onChangeText={setName}
                returnKeyType="go"
                onSubmitEditing={handleCreate}
              />
              <Text className="text-on-surface-variant font-label text-xs uppercase tracking-widest">
                Kolor
              </Text>
              <View className="flex-row flex-wrap gap-3">
                {DEFAULT_CATEGORY_COLORS.map((color) => (
                  <TouchableOpacity
                    key={color}
                    onPress={() => setSelectedColor(color)}
                    className={`w-10 h-10 rounded-full items-center justify-center ${
                      selectedColor === color
                        ? "border-2 border-primary p-0.5"
                        : ""
                    }`}
                  >
                    <View
                      className="w-full h-full rounded-full"
                      style={{ backgroundColor: color }}
                    />
                  </TouchableOpacity>
                ))}
              </View>
              <View className="flex-row gap-3">
                <Button
                  variant="outline"
                  label="Anuluj"
                  onPress={() => setShowForm(false)}
                />
                <Button
                  label="Zapisz"
                  loading={createStatus.isPending}
                  onPress={handleCreate}
                />
              </View>
            </View>
          </Card>
        )}

        {!isLoading && statuses?.length === 0 && !showForm && (
          <EmptyState
            title="Brak statusów"
            description="Utwórz statusy, aby śledzić postęp zadań na tablicy Kanban"
            primaryAction={{
              label: "Utwórz status",
              onPress: () => setShowForm(true),
            }}
          />
        )}

        {statuses?.map((status) => (
          <Card key={status.statusId} variant="surface">
            <View className="flex-row items-center gap-4">
              <View
                className="w-10 h-10 rounded-full"
                style={{ backgroundColor: status.color }}
              />
              <View className="flex-1">
                <Text className="text-on-surface font-headline text-base">
                  {status.name}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => handleDelete(status.statusId)}
                className="p-2"
              >
                <MaterialIcons
                  name="delete-outline"
                  size={20}
                  color="#777587"
                />
              </TouchableOpacity>
            </View>
          </Card>
        ))}
      </ScrollView>
    </PageLayout>
  );
}
