import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
} from "react-native";
import { useRouter, useLocalSearchParams, Redirect } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { cssInterop } from "nativewind";
import { PageLayout } from "@/components/organisms/PageLayout";
import { Card } from "@/components/atoms/Card";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
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
  useQuestionOptions,
  useDeleteQuestionOption,
} from "@/lib/hooks";
import { questionApi } from "@/lib/api";

cssInterop(LinearGradient, { className: "style" });

interface LocalQuestion {
  id: string;
  questionText: string;
  questionType: QuestionType;
  isRequired: boolean;
  options: string[];
  saved: boolean;
  serverQuestionId?: string;
  hint: string;
}

const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  [QuestionType.TEXT]: "Text Input",
  [QuestionType.LIST]: "List / Multiple Choice",
};

function QuestionTypeDropdown({
  value,
  onChange,
}: {
  value: QuestionType;
  onChange: (t: QuestionType) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <View className="relative">
      <TouchableOpacity
        className="flex-row items-center gap-2 bg-surface-container-low px-3 py-1.5 rounded-lg"
        onPress={() => setOpen(!open)}
      >
        <Text className="text-primary font-label text-xs uppercase tracking-widest font-bold">
          {QUESTION_TYPE_LABELS[value]}
        </Text>
        <MaterialIcons
          name={open ? "expand-less" : "expand-more"}
          size={18}
          color="#4d41df"
        />
      </TouchableOpacity>
      {open && (
        <View className="absolute top-9 right-0 z-50 bg-surface-container-lowest rounded-xl shadow-lg py-1 min-w-[200px]">
          {Object.entries(QUESTION_TYPE_LABELS).map(([key, label]) => (
            <TouchableOpacity
              key={key}
              className={`px-4 py-2.5 ${
                value === key ? "bg-primary-fixed/20" : ""
              }`}
              onPress={() => {
                onChange(key as QuestionType);
                setOpen(false);
              }}
            >
              <Text
                className={`font-body text-sm ${
                  value === key
                    ? "text-primary font-bold"
                    : "text-on-surface-variant"
                }`}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
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
  const updateText = (questionText: string) =>
    onUpdate({ ...question, questionText });
  const updateType = (questionType: QuestionType) => {
    const options =
      questionType === QuestionType.LIST && question.options.length === 0
        ? ["", ""]
        : question.options;
    onUpdate({ ...question, questionType, options });
  };
  const updateOption = (i: number, text: string) => {
    const opts = [...question.options];
    opts[i] = text;
    onUpdate({ ...question, options: opts });
  };
  const removeOption = (i: number) => {
    const opts = question.options.filter((_, idx) => idx !== i);
    onUpdate({ ...question, options: opts });
  };
  const addOption = () =>
    onUpdate({ ...question, options: [...question.options, ""] });

  return (
    <Card variant="surface" className="relative">
      {/* Header: label + type + delete */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="bg-primary-fixed/20 px-3 py-1 rounded-lg">
          <Text className="text-primary font-label text-[10px] uppercase tracking-widest font-bold">
            Question {String(index + 1).padStart(2, "0")}
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          <QuestionTypeDropdown
            value={question.questionType}
            onChange={updateType}
          />
          <TouchableOpacity onPress={onDelete} className="p-1">
            <MaterialIcons name="delete-outline" size={20} color="#ba1a1a" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Question text */}
      <TextInput
        value={question.questionText}
        onChangeText={updateText}
        placeholder="Enter your question here..."
        placeholderTextColor="#777587"
        className="text-on-surface font-headline text-lg font-bold mb-1 py-2 border-b border-outline-variant/15"
      />

      {/* Hint */}
      <TextInput
        value={question.hint}
        onChangeText={(hint) => onUpdate({ ...question, hint, saved: false })}
        placeholder="Podpowiedź dla użytkownika (opcjonalnie)..."
        placeholderTextColor="#999"
        className="text-on-surface-variant font-body text-sm mt-2 py-2 border-b border-outline-variant/10"
      />

      {question.questionType === QuestionType.TEXT && (
        <Text className="text-on-surface-variant font-body text-sm mt-2 italic">
          User will provide a short text response...
        </Text>
      )}

      {question.questionType === QuestionType.LIST && (
        <View className="mt-4 gap-2">
          {question.options.map((opt, i) => (
            <View key={i} className="flex-row items-center gap-3">
              <View className="w-5 h-5 rounded-full border-2 border-outline-variant/30" />
              <TextInput
                value={opt}
                onChangeText={(t) => updateOption(i, t)}
                placeholder={`Option ${i + 1}`}
                placeholderTextColor="#777587"
                className="flex-1 text-on-surface font-body text-sm py-2 border-b border-outline-variant/15"
              />
              <TouchableOpacity onPress={() => removeOption(i)} className="p-1">
                <MaterialIcons name="close" size={18} color="#777587" />
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity
            onPress={addOption}
            className="flex-row items-center gap-3 mt-1"
          >
            <View className="w-5 h-5 rounded-full border-2 border-dashed border-outline-variant/30" />
            <Text className="text-on-surface-variant font-body text-sm italic">
              Add an option...
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Required toggle */}
      <TouchableOpacity
        className="flex-row items-center gap-2 mt-4 self-start"
        onPress={() =>
          onUpdate({ ...question, isRequired: !question.isRequired })
        }
      >
        <MaterialIcons
          name={question.isRequired ? "check-box" : "check-box-outline-blank"}
          size={20}
          color={question.isRequired ? "#4d41df" : "#777587"}
        />
        <Text className="text-on-surface-variant font-label text-xs uppercase tracking-widest">
          Required
        </Text>
      </TouchableOpacity>
    </Card>
  );
}

function AddQuestionCard({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress}>
      <View className="rounded-2xl border-2 border-dashed border-outline-variant/30 p-8 items-center justify-center">
        <View className="w-12 h-12 rounded-full bg-surface-container-low items-center justify-center mb-3">
          <MaterialIcons name="add" size={24} color="#777587" />
        </View>
        <Text className="text-on-surface font-headline text-base font-bold mb-1">
          Click to add a new question
        </Text>
        <Text className="text-on-surface-variant font-label text-[10px] uppercase tracking-widest">
          Select from multiple choice, text, or scale
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function AdminSurveyBuilderPage() {
  const router = useRouter();
  const { surveyId } = useLocalSearchParams<{ surveyId?: string }>();
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
  const [questions, setQuestions] = useState<LocalQuestion[]>([]);
  const [saving, setSaving] = useState(false);
  const [initialized, setInitialized] = useState(!isEditMode);

  // Populate form when editing
  useEffect(() => {
    if (isEditMode && existingSurvey && !initialized) {
      setTitle(existingSurvey.title);
      setDescription(existingSurvey.description);
      setInitialized(true);
    }
  }, [isEditMode, existingSurvey, initialized]);

  // Load existing questions with their options
  useEffect(() => {
    if (
      isEditMode &&
      existingQuestions &&
      initialized &&
      questions.length === 0
    ) {
      const loadQuestions = async () => {
        const loaded: LocalQuestion[] = [];
        for (const q of existingQuestions) {
          let options: string[] = [];
          if (q.questionType === QuestionType.LIST) {
            try {
              const { data } = await questionApi.getOptions(q.questionId);
              options = data.map((o) => o.optionText);
            } catch {
              options = [];
            }
          }
          loaded.push({
            id: q.questionId,
            questionText: q.questionText,
            questionType: q.questionType,
            isRequired: true,
            options,
            saved: true,
            serverQuestionId: q.questionId,
            hint: q.hint ?? "",
          });
        }
        setQuestions(loaded);
      };
      loadQuestions();
    }
  }, [isEditMode, existingQuestions, initialized]);

  if (user?.role !== Role.ADMIN) {
    return <Redirect href="/(app)/dashboard" />;
  }

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: `local-${Date.now()}`,
        questionText: "",
        questionType: QuestionType.TEXT,
        isRequired: true,
        options: [],
        saved: false,
        hint: "",
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
      if (q.questionType === QuestionType.LIST) {
        const validOpts = q.options.filter((o) => o.trim().length >= 3);
        if (validOpts.length < 2)
          return `Question ${i + 1} needs at least 2 options (min 3 chars each).`;
      }
    }
    return null;
  };

  const save = useCallback(
    async (publish: boolean) => {
      const err = validate();
      if (err) {
        if (Platform.OS === "web") {
          window.alert(err);
        } else {
          Alert.alert("Validation Error", err);
        }
        return;
      }

      setSaving(true);
      try {
        let targetSurveyId = surveyId;

        if (isEditMode && targetSurveyId) {
          // Edit existing survey
          await editSurvey.mutateAsync({
            surveyId: targetSurveyId,
            data: { title: title.trim(), description: description.trim() },
          });
        } else {
          // Create new survey
          const { data } = await createSurvey.mutateAsync({
            title: title.trim(),
            description: description.trim(),
          });
          targetSurveyId = data.surveyId;
        }

        // Save questions
        for (let i = 0; i < questions.length; i++) {
          const q = questions[i];
          if (q.serverQuestionId && !q.saved) {
            // Edit existing question
            await editQuestion.mutateAsync({
              questionId: q.serverQuestionId,
              data: {
                questionText: q.questionText.trim(),
                questionType: q.questionType,
                isRequired: q.isRequired,
                hint: q.hint.trim() || null,
              },
            });
          } else if (!q.serverQuestionId) {
            // Create new question
            const validOptions = q.options.filter((o) => o.trim().length >= 3);
            await createQuestion.mutateAsync({
              surveyId: targetSurveyId!,
              data: {
                questionText: q.questionText.trim(),
                questionType: q.questionType,
                optionTextValue:
                  q.questionType === QuestionType.LIST ? validOptions : [],
                isRequired: q.isRequired,
                hint: q.hint.trim() || null,
              },
            });
          }
        }

        // Set visibility — only call API when target differs from current state
        const currentVisibility = existingSurvey?.isVisible ?? false;
        if (publish !== currentVisibility) {
          await changeVisibility.mutateAsync({
            surveyId: targetSurveyId!,
            isVisible: publish,
          });
        }

        router.push("/(app)/admin-surveys" as never);
      } catch (e: any) {
        const msg =
          e?.response?.data?.message || e?.message || "Failed to save survey.";
        if (Platform.OS === "web") {
          window.alert(msg);
        } else {
          Alert.alert("Error", msg);
        }
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

  return (
    <PageLayout title="Survey Builder">
      {/* Top bar */}
      <View className="flex-row items-center justify-between mb-6">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity
            onPress={() => router.back()}
            className="p-2 rounded-xl bg-surface-container-low"
          >
            <MaterialIcons name="arrow-back" size={20} color="#464555" />
          </TouchableOpacity>
          <Text className="text-on-surface font-headline text-2xl font-black">
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
              <TouchableOpacity onPress={() => save(true)} disabled={saving}>
                <LinearGradient
                  colors={["#4d41df", "#675df9"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="flex-row items-center gap-2 px-6 py-3 rounded-xl"
                >
                  <MaterialIcons name="save" size={18} color="#ffffff" />
                  <Text className="text-white font-label text-sm font-bold uppercase tracking-wider">
                    Save
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                label="Save Draft"
                loading={saving}
                onPress={() => save(false)}
              />
              <TouchableOpacity onPress={() => save(true)} disabled={saving}>
                <LinearGradient
                  colors={["#4d41df", "#675df9"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="flex-row items-center gap-2 px-6 py-3 rounded-xl"
                >
                  <MaterialIcons
                    name="rocket-launch"
                    size={18}
                    color="#ffffff"
                  />
                  <Text className="text-white font-label text-sm font-bold uppercase tracking-wider">
                    Publish Survey
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      {isLoadingEdit ? (
        <View className="flex-row gap-6">
          <View className="w-[35%] gap-4">
            <Card variant="glass">
              <Skeleton width="60%" height={16} className="mb-4" />
              <Skeleton height={44} className="mb-4" />
              <Skeleton width="60%" height={16} className="mb-4" />
              <Skeleton height={100} />
            </Card>
          </View>
          <View className="flex-1 gap-4">
            <Skeleton height={200} borderRadius={16} />
            <Skeleton height={200} borderRadius={16} />
          </View>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          <View className="flex-row gap-6">
            {/* Left column — Survey Details */}
            <View className="w-[35%]">
              <Card variant="glass">
                <Text className="text-on-surface font-headline text-xl font-bold mb-6">
                  Survey Details
                </Text>

                <Input
                  label="Survey Title"
                  value={title}
                  onChangeText={setTitle}
                  placeholder="e.g., Q3 Customer Satisfaction"
                />

                <View className="mt-4">
                  <Text className="text-on-surface-variant font-label text-[10px] uppercase tracking-widest mb-2">
                    Description
                  </Text>
                  <TextInput
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Briefly describe the purpose of this survey..."
                    placeholderTextColor="#777587"
                    multiline
                    numberOfLines={5}
                    textAlignVertical="top"
                    className="bg-surface-container-lowest rounded-xl p-4 text-on-surface font-body text-sm min-h-[120px] border border-outline-variant/15"
                  />
                </View>
              </Card>

              {/* AI Tip */}
              <View className="mt-6 bg-primary-fixed/15 rounded-2xl p-5">
                <View className="flex-row items-center gap-2 mb-2">
                  <MaterialIcons
                    name="auto-awesome"
                    size={18}
                    color="#4d41df"
                  />
                  <Text className="text-primary font-label text-[10px] uppercase tracking-widest font-bold">
                    Tip
                  </Text>
                </View>
                <Text className="text-on-surface-variant font-body text-sm leading-relaxed">
                  Surveys with 5 or fewer questions have an 85% higher
                  completion rate. Try to keep it concise!
                </Text>
              </View>
            </View>

            {/* Right column — Question Structure */}
            <View className="flex-1">
              <View className="flex-row items-center justify-between mb-4">
                <View>
                  <Text className="text-on-surface font-headline text-xl font-bold">
                    Question Structure
                  </Text>
                  <Text className="text-on-surface-variant font-body text-sm mt-1">
                    Build your survey sequence
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={addQuestion}
                  className="flex-row items-center gap-1"
                >
                  <MaterialIcons name="add" size={18} color="#4d41df" />
                  <Text className="text-primary font-label text-xs uppercase tracking-widest font-bold">
                    Add Question
                  </Text>
                </TouchableOpacity>
              </View>

              <View className="gap-4">
                {questions.map((q, i) => (
                  <QuestionCard
                    key={q.id}
                    index={i}
                    question={q}
                    onUpdate={(updated) => updateQuestion(i, updated)}
                    onDelete={() => removeQuestion(i)}
                  />
                ))}
                <AddQuestionCard onPress={addQuestion} />
              </View>
            </View>
          </View>
        </ScrollView>
      )}
    </PageLayout>
  );
}
