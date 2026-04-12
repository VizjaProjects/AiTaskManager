import { useMemo } from "react";
import { View, Text, ScrollView, RefreshControl } from "react-native";
import { useRouter, useLocalSearchParams, Redirect } from "expo-router";
import { TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { PageLayout } from "@/components/organisms/PageLayout";
import { Card } from "@/components/atoms/Card";
import { StatCard } from "@/components/molecules/StatCard";
import { Skeleton } from "@/components/atoms/Skeleton";
import { EmptyState } from "@/components/atoms/EmptyState";
import { useAuthStore } from "@/lib/stores";
import { Role, QuestionType } from "@/lib/types";
import { useSurveys, useSurveyQuestions, useUserResponses } from "@/lib/hooks";
import { questionApi } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

function ResponseBar({
  label,
  count,
  total,
}: {
  label: string;
  count: number;
  total: number;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <View className="mb-3">
      <View className="flex-row items-center justify-between mb-1.5">
        <Text className="text-on-surface font-body text-sm">{label}</Text>
        <Text className="text-on-surface-variant font-label text-xs">
          {count} ({pct}%)
        </Text>
      </View>
      <View className="h-2.5 bg-surface-container-low rounded-full overflow-hidden">
        <View
          className="h-full bg-primary rounded-full"
          style={{ width: `${pct}%` }}
        />
      </View>
    </View>
  );
}

function TextResponseItem({
  answer,
  index,
}: {
  answer: string;
  index: number;
}) {
  return (
    <View className="border-l-4 border-primary/30 pl-4 py-3 mb-3">
      <View className="flex-row items-center gap-2 mb-1">
        <View className="w-7 h-7 rounded-full bg-primary-fixed items-center justify-center">
          <Text className="text-primary font-label text-[10px] font-bold">
            #{index + 1}
          </Text>
        </View>
        <Text className="text-on-surface-variant font-label text-xs">
          Response
        </Text>
      </View>
      <Text className="text-on-surface font-body text-sm leading-relaxed">
        {answer}
      </Text>
    </View>
  );
}

export default function AdminSurveyResponsesPage() {
  const router = useRouter();
  const { surveyId } = useLocalSearchParams<{ surveyId: string }>();
  const user = useAuthStore((s) => s.user);

  const { data: surveys } = useSurveys();
  const survey = surveys?.find((s) => s.surveyId === surveyId);
  const { data: questions, isLoading: questionsLoading } =
    useSurveyQuestions(surveyId);
  const {
    data: allResponses,
    isLoading: responsesLoading,
    refetch,
  } = useUserResponses();

  // Filter responses for this survey
  const surveyResponses = useMemo(
    () => allResponses?.filter((r) => r.surveyId === surveyId) ?? [],
    [allResponses, surveyId],
  );

  // Group responses by questionId
  const responsesByQuestion = useMemo(() => {
    const grouped: Record<string, string[]> = {};
    surveyResponses.forEach((r) => {
      if (!grouped[r.questionId]) grouped[r.questionId] = [];
      grouped[r.questionId].push(r.textAnswer);
    });
    return grouped;
  }, [surveyResponses]);

  // Fetch options for all LIST questions
  const questionIds = questions
    ?.filter((q) => q.questionType === QuestionType.LIST)
    .map((q) => q.questionId);

  const { data: optionsMap } = useQuery({
    queryKey: ["all-question-options", surveyId, questionIds],
    queryFn: async () => {
      if (!questionIds?.length) return {};
      const result: Record<
        string,
        Array<{ questionOptionId: string; optionText: string }>
      > = {};
      for (const qid of questionIds) {
        try {
          const { data } = await questionApi.getOptions(qid);
          result[qid] = data;
        } catch {
          result[qid] = [];
        }
      }
      return result;
    },
    enabled: !!questionIds?.length,
  });

  if (user?.role !== Role.ADMIN) {
    return <Redirect href="/(app)/dashboard" />;
  }

  if (!surveyId) {
    return <Redirect href="/(app)/admin-surveys" />;
  }

  const isLoading = questionsLoading || responsesLoading;
  const uniqueRespondents = new Set(surveyResponses.map((r) => r.surveyId))
    .size;
  const totalResponseEntries = surveyResponses.length;

  return (
    <PageLayout title="Survey Responses">
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={refetch} />
        }
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Back + Header */}
        <View className="flex-row items-center gap-3 mb-2">
          <TouchableOpacity
            onPress={() => router.push("/(app)/admin-surveys" as never)}
            className="p-2 rounded-xl bg-surface-container-low"
          >
            <MaterialIcons name="arrow-back" size={20} color="#464555" />
          </TouchableOpacity>
          <Text className="text-on-surface-variant font-label text-xs uppercase tracking-widest">
            Survey Results
          </Text>
        </View>

        {isLoading ? (
          <View className="gap-4 mt-4">
            <Skeleton width="60%" height={32} />
            <Skeleton width="100%" height={16} />
            <View className="flex-row gap-4 mt-4">
              <View className="flex-1">
                <Skeleton height={100} borderRadius={16} />
              </View>
              <View className="flex-1">
                <Skeleton height={100} borderRadius={16} />
              </View>
            </View>
            <Skeleton height={200} borderRadius={16} className="mt-4" />
          </View>
        ) : !survey ? (
          <EmptyState
            title="Survey not found"
            description="This survey may have been removed."
            primaryAction={{
              label: "Back to Surveys",
              onPress: () => router.push("/(app)/admin-surveys" as never),
            }}
          />
        ) : (
          <>
            {/* Survey Title */}
            <View className="mb-6">
              <Text className="text-on-surface font-headline text-3xl font-black mb-1">
                {survey.title}
              </Text>
              <Text className="text-on-surface-variant font-body text-sm leading-relaxed">
                {survey.description}
              </Text>
            </View>

            {/* Stats */}
            <View className="flex-row gap-4 mb-8">
              <View className="flex-1">
                <StatCard
                  label="Total Responses"
                  value={totalResponseEntries}
                  icon="forum"
                />
              </View>
              <View className="flex-1">
                <StatCard
                  label="Questions"
                  value={questions?.length ?? 0}
                  icon="help-outline"
                  iconColor="#006b58"
                />
              </View>
              <View className="flex-1">
                <StatCard
                  label="Status"
                  value={survey.isVisible ? "Active" : "Draft"}
                  icon={survey.isVisible ? "visibility" : "visibility-off"}
                  iconColor={survey.isVisible ? "#006b58" : "#777587"}
                />
              </View>
            </View>

            {/* Questions & Responses */}
            {!questions || questions.length === 0 ? (
              <EmptyState
                title="No questions"
                description="This survey doesn't have any questions yet."
                primaryAction={{
                  label: "Edit Survey",
                  onPress: () =>
                    router.push(
                      `/(app)/admin-survey-builder?surveyId=${surveyId}` as never,
                    ),
                }}
              />
            ) : (
              <View className="gap-6">
                {questions.map((q, qIdx) => {
                  const answers = responsesByQuestion[q.questionId] ?? [];
                  const options = optionsMap?.[q.questionId];

                  return (
                    <Card key={q.questionId} variant="glass">
                      {/* Question badge */}
                      <View className="flex-row items-center gap-3 mb-4">
                        <View
                          className={`px-3 py-1 rounded-full ${
                            q.questionType === QuestionType.LIST
                              ? "bg-secondary/15"
                              : "bg-primary-fixed/30"
                          }`}
                        >
                          <Text
                            className={`font-label text-[10px] uppercase tracking-widest font-bold ${
                              q.questionType === QuestionType.LIST
                                ? "text-secondary"
                                : "text-primary"
                            }`}
                          >
                            {q.questionType === QuestionType.LIST
                              ? "Multiple Choice"
                              : "Open Text"}
                          </Text>
                        </View>
                      </View>

                      <Text className="text-on-surface font-headline text-lg font-bold mb-4">
                        {q.questionText}
                      </Text>

                      {q.questionType === QuestionType.LIST && options ? (
                        <View>
                          {options.map((opt) => {
                            const count = answers.filter(
                              (a) => a === opt.optionText,
                            ).length;
                            return (
                              <ResponseBar
                                key={opt.questionOptionId}
                                label={opt.optionText}
                                count={count}
                                total={answers.length}
                              />
                            );
                          })}
                        </View>
                      ) : (
                        <View>
                          {answers.length === 0 ? (
                            <Text className="text-on-surface-variant font-body text-sm italic">
                              No responses yet.
                            </Text>
                          ) : (
                            answers.map((a, aIdx) => (
                              <TextResponseItem
                                key={aIdx}
                                answer={a}
                                index={aIdx}
                              />
                            ))
                          )}
                        </View>
                      )}

                      {/* Footer */}
                      <View className="flex-row items-center justify-between mt-4 pt-3 border-t border-outline-variant/10">
                        <Text className="text-on-surface-variant font-label text-xs">
                          {answers.length} response
                          {answers.length !== 1 ? "s" : ""}
                        </Text>
                      </View>
                    </Card>
                  );
                })}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </PageLayout>
  );
}
