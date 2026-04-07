import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import { PageLayout } from "@/components/organisms";
import { Button, Input, Card, EmptyState } from "@/components/atoms";
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
} from "@/lib/hooks";
import { DEFAULT_CATEGORY_COLORS, getCategoryDisplayColor } from "@/lib/utils";
import { useThemeStore } from "@/lib/stores";

export default function CategoriesScreen() {
  const { data: categories, isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const deleteCategory = useDeleteCategory();
  const isDark = useThemeStore((s) => s.mode) === "dark";
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState(
    DEFAULT_CATEGORY_COLORS[0],
  );

  async function handleCreate() {
    if (!name.trim()) return;
    await createCategory.mutateAsync({
      name: name.trim(),
      color: selectedColor,
    });
    setName("");
    setShowForm(false);
  }

  function handleDelete(categoryId: string) {
    Alert.alert("Usuń kategorię", "Czy na pewno chcesz usunąć tę kategorię?", [
      { text: "Anuluj", style: "cancel" },
      {
        text: "Usuń",
        style: "destructive",
        onPress: () => deleteCategory.mutate(categoryId),
      },
    ]);
  }

  return (
    <PageLayout title="Categories">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ gap: 16, paddingBottom: 32 }}
      >
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-on-surface font-headline text-lg">
              Kategorie
            </Text>
            <Text className="text-on-surface-variant font-body text-sm">
              Organizuj zadania kolorowymi kategoriami
            </Text>
          </View>
          <Button
            label="Nowa kategoria"
            onPress={() => setShowForm(!showForm)}
          />
        </View>

        {showForm && (
          <Card variant="surface">
            <View className="gap-4">
              <Input
                label="Nazwa kategorii"
                placeholder="np. Praca, Osobiste..."
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
                  loading={createCategory.isPending}
                  onPress={handleCreate}
                />
              </View>
            </View>
          </Card>
        )}

        {!isLoading && categories?.length === 0 && !showForm && (
          <EmptyState
            title="Brak kategorii"
            description="Kategorie pomagają organizować zadania wg projektu, obszaru lub kontekstu"
            primaryAction={{
              label: "Utwórz kategorię",
              onPress: () => setShowForm(true),
            }}
          />
        )}

        {categories?.map((cat) => (
          <Card key={cat.categoryId} variant="surface">
            <View className="flex-row items-center gap-4">
              <View
                className="w-10 h-10 rounded-full"
                style={{
                  backgroundColor: getCategoryDisplayColor(cat.color, isDark),
                }}
              />
              <View className="flex-1">
                <Text className="text-on-surface font-headline text-base">
                  {cat.name}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => handleDelete(cat.categoryId)}
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
