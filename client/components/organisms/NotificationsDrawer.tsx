import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
  useWindowDimensions,
} from "react-native";
import { useMemo } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { Card, EmptyState } from "../atoms";
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

interface NotificationsDrawerProps {
  visible: boolean;
  onClose: () => void;
}

export function NotificationsDrawer({
  visible,
  onClose,
}: NotificationsDrawerProps) {
  const { data: tasks } = useTasks();
  const { data: events } = useEvents();
  const { data: proposals } = useAiProposals();
  const { width } = useWindowDimensions();

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

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 flex-row">
        {/* Backdrop */}
        <Pressable className="flex-1 bg-black/40" onPress={onClose} />

        {/* Drawer panel — right side */}
        <View
          className="h-full bg-surface-container-lowest"
          style={{ width: Math.min(width * 0.85, 400) }}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between px-5 py-4 border-b border-outline-variant/30">
            <Text className="text-on-surface font-headline text-lg">
              Powiadomienia
            </Text>
            <TouchableOpacity className="p-2 rounded-full" onPress={onClose}>
              <MaterialIcons name="close" size={22} color="#777587" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          {notifications.length === 0 ? (
            <View className="flex-1 justify-center px-5">
              <EmptyState
                title="Brak powiadomień"
                description="Jesteś na bieżąco — nie masz żadnych nowych powiadomień"
              />
            </View>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ gap: 8, padding: 16, paddingBottom: 32 }}
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
        </View>
      </View>
    </Modal>
  );
}
