import { useMemo, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { PageLayout } from "@/components/organisms/PageLayout";
import { Card } from "@/components/atoms/Card";
import { StatCard } from "@/components/molecules/StatCard";
import { EmptyState } from "@/components/atoms/EmptyState";
import { useMyResponses, useActiveSurveys } from "@/lib/hooks";
import type { UserResponseResultItem } from "@/lib/api/surveys";

export default function MyResponsesScreen() {
  const { data: responses, isLoading, refetch } = useMyResponses();
  const { data: surveys } = useActiveSurveys();

  const grouped = useMemo(() => {
    if (!responses)
      return [] as Array<{
        surveyId: string;
        description: string;
        items: UserResponseResultItem[];
      }>;
    const map = new Map<
      string,
      { description: string; items: UserResponseResultItem[] }
    >();
    for (const r of responses) {
      if (!map.has(r.surveyId)) {
        map.set(r.surveyId, { description: r.surveyDescription, items: [] });
      }
      map.get(r.surveyId)!.items.push(r);
    }
    return Array.from(map.entries()).map(([surveyId, data]) => ({
      surveyId,
      ...data,
    }));
  }, [responses]);

  const surveyCount = grouped.length;
  const answerCount = responses?.length ?? 0;

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  if (isLoading) {
    return (
      <PageLayout title="Moje odpowiedzi">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#4d41df" />
        </View>
      </PageLayout>
    );
  }

  if (!responses || responses.length === 0) {
    return (
      <PageLayout title="Moje odpowiedzi">
        <EmptyState
          icon="quiz"
          title="Brak odpowiedzi"
          description="Nie wypełniłeś jeszcze żadnej ankiety."
        />
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Moje odpowiedzi">
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={onRefresh} />
        }
      >
        {/* Stats header */}
        <View className="flex-row gap-4 mb-6">
          <View className="flex-1">
            <StatCard
              label="Ankiety"
              value={surveyCount}
              icon="assignment-turned-in"
              iconColor="#4d41df"
            />
          </View>
          <View className="flex-1">
            <StatCard
              label="Odpowiedzi"
              value={answerCount}
              icon="question-answer"
              iconColor="#16a34a"
            />
          </View>
        </View>

        {/* Survey cards — all expanded */}
        <View className="gap-5">
          {grouped.map(({ surveyId, description, items }) => {
            const survey = surveys?.find((s) => s.surveyId === surveyId);
            const title = survey?.title ?? "Ankieta";

            return (
              <Card key={surveyId} variant="glass">
                {/* Survey header */}
                <View className="flex-row items-start justify-between mb-4">
                  <View className="flex-1 mr-3">
                    <View className="flex-row items-center gap-2 mb-1">
                      <MaterialIcons
                        name="description"
                        size={18}
                        color="#4d41df"
                      />
                      <Text className="text-on-surface font-headline text-base">
                        {title}
                      </Text>
                    </View>
                    {description ? (
                      <Text className="text-on-surface-variant font-body text-xs ml-[26px]">
                        {description}
                      </Text>
                    ) : null}
                  </View>
                  <View className="bg-primary/10 px-2.5 py-1 rounded-full">
                    <Text className="text-primary font-label text-[10px] font-bold">
                      {items.length}{" "}
                      {items.length === 1 ? "odpowiedź" : "odpowiedzi"}
                    </Text>
                  </View>
                </View>

                {/* Progress bar */}
                <View className="mb-4">
                  <View className="h-1.5 bg-surface-container-low rounded-full overflow-hidden">
                    <View
                      className="h-full bg-primary rounded-full"
                      style={{ width: "100%" }}
                    />
                  </View>
                  <Text className="text-on-surface-variant font-label text-[10px] mt-1.5">
                    Wypełniono {items.length} z {items.length} pytań
                  </Text>
                </View>

                {/* Answers */}
                <View className="gap-3">
                  {items.map((item, idx) => (
                    <View
                      key={item.userResponseId}
                      className="border-l-[3px] border-primary/30 pl-4 py-2"
                    >
                      <View className="flex-row items-center gap-2 mb-1.5">
                        <View className="w-5 h-5 rounded-full bg-primary/10 items-center justify-center">
                          <Text className="text-primary font-label text-[9px] font-bold">
                            {idx + 1}
                          </Text>
                        </View>
                        <Text className="text-on-surface-variant font-label text-[11px] uppercase tracking-wider flex-1">
                          {item.questionText}
                        </Text>
                      </View>
                      <Text className="text-on-surface font-body text-sm leading-relaxed ml-7">
                        {item.textAnswer}
                      </Text>
                    </View>
                  ))}
                </View>
              </Card>
            );
          })}
        </View>

        {/* Bottom spacer */}
        <View className="h-8" />
      </ScrollView>
    </PageLayout>
  );
}
