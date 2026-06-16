import { View, Text, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import type { Task, Category, CalendarEvent } from "@/lib/types";
import { TaskPriority } from "@/lib/types";
import { PriorityBadge, AiSuggestedBadge, Avatar, ColorBadge } from "../atoms";
import { useAuthStore, useThemeStore } from "@/lib/stores";
import { useT, useLanguageStore } from "@/lib/i18n";
import { resolveEventColor, eventColorWithAlpha } from "@/lib/utils/eventColors";

interface DashboardFocusItemProps {
  task: Task;
  category?: Category;
  onPress?: () => void;
}

export function DashboardFocusItem({ task, category, onPress }: DashboardFocusItemProps) {
  const t = useT();
  const user = useAuthStore((s) => s.user);
  const dueLabel = task.dueDateTime
    ? new Date(task.dueDateTime).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      className="flex-row items-center gap-3 py-3.5"
    >
      <View className="w-5 h-5 rounded-full border-2 border-outline-variant shrink-0" />
      <View className="flex-1 min-w-0 gap-1">
        <Text className="font-headline text-on-surface text-body-md" numberOfLines={1}>
          {task.title}
        </Text>
        <View className="flex-row flex-wrap items-center gap-2">
          <PriorityBadge priority={task.priority} variant="soft" />
          {category && <ColorBadge label={category.name} color={category.color} />}
          {dueLabel && (
            <Text className="text-on-surface-variant font-body text-xs">{t("dash.due")} {dueLabel}</Text>
          )}
        </View>
      </View>
      {user && <Avatar fullName={user.fullName} size="sm" />}
    </TouchableOpacity>
  );
}

interface DashboardEventItemProps {
  event: CalendarEvent;
  onPress?: () => void;
}

export function DashboardEventItem({ event, onPress }: DashboardEventItemProps) {
  const t = useT();
  const lang = useLanguageStore((s) => s.lang);
  const locale = lang === "pl" ? "pl-PL" : "en-US";
  const isDark = useThemeStore((s) => s.mode) === "dark";
  const eventColor = resolveEventColor(event);
  const start = new Date(event.startDateTime);
  const end = new Date(event.endDateTime);
  const isToday = (() => {
    const t = new Date();
    return (
      start.getFullYear() === t.getFullYear() &&
      start.getMonth() === t.getMonth() &&
      start.getDate() === t.getDate()
    );
  })();

  const dateLabel = isToday
    ? t("common.today")
    : start.toLocaleDateString(locale, { weekday: "short", month: "short", day: "numeric" });

  const timeLabel = `${start.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })} – ${end.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })}`;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      className="flex-row items-center gap-3 py-3.5"
    >
      <View
        className="w-10 h-10 rounded-xl border border-outline-variant items-center justify-center shrink-0"
        style={{ backgroundColor: eventColorWithAlpha(eventColor, isDark ? 0.25 : 0.12) }}
      >
        <MaterialIcons name="event" size={18} color={eventColor} />
      </View>
      <View className="flex-1 min-w-0 gap-0.5">
        <Text className="font-headline text-on-surface text-body-md" numberOfLines={1}>
          {event.title}
        </Text>
        <Text className="text-on-surface-variant font-body text-xs">
          {dateLabel} · {timeLabel}
        </Text>
      </View>
      <MaterialIcons name="chevron-right" size={18} color={isDark ? "#6e6e73" : "#d1d5db"} />
    </TouchableOpacity>
  );
}

interface DashboardAiProposalItemProps {
  title: string;
  description?: string;
  priority?: TaskPriority;
  onAccept: () => void;
  onDismiss: () => void;
  loading?: boolean;
}

export function DashboardAiProposalItem({
  title,
  description,
  priority,
  onAccept,
  onDismiss,
  loading,
}: DashboardAiProposalItemProps) {
  const t = useT();
  return (
    <View className="rounded-xl border border-outline-variant bg-surface-container-lowest overflow-hidden my-1">
      <View className="p-3.5 gap-2">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-1.5">
            <MaterialIcons name="auto-awesome" size={13} color="#9ca3af" />
            <AiSuggestedBadge />
          </View>
          {priority && <PriorityBadge priority={priority} variant="soft" />}
        </View>
        <Text className="font-headline text-on-surface text-body-md">{title}</Text>
        {description && (
          <Text className="text-on-surface-variant font-body text-xs" numberOfLines={2}>
            {description}
          </Text>
        )}
      </View>
      <View className="flex-row gap-2 px-3.5 pb-3.5">
        <TouchableOpacity
          onPress={onDismiss}
          disabled={loading}
          className="flex-1 flex-row items-center justify-center gap-1 py-2 rounded-lg border border-outline-variant"
        >
          <MaterialIcons name="close" size={14} color="#ef4444" />
          <Text className="text-on-surface font-headline text-xs">{t("common.reject")}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onAccept}
          disabled={loading}
          className="flex-1 flex-row items-center justify-center gap-1 py-2 rounded-lg bg-action"
        >
          <MaterialIcons name="check" size={14} color="#f0f0f0" />
          <Text className="text-on-action font-headline text-xs">
            {loading ? "..." : t("common.accept")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
