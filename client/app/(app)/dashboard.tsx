import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { useState, useMemo, useCallback } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { cssInterop } from "nativewind";
import { PageLayout } from "@/components/organisms";
import { StatCard, TaskCard, EventCard } from "@/components/molecules";
import { StatCardSkeleton, TaskCardSkeleton } from "@/components/atoms";
import {
  useTasks,
  useEvents,
  useAiProposals,
  useCategories,
  useActiveSurveys,
  useMyResponses,
} from "@/lib/hooks";
import type { Category } from "@/lib/types";

cssInterop(LinearGradient, { className: "style" });

function SurveyBanner() {
  const router = useRouter();
  const { data: surveys } = useActiveSurveys();
  const { data: myResponses } = useMyResponses();

  const pendingCount = useMemo(() => {
    if (!surveys || !myResponses) return 0;
    const answeredIds = new Set(
      (myResponses as any[]).map((r: any) => r.questionId),
    );
    // Count unanswered across ALL active surveys (approximate — questions loaded separately)
    // For the banner we simply count surveys that have at least one response missing
    return surveys.length;
  }, [surveys, myResponses]);

  const incompleteSurveys = useMemo(() => {
    if (!surveys) return 0;
    const answeredSurveyIds = new Set(
      (myResponses ?? ([] as any[])).map((r: any) => r.surveyId),
    );
    // A survey is "incomplete" if user has NO responses for it at all,
    // or we can't tell without question data — count surveys user hasn't fully answered
    return surveys.filter((s) => !answeredSurveyIds.has(s.surveyId)).length;
  }, [surveys, myResponses]);

  if (!surveys || surveys.length === 0 || incompleteSurveys === 0) return null;

  return (
    <TouchableOpacity
      onPress={() => router.push("/(app)/surveys" as never)}
      activeOpacity={0.85}
    >
      <LinearGradient
        colors={["#4d41df", "#6c63ff"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className="rounded-2xl p-5 flex-row items-center gap-4"
      >
        <View className="w-11 h-11 rounded-xl bg-white/20 items-center justify-center">
          <MaterialIcons name="assignment" size={24} color="#fff" />
        </View>
        <View className="flex-1">
          <Text className="text-white font-headline text-base">
            Masz ankiety do wypełnienia
          </Text>
          <Text className="text-white/70 font-body text-sm mt-1">
            {incompleteSurveys}{" "}
            {incompleteSurveys === 1
              ? "ankieta czeka"
              : incompleteSurveys < 5
                ? "ankiety czekają"
                : "ankiet czeka"}{" "}
            na Twoje odpowiedzi
          </Text>
        </View>
        <MaterialIcons name="arrow-forward" size={22} color="#fff" />
      </LinearGradient>
    </TouchableOpacity>
  );
}

export default function DashboardScreen() {
  const router = useRouter();
  const {
    data: tasks,
    isLoading: tasksLoading,
    refetch: refetchTasks,
  } = useTasks();
  const {
    data: events,
    isLoading: eventsLoading,
    refetch: refetchEvents,
  } = useEvents();
  const { data: proposals, refetch: refetchProposals } = useAiProposals();
  const { data: categories } = useCategories();
  const [refreshing, setRefreshing] = useState(false);

  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const todayTasks = tasks?.filter((t) => {
      if (!t.dueDateTime) return false;
      const due = new Date(t.dueDateTime);
      return due >= today && due <= endOfDay;
    });

    const upcomingEvents = events?.filter(
      (e) => new Date(e.startDateTime) > new Date(),
    );
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    return {
      tasksToday: todayTasks?.length ?? 0,
      upcomingEvents: upcomingEvents?.length ?? 0,
      pendingAi:
        (proposals?.tasks?.length ?? 0) + (proposals?.events?.length ?? 0),
      completedWeek: tasks?.filter(() => false).length ?? 0,
    };
  }, [tasks, events, proposals]);

  const recentTasks = useMemo(() => (tasks ?? []).slice(0, 5), [tasks]);

  const upcomingEventsList = useMemo(
    () =>
      (events ?? [])
        .filter((e) => new Date(e.startDateTime) > new Date())
        .sort(
          (a, b) =>
            new Date(a.startDateTime).getTime() -
            new Date(b.startDateTime).getTime(),
        )
        .slice(0, 4),
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

  return (
    <PageLayout title="Dashboard">
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ gap: 24, paddingBottom: 32 }}
      >
        <SurveyBanner />

        <View className="flex-row flex-wrap gap-4">
          {isLoading ? (
            <>
              <View className="flex-1 min-w-[140px]">
                <StatCardSkeleton />
              </View>
              <View className="flex-1 min-w-[140px]">
                <StatCardSkeleton />
              </View>
              <View className="flex-1 min-w-[140px]">
                <StatCardSkeleton />
              </View>
              <View className="flex-1 min-w-[140px]">
                <StatCardSkeleton />
              </View>
            </>
          ) : (
            <>
              <View className="flex-1 min-w-[140px]">
                <StatCard
                  label="Tasks Today"
                  value={String(stats.tasksToday).padStart(2, "0")}
                  icon="task-alt"
                />
              </View>
              <View className="flex-1 min-w-[140px]">
                <StatCard
                  label="Upcoming Events"
                  value={String(stats.upcomingEvents).padStart(2, "0")}
                  icon="event"
                  iconColor="#006b58"
                />
              </View>
              <View className="flex-1 min-w-[140px]">
                <StatCard
                  label="Pending AI"
                  value={String(stats.pendingAi).padStart(2, "0")}
                  icon="auto-awesome"
                  variant="primary"
                />
              </View>
              <View className="flex-1 min-w-[140px]">
                <StatCard
                  label="This Week"
                  value={String(stats.completedWeek).padStart(2, "0")}
                  icon="check-circle"
                  iconColor="#10B981"
                />
              </View>
            </>
          )}
        </View>

        {upcomingEventsList.length > 0 && (
          <View className="gap-3">
            {upcomingEventsList.map((event) => (
              <EventCard key={event.eventId} event={event} />
            ))}
          </View>
        )}

        <View className="gap-3">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <TaskCardSkeleton key={i} />
              ))
            : recentTasks.map((task) => (
                <TaskCard
                  key={task.taskId}
                  task={task}
                  category={
                    task.categoryId
                      ? (categoryMap.get(task.categoryId) ?? undefined)
                      : undefined
                  }
                  onPress={() =>
                    router.push(`/(app)/tasks?taskId=${task.taskId}` as never)
                  }
                />
              ))}
        </View>
      </ScrollView>
    </PageLayout>
  );
}
