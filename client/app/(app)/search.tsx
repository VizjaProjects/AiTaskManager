import { View, Text, ScrollView } from "react-native";
import { useMemo, useState } from "react";
import { PageLayout } from "@/components/organisms";
import { SearchBar } from "@/components/molecules";
import { TaskCard } from "@/components/molecules";
import { EmptyState } from "@/components/atoms";
import { useTasks, useCategories, useEvents } from "@/lib/hooks";
import { getCategoryDisplayColor } from "@/lib/utils";
import { useThemeStore } from "@/lib/stores";
import type { Category } from "@/lib/types";

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const isDark = useThemeStore((s) => s.mode) === "dark";
  const { data: tasks } = useTasks();
  const { data: categories } = useCategories();
  const { data: events } = useEvents();

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

  return (
    <PageLayout title="Szukaj" showSearch={false}>
      <View className="gap-4">
        <SearchBar value={query} onChangeText={setQuery} />

        {query.trim() && !hasResults && (
          <EmptyState
            title="Brak wyników"
            description={`Nie znaleziono wyników dla "${query}"`}
          />
        )}

        {hasResults && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ gap: 16, paddingBottom: 32 }}
          >
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
                  <View
                    key={event.eventId}
                    className="bg-surface-container-lowest rounded-2xl p-4"
                  >
                    <Text className="text-on-surface font-headline text-sm">
                      {event.title}
                    </Text>
                  </View>
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
        )}
      </View>
    </PageLayout>
  );
}
