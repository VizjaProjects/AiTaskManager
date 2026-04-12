import { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { PageLayout } from "@/components/organisms/PageLayout";
import { Card } from "@/components/atoms/Card";
import { StatCard } from "@/components/molecules/StatCard";
import { EmptyState } from "@/components/atoms/EmptyState";
import {
  useActiveSurveys,
  useMyResponses,
  useSurveyQuestions,
  useEditResponse,
} from "@/lib/hooks";
import type { UserResponseResultItem } from "@/lib/api/surveys";

/* ─── Completed survey card — expandable answers with inline edit ─── */
function CompletedSurveyCard({
  surveyId,
  title,
  description,
  responses,
  total,
}: {
  surveyId: string;
  title: string;
  description: string;
  responses: UserResponseResultItem[];
  total: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const editResponse = useEditResponse();

  const startEdit = (item: UserResponseResultItem) => {
    setEditingId(item.userResponseId);
    setEditValue(item.textAnswer);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };

  const saveEdit = async (userResponseId: string) => {
    const trimmed = editValue.trim();
    if (!trimmed) return;
    try {
      await editResponse.mutateAsync({ userResponseId, newAnswer: trimmed });
      setEditingId(null);
      setEditValue("");
    } catch {}
  };

  return (
    <Card variant="glass">
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => setExpanded((v) => !v)}
      >
        {/* Header */}
        <View className="flex-row items-start justify-between mb-3">
          <View className="flex-row items-center gap-2.5 flex-1 mr-3">
            <View className="w-10 h-10 rounded-xl items-center justify-center bg-green-500/15">
              <MaterialIcons name="check-circle" size={22} color="#16a34a" />
            </View>
            <View className="flex-1">
              <Text className="text-on-surface font-headline text-base">
                {title}
              </Text>
              {description ? (
                <Text
                  className="text-on-surface-variant font-body text-xs mt-0.5"
                  numberOfLines={2}
                >
                  {description}
                </Text>
              ) : null}
            </View>
          </View>

          <View className="flex-row items-center gap-2">
            <View className="bg-green-500/15 px-2.5 py-1 rounded-full">
              <Text className="text-green-600 font-label text-[10px] font-bold">
                Wypełniona
              </Text>
            </View>
            <MaterialIcons
              name={expanded ? "expand-less" : "expand-more"}
              size={20}
              color="#777587"
            />
          </View>
        </View>

        {/* Progress bar — full green */}
        <View>
          <View className="h-1.5 bg-surface-container-low rounded-full overflow-hidden">
            <View className="h-full bg-green-500 rounded-full w-full" />
          </View>
          <Text className="text-on-surface-variant font-label text-[10px] mt-1.5">
            {total} z {total} pytań · 100%
          </Text>
        </View>
      </TouchableOpacity>

      {/* Expanded answers */}
      {expanded && responses.length > 0 && (
        <View className="mt-4 pt-4 border-t border-outline-variant/15">
          <View className="flex-row items-center gap-2 mb-3">
            <MaterialIcons name="quiz" size={16} color="#4d41df" />
            <Text className="text-on-surface-variant font-label text-[10px] uppercase tracking-widest font-bold">
              Twoje odpowiedzi
            </Text>
          </View>
          <View className="gap-3">
            {responses.map((item, idx) => {
              const isEditing = editingId === item.userResponseId;

              return (
                <View
                  key={item.userResponseId}
                  className="border-l-[3px] border-green-500/30 pl-4 py-2"
                >
                  <View className="flex-row items-center gap-2 mb-1.5">
                    <View className="w-5 h-5 rounded-full bg-green-500/10 items-center justify-center">
                      <Text className="text-green-600 font-label text-[9px] font-bold">
                        {idx + 1}
                      </Text>
                    </View>
                    <Text className="text-on-surface-variant font-label text-[11px] uppercase tracking-wider flex-1">
                      {item.questionText}
                    </Text>
                    {!isEditing && (
                      <TouchableOpacity
                        onPress={() => startEdit(item)}
                        className="p-1"
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <MaterialIcons name="edit" size={15} color="#777587" />
                      </TouchableOpacity>
                    )}
                  </View>

                  {isEditing ? (
                    <View className="ml-7">
                      <TextInput
                        value={editValue}
                        onChangeText={setEditValue}
                        autoFocus
                        multiline
                        className="text-on-surface font-body text-sm bg-surface-container-lowest rounded-lg px-3 py-2 border border-primary/30"
                      />
                      <View className="flex-row items-center gap-2 mt-2">
                        <TouchableOpacity
                          onPress={() => saveEdit(item.userResponseId)}
                          disabled={editResponse.isPending || !editValue.trim()}
                          className="flex-row items-center gap-1 bg-primary/10 px-3 py-1.5 rounded-lg"
                        >
                          <MaterialIcons
                            name="check"
                            size={14}
                            color="#4d41df"
                          />
                          <Text className="text-primary font-label text-[10px] font-bold uppercase">
                            Zapisz
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={cancelEdit}
                          className="flex-row items-center gap-1 px-3 py-1.5 rounded-lg"
                        >
                          <MaterialIcons
                            name="close"
                            size={14}
                            color="#777587"
                          />
                          <Text className="text-on-surface-variant font-label text-[10px] uppercase">
                            Anuluj
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <Text className="text-on-surface font-body text-sm leading-relaxed ml-7">
                      {item.textAnswer}
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
        </View>
      )}
    </Card>
  );
}

/* ─── In-progress survey card — clickable CTA ─── */
function InProgressSurveyCard({
  surveyId,
  title,
  description,
  answered,
  total,
}: {
  surveyId: string;
  title: string;
  description: string;
  answered: number;
  total: number;
}) {
  const router = useRouter();
  const pct = total > 0 ? Math.round((answered / total) * 100) : 0;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() =>
        router.push(
          `/(app)/survey-onboarding?surveyId=${encodeURIComponent(surveyId)}` as never,
        )
      }
    >
      <Card variant="glass">
        {/* Header */}
        <View className="flex-row items-start justify-between mb-3">
          <View className="flex-row items-center gap-2.5 flex-1 mr-3">
            <View className="w-10 h-10 rounded-xl items-center justify-center bg-primary/10">
              <MaterialIcons name="assignment" size={22} color="#4d41df" />
            </View>
            <View className="flex-1">
              <Text className="text-on-surface font-headline text-base">
                {title}
              </Text>
              {description ? (
                <Text
                  className="text-on-surface-variant font-body text-xs mt-0.5"
                  numberOfLines={2}
                >
                  {description}
                </Text>
              ) : null}
            </View>
          </View>

          {total > 0 ? (
            <View className="bg-primary/10 px-2.5 py-1 rounded-full">
              <Text className="text-primary font-label text-[10px] font-bold">
                {total - answered}{" "}
                {total - answered === 1
                  ? "pytanie"
                  : total - answered < 5
                    ? "pytania"
                    : "pytań"}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Progress bar */}
        {total > 0 && (
          <View>
            <View className="h-1.5 bg-surface-container-low rounded-full overflow-hidden">
              <View
                className="h-full bg-primary rounded-full"
                style={{ width: `${pct}%` }}
              />
            </View>
            <Text className="text-on-surface-variant font-label text-[10px] mt-1.5">
              {answered} z {total} pytań · {pct}%
            </Text>
          </View>
        )}

        {/* CTA */}
        <View className="flex-row items-center gap-1.5 mt-3">
          <MaterialIcons name="arrow-forward" size={14} color="#4d41df" />
          <Text className="text-primary font-label text-xs">
            {answered > 0 ? "Kontynuuj ankietę" : "Rozpocznij ankietę"}
          </Text>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

/* ─── Wrapper that resolves question counts per survey ─── */
function SurveyCardWrapper({
  surveyId,
  title,
  description,
  allResponses,
}: {
  surveyId: string;
  title: string;
  description: string;
  allResponses: UserResponseResultItem[];
}) {
  const { data: questions } = useSurveyQuestions(surveyId);

  const { answered, total, surveyResponses } = useMemo(() => {
    if (!questions) return { answered: 0, total: 0, surveyResponses: [] };
    const resp = allResponses.filter((r) => r.surveyId === surveyId);
    const answeredIds = new Set(resp.map((r) => r.questionId));
    const answeredCount = questions.filter((q: any) =>
      answeredIds.has(q.questionId),
    ).length;
    return {
      answered: answeredCount,
      total: questions.length,
      surveyResponses: resp,
    };
  }, [questions, allResponses, surveyId]);

  const isComplete = total > 0 && answered >= total;

  if (isComplete) {
    return (
      <CompletedSurveyCard
        surveyId={surveyId}
        title={title}
        description={description}
        responses={surveyResponses}
        total={total}
      />
    );
  }

  return (
    <InProgressSurveyCard
      surveyId={surveyId}
      title={title}
      description={description}
      answered={answered}
      total={total}
    />
  );
}

/* ─── Main screen ─── */
export default function SurveysScreen() {
  const {
    data: surveys,
    isLoading,
    refetch: refetchSurveys,
  } = useActiveSurveys();
  const {
    data: myResponses,
    isLoading: responsesLoading,
    refetch: refetchResponses,
  } = useMyResponses();

  const onRefresh = useCallback(() => {
    refetchSurveys();
    refetchResponses();
  }, [refetchSurveys, refetchResponses]);

  const allResponses = myResponses ?? [];

  const { completedSurveys, incompleteSurveys, completedCount } =
    useMemo(() => {
      if (!surveys)
        return {
          completedSurveys: [],
          incompleteSurveys: [],
          completedCount: 0,
        };
      const respondedSurveyIds = new Set(allResponses.map((r) => r.surveyId));
      // We can't know exact completion without question counts, so we split by
      // "has any response" vs "no response" — the card components resolve fully.
      // For stat counter we use the same heuristic; cards handle the real logic.
      const comp = surveys.filter((s) => respondedSurveyIds.has(s.surveyId));
      const inc = surveys.filter((s) => !respondedSurveyIds.has(s.surveyId));
      return {
        completedSurveys: comp,
        incompleteSurveys: inc,
        completedCount: comp.length,
      };
    }, [surveys, allResponses]);

  const loading = isLoading || responsesLoading;

  if (loading) {
    return (
      <PageLayout title="Ankiety">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#4d41df" />
        </View>
      </PageLayout>
    );
  }

  if (!surveys || surveys.length === 0) {
    return (
      <PageLayout title="Ankiety">
        <EmptyState
          icon="assignment"
          title="Brak aktywnych ankiet"
          description="Nie ma jeszcze żadnych ankiet do wypełnienia."
        />
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Ankiety">
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={onRefresh} />
        }
      >
        {/* Stats */}
        <View className="flex-row gap-4 mb-6">
          <View className="flex-1">
            <StatCard
              label="Dostępne"
              value={surveys.length}
              icon="assignment"
              iconColor="#4d41df"
            />
          </View>
          <View className="flex-1">
            <StatCard
              label="Ukończone"
              value={completedCount}
              icon="check-circle"
              iconColor="#16a34a"
            />
          </View>
          <View className="flex-1">
            <StatCard
              label="Odpowiedzi"
              value={allResponses.length}
              icon="question-answer"
              iconColor="#f59e0b"
            />
          </View>
        </View>

        {/* Incomplete surveys — action needed */}
        {incompleteSurveys.length > 0 && (
          <View className="mb-6">
            <View className="flex-row items-center gap-2 mb-3">
              <MaterialIcons name="pending-actions" size={18} color="#4d41df" />
              <Text className="text-on-surface font-headline text-sm font-bold uppercase tracking-wider">
                Do wypełnienia
              </Text>
            </View>
            <View className="gap-4">
              {incompleteSurveys.map((s) => (
                <SurveyCardWrapper
                  key={s.surveyId}
                  surveyId={s.surveyId}
                  title={s.title}
                  description={s.description}
                  allResponses={allResponses}
                />
              ))}
            </View>
          </View>
        )}

        {/* Completed surveys — with responses */}
        {completedSurveys.length > 0 && (
          <View className="mb-6">
            <View className="flex-row items-center gap-2 mb-3">
              <MaterialIcons
                name="assignment-turned-in"
                size={18}
                color="#16a34a"
              />
              <Text className="text-on-surface font-headline text-sm font-bold uppercase tracking-wider">
                Wypełnione
              </Text>
            </View>
            <View className="gap-4">
              {completedSurveys.map((s) => (
                <SurveyCardWrapper
                  key={s.surveyId}
                  surveyId={s.surveyId}
                  title={s.title}
                  description={s.description}
                  allResponses={allResponses}
                />
              ))}
            </View>
          </View>
        )}

        <View className="h-8" />
      </ScrollView>
    </PageLayout>
  );
}
