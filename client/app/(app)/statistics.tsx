import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from "react-native";
import { useState, useMemo, useCallback } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { PageLayout } from "@/components/organisms";
import { Card, EmptyState } from "@/components/atoms";
import { StatCard } from "@/components/molecules";
import { useAiStatistics, useDeleteAiStatistic } from "@/lib/hooks";
import { formatDateTime } from "@/lib/utils";

export default function StatisticsScreen() {
  const { data: statistics, isLoading, refetch } = useAiStatistics();
  const deleteStatistic = useDeleteAiStatistic();
  const [refreshing, setRefreshing] = useState(false);

  const summary = useMemo(() => {
    if (!statistics || statistics.length === 0)
      return { total: 0, totalTokens: 0, avgTokens: 0 };
    const totalTokens = statistics.reduce((s, st) => s + st.inputTokens, 0);
    return {
      total: statistics.length,
      totalTokens,
      avgTokens: Math.round(totalTokens / statistics.length),
    };
  }, [statistics]);

  const sortedStatistics = useMemo(
    () =>
      [...(statistics ?? [])].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [statistics],
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  function handleDelete(id: string) {
    Alert.alert("Usuń statystykę", "Czy na pewno chcesz usunąć ten wpis?", [
      { text: "Anuluj", style: "cancel" },
      {
        text: "Usuń",
        style: "destructive",
        onPress: () => deleteStatistic.mutate(id),
      },
    ]);
  }

  if (isLoading) {
    return (
      <PageLayout title="Statistics">
        <View className="gap-4 mt-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <View
              key={i}
              className="bg-surface-container-lowest rounded-2xl h-32 animate-pulse"
            />
          ))}
        </View>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Statistics">
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ gap: 24, paddingBottom: 32 }}
      >
        <View>
          <Text className="text-on-surface font-headline text-xl">
            Statystyki AI
          </Text>
          <Text className="text-on-surface-variant font-body text-sm mt-1">
            Przegląd zużycia tokenów i historii promptów
          </Text>
        </View>

        <View className="flex-row flex-wrap gap-4">
          <View className="flex-1" style={{ minWidth: 200 }}>
            <StatCard
              label="Prompty"
              value={summary.total}
              icon="chat"
              iconColor="#4d41df"
            />
          </View>
          <View className="flex-1" style={{ minWidth: 200 }}>
            <StatCard
              label="Tokeny łącznie"
              value={summary.totalTokens.toLocaleString()}
              icon="data-usage"
              iconColor="#006b58"
            />
          </View>
          <View className="flex-1" style={{ minWidth: 200 }}>
            <StatCard
              label="Śr. tokenów/prompt"
              value={summary.avgTokens.toLocaleString()}
              icon="analytics"
              iconColor="#f59e0b"
            />
          </View>
        </View>

        <View className="gap-3">
          <Text className="text-on-surface font-headline text-base">
            Historia promptów
          </Text>

          {sortedStatistics.length === 0 ? (
            <EmptyState
              title="Brak historii"
              description="Wygeneruj swój pierwszy plan AI, aby zobaczyć statystyki"
            />
          ) : (
            sortedStatistics.map((stat) => (
              <Card key={stat.aiStatisticId} variant="surface">
                <View className="gap-2">
                  <View className="flex-row items-start justify-between gap-3">
                    <View className="flex-1 gap-1">
                      <Text
                        className="text-on-surface font-body text-sm"
                        numberOfLines={3}
                      >
                        {stat.promptText}
                      </Text>
                      <View className="flex-row items-center gap-4 mt-1">
                        <View className="flex-row items-center gap-1">
                          <MaterialIcons
                            name="token"
                            size={14}
                            color="#777587"
                          />
                          <Text className="text-on-surface-variant font-label text-xs">
                            {stat.inputTokens.toLocaleString()} tokenów
                          </Text>
                        </View>
                        <View className="flex-row items-center gap-1">
                          <MaterialIcons
                            name="schedule"
                            size={14}
                            color="#777587"
                          />
                          <Text className="text-on-surface-variant font-label text-xs">
                            {formatDateTime(stat.createdAt)}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleDelete(stat.aiStatisticId)}
                      className="p-2"
                    >
                      <MaterialIcons
                        name="delete-outline"
                        size={20}
                        color="#777587"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </Card>
            ))
          )}
        </View>
      </ScrollView>
    </PageLayout>
  );
}
