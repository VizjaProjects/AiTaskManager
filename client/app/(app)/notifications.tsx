import { View, Text, ScrollView, RefreshControl } from "react-native";
import { useMemo, useState, useCallback } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { PageLayout } from "@/components/organisms";
import { Button, Card, EmptyState } from "@/components/atoms";
import { useTasks, useEvents, useAiProposals } from "@/lib/hooks";
import { isOverdue, isDueToday, formatDateTime } from "@/lib/utils";

interface Notification {
  id: string;
  type: "overdue" | "due_today" | "ai_proposal" | "event_soon";
  title: string;
  description: string;
  timestamp: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  color: string;
}

export default function NotificationsScreen() {
  const { data: tasks, refetch: refetchTasks } = useTasks();
  const { data: events, refetch: refetchEvents } = useEvents();
  const { data: proposals, refetch: refetchProposals } = useAiProposals();
  const [refreshing, setRefreshing] = useState(false);

  const notifications = useMemo<Notification[]>(() => {
    const notifs: Notification[] = [];

    (tasks ?? []).forEach((t) => {
      if (isOverdue(t.dueDateTime)) {
        notifs.push({
          id: `overdue-${t.taskId}`,
          type: "overdue",
          title: "Zadanie przeterminowane",
          description: t.title,
          timestamp: t.dueDateTime!,
          icon: "warning",
          color: "#dc2626",
        });
      } else if (isDueToday(t.dueDateTime)) {
        notifs.push({
          id: `today-${t.taskId}`,
          type: "due_today",
          title: "Zadanie na dziś",
          description: t.title,
          timestamp: t.dueDateTime!,
          icon: "schedule",
          color: "#f59e0b",
        });
      }
    });

    const now = new Date();
    const in2h = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    (events ?? []).forEach((e) => {
      const start = new Date(e.startDateTime);
      if (start > now && start <= in2h) {
        notifs.push({
          id: `event-${e.eventId}`,
          type: "event_soon",
          title: "Nadchodzące wydarzenie",
          description: e.title,
          timestamp: e.startDateTime,
          icon: "event",
          color: "#4d41df",
        });
      }
    });

    const proposedTasks = proposals?.tasks ?? [];
    proposedTasks.forEach((p, i) => {
      notifs.push({
        id: `ai-${p.taskId ?? i}`,
        type: "ai_proposal",
        title: "Propozycja AI",
        description: p.title ?? "Nowa propozycja zadania od AI",
        timestamp: new Date().toISOString(),
        icon: "auto-awesome",
        color: "#006b58",
      });
    });

    return notifs.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
  }, [tasks, events, proposals]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchTasks(), refetchEvents(), refetchProposals()]);
    setRefreshing(false);
  }, [refetchTasks, refetchEvents, refetchProposals]);

  return (
    <PageLayout title="Powiadomienia" showSearch={false}>
      {notifications.length === 0 ? (
        <EmptyState
          title="Brak powiadomień"
          description="Jesteś na bieżąco — nie masz żadnych nowych powiadomień"
        />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={{ gap: 8, paddingBottom: 32 }}
        >
          {notifications.map((n) => (
            <Card key={n.id} variant="surface">
              <View className="flex-row items-start gap-4">
                <View
                  className="w-10 h-10 rounded-full items-center justify-center"
                  style={{ backgroundColor: `${n.color}20` }}
                >
                  <MaterialIcons name={n.icon} size={20} color={n.color} />
                </View>
                <View className="flex-1 gap-1">
                  <Text className="text-on-surface font-headline text-sm">
                    {n.title}
                  </Text>
                  <Text
                    className="text-on-surface-variant font-body text-sm"
                    numberOfLines={1}
                  >
                    {n.description}
                  </Text>
                  <Text className="text-outline font-body text-xs">
                    {formatDateTime(n.timestamp)}
                  </Text>
                </View>
              </View>
            </Card>
          ))}
        </ScrollView>
      )}
    </PageLayout>
  );
}
