import {
  View,
  Text,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Animated,
  useWindowDimensions,
} from "react-native";
import { useState, useEffect, useRef } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { PageLayout } from "@/components/organisms";
import { TaskDetailModal } from "@/components/organisms/TaskModals";
import {
  Button,
  Input,
  InlineDatePicker,
  AiProposedCard,
} from "@/components/atoms";
import {
  useGenerateAiPlan,
  useAiProposals,
  useAcceptAiTask,
  useRejectAiTask,
  useAcceptAiEvent,
  useRejectAiEvent,
  useCategories,
  useTaskStatuses,
} from "@/lib/hooks";
import { AiChatConfigButton } from "@/components/molecules/AiChatConfigButton";
import { AiLimitInfo } from "@/components/molecules/AiLimitInfo";
import {
  useAiPlanningRequestStore,
  useLlmSettingsSelectionStore,
} from "@/lib/stores";
import {
  extractApiErrorMessage,
  isOrdovitaAiSelection,
} from "@/lib/utils/llmSettings";
import type {
  Task,
  CalendarEvent,
  AcceptAiTaskRequest,
  AcceptAiEventRequest,
} from "@/lib/types";
import { EventStatus } from "@/lib/types";
import { formatDuration, normalizeDueDateTime, parseApiDateTime } from "@/lib/utils";
import { useReducedMotion } from "@/lib/utils/useReducedMotion";
import { UI } from "@/lib/utils/uiTokens";
import { useT, useLocale, useLanguageStore, localeFor } from "@/lib/i18n";
import { AppModal } from "@/components/molecules/AppModal";
import { Fold } from "@/components/molecules/Fold";
import { Reveal } from "@/components/molecules/Reveal";
import { useRouter } from "expo-router";

type ProposalItem =
  | { id: string; task: Task; event?: undefined }
  | { id: string; event: CalendarEvent; task?: undefined };

/** Where an accepted proposal landed; `date` is null for a task without a due date. */
type Receipt = { date: Date | null; allDay: boolean };

function dateKey(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const NO_OUTLINE =
  Platform.OS === "web" ? ({ outlineStyle: "none" } as any) : undefined;
const MAX_AI_PLAN_TEXT_LENGTH = 4000;

function AiLoadingAnimation() {
  const t = useT();
  const pulse1 = useRef(new Animated.Value(0.3)).current;
  const pulse2 = useRef(new Animated.Value(0.3)).current;
  const pulse3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    function animate(val: Animated.Value, delay: number) {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(val, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(val, {
            toValue: 0.3,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
      );
    }
    const a1 = animate(pulse1, 0);
    const a2 = animate(pulse2, 200);
    const a3 = animate(pulse3, 400);
    a1.start();
    a2.start();
    a3.start();
    return () => {
      a1.stop();
      a2.stop();
      a3.stop();
    };
  }, [pulse1, pulse2, pulse3]);

  return (
    <View className="rounded-2xl bg-surface-container-lowest border border-outline-variant p-8 items-center gap-4">
      <View className="flex-row items-center gap-2">
        {[pulse1, pulse2, pulse3].map((p, i) => (
          <Animated.View key={i} style={{ opacity: p }}>
            <View className="w-2 h-2 rounded-full bg-on-surface" />
          </Animated.View>
        ))}
      </View>
      <Text className="text-on-surface font-headline text-body-md">
        {t("aiTask.analyzing")}
      </Text>
      <Text className="text-on-surface-variant font-body text-sm text-center">
        {t("aiTask.analyzingDesc")}
      </Text>
    </View>
  );
}

function EditEventModal({
  event,
  visible,
  onClose,
  onSave,
  loading,
}: {
  event: CalendarEvent;
  visible: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  loading: boolean;
}) {
  const t = useT();
  const [title, setTitle] = useState(event.title);
  const [startDateObj, setStartDateObj] = useState<Date>(() => {
    const s = new Date(event.startDateTime);
    return new Date(s.getFullYear(), s.getMonth(), s.getDate());
  });
  const [startHour, setStartHour] = useState("09");
  const [startMin, setStartMin] = useState("00");
  const [endHour, setEndHour] = useState("10");
  const [endMin, setEndMin] = useState("00");
  const [allDay, setAllDay] = useState(event.allDay);

  useEffect(() => {
    if (visible) {
      setTitle(event.title);
      setAllDay(event.allDay);
      const s = new Date(event.startDateTime);
      const e = new Date(event.endDateTime);
      setStartDateObj(new Date(s.getFullYear(), s.getMonth(), s.getDate()));
      setStartHour(String(s.getHours()).padStart(2, "0"));
      setStartMin(String(s.getMinutes()).padStart(2, "0"));
      setEndHour(String(e.getHours()).padStart(2, "0"));
      setEndMin(String(e.getMinutes()).padStart(2, "0"));
    }
  }, [visible, event]);

  function buildDateTime() {
    const start = new Date(startDateObj);
    start.setHours(parseInt(startHour), parseInt(startMin), 0, 0);
    const end = new Date(startDateObj);
    end.setHours(parseInt(endHour), parseInt(endMin), 0, 0);
    return { start, end };
  }

  return (
    <AppModal visible={visible} onRequestClose={onClose} dim={0.5}>
      <View className="flex-1 items-center justify-center p-6">
        <View className="bg-surface-container-lowest rounded-2xl p-6 w-full max-w-lg gap-4">
          <View className="flex-row items-center justify-between">
            <Text className="font-headline text-on-surface text-lg">
              {t("aiTask.editEventProposal")}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={24} color="#6b6965" />
            </TouchableOpacity>
          </View>
          <Input
            label={t("cal.eventTitle")}
            value={title}
            onChangeText={setTitle}
          />
          <View>
            <Text className="text-on-surface-variant font-label text-xs uppercase tracking-widest mb-2">
              {t("cal.date")}
            </Text>
            <InlineDatePicker value={startDateObj} onChange={setStartDateObj} />
          </View>
          <View className="flex-row gap-6">
            <View>
              <Text className="text-on-surface-variant font-label text-xs uppercase tracking-widest mb-2">
                {t("cal.start")}
              </Text>
              <View className="flex-row items-center gap-1">
                <TextInput
                  value={startHour}
                  onChangeText={(v) =>
                    setStartHour(v.replace(/\D/g, "").slice(0, 2))
                  }
                  maxLength={2}
                  placeholder="HH"
                  placeholderTextColor="#6b6965"
                  className="bg-surface-container-lowest rounded-xl h-12 w-16 text-center text-on-surface font-body text-base border border-outline-variant"
                  style={NO_OUTLINE}
                />
                <Text className="text-on-surface font-headline text-lg">:</Text>
                <TextInput
                  value={startMin}
                  onChangeText={(v) =>
                    setStartMin(v.replace(/\D/g, "").slice(0, 2))
                  }
                  maxLength={2}
                  placeholder="MM"
                  placeholderTextColor="#6b6965"
                  className="bg-surface-container-lowest rounded-xl h-12 w-16 text-center text-on-surface font-body text-base border border-outline-variant"
                  style={NO_OUTLINE}
                />
              </View>
            </View>
            <View>
              <Text className="text-on-surface-variant font-label text-xs uppercase tracking-widest mb-2">
                {t("cal.end")}
              </Text>
              <View className="flex-row items-center gap-1">
                <TextInput
                  value={endHour}
                  onChangeText={(v) =>
                    setEndHour(v.replace(/\D/g, "").slice(0, 2))
                  }
                  maxLength={2}
                  placeholder="HH"
                  placeholderTextColor="#6b6965"
                  className="bg-surface-container-lowest rounded-xl h-12 w-16 text-center text-on-surface font-body text-base border border-outline-variant"
                  style={NO_OUTLINE}
                />
                <Text className="text-on-surface font-headline text-lg">:</Text>
                <TextInput
                  value={endMin}
                  onChangeText={(v) =>
                    setEndMin(v.replace(/\D/g, "").slice(0, 2))
                  }
                  maxLength={2}
                  placeholder="MM"
                  placeholderTextColor="#6b6965"
                  className="bg-surface-container-lowest rounded-xl h-12 w-16 text-center text-on-surface font-body text-base border border-outline-variant"
                  style={NO_OUTLINE}
                />
              </View>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => setAllDay(!allDay)}
            className="flex-row items-center gap-2"
          >
            <MaterialIcons
              name={allDay ? "check-box" : "check-box-outline-blank"}
              size={22}
              color="#9b9791"
            />
            <Text className="text-on-surface font-body text-sm">
              {t("cal.allDay")}
            </Text>
          </TouchableOpacity>
          <View className="flex-row gap-3 justify-end mt-2">
            <Button
              variant="outline"
              label={t("common.cancel")}
              onPress={onClose}
            />
            <Button
              label={t("aiTask.saveAndAccept")}
              loading={loading}
              onPress={() => {
                const { start, end } = buildDateTime();
                onSave({
                  title,
                  startDateTime: start.toISOString(),
                  endDateTime: end.toISOString(),
                  allDay,
                  status: EventStatus.ACCEPTED,
                });
              }}
            />
          </View>
        </View>
      </View>
    </AppModal>
  );
}

export default function AiTaskScreen() {
  const t = useT();
  const locale = useLocale();
  const [text, setText] = useState("");
  const [configError, setConfigError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const generatePlan = useGenerateAiPlan();
  const activeLlmSettingsId = useLlmSettingsSelectionStore(
    (s) => s.activeLlmSettingsId,
  );
  const llmSelectionHydrated = useLlmSettingsSelectionStore((s) => s.hydrated);
  const hydrateLlmSelection = useLlmSettingsSelectionStore((s) => s.hydrate);
  const pendingPlanningRequest = useAiPlanningRequestStore(
    (s) => s.pendingRequest,
  );
  const consumePlanningRequest = useAiPlanningRequestStore((s) => s.consume);
  const {
    data: proposals,
    isLoading: proposalsLoading,
    isFetching: proposalsFetching,
  } = useAiProposals();
  const { data: categories } = useCategories();
  const { data: statuses } = useTaskStatuses();
  const acceptTask = useAcceptAiTask();
  const rejectTask = useRejectAiTask();
  const acceptEvent = useAcceptAiEvent();
  const rejectEvent = useRejectAiEvent();

  const [previewTask, setPreviewTask] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const router = useRouter();
  const reduced = useReducedMotion();

  // Cards keep their place when the list refetches: accepted ones stay as a
  // receipt, rejected ones until they have folded away.
  const [shown, setShown] = useState<ProposalItem[]>([]);
  const [busy, setBusy] = useState<Record<string, true>>({});
  const [receipts, setReceipts] = useState<Record<string, Receipt>>({});
  const [rejected, setRejected] = useState<Record<string, true>>({});
  const keep = useRef(new Set<string>());
  // Cards from a plan just generated come in one after another.
  const [reveal, setReveal] = useState<Record<string, number>>({});
  const armReveal = useRef(false);

  useEffect(() => {
    if (!proposals) return;
    const fresh: ProposalItem[] = [
      ...proposals.events
        .filter((e) => !e.taskId)
        .map((event) => ({ id: event.eventId, event })),
      ...proposals.tasks.map((task) => ({ id: task.taskId, task })),
    ];
    setShown((prev) => {
      const byId = new Map(fresh.map((i) => [i.id, i]));
      const kept = prev
        .filter((i) => byId.has(i.id) || keep.current.has(i.id))
        .map((i) => byId.get(i.id) ?? i);
      const ids = new Set(kept.map((i) => i.id));
      const added = fresh.filter((i) => !ids.has(i.id));
      if (armReveal.current && added.length) {
        armReveal.current = false;
        setReveal(Object.fromEntries(added.map((i, n) => [i.id, n])));
      }
      return [...kept, ...added];
    });
  }, [proposals]);

  function without<T>(map: Record<string, T>, id: string) {
    const next = { ...map };
    delete next[id];
    return next;
  }

  function settle(id: string, error?: unknown) {
    setBusy((b) => without(b, id));
    if (error) {
      keep.current.delete(id);
      setConfigError(extractApiErrorMessage(error));
    }
  }

  function acceptTaskProposal(taskId: string, data: AcceptAiTaskRequest, onDone?: () => void) {
    keep.current.add(taskId);
    setBusy((b) => ({ ...b, [taskId]: true }));
    acceptTask.mutate(
      { taskId, data },
      {
        onSuccess: () => {
          const due = data.dueDateTime ? parseApiDateTime(data.dueDateTime) : null;
          setReceipts((r) => ({ ...r, [taskId]: { date: due, allDay: false } }));
          settle(taskId);
          onDone?.();
        },
        onError: (e) => settle(taskId, e),
      },
    );
  }

  function acceptEventProposal(eventId: string, data: AcceptAiEventRequest, onDone?: () => void) {
    keep.current.add(eventId);
    setBusy((b) => ({ ...b, [eventId]: true }));
    acceptEvent.mutate(
      { eventId, data },
      {
        onSuccess: () => {
          setReceipts((r) => ({
            ...r,
            [eventId]: { date: parseApiDateTime(data.startDateTime), allDay: data.allDay },
          }));
          settle(eventId);
          onDone?.();
        },
        onError: (e) => settle(eventId, e),
      },
    );
  }

  // Optimistic: the card folds away at once and comes back if the request fails.
  function rejectProposal(item: ProposalItem) {
    keep.current.add(item.id);
    setRejected((r) => ({ ...r, [item.id]: true }));
    const callbacks = {
      onSuccess: () =>
        setTimeout(() => {
          keep.current.delete(item.id);
          setShown((prev) => prev.filter((i) => i.id !== item.id));
        }, 420),
      onError: (e: unknown) => {
        setRejected((r) => without(r, item.id));
        settle(item.id, e);
      },
    };
    if (item.task) rejectTask.mutate(item.id, callbacks);
    else rejectEvent.mutate(item.id, callbacks);
  }

  function receiptFor(id: string) {
    const r = receipts[id];
    if (!r) return null;
    if (!r.date) {
      return {
        label: t("aiTask.addedToTasks"),
        actionLabel: t("aiTask.openTasks"),
        onAction: () => router.push("/tasks"),
      };
    }
    const date = r.date;
    const day = date.toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long" });
    const when = r.allDay
      ? day
      : `${day}, ${date.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })}`;
    return {
      label: t("aiTask.addedToCalendar", { when }),
      actionLabel: t("aiTask.openCalendar"),
      // `highlight` = event id or task id; the calendar pulses the matching event.
      onAction: () =>
        router.push({ pathname: "/calendar", params: { date: dateKey(date), highlight: id } }),
    };
  }

  useEffect(() => {
    if (!proposals) return;
    if (previewTask) {
      const current = proposals.tasks.find(
        (task) => task.taskId === previewTask.taskId,
      );
      if (current && current !== previewTask) setPreviewTask(current);
    }
    if (editingTask) {
      const current = proposals.tasks.find(
        (task) => task.taskId === editingTask.taskId,
      );
      if (current && current !== editingTask) setEditingTask(current);
    }
  }, [proposals, previewTask, editingTask]);

  const categoryMap = new Map((categories ?? []).map((c) => [c.categoryId, c]));

  async function generateFromText(input: string) {
    const normalized = input.trim();
    if (!normalized) return;
    if (normalized.length > MAX_AI_PLAN_TEXT_LENGTH) {
      setConfigError(
        t("aiTask.textTooLong", { max: MAX_AI_PLAN_TEXT_LENGTH }),
      );
      return;
    }
    if (isListening) toggleSpeech();
    setConfigError(null);
    // Receipts belong to the previous plan.
    setShown((prev) => prev.filter((i) => !keep.current.has(i.id)));
    keep.current.clear();
    setReceipts({});
    setRejected({});
    setReveal({});
    armReveal.current = true;
    try {
      await generatePlan.mutateAsync({
        text: normalized,
        ...(isOrdovitaAiSelection(activeLlmSettingsId)
          ? {}
          : { llmSettingsId: activeLlmSettingsId! }),
      });
      setText("");
    } catch (e) {
      armReveal.current = false;
      setConfigError(extractApiErrorMessage(e));
    }
  }

  function handleGenerate() {
    if (text.trim().length < 10) return;
    void generateFromText(text);
  }

  useEffect(() => {
    if (pendingPlanningRequest && !llmSelectionHydrated) {
      void hydrateLlmSelection();
    }
  }, [hydrateLlmSelection, llmSelectionHydrated, pendingPlanningRequest]);

  useEffect(() => {
    if (
      !llmSelectionHydrated ||
      !pendingPlanningRequest ||
      generatePlan.isPending
    ) {
      return;
    }

    const request = consumePlanningRequest();
    if (!request) return;
    setText(request.text);
    void generateFromText(request.text);
    // The request is synchronously consumed before generation, which prevents
    // duplicate calls when effects are replayed in development.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeLlmSettingsId,
    consumePlanningRequest,
    generatePlan.isPending,
    llmSelectionHydrated,
    pendingPlanningRequest,
  ]);

  const canGenerate =
    text.trim().length >= 10 &&
    text.length <= MAX_AI_PLAN_TEXT_LENGTH &&
    !generatePlan.isPending;

  const speechSupported =
    Platform.OS === "web" &&
    typeof window !== "undefined" &&
    (!!(window as any).SpeechRecognition ||
      !!(window as any).webkitSpeechRecognition);

  const listeningRef = useRef(false);
  const textRef = useRef(text);
  textRef.current = text;

  function toggleSpeech() {
    if (isListening && recognitionRef.current) {
      listeningRef.current = false;
      recognitionRef.current.stop();
      setIsListening(false);
      recognitionRef.current = null;
      return;
    }
    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SR) return;

    function createRecognition() {
      const r = new SR();
      r.lang = localeFor(useLanguageStore.getState().lang);
      r.interimResults = true;
      r.continuous = true;
      let finalTranscript = textRef.current;
      r.onresult = (event: any) => {
        let interim = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const t = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += (finalTranscript ? " " : "") + t;
          } else {
            interim += t;
          }
        }
        setText(finalTranscript + (interim ? " " + interim : ""));
        textRef.current = finalTranscript;
      };
      r.onerror = (e: any) => {
        console.warn("[SpeechRecognition] error:", e.error, e.message);
        if (e.error === "aborted" || e.error === "no-speech") return;
        listeningRef.current = false;
        setIsListening(false);
        recognitionRef.current = null;
      };
      r.onend = () => {
        console.log(
          "[SpeechRecognition] onend, listeningRef:",
          listeningRef.current,
        );
        if (listeningRef.current) {
          try {
            const next = createRecognition();
            recognitionRef.current = next;
            next.start();
          } catch {
            listeningRef.current = false;
            setIsListening(false);
            recognitionRef.current = null;
          }
        } else {
          setIsListening(false);
          recognitionRef.current = null;
        }
      };
      return r;
    }

    // Request mic permission explicitly first (needed for Chrome/Arc)
    async function startWithPermission() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        // Stop the tracks — we just needed the permission grant
        stream.getTracks().forEach((t) => t.stop());
      } catch (err) {
        console.warn("[SpeechRecognition] mic permission denied:", err);
        setIsListening(false);
        return;
      }
      try {
        const recognition = createRecognition();
        recognitionRef.current = recognition;
        listeningRef.current = true;
        recognition.start();
        setIsListening(true);
      } catch (err) {
        console.warn("[SpeechRecognition] start failed:", err);
        setIsListening(false);
      }
    }

    startWithPermission();
  }

  const pendingCount = shown.filter((i) => !receipts[i.id] && !rejected[i.id]).length;

  const isGenerating = generatePlan.isPending;
  const { width } = useWindowDimensions();
  const isWide = Platform.OS === "web" && width >= 768;
  const isXl = Platform.OS === "web" && width >= 1280;
  const proposalCardWidth = isXl ? "31.5%" : isWide ? "48%" : "100%";

  return (
    <PageLayout>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ gap: 24, paddingBottom: 32 }}
        >
          <View className="gap-3">
            <View className="flex-row items-center gap-1.5 self-start px-2.5 py-1 rounded-sm border border-outline-variant bg-surface">
              <MaterialIcons name="auto-awesome" size={13} color="#9b9791" />
              <Text className="text-text-tertiary font-label text-xs">
                {t("aiTask.badge")}
              </Text>
            </View>
            <Text className="text-on-surface font-display text-headline-md">
              {t("aiTask.heading")}
            </Text>
            <Text className="text-on-surface-variant font-body text-body-md">
              {t("aiTask.subheading")}
            </Text>
          </View>

          {configError ? (
            <View className="bg-error-container rounded-xl px-4 py-3">
              <Text className="text-on-error-container font-body text-sm">
                {configError}
              </Text>
            </View>
          ) : null}

          <View className="bg-surface rounded-input border border-outline-variant p-5 gap-4">
            <View className="flex-row items-center gap-2">
              <MaterialIcons name="auto-awesome" size={16} color="#9b9791" />
              <Text className="text-on-surface font-display text-title-lg">
                {t("aiTask.promptTitle")}
              </Text>
            </View>
            <TextInput
              className="bg-surface-container-low rounded-md text-on-surface font-body text-base border border-outline-variant"
              style={[
                {
                  minHeight: 120,
                  padding: 16,
                  lineHeight: 22,
                  borderColor: isListening ? "#C0392B" : undefined,
                  opacity: generatePlan.isPending ? 0.5 : 1,
                },
                NO_OUTLINE,
              ]}
              placeholder={t("aiTask.promptPlaceholder")}
              placeholderTextColor="#9b9791"
              multiline
              textAlignVertical="top"
              value={text}
              maxLength={MAX_AI_PLAN_TEXT_LENGTH}
              onChangeText={setText}
              editable={!generatePlan.isPending}
              onKeyPress={(e: any) => {
                if (e.nativeEvent.key === "Enter" && !e.nativeEvent.shiftKey) {
                  e.preventDefault();
                  handleGenerate();
                }
              }}
            />
            <View className="flex-row items-center justify-between gap-2 flex-wrap">
              <View className="flex-row items-center gap-2">
                <AiChatConfigButton disabled={generatePlan.isPending} />
                <AiLimitInfo />
              </View>
              <View className="flex-row items-center gap-2">
                {speechSupported && (
                  <TouchableOpacity
                    onPress={toggleSpeech}
                    disabled={generatePlan.isPending}
                    className="w-10 h-10 items-center justify-center rounded-xl bg-surface-container-lowest"
                    style={{
                      opacity: generatePlan.isPending ? 0.4 : 1,
                      borderWidth: 1,
                      borderColor: isListening ? "#C0392B" : UI.borderHover,
                    }}
                  >
                    <MaterialIcons
                      name={isListening ? "stop" : "mic"}
                      size={18}
                      color={isListening ? "#C0392B" : "#6b6965"}
                    />
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={handleGenerate}
                  disabled={!canGenerate}
                  className="flex-row items-center gap-1.5 bg-action px-5 py-2.5 rounded-xl"
                  style={{ opacity: canGenerate ? 1 : 0.45 }}
                >
                  <MaterialIcons name="north" size={16} color="#f0f0f0" />
                  <Text className="text-on-action font-headline text-sm">
                    {generatePlan.isPending ? "…" : t("aiTask.generate")}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            {isListening && (
              <View className="flex-row items-center gap-2">
                <View className="w-2 h-2 rounded-full bg-error" />
                <Text className="text-error font-label text-xs">
                  {t("aiTask.listening")}
                </Text>
              </View>
            )}
          </View>

          {isGenerating && <AiLoadingAnimation />}

          {!isGenerating && shown.length > 0 && (
            <View className="gap-5">
              <View className="flex-row items-start justify-between gap-4">
                <View className="flex-1">
                  <Text className="text-on-surface font-headline text-title-lg">
                    {t("aiTask.proposalsTitle")}
                  </Text>
                  <Text className="text-on-surface-variant font-body text-body-md mt-1">
                    {t("aiTask.proposalsDesc")}
                  </Text>
                </View>
                {pendingCount > 0 && (
                  <View className="px-2.5 py-1 rounded-full border border-outline-variant bg-surface-container-lowest">
                    <Text className="text-on-surface-variant font-label text-xs">
                      {t("aiTask.pendingCount", { count: pendingCount })}
                    </Text>
                  </View>
                )}
              </View>

              <View className="flex-row flex-wrap gap-4">
                {shown.map((item) => {
                  let card;
                  if (item.event) {
                    const event = item.event;
                    const start = new Date(event.startDateTime);
                    const end = new Date(event.endDateTime);
                    const hhmm = {
                      hour: "2-digit",
                      minute: "2-digit",
                    } as const;
                    const duration = `${start.toLocaleTimeString(locale, hhmm)} – ${end.toLocaleTimeString(locale, hhmm)}`;
                    const dueDate = start.toLocaleDateString(locale, {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    });
                    card = (
                      <AiProposedCard
                        type="event"
                        title={event.title}
                        duration={duration}
                        dueDate={dueDate}
                        onDismiss={() => rejectProposal(item)}
                        onEdit={() => setEditingEvent(event)}
                        onAccept={() =>
                          acceptEventProposal(event.eventId, {
                            title: event.title,
                            startDateTime: event.startDateTime,
                            endDateTime: event.endDateTime,
                            allDay: event.allDay,
                            status: EventStatus.ACCEPTED,
                          })
                        }
                        loading={!!busy[item.id]}
                        receipt={receiptFor(item.id)}
                      />
                    );
                  } else {
                    const task = item.task;
                    card = (
                      <AiProposedCard
                        type="task"
                        title={task.title}
                        description={task.description ?? undefined}
                        priority={task.priority}
                        steps={task.steps}
                        duration={
                          task.estimatedDuration > 0
                            ? formatDuration(task.estimatedDuration)
                            : undefined
                        }
                        dueDate={
                          task.dueDateTime
                            ? new Date(task.dueDateTime).toLocaleDateString(
                                locale,
                                {
                                  day: "numeric",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )
                            : undefined
                        }
                        onDismiss={() => rejectProposal(item)}
                        onPreview={() => setPreviewTask(task)}
                        onEdit={() => setEditingTask(task)}
                        onAccept={() =>
                          acceptTaskProposal(task.taskId, {
                            title: task.title,
                            description: task.description,
                            priority: task.priority,
                            statusId: task.statusId,
                            categoryId: task.categoryId ?? undefined,
                            estimatedDuration: task.estimatedDuration,
                            dueDateTime: normalizeDueDateTime(task.dueDateTime),
                          })
                        }
                        loading={!!busy[item.id]}
                        receipt={receiptFor(item.id)}
                      />
                    );
                  }
                  return (
                    <View key={item.id} style={{ width: proposalCardWidth }}>
                      <Reveal
                        animate={reveal[item.id] !== undefined}
                        delay={Math.min(reveal[item.id] ?? 0, 8) * 70}
                      >
                        <Fold open={!rejected[item.id]} reduceMotion={reduced}>
                          {card}
                        </Fold>
                      </Reveal>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {shown.length === 0 && !proposalsLoading && !isGenerating && (
            <View className="items-center py-8 gap-2">
              <MaterialIcons name="auto-awesome" size={32} color="#cccccc" />
              <Text className="text-on-surface-variant font-body text-body-md text-center">
                {t("aiTask.emptyProposals")}
              </Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <TaskDetailModal
        task={previewTask}
        visible={!!previewTask}
        onClose={() => setPreviewTask(null)}
        categories={categories ?? []}
        statuses={statuses ?? []}
        showDelete={false}
        rejectAction={{
          label: t("common.reject"),
          onPress: () => {
            if (!previewTask) return;
            rejectProposal({ id: previewTask.taskId, task: previewTask });
            setPreviewTask(null);
          },
        }}
        acceptAction={{
          label: t("common.accept"),
          loading: !!previewTask && !!busy[previewTask.taskId],
          onPress: () => {
            if (!previewTask) return;
            acceptTaskProposal(
              previewTask.taskId,
              {
                title: previewTask.title,
                description: previewTask.description,
                priority: previewTask.priority,
                statusId: previewTask.statusId,
                categoryId: previewTask.categoryId ?? undefined,
                estimatedDuration: previewTask.estimatedDuration,
                dueDateTime: normalizeDueDateTime(previewTask.dueDateTime),
              },
              () => setPreviewTask(null),
            );
          },
        }}
      />

      <TaskDetailModal
        task={editingTask}
        visible={!!editingTask}
        onClose={() => setEditingTask(null)}
        categories={categories ?? []}
        statuses={statuses ?? []}
        forceEdit
        showDelete={false}
        saveLabel={t("aiTask.saveAndAccept")}
        saveLoading={!!editingTask && !!busy[editingTask.taskId]}
        onSaveCustom={(data) => {
          if (!editingTask) return;
          acceptTaskProposal(editingTask.taskId, data, () => setEditingTask(null));
        }}
      />

      {editingEvent && (
        <EditEventModal
          event={editingEvent}
          visible={!!editingEvent}
          onClose={() => setEditingEvent(null)}
          loading={!!busy[editingEvent.eventId]}
          onSave={(data) => {
            acceptEventProposal(editingEvent.eventId, data, () => setEditingEvent(null));
          }}
        />
      )}
    </PageLayout>
  );
}
