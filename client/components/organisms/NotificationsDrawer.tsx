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
import { useT } from "@/lib/i18n";

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

/**
 * Shared notification computation so the header badge and the drawer agree on
 * whether there is anything to show (the dot must not light up when empty).
 */
export function useNotificationItems(): Notification[] {
  const t = useT();
  const { data: tasks } = useTasks();
  const { data: events } = useEvents();
  const { data: proposals } = useAiProposals();

  return useMemo<Notification[]>(() => {
    const notifs: Notification[] = [];

    (tasks ?? []).forEach((task) => {
      if (isOverdue(task.dueDateTime)) {
        notifs.push({
          id: `overdue-${task.taskId}`,
          type: "overdue",
          title: t("notif.overdue"),
          description: task.title,
          timestamp: task.dueDateTime!,
          icon: "warning",
          color: "#C0392B",
        });
      } else if (isDueToday(task.dueDateTime)) {
        notifs.push({
          id: `today-${task.taskId}`,
          type: "due_today",
          title: t("notif.dueToday"),
          description: task.title,
          timestamp: task.dueDateTime!,
          icon: "schedule",
          color: "#B7770D",
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
          title: t("notif.eventSoon"),
          description: e.title,
          timestamp: e.startDateTime,
          icon: "event",
          color: "#5b4ee0",
        });
      }
    });

    const proposedTasks = proposals?.tasks ?? [];
    proposedTasks.forEach((p, i) => {
      notifs.push({
        id: `ai-${p.taskId ?? i}`,
        type: "ai_proposal",
        title: t("notif.aiProposal"),
        description: p.title ?? t("notif.aiProposalDesc"),
        timestamp: new Date().toISOString(),
        icon: "auto-awesome",
        color: "#006b58",
      });
    });

    return notifs.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
  }, [tasks, events, proposals, t]);
}

export function NotificationsDrawer({
  visible,
  onClose,
}: NotificationsDrawerProps) {
  const t = useT();
  const { width } = useWindowDimensions();
  const notifications = useNotificationItems();

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
              {t("notif.title")}
            </Text>
            <TouchableOpacity className="p-2 rounded-full" onPress={onClose}>
              <MaterialIcons name="close" size={22} color="#6b6965" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          {notifications.length === 0 ? (
            <View className="flex-1 justify-center px-5">
              <EmptyState
                title={t("notif.empty")}
                description={t("notif.emptyDesc")}
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
