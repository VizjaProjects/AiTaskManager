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
import { Role } from "@/lib/types";
import { useSurveys, useSurveyQuestions, useSurveyResponses } from "@/lib/hooks";

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
    data: surveyResponses,
    isLoading: responsesLoading,
    refetch,
  } = useSurveyResponses(surveyId);

  const responses = surveyResponses ?? [];

  // Group responses by questionId
  const responsesByQuestion = useMemo(() => {
    const grouped: Record<string, string[]> = {};
    responses.forEach((r) => {
      if (!grouped[r.questionId]) grouped[r.questionId] = [];
      grouped[r.questionId].push(r.textAnswer);
    });
    return grouped;
  }, [responses]);

  if (user?.role !== Role.ADMIN) {
    return <Redirect href="/(app)/dashboard" />;
  }

  if (!surveyId) {
    return <Redirect href="/(app)/admin-surveys" />;
  }

  const isLoading = questionsLoading || responsesLoading;
  const uniqueRespondents = new Set(responses.map((r) => r.userResponseId)).size;
  const totalResponseEntries = responses.length;

  return (
    <PageLayout>
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
                {questions.map((q) => {
                  const answers = responsesByQuestion[q.questionId] ?? [];

                  return (
                    <Card key={q.questionId} variant="glass">
                      <View className="flex-row items-center gap-3 mb-4">
                        <View className="px-3 py-1 rounded-full bg-primary-fixed/30">
                          <Text className="font-label text-[10px] uppercase tracking-widest font-bold text-primary">
                            Open Text
                          </Text>
                        </View>
                      </View>

                      <Text className="text-on-surface font-headline text-lg font-bold mb-4">
                        {q.questionText}
                      </Text>

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
