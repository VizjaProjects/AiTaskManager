import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  RefreshControl,
  Platform,
  useWindowDimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { useState, useMemo, useCallback } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { PageLayout } from "@/components/organisms";
import {
  StatCard,
  DashboardTaskCard,
  DashboardEventItem,
  DashboardQuickActions,
} from "@/components/molecules";
import { StatCardSkeleton } from "@/components/atoms";
import {
  useTasks,
  useEvents,
  useAiProposals,
  useCategories,
  useTaskStatuses,
  useSurveyGate,
} from "@/lib/hooks";
import { useAuthStore, useThemeStore } from "@/lib/stores";
import { useT, useLanguageStore } from "@/lib/i18n";
import type { Category } from "@/lib/types";

function SurveyBanner() {
  const router = useRouter();
  const t = useT();
  const { hasPendingSurvey, isLoading } = useSurveyGate();

  if (isLoading || !hasPendingSurvey) return null;

  return (
    <View className="rounded-2xl p-5 flex-row items-center gap-4 bg-surface-container-lowest border border-outline-variant">
      <View className="flex-1">
        <Text className="text-on-surface font-headline text-title-lg">
          {t("dash.surveyTitle")}
        </Text>
        <Text className="text-on-surface-variant font-body text-body-md mt-1">
          {t("dash.surveyDesc")}
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => router.push("/(app)/survey-onboarding" as never)}
        className="bg-action px-5 py-2.5 rounded-xl"
      >
        <Text className="text-on-action font-headline text-sm">
          {t("dash.startSurvey")}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function getWeekRange() {
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((day + 6) % 7));
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return { monday, sunday };
}

function isDoneStatus(statusId: string, statuses: { statusId: string; name: string }[]) {
  const s = statuses.find((x) => x.statusId === statusId);
  if (!s) return false;
  const n = s.name.toLowerCase();
  return (
    n === "done" ||
    n === "completed" ||
    n === "zakończone" ||
    n === "ukończone" ||
    n === "cancelled" ||
    n === "anulowane"
  );
}

function greetingKey(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "dash.greetingMorning";
  if (hour < 18) return "dash.greetingAfternoon";
  return "dash.greetingEvening";
}

export default function DashboardScreen() {
  const router = useRouter();
  const t = useT();
  const lang = useLanguageStore((s) => s.lang);
  const locale = lang === "pl" ? "pl-PL" : "en-US";
  const { width } = useWindowDimensions();
  const isWide = Platform.OS === "web" && width >= 768;
  const isXl = Platform.OS === "web" && width >= 1280;
  const user = useAuthStore((s) => s.user);
  const { data: tasks, isLoading: tasksLoading, refetch: refetchTasks } = useTasks();
  const { data: events, isLoading: eventsLoading, refetch: refetchEvents } = useEvents();
  const { data: proposals, refetch: refetchProposals } = useAiProposals();
  const { data: categories } = useCategories();
  const { data: statuses } = useTaskStatuses();
  const [refreshing, setRefreshing] = useState(false);

  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);
    const { monday, sunday } = getWeekRange();

    const todayTasks = tasks?.filter((t) => {
      if (!t.dueDateTime) return false;
      const due = new Date(t.dueDateTime);
      return due >= today && due <= endOfDay;
    });

    const upcomingEvents = events?.filter(
      (e) => new Date(e.startDateTime) > new Date(),
    );

    const weekTasks = tasks?.filter((t) => {
      if (!t.dueDateTime) return false;
      const due = new Date(t.dueDateTime);
      return due >= monday && due <= sunday;
    });

    return {
      tasksToday: todayTasks?.length ?? 0,
      upcomingEvents: upcomingEvents?.length ?? 0,
      pendingAi:
        (proposals?.tasks?.length ?? 0) + (proposals?.events?.length ?? 0),
      thisWeek: weekTasks?.length ?? 0,
    };
  }, [tasks, events, proposals]);

  const todoTasks = useMemo(() => {
    const list = (tasks ?? []).filter(
      (t) => !statuses?.length || !isDoneStatus(t.statusId, statuses),
    );
    return list
      .sort((a, b) => {
        const aDue = a.dueDateTime ? new Date(a.dueDateTime).getTime() : Infinity;
        const bDue = b.dueDateTime ? new Date(b.dueDateTime).getTime() : Infinity;
        return aDue - bDue;
      })
      .slice(0, 6);
  }, [tasks, statuses]);

  const scheduleEvents = useMemo(
    () =>
      (events ?? [])
        .filter((e) => new Date(e.startDateTime) > new Date())
        .sort(
          (a, b) =>
            new Date(a.startDateTime).getTime() -
            new Date(b.startDateTime).getTime(),
        )
        .slice(0, 5),
    [events],
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchTasks(), refetchEvents(), refetchProposals()]);
    setRefreshing(false);
  }, [refetchTasks, refetchEvents, refetchProposals]);

  const categoryMap = useMemo(() => {
    const m = new Map<string, Category>();
    categories?.forEach((c) => m.set(c.categoryId, c));
    return m;
  }, [categories]);

  const isLoading = tasksLoading || eventsLoading;
  const isDark = useThemeStore((s) => s.mode) === "dark";
  const iconMuted = isDark ? "#a0a0a5" : "#6b6965";
  const firstName = user?.fullName?.split(" ")[0] ?? (lang === "pl" ? "użytkowniku" : "there");
  const dateLabel = new Date().toLocaleDateString(locale, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <PageLayout showSearch>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ gap: 20, paddingBottom: 32 }}
      >
        <View className="flex-row items-start justify-between">
          <View className="flex-1">
            <Text className="text-on-surface font-headline text-headline-md">
              {t(greetingKey(), { name: firstName })}
            </Text>
            <Text className="text-on-surface-variant font-body text-body-md mt-1">
              {t("dash.summary", {
                tasks: stats.tasksToday,
                events: stats.upcomingEvents,
              })}
            </Text>
          </View>
          <Text className="text-on-surface-variant font-body text-body-md hidden md:flex">
            {dateLabel}
          </Text>
        </View>

        <DashboardQuickActions
          onAddTask={() => router.push("/(app)/tasks?create=1" as never)}
          onAddEvent={() => router.push("/(app)/calendar?create=1" as never)}
          onAddNote={() => router.push("/(app)/notes?create=1" as never)}
        />

        <View className="flex-row flex-wrap gap-3">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <View key={i} className="flex-1 min-w-[120px]">
                <StatCardSkeleton />
              </View>
            ))
          ) : (
            <>
              <View className="flex-1 min-w-[120px]">
                <StatCard label={t("dash.tasksToday")} value={stats.tasksToday} icon="task-alt" />
              </View>
              <View className="flex-1 min-w-[120px]">
                <StatCard label={t("dash.upcomingEvents")} value={stats.upcomingEvents} icon="event" tone="rose" />
              </View>
              <View className="flex-1 min-w-[120px]">
                <StatCard label={t("dash.pendingAi")} value={stats.pendingAi} icon="auto-awesome" tone="amber" />
              </View>
              <View className="flex-1 min-w-[120px]">
                <StatCard label={t("dash.thisWeek")} value={stats.thisWeek} icon="date-range" tone="emerald" />
              </View>
            </>
          )}
        </View>

        <SurveyBanner />

        <View className={isWide ? "flex-row gap-5 items-start" : "gap-5"}>
          <View className="flex-1 gap-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <MaterialIcons name="checklist" size={18} color={iconMuted} />
                <Text className="font-headline text-on-surface text-title-lg">
                  {t("dash.todo")}
                </Text>
              </View>
              <TouchableOpacity onPress={() => router.push("/(app)/tasks" as never)}>
                <Text className="text-on-surface-variant font-headline text-sm">
                  {t("dash.viewAll")}
                </Text>
              </TouchableOpacity>
            </View>

            {!isLoading && todoTasks.length === 0 ? (
              <View className="items-center py-10 gap-3 rounded-2xl bg-surface-container-lowest border border-outline-variant">
                <View className="w-12 h-12 rounded-xl bg-surface-container-low items-center justify-center">
                  <MaterialIcons name="check-circle" size={26} color="#2E7D52" />
                </View>
                <Text className="text-on-surface font-headline text-body-md">
                  {t("dash.allClear")}
                </Text>
                <Text className="text-on-surface-variant font-body text-xs text-center px-6">
                  {t("dash.allClearDesc")}
                </Text>
                <TouchableOpacity
                  onPress={() => router.push("/(app)/ai-task" as never)}
                  className="mt-1 bg-action px-4 py-2 rounded-lg"
                >
                  <Text className="text-on-action font-headline text-xs">
                    {t("dash.planWithAi")}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View className="flex-row flex-wrap gap-3">
                {todoTasks.map((task) => (
                  <View
                    key={task.taskId}
                    style={{
                      width: isXl ? "31.5%" : isWide ? "48%" : "100%",
                    }}
                  >
                    <DashboardTaskCard
                      task={task}
                      category={
                        task.categoryId
                          ? categoryMap.get(task.categoryId)
                          : undefined
                      }
                      onPress={() =>
                        router.push(`/(app)/tasks?taskId=${task.taskId}` as never)
                      }
                    />
                  </View>
                ))}
              </View>
            )}
          </View>

          <View
            className={`bg-surface-container-lowest rounded-2xl border border-outline-variant overflow-hidden ${
              isWide ? "shrink-0" : ""
            }`}
            style={
              isWide
                ? { width: "32%", maxWidth: 400, minWidth: 300 }
                : undefined
            }
          >
            <View className="flex-row items-center justify-between px-5 pt-5 pb-3">
              <View className="flex-row items-center gap-2">
                <MaterialIcons name="event" size={18} color="#dc2c4f" />
                <Text className="font-headline text-on-surface text-title-lg">
                  {t("dash.schedule")}
                </Text>
              </View>
              <TouchableOpacity onPress={() => router.push("/(app)/calendar" as never)}>
                <Text className="text-on-surface-variant font-headline text-sm">
                  {t("dash.calendar")}
                </Text>
              </TouchableOpacity>
            </View>

            <View className="px-5 pb-5">
              {!isLoading && scheduleEvents.length === 0 ? (
                <View className="items-center py-10 gap-2">
                  <View className="w-12 h-12 rounded-xl bg-surface-container-low items-center justify-center">
                    <MaterialIcons name="event-available" size={26} color="#cccccc" />
                  </View>
                  <Text className="text-on-surface-variant font-body text-sm text-center">
                    {t("dash.noUpcomingEvents")}
                  </Text>
                  <TouchableOpacity
                    onPress={() => router.push("/(app)/calendar?create=1" as never)}
                    className="mt-1"
                  >
                    <Text className="text-on-surface-variant font-headline text-xs">
                      {t("dash.addEvent")}
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                scheduleEvents.map((event) => (
                  <DashboardEventItem
                    key={event.eventId}
                    event={event}
                    onPress={() =>
                      router.push(`/(app)/calendar?eventId=${event.eventId}` as never)
                    }
                  />
                ))
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </PageLayout>
  );
}
