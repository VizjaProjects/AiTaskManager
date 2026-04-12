import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  useWindowDimensions,
  ActivityIndicator,
  Image,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useMemo, useCallback, useEffect } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { cssInterop } from "nativewind";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  useActiveSurveys,
  useSurveyQuestions,
  useQuestionOptions,
  useMyResponses,
  useSubmitResponse,
} from "@/lib/hooks";
import { useThemeStore, useAuthStore } from "@/lib/stores";
import { Role } from "@/lib/types";

cssInterop(LinearGradient, { className: "style" });

interface LoadedQuestion {
  questionId: string;
  questionText: string;
  questionType: "TEXT" | "LIST";
  isRequired: boolean;
  surveyId: string;
  hint: string | null;
}

/* ─── Option Chips for LIST questions ─── */
function OptionChips({
  questionId,
  selected,
  onToggle,
}: {
  questionId: string;
  selected: string[];
  onToggle: (option: string) => void;
}) {
  const { data: options, isLoading } = useQuestionOptions(questionId);
  const mode = useThemeStore((s) => s.mode);

  if (isLoading) {
    return (
      <View className="flex-row flex-wrap gap-3 mt-4">
        {[1, 2, 3, 4].map((i) => (
          <View
            key={i}
            className="h-11 w-32 rounded-full bg-surface-variant/50 animate-pulse"
          />
        ))}
      </View>
    );
  }

  const CHIP_ICONS: Record<string, string> = {
    "Praca zawodowa": "work",
    "Zdrowie i Sport": "fitness-center",
    Edukacja: "school",
    Hobby: "extension",
    "Dom i Rodzina": "home",
    Finanse: "account-balance-wallet",
    "Rozwój osobisty": "favorite",
  };

  return (
    <View className="flex-row flex-wrap gap-3 mt-4">
      {(options ?? []).map((opt) => {
        const isSelected = selected.includes(opt.optionText);
        const iconName = CHIP_ICONS[opt.optionText] ?? "label";
        return (
          <TouchableOpacity
            key={opt.questionOptionId}
            onPress={() => onToggle(opt.optionText)}
            className={`flex-row items-center gap-2 px-5 py-3 rounded-full border ${
              isSelected
                ? "bg-primary border-primary"
                : mode === "dark"
                  ? "bg-surface-variant/30 border-outline-variant"
                  : "bg-surface border-outline-variant"
            }`}
          >
            <MaterialIcons
              name={iconName as any}
              size={18}
              color={isSelected ? "#fff" : mode === "dark" ? "#aaa" : "#555"}
            />
            <Text
              className={`font-headline text-sm ${
                isSelected ? "text-white" : "text-on-surface"
              }`}
            >
              {opt.optionText}
            </Text>
            {isSelected && (
              <MaterialIcons name="close" size={16} color="#fff" />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

/* ─── Progress sidebar (desktop) ─── */
function ProgressSidebar({
  currentStep,
  totalSteps,
  questions,
}: {
  currentStep: number;
  totalSteps: number;
  questions: LoadedQuestion[];
}) {
  const mode = useThemeStore((s) => s.mode);

  const STEP_LABELS = questions.map((q) => {
    const text = q.questionText;
    return text.length > 30 ? text.slice(0, 30) + "…" : text;
  });

  return (
    <View
      className={`w-80 rounded-2xl p-6 ${
        mode === "dark" ? "bg-surface-variant/30" : "bg-[#f5f4ff]"
      }`}
    >
      {/* AI curator card */}
      <View
        className={`rounded-xl p-5 mb-6 ${
          mode === "dark" ? "bg-[#2a2d3e]" : "bg-white"
        }`}
      >
        <View className="flex-row items-center gap-3 mb-3">
          <View className="w-10 h-10 rounded-full bg-primary/20 items-center justify-center">
            <MaterialIcons name="smart-toy" size={22} color="#4d41df" />
          </View>
          <View>
            <Text className="text-xs font-headline text-primary uppercase tracking-wider">
              TWÓJ KURATOR AI
            </Text>
            <Text className="font-headline text-base text-on-surface">
              Alex
            </Text>
          </View>
        </View>
        <Text className="text-on-surface-variant text-sm italic leading-5">
          "Widzę, że Twoje cele skupiają się na harmonii między pracą a rozwojem
          osobistym. To świetny kierunek! Kolejne pytania pomogą mi dopasować
          priorytety Twojego kalendarza."
        </Text>
      </View>

      {/* Steps list */}
      <Text className="text-xs font-headline text-on-surface-variant uppercase tracking-wider mb-4">
        TWÓJ POSTĘP
      </Text>
      {STEP_LABELS.map((label, idx) => {
        const isCompleted = idx < currentStep;
        const isCurrent = idx === currentStep;
        return (
          <View key={idx} className="flex-row items-center gap-3 mb-3">
            {isCompleted ? (
              <View className="w-7 h-7 rounded-full bg-primary items-center justify-center">
                <MaterialIcons name="check" size={16} color="#fff" />
              </View>
            ) : (
              <View
                className={`w-7 h-7 rounded-full items-center justify-center ${
                  isCurrent
                    ? "bg-primary"
                    : mode === "dark"
                      ? "bg-surface-variant"
                      : "bg-[#e0dff5]"
                }`}
              >
                <Text
                  className={`text-xs font-headline ${
                    isCurrent ? "text-white" : "text-on-surface-variant"
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
          </View>
        );
      })}

      {/* Privacy note */}
      <View className="flex-row items-start gap-2 mt-6 pt-4 border-t border-outline-variant/30">
        <MaterialIcons name="verified-user" size={18} color="#4d41df" />
        <Text className="text-xs text-on-surface-variant flex-1 leading-4">
          Twoje dane są szyfrowane i wykorzystywane wyłącznie do personalizacji
          Twojego workspace.
        </Text>
      </View>
    </View>
  );
}

/* ─── Main Screen ─── */
export default function SurveyOnboardingScreen() {
  const router = useRouter();
  const { surveyId: paramSurveyId } = useLocalSearchParams<{
    surveyId?: string;
  }>();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && width >= 1024;
  const mode = useThemeStore((s) => s.mode);

  const { data: surveys, isLoading: surveysLoading } = useActiveSurveys();
  const { data: myResponses, isLoading: responsesLoading } = useMyResponses();
  const submitResponse = useSubmitResponse();

  // Pick survey by param or fall back to first active
  const survey = paramSurveyId
    ? (surveys?.find((s) => s.surveyId === paramSurveyId) ?? surveys?.[0])
    : surveys?.[0];

  const { data: rawQuestions, isLoading: questionsLoading } =
    useSurveyQuestions(survey?.surveyId);

  // Build questions list with surveyId
  const questions: LoadedQuestion[] = useMemo(() => {
    if (!rawQuestions || !survey) return [];
    return rawQuestions.map((q: any) => ({
      questionId: q.questionId,
      questionText: q.questionText,
      questionType: q.questionType,
      isRequired: q.isRequired ?? false,
      surveyId: survey.surveyId,
      hint: q.hint ?? null,
    }));
  }, [rawQuestions, survey]);

  // Filter out already-answered questions
  const unansweredQuestions = useMemo(() => {
    if (!questions.length) return [];
    const answeredIds = new Set(
      (myResponses ?? []).map((r: any) => r.questionId),
    );
    return questions.filter((q) => !answeredIds.has(q.questionId));
  }, [questions, myResponses]);

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const user = useAuthStore((s) => s.user);

  // Admin skips survey, redirect to dashboard
  useEffect(() => {
    if (user?.role === Role.ADMIN) {
      router.replace("/(app)/dashboard");
      return;
    }
    if (
      !surveysLoading &&
      !responsesLoading &&
      !questionsLoading &&
      (unansweredQuestions.length === 0 || !survey)
    ) {
      router.replace("/(app)/surveys");
    }
  }, [
    user,
    unansweredQuestions,
    survey,
    surveysLoading,
    responsesLoading,
    questionsLoading,
    router,
  ]);

  const totalSteps = unansweredQuestions.length;
  const currentQuestion = unansweredQuestions[currentStep];
  const currentAnswer = currentQuestion
    ? (answers[currentQuestion.questionId] ?? "")
    : "";

  const canProceed =
    currentQuestion &&
    (currentQuestion.isRequired ? currentAnswer.trim().length > 0 : true);

  const handleNext = useCallback(async () => {
    if (!currentQuestion || !survey) return;

    setSubmitting(true);
    try {
      await submitResponse.mutateAsync({
        surveyId: survey.surveyId,
        questionId: currentQuestion.questionId,
        answer: currentAnswer,
      });

      if (currentStep >= totalSteps - 1) {
        router.replace("/(app)/dashboard");
      }
      // Don't increment currentStep — the answered question is removed from
      // unansweredQuestions after my-responses refetches, so the same index
      // naturally points to the next question.
    } catch {
      // Allow retry
    } finally {
      setSubmitting(false);
    }
  }, [
    currentQuestion,
    survey,
    currentAnswer,
    currentStep,
    totalSteps,
    submitResponse,
    router,
  ]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  }, [currentStep]);

  const handleToggleChip = useCallback(
    (option: string) => {
      if (!currentQuestion) return;
      const qid = currentQuestion.questionId;
      const current = answers[qid] ?? "";
      const selected = current ? current.split(",") : [];
      const idx = selected.indexOf(option);
      if (idx >= 0) {
        selected.splice(idx, 1);
      } else {
        selected.push(option);
      }
      setAnswers((a) => ({ ...a, [qid]: selected.join(",") }));
    },
    [currentQuestion, answers],
  );

  const isLoading = surveysLoading || responsesLoading || questionsLoading;

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#4d41df" />
        <Text className="text-on-surface-variant mt-4 font-body">
          Ładowanie ankiety…
        </Text>
      </View>
    );
  }

  if (!currentQuestion) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#4d41df" />
      </View>
    );
  }

  /* ─── Question content ─── */
  const questionContent = (
    <View className="flex-1">
      {/* Category badge */}
      <View className="flex-row items-center gap-2 mb-4">
        <MaterialIcons name="bolt" size={16} color="#4d41df" />
        <Text className="text-xs font-headline text-primary uppercase tracking-wider">
          {survey?.title ?? "ANKIETA"}
        </Text>
      </View>

      {/* Question title */}
      <Text className="text-3xl font-headline text-on-surface mb-3">
        {currentQuestion.questionText}
      </Text>

      {/* Hint */}
      {currentQuestion.hint ? (
        <View className="flex-row items-start gap-2 mb-4 bg-primary-fixed/10 rounded-xl px-4 py-3">
          <MaterialIcons name="lightbulb" size={18} color="#4d41df" />
          <Text className="text-on-surface-variant text-sm flex-1 leading-5">
            {currentQuestion.hint}
          </Text>
        </View>
      ) : null}

      {/* Subtitle */}
      <Text className="text-on-surface-variant text-base mb-6 leading-6">
        {survey?.description ?? ""}
      </Text>

      {/* Answer input */}
      {currentQuestion.questionType === "TEXT" ? (
        <TextInput
          className={`rounded-xl p-4 min-h-[140px] text-base font-body ${
            mode === "dark"
              ? "bg-[#2a2d3e] text-white border-outline-variant"
              : "bg-[#f8f8fc] text-on-surface border-outline-variant"
          } border`}
          placeholder="Wpisz swoją odpowiedź..."
          placeholderTextColor={mode === "dark" ? "#777" : "#999"}
          multiline
          textAlignVertical="top"
          value={currentAnswer}
          onChangeText={(text) =>
            setAnswers((a) => ({
              ...a,
              [currentQuestion.questionId]: text,
            }))
          }
        />
      ) : (
        <>
          <Text className="text-on-surface font-headline text-lg mb-1">
            Które kategorie Cię interesują?
          </Text>
          <OptionChips
            questionId={currentQuestion.questionId}
            selected={currentAnswer ? currentAnswer.split(",") : []}
            onToggle={handleToggleChip}
          />
        </>
      )}
    </View>
  );

  /* ─── Navigation buttons ─── */
  const navigationButtons = (
    <View className="flex-row items-center justify-between pt-6 mt-6 border-t border-outline-variant/30">
      {currentStep > 0 ? (
        <TouchableOpacity
          onPress={handleBack}
          className="flex-row items-center gap-2 px-4 py-3"
        >
          <MaterialIcons
            name="arrow-back"
            size={20}
            color={mode === "dark" ? "#aaa" : "#555"}
          />
          <Text className="text-on-surface-variant font-headline text-sm uppercase tracking-wider">
            WSTECZ
          </Text>
        </TouchableOpacity>
      ) : (
        <View />
      )}

      <TouchableOpacity
        onPress={handleNext}
        disabled={!canProceed || submitting}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={["#4d41df", "#6c63ff"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className={`px-10 py-4 rounded-xl ${
            !canProceed || submitting ? "opacity-50" : ""
          }`}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text className="text-white font-headline text-sm uppercase tracking-wider">
              {currentStep === totalSteps - 1 ? "ZAKOŃCZ" : "DALEJ"}
            </Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  /* ─── Desktop layout ─── */
  if (isDesktop) {
    return (
      <View className="flex-1 bg-background">
        {/* Top bar */}
        <View className="flex-row items-center justify-between px-8 py-4 border-b border-outline-variant/30">
          <View className="flex-row items-center gap-3">
            <View className="w-9 h-9 rounded-lg bg-primary items-center justify-center">
              <MaterialIcons name="auto-awesome" size={20} color="#fff" />
            </View>
            <View>
              <Text className="font-headline text-lg text-on-surface">
                INTELLIGENT CURATOR
              </Text>
              <Text className="text-xs text-on-surface-variant">
                AI-DRIVEN FOCUS
              </Text>
            </View>
          </View>
          <View className="flex-row items-center gap-3">
            <Text className="text-on-surface-variant font-body text-sm">
              Krok {currentStep + 1} z {totalSteps}
            </Text>
            <View className="w-8 h-8 rounded-full bg-surface-variant items-center justify-center">
              <MaterialIcons name="help-outline" size={18} color="#777" />
            </View>
          </View>
        </View>

        {/* Content area */}
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 48,
            paddingVertical: 40,
          }}
        >
          <View className="flex-row gap-10 max-w-[1200px] mx-auto w-full">
            {/* Left: question */}
            <View className="flex-1">
              {questionContent}
              {navigationButtons}
            </View>

            {/* Right: progress */}
            <ProgressSidebar
              currentStep={currentStep}
              totalSteps={totalSteps}
              questions={unansweredQuestions}
            />
          </View>
        </ScrollView>

        {/* Footer */}
        <View className="flex-row items-center justify-between px-8 py-3 border-t border-outline-variant/20">
          <View className="flex-row gap-6">
            <Text className="text-xs text-on-surface-variant uppercase tracking-wider">
              POLITYKA PRYWATNOŚCI
            </Text>
            <Text className="text-xs text-on-surface-variant uppercase tracking-wider">
              WARUNKI KORZYSTANIA
            </Text>
          </View>
          <Text className="text-xs text-on-surface-variant">
            POWERED BY CURATOR ENGINE 2.0 · © 2024
          </Text>
        </View>
      </View>
    );
  }

  /* ─── Mobile layout ─── */
  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      {/* Top bar */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-outline-variant/30">
        <Text className="font-headline text-base text-on-surface">Ankieta</Text>
        <Text className="text-on-surface-variant font-body text-sm">
          Krok {currentStep + 1} z {totalSteps}
        </Text>
      </View>

      <ScrollView
        className="flex-1 px-4 py-6"
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {questionContent}
        {navigationButtons}
      </ScrollView>
    </SafeAreaView>
  );
}
