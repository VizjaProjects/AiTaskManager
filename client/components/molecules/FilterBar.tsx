import { View, ScrollView, TouchableOpacity, Text } from "react-native";
import { TaskPriority } from "@/lib/types";
import { PRIORITY_COLORS } from "@/lib/utils";

interface FilterBarProps {
  selectedPriority: TaskPriority | null;
  onSelectPriority: (priority: TaskPriority | null) => void;
  categories?: Array<{ id: string; name: string; color: string }>;
  selectedCategoryId: string | null;
  onSelectCategory: (id: string | null) => void;
}

export function FilterBar({
  selectedPriority,
  onSelectPriority,
  categories = [],
  selectedCategoryId,
  onSelectCategory,
}: FilterBarProps) {
  const priorities = Object.values(TaskPriority);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="py-2"
      contentContainerStyle={{ gap: 8, paddingHorizontal: 4 }}
    >
      {priorities.map((p) => {
        const active = selectedPriority === p;
        return (
          <TouchableOpacity
            key={p}
            onPress={() => onSelectPriority(active ? null : p)}
            className={`px-3 py-1.5 rounded-full border ${
              active ? "border-transparent" : "border-outline-variant"
            }`}
            style={active ? { backgroundColor: PRIORITY_COLORS[p] } : undefined}
          >
            <Text
              className={`text-xs font-label ${
                active ? "text-white" : "text-on-surface-variant"
              }`}
            >
              {p}
            </Text>
          </TouchableOpacity>
        );
      })}

      {categories.length > 0 && (
        <View className="w-px h-6 bg-outline-variant mx-1 self-center" />
      )}

      {categories.map((cat) => {
        const active = selectedCategoryId === cat.id;
        return (
          <TouchableOpacity
            key={cat.id}
            onPress={() => onSelectCategory(active ? null : cat.id)}
            className={`flex-row items-center gap-1.5 px-3 py-1.5 rounded-full border ${
              active
                ? "border-transparent bg-primary-fixed"
                : "border-outline-variant"
            }`}
          >
            <View
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: cat.color }}
            />
            <Text
              className={`text-xs font-label ${
                active ? "text-primary" : "text-on-surface-variant"
              }`}
            >
              {cat.name}
            </Text>
          </TouchableOpacity>
        );
      })}

      {(selectedPriority || selectedCategoryId) && (
        <TouchableOpacity
          onPress={() => {
            onSelectPriority(null);
            onSelectCategory(null);
          }}
          className="px-3 py-1.5"
        >
          <Text className="text-xs font-label text-primary">Wyczyść</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}
