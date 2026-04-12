import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
  useWindowDimensions,
  Platform,
} from "react-native";
import { useMemo, useState, useRef, useEffect } from "react";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { SearchBar, TaskCard } from "../molecules";
import { EmptyState } from "../atoms";
import { useTasks, useCategories, useEvents } from "@/lib/hooks";
import { getCategoryDisplayColor, formatDateTime } from "@/lib/utils";
import { useThemeStore } from "@/lib/stores";
import type { Category } from "@/lib/types";
import type { TextInput } from "react-native";

interface SearchModalProps {
  visible: boolean;
  onClose: () => void;
}

export function SearchModal({ visible, onClose }: SearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const isDark = useThemeStore((s) => s.mode) === "dark";
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && width >= 1024;
  const { data: tasks } = useTasks();
  const { data: categories } = useCategories();
  const { data: events } = useEvents();

  useEffect(() => {
    if (!visible) setQuery("");
  }, [visible]);

  const categoryMap = useMemo(() => {
    const m = new Map<string, Category>();
    categories?.forEach((c) => m.set(c.categoryId, c));
    return m;
  }, [categories]);

  const results = useMemo(() => {
    if (!query.trim()) return { tasks: [], events: [], categories: [] };
    const q = query.toLowerCase();
    return {
      tasks: (tasks ?? []).filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q),
      ),
      events: (events ?? []).filter((e) => e.title.toLowerCase().includes(q)),
      categories: (categories ?? []).filter((c) =>
        c.name.toLowerCase().includes(q),
      ),
    };
  }, [query, tasks, events, categories]);

  const hasResults =
    results.tasks.length > 0 ||
    results.events.length > 0 ||
    results.categories.length > 0;

  const handleTaskPress = (taskId: string) => {
    onClose();
    router.push({ pathname: "/(app)/tasks" as never, params: { taskId } });
  };

  const handleEventPress = (eventId: string) => {
    onClose();
    router.push({ pathname: "/(app)/calendar" as never, params: { eventId } });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/40">
        <Pressable className="flex-1" onPress={onClose} />

        {/* Search panel — centered */}
        <View
          className="bg-surface-container-lowest rounded-t-3xl"
          style={{
            maxHeight: "85%",
            ...(isDesktop
              ? {
                  position: "absolute" as const,
                  top: "8%",
                  left: "50%",
                  transform: [{ translateX: -Math.min(width * 0.4, 320) }],
                  width: Math.min(width * 0.8, 640),
                  borderRadius: 24,
                  maxHeight: "80%",
                }
              : {}),
          }}
        >
          {/* Header */}
          <View className="flex-row items-center gap-3 px-5 pt-5 pb-3">
            <View className="flex-1">
              <SearchBar
                value={query}
                onChangeText={setQuery}
                placeholder="Szukaj zadań, wydarzeń..."
              />
            </View>
            <TouchableOpacity className="p-2 rounded-full" onPress={onClose}>
              <MaterialIcons name="close" size={22} color="#777587" />
            </TouchableOpacity>
          </View>

          {/* Results */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              gap: 16,
              paddingHorizontal: 20,
              paddingBottom: 32,
            }}
            keyboardShouldPersistTaps="handled"
          >
            {query.trim() && !hasResults && (
              <EmptyState
                title="Brak wyników"
                description={`Nie znaleziono wyników dla "${query}"`}
              />
            )}

            {results.tasks.length > 0 && (
              <View className="gap-3">
                <Text className="text-on-surface font-headline text-base">
                  Zadania ({results.tasks.length})
                </Text>
                {results.tasks.map((task) => (
                  <TaskCard
                    key={task.taskId}
                    task={task}
                    category={
                      task.categoryId
                        ? (categoryMap.get(task.categoryId) ?? undefined)
                        : undefined
                    }
                    onPress={() => handleTaskPress(task.taskId)}
                  />
                ))}
              </View>
            )}

            {results.events.length > 0 && (
              <View className="gap-3">
                <Text className="text-on-surface font-headline text-base">
                  Wydarzenia ({results.events.length})
                </Text>
                {results.events.map((event) => (
                  <TouchableOpacity
                    key={event.eventId}
                    activeOpacity={0.85}
                    onPress={() => handleEventPress(event.eventId)}
                    className="bg-surface-container-lowest rounded-2xl p-4 flex-row items-center gap-3 border border-outline-variant/20"
                  >
                    <View className="w-9 h-9 rounded-full bg-primary/10 items-center justify-center">
                      <MaterialIcons name="event" size={18} color="#4d41df" />
                    </View>
                    <View className="flex-1 gap-0.5">
                      <Text className="text-on-surface font-headline text-sm">
                        {event.title}
                      </Text>
                      <Text className="text-on-surface-variant font-body text-xs">
                        {formatDateTime(event.startDateTime)}
                      </Text>
                    </View>
                    <MaterialIcons
                      name="chevron-right"
                      size={20}
                      color="#777587"
                    />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {results.categories.length > 0 && (
              <View className="gap-3">
                <Text className="text-on-surface font-headline text-base">
                  Kategorie ({results.categories.length})
                </Text>
                {results.categories.map((cat) => (
                  <View
                    key={cat.categoryId}
                    className="flex-row items-center gap-3 bg-surface-container-lowest rounded-2xl p-4"
                  >
                    <View
                      className="w-4 h-4 rounded-full"
                      style={{
                        backgroundColor: getCategoryDisplayColor(
                          cat.color,
                          isDark,
                        ),
                      }}
                    />
                    <Text className="text-on-surface font-headline text-sm">
                      {cat.name}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
