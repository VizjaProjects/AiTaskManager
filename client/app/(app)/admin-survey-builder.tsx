import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  useWindowDimensions,
} from "react-native";
import { useRouter, useLocalSearchParams, Redirect } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { PageLayout } from "@/components/organisms/PageLayout";
import { Button } from "@/components/atoms/Button";
import { Skeleton } from "@/components/atoms/Skeleton";
import { useAuthStore } from "@/lib/stores";
import { Role, QuestionType } from "@/lib/types";
import {
  useSurveys,
  useSurveyQuestions,
  useCreateSurvey,
  useEditSurvey,
  useChangeSurveyVisibility,
  useCreateQuestion,
  useEditQuestion,
  useDeleteQuestion,
} from "@/lib/hooks";

type BuilderQuestionKind = "text" | "single" | "multiple";

interface LocalQuestion {
  id: string;
  questionText: string;
  isRequired: boolean;
  saved: boolean;
  serverQuestionId?: string;
  hint: string;
  kind: BuilderQuestionKind;
  options: string[];
}

const KIND_LABELS: Record<BuilderQuestionKind, string> = {
  text: "Text Answer",
  single: "Single Choice",
  multiple: "Multiple Choice",
};

const NO_OUTLINE: Record<string, unknown> =
  Platform.OS === "web" ? { outlineStyle: "none" } : {};

function toApiType(kind: BuilderQuestionKind): QuestionType {
  return kind === "text" ? QuestionType.TEXT : QuestionType.LIST;
}

function FieldLabel({ children }: { children: string }) {
  return (
    <Text className="text-on-surface-variant font-label text-[10px] uppercase tracking-widest mb-2">
      {children}
    </Text>
  );
}

function BorderedInput({
  value,
  onChangeText,
  placeholder,
  multiline,
  minHeight,
}: {
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  multiline?: boolean;
  minHeight?: number;
}) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#9ca3af"
      multiline={multiline}
      textAlignVertical={multiline ? "top" : "center"}
      className="rounded-xl px-4 py-3.5 text-on-surface font-body text-sm border border-outline-variant bg-surface-container-lowest"
      style={[NO_OUTLINE, minHeight ? { minHeight } : undefined]}
    />
  );
}

function QuestionCard({
  index,
  question,
  onUpdate,
  onDelete,
}: {
  index: number;
  question: LocalQuestion;
  onUpdate: (q: LocalQuestion) => void;
  onDelete: () => void;
}) {
  const isList = question.kind !== "text";

  return (
    <View className="rounded-2xl bg-surface-container-lowest border border-outline-variant p-6 gap-5">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <MaterialIcons name="drag-indicator" size={22} color="#c4c4c4" />
          <Text className="text-on-surface-variant font-label text-[11px] uppercase tracking-[0.15em] font-semibold">
            Question {String(index + 1).padStart(2, "0")}
          </Text>
        </View>
        <View className="flex-row items-center gap-3">
          <View className="px-3 py-1.5 rounded-lg bg-surface-container-low">
            <Text className="text-on-surface-variant font-label text-[10px] uppercase tracking-wide font-semibold">
              {KIND_LABELS[question.kind]}
            </Text>
          </View>
          <TouchableOpacity onPress={onDelete} className="p-1">
            <MaterialIcons name="delete-outline" size={22} color="#9ca3af" />
          </TouchableOpacity>
        </View>
      </View>

      <View>
        <FieldLabel>Question title</FieldLabel>
        <BorderedInput
          value={question.questionText}
          onChangeText={(questionText) =>
            onUpdate({ ...question, questionText, saved: false })
          }
          placeholder="Enter your question here..."
        />
      </View>

      <View>
        <FieldLabel>Helper text (optional)</FieldLabel>
        <BorderedInput
          value={question.hint}
          onChangeText={(hint) => onUpdate({ ...question, hint, saved: false })}
          placeholder="Short hint shown to the respondent..."
        />
      </View>

      {isList && (
        <View className="gap-2">
          <FieldLabel>Answer options</FieldLabel>
          {question.options.map((opt, optIdx) => (
            <View key={optIdx} className="flex-row items-center gap-2">
              <BorderedInput
                value={opt}
                onChangeText={(v) => {
                  const options = [...question.options];
                  options[optIdx] = v;
                  onUpdate({ ...question, options, saved: false });
                }}
                placeholder={`Option ${optIdx + 1}`}
              />
              <TouchableOpacity
                onPress={() => {
                  const options = question.options.filter(
                    (_, i) => i !== optIdx,
                  );
                  onUpdate({ ...question, options, saved: false });
                }}
              >
                <MaterialIcons name="close" size={18} color="#9ca3af" />
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity
            onPress={() =>
              onUpdate({
                ...question,
                options: [...question.options, ""],
                saved: false,
              })
            }
            className="flex-row items-center gap-1 self-start mt-1"
          >
            <MaterialIcons name="add" size={16} color="#9ca3af" />
            <Text className="text-on-surface-variant font-label text-xs">
              Add option
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <Text className="text-on-surface-variant font-body text-sm">
        {question.kind === "text"
          ? "User will provide a text response."
          : question.kind === "single"
            ? "User will pick one option."
            : "User can pick multiple options."}
      </Text>

      <TouchableOpacity
        className="flex-row items-center gap-2.5 self-start"
        onPress={() =>
          onUpdate({
            ...question,
            isRequired: !question.isRequired,
            saved: false,
          })
        }
      >
        <MaterialIcons
          name={question.isRequired ? "check-box" : "check-box-outline-blank"}
          size={22}
          color={question.isRequired ? "#4d41df" : "#9ca3af"}
        />
        <Text className="text-on-surface-variant font-label text-xs uppercase tracking-widest">
          Required
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function createEmptyQuestion(): LocalQuestion {
  return {
    id: `local-${Date.now()}`,
    questionText: "",
    isRequired: true,
    saved: false,
    hint: "",
    kind: "text",
    options: [],
  };
}

function AddQuestionPanel({
  onAdd,
}: {
  onAdd: (kind: BuilderQuestionKind) => void;
}) {
  const types: Array<{
    kind: BuilderQuestionKind;
    label: string;
    icon: keyof typeof MaterialIcons.glyphMap;
  }> = [
    { kind: "text", label: "Text", icon: "text-fields" },
    { kind: "single", label: "Single", icon: "radio-button-checked" },
    { kind: "multiple", label: "Multiple", icon: "check-box" },
  ];

  return (
    <View className="rounded-2xl border-2 border-dashed border-outline-variant p-8 gap-5">
      <Text className="text-on-surface font-headline text-lg text-center">
        Add a new question
      </Text>
      <View className="flex-row gap-4 justify-center">
        {types.map((t) => (
          <TouchableOpacity
            key={t.kind}
            onPress={() => onAdd(t.kind)}
            className="flex-1 max-w-[140px] rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 items-center gap-3"
            activeOpacity={0.85}
          >
            <MaterialIcons name={t.icon} size={28} color="#9ca3af" />
            <Text className="text-on-surface font-headline text-sm">
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export default function AdminSurveyBuilderPage() {
  const router = useRouter();
  const { surveyId } = useLocalSearchParams<{ surveyId?: string }>();
  const { width } = useWindowDimensions();
  const isWide = Platform.OS === "web" && width >= 900;
  const user = useAuthStore((s) => s.user);
  const isEditMode = !!surveyId;

  const { data: surveys } = useSurveys();
  const existingSurvey = surveys?.find((s) => s.surveyId === surveyId);
  const { data: existingQuestions, isLoading: questionsLoading } =
    useSurveyQuestions(surveyId);

  const createSurvey = useCreateSurvey();
  const editSurvey = useEditSurvey();
  const changeVisibility = useChangeSurveyVisibility();
  const createQuestion = useCreateQuestion();
  const editQuestion = useEditQuestion();
  const deleteQuestion = useDeleteQuestion();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<LocalQuestion[]>(() =>
    isEditMode ? [] : [createEmptyQuestion()],
  );
  const [saving, setSaving] = useState(false);
  const [initialized, setInitialized] = useState(!isEditMode);

  useEffect(() => {
    if (isEditMode && existingSurvey && !initialized) {
      setTitle(existingSurvey.title);
      setDescription(existingSurvey.description);
      setInitialized(true);
    }
  }, [isEditMode, existingSurvey, initialized]);

  useEffect(() => {
    if (
      isEditMode &&
      existingQuestions &&
      initialized &&
      questions.length === 0
    ) {
      setQuestions(
        existingQuestions.map((q) => ({
          id: q.questionId,
          questionText: q.questionText,
          isRequired: q.isRequired ?? true,
          saved: true,
          serverQuestionId: q.questionId,
          hint: q.hint ?? "",
          kind: q.questionType === QuestionType.LIST ? "single" : "text",
          options: [],
        })),
      );
    }
  }, [isEditMode, existingQuestions, initialized, questions.length]);

  if (user?.role !== Role.ADMIN) {
    return <Redirect href="/(app)/dashboard" />;
  }

  const addQuestion = (kind: BuilderQuestionKind) => {
    setQuestions([
      ...questions,
      {
        id: `local-${Date.now()}`,
        questionText: "",
        isRequired: true,
        saved: false,
        hint: "",
        kind,
        options: kind === "text" ? [] : [""],
      },
    ]);
  };

  const updateQuestion = (idx: number, q: LocalQuestion) => {
    const updated = [...questions];
    updated[idx] = { ...q, saved: false };
    setQuestions(updated);
  };

  const removeQuestion = (idx: number) => {
    const q = questions[idx];
    if (q.serverQuestionId) {
      deleteQuestion.mutate(q.serverQuestionId);
    }
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const validate = () => {
    if (!title.trim()) return "Survey title is required.";
    if (!description.trim()) return "Survey description is required.";
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText.trim()) return `Question ${i + 1} text is required.`;
      if (q.kind !== "text") {
        const opts = q.options.map((o) => o.trim()).filter(Boolean);
        if (opts.length < 2)
          return `Question ${i + 1} needs at least 2 options.`;
      }
    }
    return null;
  };

  const save = useCallback(
    async (publish: boolean) => {
      const err = validate();
      if (err) {
        if (Platform.OS === "web") window.alert(err);
        else Alert.alert("Validation Error", err);
        return;
      }

      setSaving(true);
      try {
        let targetSurveyId = surveyId;

        if (isEditMode && targetSurveyId) {
          await editSurvey.mutateAsync({
            surveyId: targetSurveyId,
            data: { title: title.trim(), description: description.trim() },
          });
        } else {
          const { data } = await createSurvey.mutateAsync({
            title: title.trim(),
            description: description.trim(),
          });
          targetSurveyId = data.surveyId;
        }

        for (const q of questions) {
          const apiType = toApiType(q.kind);
          const optionTextValue =
            q.kind === "text"
              ? []
              : q.options.map((o) => o.trim()).filter(Boolean);

          if (q.serverQuestionId && !q.saved) {
            await editQuestion.mutateAsync({
              questionId: q.serverQuestionId,
              data: {
                questionText: q.questionText.trim(),
                questionType: apiType,
                isRequired: q.isRequired,
                hint: q.hint.trim() || null,
              },
            });
          } else if (!q.serverQuestionId) {
            await createQuestion.mutateAsync({
              surveyId: targetSurveyId!,
              data: {
                questionText: q.questionText.trim(),
                questionType: apiType,
                optionTextValue,
                isRequired: q.isRequired,
                hint: q.hint.trim() || null,
              },
            });
          }
        }

        const currentVisibility = existingSurvey?.isVisible ?? false;
        if (publish !== currentVisibility) {
          await changeVisibility.mutateAsync({
            surveyId: targetSurveyId!,
            isVisible: publish,
          });
        }

        router.push("/(app)/admin-surveys" as never);
      } catch (e: unknown) {
        const msg =
          (
            e as {
              response?: { data?: { message?: string } };
              message?: string;
            }
          )?.response?.data?.message ||
          (e as Error)?.message ||
          "Failed to save survey.";
        if (Platform.OS === "web") window.alert(msg);
        else Alert.alert("Error", msg);
      } finally {
        setSaving(false);
      }
    },
    [
      title,
      description,
      questions,
      surveyId,
      isEditMode,
      existingSurvey,
      createSurvey,
      editSurvey,
      changeVisibility,
      createQuestion,
      editQuestion,
      router,
    ],
  );

  const isLoadingEdit = isEditMode && (!initialized || questionsLoading);

  const body = isLoadingEdit ? (
    <View className={`${isWide ? "flex-row" : ""} gap-6`}>
      <View className={isWide ? "w-[34%]" : ""}>
        <Skeleton height={240} borderRadius={16} />
      </View>
      <View className="flex-1 gap-4">
        <Skeleton height={300} borderRadius={16} />
      </View>
    </View>
  ) : (
    <View className={`${isWide ? "flex-row" : "gap-6"} gap-6 items-start`}>
      <View className={isWide ? "w-[34%] shrink-0" : "w-full"}>
        <View className="rounded-2xl bg-surface-container-lowest border border-outline-variant p-6 gap-5">
          <Text className="text-on-surface-variant font-label text-[10px] uppercase tracking-widest font-semibold">
            Survey details
          </Text>
          <View>
            <FieldLabel>Survey title</FieldLabel>
            <BorderedInput
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Customer satisfaction"
            />
          </View>
          <View>
            <FieldLabel>Description</FieldLabel>
            <BorderedInput
              value={description}
              onChangeText={setDescription}
              placeholder="What is this survey about?"
              multiline
              minHeight={120}
            />
          </View>
        </View>
      </View>

      <View className="flex-1 min-w-0 gap-5">
        <View>
          <Text className="text-on-surface font-headline text-xl font-bold">
            Question structure
          </Text>
          <Text className="text-on-surface-variant font-body text-sm mt-1">
            {questions.length} question{questions.length === 1 ? "" : "s"} ·
            build your survey sequence
          </Text>
        </View>

        {questions.map((q, i) => (
          <QuestionCard
            key={q.id}
            index={i}
            question={q}
            onUpdate={(updated) => updateQuestion(i, updated)}
            onDelete={() => removeQuestion(i)}
          />
        ))}

        <AddQuestionPanel onAdd={addQuestion} />
      </View>
    </View>
  );

  return (
    <PageLayout showSearch={false}>
      <View className="flex-1 rounded-2xl bg-[#f3f4f6] p-6 md:p-8 min-h-full">
        <View className="flex-row items-center justify-between mb-8">
          <View className="flex-row items-center gap-3">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 items-center justify-center rounded-full border border-outline-variant bg-surface-container-lowest"
            >
              <MaterialIcons name="arrow-back" size={20} color="#6b7280" />
            </TouchableOpacity>
            <Text className="text-on-surface font-headline text-2xl font-bold">
              Survey Builder
            </Text>
          </View>
          <View className="flex-row items-center gap-3">
            {isEditMode && existingSurvey?.isVisible ? (
              <>
                <Button
                  variant="outline"
                  label="Unpublish"
                  loading={saving}
                  onPress={() => save(false)}
                />
                <Button
                  label="Save"
                  loading={saving}
                  onPress={() => save(true)}
                />
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  label="Save draft"
                  loading={saving}
                  onPress={() => save(false)}
                />
                <Button
                  label="Publish survey"
                  loading={saving}
                  onPress={() => save(true)}
                />
              </>
            )}
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 32 }}
        >
          {body}
        </ScrollView>
      </View>
    </PageLayout>
  );
}
