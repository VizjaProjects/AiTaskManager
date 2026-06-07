import {
  View,
  Text,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Modal,
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
import type { Task, CalendarEvent } from "@/lib/types";
import { EventStatus } from "@/lib/types";
import { formatDuration } from "@/lib/utils";

const NO_OUTLINE =
  Platform.OS === "web" ? ({ outlineStyle: "none" } as const) : undefined;

function AiLoadingAnimation() {
  const pulse1 = useRef(new Animated.Value(0.3)).current;
  const pulse2 = useRef(new Animated.Value(0.3)).current;
  const pulse3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    function animate(val: Animated.Value, delay: number) {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(val, { toValue: 1, duration: 600, useNativeDriver: true }),
          Animated.timing(val, { toValue: 0.3, duration: 600, useNativeDriver: true }),
        ]),
      );
    }
    const a1 = animate(pulse1, 0);
    const a2 = animate(pulse2, 200);
    const a3 = animate(pulse3, 400);
    a1.start();
    a2.start();
    a3.start();
    return () => { a1.stop(); a2.stop(); a3.stop(); };
  }, [pulse1, pulse2, pulse3]);

  return (
    <View className="rounded-2xl bg-surface-container-lowest border border-outline-variant p-8 items-center gap-4">
      <View className="flex-row items-center gap-2">
        {[pulse1, pulse2, pulse3].map((p, i) => (
          <Animated.View
            key={i}
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: "#111111",
              opacity: p,
            }}
          />
        ))}
      </View>
      <Text className="text-on-surface font-headline text-body-md">
        Analyzing your plan...
      </Text>
      <Text className="text-on-surface-variant font-body text-sm text-center">
        Generating tasks and events. This may take a few seconds.
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
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/50 items-center justify-center p-6">
        <View className="bg-surface-container-lowest rounded-2xl p-6 w-full max-w-lg gap-4">
          <View className="flex-row items-center justify-between">
            <Text className="font-headline text-on-surface text-lg">
              Edytuj propozycję wydarzenia
            </Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={24} color="#777587" />
            </TouchableOpacity>
          </View>
          <Input label="Tytuł" value={title} onChangeText={setTitle} />
          <View>
            <Text className="text-on-surface-variant font-label text-xs uppercase tracking-widest mb-2">
              Data
            </Text>
            <InlineDatePicker value={startDateObj} onChange={setStartDateObj} />
          </View>
          <View className="flex-row gap-6">
            <View>
              <Text className="text-on-surface-variant font-label text-xs uppercase tracking-widest mb-2">
                Start
              </Text>
              <View className="flex-row items-center gap-1">
                <TextInput
                  value={startHour}
                  onChangeText={(v) =>
                    setStartHour(v.replace(/\D/g, "").slice(0, 2))
                  }
                  maxLength={2}
                  placeholder="HH"
                  placeholderTextColor="#777587"
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
                  placeholderTextColor="#777587"
                  className="bg-surface-container-lowest rounded-xl h-12 w-16 text-center text-on-surface font-body text-base border border-outline-variant"
                  style={NO_OUTLINE}
                />
              </View>
            </View>
            <View>
              <Text className="text-on-surface-variant font-label text-xs uppercase tracking-widest mb-2">
                Koniec
              </Text>
              <View className="flex-row items-center gap-1">
                <TextInput
                  value={endHour}
                  onChangeText={(v) =>
                    setEndHour(v.replace(/\D/g, "").slice(0, 2))
                  }
                  maxLength={2}
                  placeholder="HH"
                  placeholderTextColor="#777587"
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
                  placeholderTextColor="#777587"
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
              color="#9ca3af"
            />
            <Text className="text-on-surface font-body text-sm">
              Cały dzień
            </Text>
          </TouchableOpacity>
          <View className="flex-row gap-3 justify-end mt-2">
            <Button variant="outline" label="Anuluj" onPress={onClose} />
            <Button
              label="Zapisz i akceptuj"
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
    </Modal>
  );
}

export default function AiTaskScreen() {
  const [text, setText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const generatePlan = useGenerateAiPlan();
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

  const categoryMap = new Map((categories ?? []).map((c) => [c.categoryId, c]));

  async function handleGenerate() {
    if (text.length < 10) return;
    if (isListening) toggleSpeech();
    try {
      await generatePlan.mutateAsync({ text });
      setText("");
    } catch {
      // keep text on error so user can retry
    }
  }

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
      r.lang = "pl-PL";
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

  const taskCount = proposals?.tasks?.length ?? 0;
  const manualEvents = (proposals?.events ?? []).filter((e) => !e.taskId);
  const eventCount = manualEvents.length;
  const totalCount = taskCount + eventCount;

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
            <View className="flex-row items-center gap-1.5 self-start px-3 py-1 rounded-full border border-outline-variant bg-surface-container-lowest">
              <MaterialIcons name="auto-awesome" size={13} color="#9ca3af" />
              <Text className="text-on-surface-variant font-label text-xs">
                AI Assistant
              </Text>
            </View>
            <Text className="text-on-surface font-headline text-headline-md">
              AI Task Creation
            </Text>
            <Text className="text-on-surface-variant font-body text-body-md">
              Describe your day in natural language — AI will suggest tasks and events.
            </Text>
          </View>

          <View className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-5 gap-4">
            <View className="flex-row items-center gap-2">
              <MaterialIcons name="auto-awesome" size={16} color="#9ca3af" />
              <Text className="text-on-surface font-headline text-title-lg">
                What would you like to plan?
              </Text>
            </View>
            <View className="relative">
              <TextInput
                className="bg-surface-container-lowest rounded-xl p-4 text-on-surface font-body text-base border border-outline-variant"
                style={[
                  {
                    minHeight: 140,
                    paddingRight: 16,
                    paddingBottom: 56,
                    borderColor: isListening ? "#ef4444" : undefined,
                    opacity: generatePlan.isPending ? 0.5 : 1,
                  },
                  NO_OUTLINE,
                ]}
                placeholder="e.g. Schedule a team sync tomorrow at 2 PM, prepare the Q3 report by Friday, and remind me to call Sarah."
                placeholderTextColor="#9ca3af"
                multiline
                textAlignVertical="top"
                value={text}
                onChangeText={setText}
                editable={!generatePlan.isPending}
                onKeyPress={(e: any) => {
                  if (
                    e.nativeEvent.key === "Enter" &&
                    !e.nativeEvent.shiftKey
                  ) {
                    e.preventDefault();
                    handleGenerate();
                  }
                }}
              />
              <View className="absolute bottom-3 right-3 flex-row items-center gap-2">
                {speechSupported && (
                  <TouchableOpacity
                    onPress={toggleSpeech}
                    disabled={generatePlan.isPending}
                    className="w-9 h-9 items-center justify-center rounded-full border border-outline-variant bg-surface-container-lowest"
                    style={{ opacity: generatePlan.isPending ? 0.4 : 1 }}
                  >
                    <MaterialIcons
                      name={isListening ? "stop" : "mic"}
                      size={18}
                      color={isListening ? "#ef4444" : "#6b7280"}
                    />
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={handleGenerate}
                  disabled={text.length < 10 || generatePlan.isPending}
                  className="flex-row items-center gap-1.5 bg-action px-4 py-2.5 rounded-xl"
                  style={{ opacity: text.length < 10 ? 0.45 : 1 }}
                >
                  <MaterialIcons name="north" size={16} color="#f0f0f0" />
                  <Text className="text-on-action font-headline text-sm">
                    {generatePlan.isPending ? "..." : "Generate"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            {isListening && (
              <View className="flex-row items-center gap-2">
                <View className="w-2 h-2 rounded-full bg-error" />
                <Text className="text-error font-label text-xs">Listening...</Text>
              </View>
            )}
          </View>

          {isGenerating && <AiLoadingAnimation />}

          {!isGenerating && totalCount > 0 && (
            <View className="gap-5">
              <View className="flex-row items-start justify-between gap-4">
                <View className="flex-1">
                  <Text className="text-on-surface font-headline text-title-lg">
                    AI Proposals
                  </Text>
                  <Text className="text-on-surface-variant font-body text-body-md mt-1">
                    Review and accept the generated items.
                  </Text>
                </View>
                <View className="px-2.5 py-1 rounded-full border border-outline-variant bg-surface-container-lowest">
                  <Text className="text-on-surface-variant font-label text-xs">
                    {totalCount} pending
                  </Text>
                </View>
              </View>

              <View className="flex-row flex-wrap gap-4">
                {manualEvents.map((event) => {
                  const start = new Date(event.startDateTime);
                  const end = new Date(event.endDateTime);
                  const duration = `${start.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" })} – ${end.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" })}`;
                  const dueDate = start.toLocaleDateString("pl-PL", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                  return (
                    <View key={event.eventId} style={{ width: proposalCardWidth }}>
                      <AiProposedCard
                        type="event"
                        title={event.title}
                        duration={duration}
                        dueDate={dueDate}
                        onDismiss={() => rejectEvent.mutate(event.eventId)}
                        onEdit={() => setEditingEvent(event)}
                        onAccept={() =>
                          acceptEvent.mutate({
                            eventId: event.eventId,
                            data: {
                              title: event.title,
                              startDateTime: event.startDateTime,
                              endDateTime: event.endDateTime,
                              allDay: event.allDay,
                              status: EventStatus.ACCEPTED,
                            },
                          })
                        }
                        loading={acceptEvent.isPending}
                      />
                    </View>
                  );
                })}

                {proposals!.tasks.map((task) => (
                  <View key={task.taskId} style={{ width: proposalCardWidth }}>
                    <AiProposedCard
                      type="task"
                      title={task.title}
                      description={task.description ?? undefined}
                      priority={task.priority}
                      duration={
                        task.estimatedDuration > 0
                          ? formatDuration(task.estimatedDuration)
                          : undefined
                      }
                      dueDate={
                        task.dueDateTime
                          ? new Date(task.dueDateTime).toLocaleDateString("pl-PL", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : undefined
                      }
                      onDismiss={() => rejectTask.mutate(task.taskId)}
                      onPreview={() => setPreviewTask(task)}
                      onEdit={() => setEditingTask(task)}
                      onAccept={() =>
                        acceptTask.mutate({
                          taskId: task.taskId,
                          data: {
                            title: task.title,
                            description: task.description,
                            priority: task.priority,
                            statusId: task.statusId,
                            categoryId: task.categoryId ?? undefined,
                            estimatedDuration: task.estimatedDuration,
                            dueDateTime: task.dueDateTime ?? undefined,
                          },
                        })
                      }
                      loading={acceptTask.isPending}
                    />
                  </View>
                ))}
              </View>
            </View>
          )}

          {totalCount === 0 && !proposalsLoading && !isGenerating && (
            <View className="items-center py-8 gap-2">
              <MaterialIcons name="auto-awesome" size={32} color="#cccccc" />
              <Text className="text-on-surface-variant font-body text-body-md text-center">
                No proposals yet. Describe your plan above and tap Generate.
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
          label: "Odrzuć",
          onPress: () => {
            if (!previewTask) return;
            rejectTask.mutate(previewTask.taskId, {
              onSuccess: () => setPreviewTask(null),
            });
          },
        }}
        acceptAction={{
          label: "Akceptuj",
          loading: acceptTask.isPending,
          onPress: () => {
            if (!previewTask) return;
            acceptTask.mutate(
              {
                taskId: previewTask.taskId,
                data: {
                  title: previewTask.title,
                  description: previewTask.description,
                  priority: previewTask.priority,
                  statusId: previewTask.statusId,
                  categoryId: previewTask.categoryId ?? undefined,
                  estimatedDuration: previewTask.estimatedDuration,
                  dueDateTime: previewTask.dueDateTime ?? undefined,
                },
              },
              { onSuccess: () => setPreviewTask(null) },
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
        saveLabel="Zapisz i akceptuj"
        saveLoading={acceptTask.isPending}
        onSaveCustom={(data) => {
          if (!editingTask) return;
          acceptTask.mutate(
            { taskId: editingTask.taskId, data },
            { onSuccess: () => setEditingTask(null) },
          );
        }}
      />

      {editingEvent && (
        <EditEventModal
          event={editingEvent}
          visible={!!editingEvent}
          onClose={() => setEditingEvent(null)}
          loading={acceptEvent.isPending}
          onSave={(data) => {
            acceptEvent.mutate(
              { eventId: editingEvent.eventId, data },
              { onSuccess: () => setEditingEvent(null) },
            );
          }}
        />
      )}
    </PageLayout>
  );
}
