import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  useWindowDimensions,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useMemo, useCallback, useLayoutEffect, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { OrdovitaLogo } from "@/components/atoms/OrdovitaLogo";
import { Button } from "@/components/atoms/Button";
import {
  useActiveSurveys,
  useSurveyQuestions,
  useMyResponses,
  useSubmitResponse,
  useEditResponse,
  useSurveyGate,
} from "@/lib/hooks";
import { useAuthStore } from "@/lib/stores";
import { Role } from "@/lib/types";
import { normalizeSurveyId } from "@/lib/surveys/utils";

const NO_OUTLINE =
  Platform.OS === "web" ? ({ outlineStyle: "none" } as const) : undefined;

interface LoadedQuestion {
  questionId: string;
  questionText: string;
  isRequired: boolean;
  surveyId: string;
  hint: string | null;
}

function ProgressSidebar({
  currentStep,
  questions,
  answers,
  savedQuestionIds,
  onSelectStep,
}: {
  currentStep: number;
  questions: LoadedQuestion[];
  answers: Record<string, string>;
  savedQuestionIds: Set<string>;
  onSelectStep: (idx: number) => void;
}) {
  const stepLabels = questions.map((q, idx) => {
    const fallback = `Question ${idx + 1}`;
    const text = q.questionText?.trim() || fallback;
    return text.length > 28 ? `${text.slice(0, 28)}…` : text;
  });

  return (
    <View className="w-72 shrink-0 rounded-2xl bg-surface-container-low border border-outline-variant p-5 gap-4">
      <Text className="text-on-surface-variant font-label text-[10px] uppercase tracking-widest">
        Your progress
      </Text>

      {stepLabels.map((label, idx) => {
        const qId = normalizeSurveyId(questions[idx].questionId);
        const hasAnswer =
          savedQuestionIds.has(qId) ||
          (answers[questions[idx].questionId]?.trim().length ?? 0) > 0;
        const isCurrent = idx === currentStep;
        const isCompleted = hasAnswer && !isCurrent;

        return (
          <TouchableOpacity
            key={questions[idx].questionId}
            onPress={() => onSelectStep(idx)}
            className="flex-row items-center gap-3"
            activeOpacity={0.7}
          >
            {isCompleted ? (
              <View className="w-7 h-7 rounded-full bg-action items-center justify-center">
                <MaterialIcons name="check" size={14} color="#f0f0f0" />
              </View>
            ) : (
              <View
                className={`w-7 h-7 rounded-full items-center justify-center ${
                  isCurrent ? "bg-action" : "bg-surface-container-high"
                }`}
              >
                <Text
                  className={`text-xs font-headline ${
                    isCurrent ? "text-on-action" : "text-on-surface-variant"
                  }`}
                >
                  {idx + 1}
                </Text>
              </View>
            )}
            <Text
              className={`text-sm flex-1 ${
                isCurrent
                  ? "font-headline text-on-surface"
                  : "font-body text-on-surface-variant"
              }`}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}

      <View className="flex-row items-start gap-2 pt-4 border-t border-outline-variant">
        <MaterialIcons name="verified-user" size={16} color="#9b9791" />
        <Text className="text-xs text-on-surface-variant flex-1 leading-4">
          Your answers are encrypted and used only to personalize your workspace.
        </Text>
      </View>
    </View>
  );
}

function LoadingView({ message }: { message: string }) {
  return (
    <View className="flex-1 items-center justify-center bg-background px-6">
      <ActivityIndicator size="large" color="#111111" />
      <Text className="mt-4 font-body text-base text-center text-on-surface-variant">
        {message}
      </Text>
    </View>
  );
}

function ErrorView({
  message,
  onContinue,
}: {
  message: string;
  onContinue: () => void;
}) {
  return (
    <View className="flex-1 items-center justify-center bg-background px-6">
      <MaterialIcons name="error-outline" size={48} color="#C0392B" />
      <Text className="text-on-surface font-headline text-lg mt-4 text-center">
        {message}
      </Text>
      <View className="mt-6">
        <Button label="Go to app" onPress={onContinue} />
      </View>
    </View>
  );
}

export default function SurveyOnboardingScreen() {
  const router = useRouter();
  const { surveyId: paramSurveyId } = useLocalSearchParams<{
    surveyId?: string;
  }>();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && width >= 1024;
  const user = useAuthStore((s) => s.user);

  const {
    hasPendingSurvey,
    firstPendingSurveyId,
    isLoading: gateLoading,
  } = useSurveyGate();

  const {
    data: surveys,
    isLoading: surveysLoading,
    isError: surveysError,
  } = useActiveSurveys();
  const {
    data: myResponses,
    isLoading: responsesLoading,
    isError: responsesError,
  } = useMyResponses();
  const qc = useQueryClient();
  const submitResponse = useSubmitResponse();
  const editResponse = useEditResponse();

  const targetSurveyId =
    paramSurveyId ?? firstPendingSurveyId ?? surveys?.[0]?.surveyId;

  const survey = useMemo(() => {
    if (!surveys?.length || !targetSurveyId) return undefined;
    return (
      surveys.find(
        (s) => normalizeSurveyId(s.surveyId) === normalizeSurveyId(targetSurveyId),
      ) ?? surveys[0]
    );
  }, [surveys, targetSurveyId]);

  const {
    data: rawQuestions,
    isLoading: questionsLoading,
    isError: questionsError,
  } = useSurveyQuestions(survey?.surveyId);

  const questions: LoadedQuestion[] = useMemo(() => {
    if (!rawQuestions || !survey) return [];
    return rawQuestions.map((q) => ({
      questionId: q.questionId,
      questionText: q.questionText,
      isRequired: q.isRequired ?? false,
      surveyId: survey.surveyId,
      hint: q.hint ?? "",
    }));
  }, [rawQuestions, survey]);

  const responseByQuestionId = useMemo(() => {
    const map = new Map<
      string,
      { userResponseId: string; textAnswer: string }
    >();
    if (!survey) return map;
    const surveyKey = normalizeSurveyId(survey.surveyId);
    for (const r of myResponses ?? []) {
      if (normalizeSurveyId(r.surveyId) === surveyKey) {
        map.set(normalizeSurveyId(r.questionId), {
          userResponseId: r.userResponseId,
          textAnswer: r.textAnswer,
        });
      }
    }
    return map;
  }, [myResponses, survey]);

  const savedQuestionIds = useMemo(
    () => new Set(responseByQuestionId.keys()),
    [responseByQuestionId],
  );

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const stepInitialized = useRef(false);

  const goToApp = useCallback(() => {
    router.replace("/(app)/dashboard" as never);
  }, [router]);

  useEffect(() => {
    if (!questions.length || stepInitialized.current) return;
    const initial: Record<string, string> = {};
    for (const q of questions) {
      const saved = responseByQuestionId.get(normalizeSurveyId(q.questionId));
      if (saved) initial[q.questionId] = saved.textAnswer;
    }
    const firstUnansweredIdx = questions.findIndex(
      (q) => !responseByQuestionId.has(normalizeSurveyId(q.questionId)),
    );
    const startStep = firstUnansweredIdx >= 0 ? firstUnansweredIdx : 0;
    setAnswers((prev) => ({ ...initial, ...prev }));
    setCurrentStep(startStep);
    stepInitialized.current = true;
  }, [questions, responseByQuestionId]);

  useLayoutEffect(() => {
    if (user?.role === Role.ADMIN) {
      goToApp();
      return;
    }
    if (gateLoading || surveysLoading || responsesLoading || questionsLoading) {
      return;
    }
    if (!hasPendingSurvey) {
      goToApp();
      return;
    }
    if (surveys && surveys.length === 0) {
      goToApp();
      return;
    }
    if (rawQuestions && rawQuestions.length === 0) {
      goToApp();
    }
  }, [
    user?.role,
    gateLoading,
    hasPendingSurvey,
    surveys,
    surveysLoading,
    responsesLoading,
    questionsLoading,
    rawQuestions,
    goToApp,
  ]);

  const isInitialLoading =
    gateLoading ||
    (surveysLoading && surveys === undefined) ||
    (responsesLoading && myResponses === undefined) ||
    (questionsLoading && rawQuestions === undefined);

  const totalSteps = questions.length;
  const safeStep =
    totalSteps > 0 ? Math.min(currentStep, totalSteps - 1) : 0;
  const currentQuestion = questions[safeStep];

  const currentAnswer = currentQuestion
    ? (answers[currentQuestion.questionId] ??
      responseByQuestionId.get(normalizeSurveyId(currentQuestion.questionId))
        ?.textAnswer ??
      "")
    : "";

  const canProceed =
    currentQuestion &&
    (currentQuestion.isRequired ? currentAnswer.trim().length > 0 : true);

  const progressPct =
    totalSteps > 0 ? ((safeStep + 1) / totalSteps) * 100 : 0;

  const saveCurrentAnswer = useCallback(async () => {
    if (!currentQuestion || !survey) return false;
    const answer = currentAnswer.trim();
    const qKey = normalizeSurveyId(currentQuestion.questionId);

    await qc.refetchQueries({ queryKey: ["my-responses"] });
    const refreshed = qc.getQueryData<
      Array<{
        surveyId: string;
        questionId: string;
        userResponseId: string;
      }>
    >(["my-responses"]);
    const saved = refreshed?.find(
      (r) =>
        normalizeSurveyId(r.questionId) === qKey &&
        normalizeSurveyId(r.surveyId) === normalizeSurveyId(survey.surveyId) &&
        !!r.userResponseId,
    );

    try {
      if (saved?.userResponseId) {
        await editResponse.mutateAsync({
          userResponseId: saved.userResponseId,
          newAnswer: answer,
        });
      } else {
        await submitResponse.mutateAsync({
          surveyId: survey.surveyId,
          questionId: currentQuestion.questionId,
          questionText: currentQuestion.questionText,
          answer,
        });
      }
      setAnswers((prev) => ({
        ...prev,
        [currentQuestion.questionId]: answer,
      }));
      return true;
    } catch (e: unknown) {
      const status = (e as { response?: { status?: number } })?.response?.status;
      if (status === 409) {
        await qc.refetchQueries({ queryKey: ["my-responses"] });
        const again = qc.getQueryData<
          Array<{
            surveyId: string;
            questionId: string;
            userResponseId: string;
          }>
        >(["my-responses"]);
        const existing = again?.find(
          (r) =>
            normalizeSurveyId(r.questionId) === qKey &&
            normalizeSurveyId(r.surveyId) ===
              normalizeSurveyId(survey.surveyId) &&
            !!r.userResponseId,
        );
        if (existing?.userResponseId) {
          await editResponse.mutateAsync({
            userResponseId: existing.userResponseId,
            newAnswer: answer,
          });
        }
        setAnswers((prev) => ({
          ...prev,
          [currentQuestion.questionId]: answer,
        }));
        return true;
      }
      return false;
    }
  }, [
    currentQuestion,
    survey,
    currentAnswer,
    submitResponse,
    editResponse,
    qc,
  ]);

  const handleNext = useCallback(async () => {
    if (!currentQuestion || !survey) return;
    setSubmitting(true);
    const ok = await saveCurrentAnswer();
    setSubmitting(false);
    if (!ok) return;

    if (safeStep < totalSteps - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      goToApp();
    }
  }, [
    currentQuestion,
    survey,
    saveCurrentAnswer,
    safeStep,
    totalSteps,
    goToApp,
  ]);

  const handleBack = useCallback(() => {
    if (safeStep > 0) setCurrentStep((s) => s - 1);
  }, [safeStep]);

  const handleSelectStep = useCallback((idx: number) => {
    setCurrentStep(idx);
  }, []);

  if (user?.role === Role.ADMIN || (!gateLoading && !hasPendingSurvey)) {
    return <LoadingView message="Redirecting to app…" />;
  }

  if (isInitialLoading) {
    return <LoadingView message="Loading survey…" />;
  }

  if (surveysError || responsesError) {
    return (
      <ErrorView
        message="Could not connect to the server. Check that the backend is running."
        onContinue={goToApp}
      />
    );
  }

  if (!surveys?.length) {
    return <LoadingView message="No surveys — redirecting…" />;
  }

  if (questionsError) {
    return (
      <ErrorView
        message="Could not load survey questions."
        onContinue={goToApp}
      />
    );
  }

  if (!questions.length) {
    return <LoadingView message="No questions — redirecting…" />;
  }

  if (!currentQuestion) {
    return <LoadingView message="Redirecting to app…" />;
  }

  const sectionLabel =
    survey?.title?.trim() || `Question ${safeStep + 1}`;

  const questionContent = (
    <View className="flex-1">
      <View className="self-start px-3 py-1 rounded-lg bg-surface-container-low border border-outline-variant mb-5">
        <Text className="text-on-surface-variant font-label text-[10px] uppercase tracking-widest">
          {sectionLabel}
        </Text>
      </View>

      <Text className="text-3xl font-headline text-on-surface mb-4 leading-9">
        {currentQuestion.questionText}
      </Text>

      {currentQuestion.hint ? (
        <View className="flex-row items-start gap-2 mb-6">
          <MaterialIcons name="lightbulb-outline" size={18} color="#9b9791" />
          <Text className="text-on-surface-variant text-sm flex-1 leading-5">
            {currentQuestion.hint}
          </Text>
        </View>
      ) : null}

      <TextInput
        className="rounded-xl p-4 min-h-[140px] text-base font-body text-on-surface border border-outline-variant bg-surface-container-lowest"
        placeholder="Type your answer..."
        placeholderTextColor="#9b9791"
        multiline
        textAlignVertical="top"
        value={currentAnswer}
        style={NO_OUTLINE}
        onChangeText={(text) =>
          setAnswers((a) => ({
            ...a,
            [currentQuestion.questionId]: text,
          }))
        }
      />
    </View>
  );

  const navigationButtons = (
    <View className="flex-row items-center justify-between pt-8 mt-4 border-t border-outline-variant">
      {safeStep > 0 ? (
        <TouchableOpacity
          onPress={handleBack}
          className="flex-row items-center gap-2 px-4 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest"
        >
          <MaterialIcons name="arrow-back" size={18} color="#9b9791" />
          <Text className="text-on-surface-variant font-headline text-sm">
            Back
          </Text>
        </TouchableOpacity>
      ) : (
        <View />
      )}

      <Button
        label={safeStep === totalSteps - 1 ? "Finish" : "Next"}
        loading={submitting}
        disabled={!canProceed}
        onPress={handleNext}
      />
    </View>
  );

  const header = (
    <View className="border-b border-outline-variant bg-background">
      <View className="flex-row items-center justify-between px-6 py-4">
        <OrdovitaLogo size="sm" showTagline={false} />
        <Text className="text-on-surface-variant font-body text-sm">
          {safeStep + 1} / {totalSteps}
        </Text>
      </View>
      <View className="h-1 bg-surface-container-low mx-6 rounded-full overflow-hidden">
        <View
          className="h-full bg-action rounded-full"
          style={{ width: `${progressPct}%` }}
        />
      </View>
      <View className="h-4" />
    </View>
  );

  if (isDesktop) {
    return (
      <View className="flex-1 bg-background">
        {header}
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 48,
            paddingVertical: 40,
          }}
        >
          <View className="flex-row gap-10 max-w-[1100px] mx-auto w-full">
            <View className="flex-1 min-w-0">
              {questionContent}
              {navigationButtons}
            </View>
            <ProgressSidebar
              currentStep={safeStep}
              questions={questions}
              answers={answers}
              savedQuestionIds={savedQuestionIds}
              onSelectStep={handleSelectStep}
            />
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      {header}
      <ScrollView
        className="flex-1 px-5 py-6"
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {questionContent}
        {navigationButtons}
      </ScrollView>
    </SafeAreaView>
  );
}
