import { useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
} from "react-native";
import { useRouter, Redirect } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { cssInterop } from "nativewind";
import { PageLayout } from "@/components/organisms/PageLayout";
import { Card } from "@/components/atoms/Card";
import { Button } from "@/components/atoms/Button";
import { EmptyState } from "@/components/atoms/EmptyState";
import { Skeleton } from "@/components/atoms/Skeleton";
import { StatCard } from "@/components/molecules/StatCard";
import { useAuthStore } from "@/lib/stores";
import { Role } from "@/lib/types";
import {
  useSurveys,
  useSurveyQuestions,
  useChangeSurveyVisibility,
  useDeleteSurvey,
  useUserResponses,
} from "@/lib/hooks";
import type { Survey } from "@/lib/types";

cssInterop(LinearGradient, { className: "style" });

type FilterTab = "all" | "published" | "drafts";

function StatusBadge({ isVisible }: { isVisible: boolean }) {
  return (
    <View
      className={`px-3 py-1 rounded-full ${
        isVisible ? "bg-secondary/15" : "bg-outline/15"
      }`}
    >
      <Text
        className={`font-label text-[10px] uppercase tracking-widest font-bold ${
          isVisible ? "text-secondary" : "text-outline"
        }`}
      >
        {isVisible ? "Published" : "Draft"}
      </Text>
    </View>
  );
}

function SurveyCard({
  survey,
  questionCount,
  responseCount,
  onEdit,
  onViewResults,
  onToggleVisibility,
  onDelete,
}: {
  survey: Survey;
  questionCount: number;
  responseCount: number;
  onEdit: () => void;
  onViewResults: () => void;
  onToggleVisibility: () => void;
  onDelete: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <Card variant="glass" className="relative">
      <View className="flex-row justify-between items-start mb-3">
        <StatusBadge isVisible={survey.isVisible} />
        <TouchableOpacity
          onPress={() => setMenuOpen(!menuOpen)}
          className="p-1"
        >
          <MaterialIcons name="more-vert" size={20} color="#777587" />
        </TouchableOpacity>
      </View>

      {menuOpen && (
        <View className="absolute top-14 right-4 z-50 bg-surface-container-lowest rounded-xl shadow-lg py-2 min-w-[180px]">
          <TouchableOpacity
            className="px-4 py-3 flex-row items-center gap-3"
            onPress={() => {
              setMenuOpen(false);
              onToggleVisibility();
            }}
          >
            <MaterialIcons
              name={survey.isVisible ? "visibility-off" : "visibility"}
              size={18}
              color="#464555"
            />
            <Text className="text-on-surface-variant font-body text-sm">
              {survey.isVisible ? "Unpublish" : "Publish"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="px-4 py-3 flex-row items-center gap-3"
            onPress={() => {
              setMenuOpen(false);
              onEdit();
            }}
          >
            <MaterialIcons name="edit" size={18} color="#464555" />
            <Text className="text-on-surface-variant font-body text-sm">
              Edit
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="px-4 py-3 flex-row items-center gap-3"
            onPress={() => {
              setMenuOpen(false);
              onDelete();
            }}
          >
            <MaterialIcons name="delete" size={18} color="#ba1a1a" />
            <Text className="text-error font-body text-sm">Delete</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text className="text-on-surface font-headline text-lg font-bold mb-1">
        {survey.title}
      </Text>
      <Text
        className="text-on-surface-variant font-body text-sm mb-4 leading-relaxed"
        numberOfLines={2}
      >
        {survey.description}
      </Text>

      <View className="flex-row gap-3 mb-4">
        <View className="flex-1 bg-surface-container-low rounded-xl px-4 py-3">
          <Text className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">
            Responses
          </Text>
          <Text className="text-on-surface font-headline text-xl font-bold">
            {responseCount}
          </Text>
        </View>
        <View className="flex-1 bg-surface-container-low rounded-xl px-4 py-3">
          <Text className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">
            Questions
          </Text>
          <Text className="text-on-surface font-headline text-xl font-bold">
            {questionCount}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center gap-3">
        <TouchableOpacity
          onPress={onEdit}
          className="flex-row items-center gap-1"
        >
          <MaterialIcons name="edit" size={16} color="#4d41df" />
          <Text className="text-primary font-label text-sm font-bold uppercase tracking-wider">
            Edit
          </Text>
        </TouchableOpacity>
        <View className="flex-1" />
        <Button
          variant="primary"
          label="View Results"
          onPress={onViewResults}
        />
      </View>
    </Card>
  );
}

function CreateSurveyCard({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress}>
      <View className="rounded-2xl border-2 border-dashed border-outline-variant/30 p-6 items-center justify-center min-h-[280px]">
        <View className="w-14 h-14 rounded-full bg-primary-fixed/30 items-center justify-center mb-4">
          <MaterialIcons name="add-circle-outline" size={28} color="#4d41df" />
        </View>
        <Text className="text-on-surface font-headline text-lg font-bold mb-1">
          Create New Survey
        </Text>
        <Text className="text-on-surface-variant font-body text-sm text-center">
          Build from scratch or use a template.
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function SurveyCardSkeleton() {
  return (
    <Card variant="glass">
      <View className="flex-row justify-between items-start mb-3">
        <Skeleton width={80} height={24} borderRadius={12} />
        <Skeleton width={24} height={24} borderRadius={4} />
      </View>
      <Skeleton width="80%" height={20} className="mb-2" />
      <Skeleton width="100%" height={14} className="mb-1" />
      <Skeleton width="60%" height={14} className="mb-4" />
      <View className="flex-row gap-3 mb-4">
        <View className="flex-1">
          <Skeleton height={60} borderRadius={12} />
        </View>
        <View className="flex-1">
          <Skeleton height={60} borderRadius={12} />
        </View>
      </View>
      <View className="flex-row justify-between">
        <Skeleton width={60} height={32} borderRadius={8} />
        <Skeleton width={110} height={40} borderRadius={8} />
      </View>
    </Card>
  );
}

export default function AdminSurveysPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { data: surveys, isLoading, refetch } = useSurveys();
  const { data: allResponses } = useUserResponses();
  const toggleVisibility = useChangeSurveyVisibility();
  const deleteSurvey = useDeleteSurvey();
  const [filter, setFilter] = useState<FilterTab>("all");
  const [search, setSearch] = useState("");

  if (user?.role !== Role.ADMIN) {
    return <Redirect href="/(app)/dashboard" />;
  }

  const filtered = useMemo(() => {
    if (!surveys) return [];
    let list = [...surveys];
    if (filter === "published") list = list.filter((s) => s.isVisible);
    if (filter === "drafts") list = list.filter((s) => !s.isVisible);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q),
      );
    }
    return list.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
  }, [surveys, filter, search]);

  const responseCounts = useMemo(() => {
    const map: Record<string, number> = {};
    allResponses?.forEach((r) => {
      map[r.surveyId] = (map[r.surveyId] || 0) + 1;
    });
    return map;
  }, [allResponses]);

  const totalResponses = allResponses?.length ?? 0;
  const activeSurveys = surveys?.filter((s) => s.isVisible).length ?? 0;
  const totalSurveys = surveys?.length ?? 0;

  const tabs: { key: FilterTab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "published", label: "Published" },
    { key: "drafts", label: "Drafts" },
  ];

  return (
    <PageLayout title="Surveys">
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={refetch} />
        }
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Header */}
        <View className="flex-row items-start justify-between mb-8">
          <View>
            <Text className="text-on-surface font-headline text-3xl font-black mb-1">
              Survey Management
            </Text>
            <Text className="text-on-surface-variant font-body text-sm">
              Create and monitor your research campaigns
            </Text>
          </View>
          <Button
            variant="primary"
            label="Create Survey"
            onPress={() => router.push("/(app)/admin-survey-builder" as never)}
          />
        </View>

        {/* Stats Row */}
        <View className="flex-row gap-4 mb-8">
          <View className="flex-1">
            <StatCard
              label="Total Responses"
              value={totalResponses}
              icon="forum"
            />
          </View>
          <View className="flex-1">
            <StatCard
              label="Active Surveys"
              value={activeSurveys}
              icon="poll"
              iconColor="#006b58"
            />
          </View>
          <View className="flex-1">
            <StatCard
              label="Total Surveys"
              value={totalSurveys}
              icon="assignment"
            />
          </View>
        </View>

        {/* Filter + Search Row */}
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-on-surface font-headline text-xl font-bold">
            Recent Surveys
          </Text>
          <View className="flex-row items-center gap-4">
            <View className="flex-row bg-surface-container-low rounded-xl overflow-hidden">
              {tabs.map((t) => (
                <TouchableOpacity
                  key={t.key}
                  onPress={() => setFilter(t.key)}
                  className={`px-4 py-2 ${
                    filter === t.key ? "bg-primary" : ""
                  }`}
                >
                  <Text
                    className={`font-label text-xs uppercase tracking-widest font-bold ${
                      filter === t.key
                        ? "text-white"
                        : "text-on-surface-variant"
                    }`}
                  >
                    {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View className="flex-row items-center bg-surface-container-lowest rounded-xl px-4 py-2 min-w-[240px]">
              <MaterialIcons name="search" size={20} color="#777587" />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search surveys..."
                placeholderTextColor="#777587"
                className="flex-1 ml-2 text-on-surface font-body text-sm outline-none"
              />
            </View>
          </View>
        </View>

        {/* Survey Grid */}
        {isLoading ? (
          <View className="flex-row flex-wrap gap-4">
            {[1, 2, 3].map((i) => (
              <View key={i} className="w-[32%]">
                <SurveyCardSkeleton />
              </View>
            ))}
          </View>
        ) : filtered.length === 0 && !search ? (
          <EmptyState
            title="No surveys yet"
            description="Create your first survey to start collecting feedback."
            primaryAction={{
              label: "Create Survey",
              onPress: () =>
                router.push("/(app)/admin-survey-builder" as never),
            }}
          />
        ) : (
          <View className="flex-row flex-wrap gap-4">
            {filtered.map((survey) => (
              <View key={survey.surveyId} className="w-[32%]">
                <SurveyCardWithQuestions
                  survey={survey}
                  responseCount={responseCounts[survey.surveyId] ?? 0}
                  onEdit={() =>
                    router.push(
                      `/(app)/admin-survey-builder?surveyId=${survey.surveyId}` as never,
                    )
                  }
                  onViewResults={() =>
                    router.push(
                      `/(app)/admin-survey-responses?surveyId=${survey.surveyId}` as never,
                    )
                  }
                  onToggleVisibility={() =>
                    toggleVisibility.mutate({
                      surveyId: survey.surveyId,
                      isVisible: !survey.isVisible,
                    })
                  }
                  onDelete={() => deleteSurvey.mutate(survey.surveyId)}
                />
              </View>
            ))}
            <View className="w-[32%]">
              <CreateSurveyCard
                onPress={() =>
                  router.push("/(app)/admin-survey-builder" as never)
                }
              />
            </View>
          </View>
        )}
      </ScrollView>
    </PageLayout>
  );
}

function SurveyCardWithQuestions({
  survey,
  responseCount,
  onEdit,
  onViewResults,
  onToggleVisibility,
  onDelete,
}: {
  survey: Survey;
  responseCount: number;
  onEdit: () => void;
  onViewResults: () => void;
  onToggleVisibility: () => void;
  onDelete: () => void;
}) {
  const { data: questions } = useSurveyQuestions(survey.surveyId);

  return (
    <SurveyCard
      survey={survey}
      questionCount={questions?.length ?? 0}
      responseCount={responseCount}
      onEdit={onEdit}
      onViewResults={onViewResults}
      onToggleVisibility={onToggleVisibility}
      onDelete={onDelete}
    />
  );
}
