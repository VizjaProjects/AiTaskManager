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
} from "react-native";
import { useState, useEffect, useRef } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { PageLayout } from "@/components/organisms";
import {
  Button,
  Card,
  EmptyState,
  Input,
  InlineDatePicker,
} from "@/components/atoms";
import { PriorityBadge, ColorBadge } from "@/components/atoms";
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
import type { Task, CalendarEvent, Category, TaskStatus } from "@/lib/types";
import { TaskPriority, EventStatus, ProposedBy } from "@/lib/types";
import { PRIORITY_COLORS, formatDateTime, formatDuration } from "@/lib/utils";

function AiLoadingAnimation() {
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
    <Card variant="surface">
      <View className="items-center gap-4 py-8">
        <View className="flex-row items-center gap-3">
          <Animated.View
            style={{
              width: 12,
              height: 12,
              borderRadius: 6,
              backgroundColor: "#4d41df",
              opacity: pulse1,
            }}
          />
          <Animated.View
            style={{
              width: 12,
              height: 12,
              borderRadius: 6,
              backgroundColor: "#006b58",
              opacity: pulse2,
            }}
          />
          <Animated.View
            style={{
              width: 12,
              height: 12,
              borderRadius: 6,
              backgroundColor: "#f59e0b",
              opacity: pulse3,
            }}
          />
        </View>
        <Text className="text-on-surface font-headline text-base">
          AI analizuje Twój plan...
        </Text>
        <Text className="text-on-surface-variant font-body text-sm text-center">
          Generowanie zadań i wydarzeń. To może potrwać kilka sekund.
        </Text>
      </View>
    </Card>
  );
}

function EditTaskModal({
  task,
  visible,
  onClose,
  onSave,
  loading,
  categories,
  statuses,
}: {
  task: Task;
  visible: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  loading: boolean;
  categories: Category[];
  statuses: TaskStatus[];
}) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [priority, setPriority] = useState(task.priority);
  const [statusId, setStatusId] = useState(task.statusId);
  const [categoryId, setCategoryId] = useState<string | null>(task.categoryId);
  const [estimatedDuration, setEstimatedDuration] = useState(
    task.estimatedDuration > 0 ? String(task.estimatedDuration) : "",
  );
  const [dueDate, setDueDate] = useState(task.dueDateTime ?? "");
  const [dueDateObj, setDueDateObj] = useState<Date>(() =>
    task.dueDateTime ? new Date(task.dueDateTime) : new Date(),
  );
  const [showDuePicker, setShowDuePicker] = useState(false);
  const [dueHour, setDueHour] = useState(() => {
    if (task.dueDateTime)
      return String(new Date(task.dueDateTime).getHours()).padStart(2, "0");
    return "12";
  });
  const [dueMin, setDueMin] = useState(() => {
    if (task.dueDateTime)
      return String(new Date(task.dueDateTime).getMinutes()).padStart(2, "0");
    return "00";
  });

  useEffect(() => {
    if (visible) {
      setTitle(task.title);
      setDescription(task.description);
      setPriority(task.priority);
      setStatusId(task.statusId);
      setCategoryId(task.categoryId);
      setEstimatedDuration(
        task.estimatedDuration > 0 ? String(task.estimatedDuration) : "",
      );
      setDueDate(task.dueDateTime ?? "");
      setDueDateObj(task.dueDateTime ? new Date(task.dueDateTime) : new Date());
      setShowDuePicker(false);
      if (task.dueDateTime) {
        setDueHour(
          String(new Date(task.dueDateTime).getHours()).padStart(2, "0"),
        );
        setDueMin(
          String(new Date(task.dueDateTime).getMinutes()).padStart(2, "0"),
        );
      } else {
        setDueHour("12");
        setDueMin("00");
      }
    }
  }, [visible, task]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/50 items-center justify-center p-6">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
          showsVerticalScrollIndicator={false}
        >
          <View className="bg-surface-container-lowest rounded-2xl p-6 w-full max-w-lg gap-4 self-center">
            <View className="flex-row items-center justify-between">
              <Text className="font-headline text-on-surface text-lg">
                Edytuj propozycję zadania
              </Text>
              <TouchableOpacity onPress={onClose}>
                <MaterialIcons name="close" size={24} color="#777587" />
              </TouchableOpacity>
            </View>
            <Input label="Tytuł" value={title} onChangeText={setTitle} />
            <View className="w-full">
              <Text className="text-on-surface-variant font-label text-xs uppercase tracking-widest mb-2">
                Opis
              </Text>
              <TextInput
                className="bg-surface-container-low rounded-xl p-4 text-on-surface font-body text-base"
                style={{ minHeight: 120 }}
                multiline
                textAlignVertical="top"
                value={description}
                onChangeText={setDescription}
                placeholderTextColor="#777587"
              />
            </View>
            <View className="w-full">
              <Text className="text-on-surface-variant font-label text-xs uppercase tracking-widest mb-2">
                Priorytet
              </Text>
              <View className="flex-row gap-2 flex-wrap">
                {Object.values(TaskPriority).map((p) => (
                  <TouchableOpacity
                    key={p}
                    onPress={() => setPriority(p)}
                    className={`px-3 py-1.5 rounded-full border ${
                      priority === p
                        ? "border-transparent"
                        : "border-outline-variant"
                    }`}
                    style={
                      priority === p
                        ? { backgroundColor: PRIORITY_COLORS[p] }
                        : undefined
                    }
                  >
                    <Text
                      className={`text-xs font-label ${
                        priority === p
                          ? "text-white"
                          : "text-on-surface-variant"
                      }`}
                    >
                      {p}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View className="w-full">
              <Text className="text-on-surface-variant font-label text-xs uppercase tracking-widest mb-2">
                Status
              </Text>
              <View className="flex-row gap-2 flex-wrap">
                {statuses.map((s) => (
                  <TouchableOpacity
                    key={s.statusId}
                    onPress={() => setStatusId(s.statusId)}
                    className={`px-3 py-1.5 rounded-full border ${
                      statusId === s.statusId
                        ? "border-transparent"
                        : "border-outline-variant"
                    }`}
                    style={
                      statusId === s.statusId
                        ? { backgroundColor: s.color }
                        : undefined
                    }
                  >
                    <Text
                      className={`text-xs font-label ${
                        statusId === s.statusId
                          ? "text-white"
                          : "text-on-surface-variant"
                      }`}
                    >
                      {s.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View className="w-full">
              <Text className="text-on-surface-variant font-label text-xs uppercase tracking-widest mb-2">
                Kategoria
              </Text>
              <View className="flex-row gap-2 flex-wrap">
                <TouchableOpacity
                  onPress={() => setCategoryId(null)}
                  className={`px-3 py-1.5 rounded-full border ${
                    !categoryId
                      ? "border-transparent bg-outline-variant"
                      : "border-outline-variant"
                  }`}
                >
                  <Text className="text-xs font-label text-on-surface-variant">
                    Brak
                  </Text>
                </TouchableOpacity>
                {categories.map((c) => (
                  <TouchableOpacity
                    key={c.categoryId}
                    onPress={() => setCategoryId(c.categoryId)}
                    className={`flex-row items-center gap-1.5 px-3 py-1.5 rounded-full border ${
                      categoryId === c.categoryId
                        ? "border-transparent"
                        : "border-outline-variant"
                    }`}
                    style={
                      categoryId === c.categoryId
                        ? { backgroundColor: `${c.color}20` }
                        : undefined
                    }
                  >
                    <View
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: c.color }}
                    />
                    <Text
                      className="text-xs font-label"
                      style={
                        categoryId === c.categoryId
                          ? { color: c.color }
                          : undefined
                      }
                    >
                      {c.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <Input
              label="Czas trwania (min)"
              value={estimatedDuration}
              onChangeText={setEstimatedDuration}
              placeholder="np. 45"
              keyboardType="numeric"
            />
            <View className="w-full">
              <TouchableOpacity
                onPress={() => setShowDuePicker(!showDuePicker)}
                className="flex-row items-center justify-between bg-surface-container-low rounded-xl px-4 py-3"
              >
                <View>
                  <Text className="text-on-surface-variant font-label text-xs uppercase tracking-widest">
                    Termin
                  </Text>
                  <Text className="text-on-surface font-body text-sm mt-1">
                    {dueDate
                      ? (() => {
                          const d = new Date(dueDate);
                          return `${d.toLocaleDateString("pl-PL", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })} ${dueHour}:${dueMin}`;
                        })()
                      : "Brak terminu"}
                  </Text>
                </View>
                <MaterialIcons
                  name={showDuePicker ? "expand-less" : "calendar-today"}
                  size={20}
                  color="#777587"
                />
              </TouchableOpacity>
              {showDuePicker && (
                <View className="mt-2">
                  <InlineDatePicker
                    value={dueDateObj}
                    onChange={(d) => {
                      setDueDateObj(d);
                      setDueDate(d.toISOString());
                    }}
                  />
                  <View className="flex-row items-center gap-2 mt-3">
                    <Text className="text-on-surface-variant font-label text-xs uppercase tracking-widest">
                      Godzina
                    </Text>
                    <TextInput
                      value={dueHour}
                      onChangeText={(v) =>
                        setDueHour(v.replace(/\D/g, "").slice(0, 2))
                      }
                      maxLength={2}
                      placeholder="HH"
                      placeholderTextColor="#777587"
                      keyboardType="numeric"
                      className="bg-surface-container-low rounded-xl h-10 w-14 text-center text-on-surface font-body text-sm"
                    />
                    <Text className="text-on-surface font-headline text-base">
                      :
                    </Text>
                    <TextInput
                      value={dueMin}
                      onChangeText={(v) =>
                        setDueMin(v.replace(/\D/g, "").slice(0, 2))
                      }
                      maxLength={2}
                      placeholder="MM"
                      placeholderTextColor="#777587"
                      keyboardType="numeric"
                      className="bg-surface-container-low rounded-xl h-10 w-14 text-center text-on-surface font-body text-sm"
                    />
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      setDueDate("");
                      setShowDuePicker(false);
                    }}
                    className="mt-2 self-start"
                  >
                    <Text className="text-error font-label text-xs">
                      Usuń termin
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
            <View className="flex-row gap-3 justify-end mt-2">
              <Button variant="outline" label="Anuluj" onPress={onClose} />
              <Button
                label="Zapisz i akceptuj"
                loading={loading}
                onPress={() =>
                  onSave({
                    title,
                    description,
                    priority,
                    statusId,
                    categoryId: categoryId ?? undefined,
                    estimatedDuration: estimatedDuration
                      ? parseInt(estimatedDuration, 10)
                      : undefined,
                    dueDateTime: dueDate
                      ? new Date(
                          dueDateObj.getFullYear(),
                          dueDateObj.getMonth(),
                          dueDateObj.getDate(),
                          parseInt(dueHour) || 0,
                          parseInt(dueMin) || 0,
                        ).toISOString()
                      : undefined,
                  })
                }
              />
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
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
                  className="bg-surface-container-low rounded-xl h-12 w-16 text-center text-on-surface font-body text-base"
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
                  className="bg-surface-container-low rounded-xl h-12 w-16 text-center text-on-surface font-body text-base"
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
                  className="bg-surface-container-low rounded-xl h-12 w-16 text-center text-on-surface font-body text-base"
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
                  className="bg-surface-container-low rounded-xl h-12 w-16 text-center text-on-surface font-body text-base"
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
              color="#4d41df"
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

  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  const categoryMap = new Map((categories ?? []).map((c) => [c.categoryId, c]));

  async function handleGenerate() {
    if (text.length < 10) return;
    if (isListening) toggleSpeech();
    await generatePlan.mutateAsync({ text });
    setText("");
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

  return (
    <PageLayout title="AI Task">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ gap: 24, paddingBottom: 32 }}
        >
          <Card variant="surface">
            <View className="gap-4">
              <View className="flex-row items-center gap-2">
                <MaterialIcons name="auto-awesome" size={24} color="#006b58" />
                <Text className="text-on-surface font-headline text-lg">
                  Generuj zadania z AI
                </Text>
              </View>
              <Text className="text-on-surface-variant font-body text-sm">
                Opisz swój plan, projekt lub listę rzeczy do zrobienia — AI
                automatycznie utworzy zadania i wydarzenia.
              </Text>
              <View className="relative">
                <TextInput
                  className="bg-surface-container-low rounded-xl p-4 pr-14 text-on-surface font-body text-base"
                  style={{
                    minHeight: 120,
                    borderWidth: isListening ? 2 : 0,
                    borderColor: isListening ? "#dc2626" : "transparent",
                  }}
                  placeholder="Np. Muszę przygotować prezentację na piątek, spotkanie z klientem w środę o 14..."
                  placeholderTextColor="#777587"
                  multiline
                  textAlignVertical="top"
                  value={text}
                  onChangeText={setText}
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
                {speechSupported && (
                  <TouchableOpacity
                    onPress={toggleSpeech}
                    className="absolute right-3 top-3 items-center justify-center rounded-full"
                    style={{
                      width: 36,
                      height: 36,
                      backgroundColor: isListening
                        ? "#dc2626"
                        : "rgba(77, 65, 223, 0.1)",
                    }}
                  >
                    <MaterialIcons
                      name={isListening ? "stop" : "mic"}
                      size={20}
                      color={isListening ? "#fff" : "#4d41df"}
                    />
                  </TouchableOpacity>
                )}
                {isListening && (
                  <View className="flex-row items-center gap-2 mt-2">
                    <View
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: "#dc2626",
                      }}
                    />
                    <Text className="text-error font-label text-xs">
                      Nasłuchuję... mów teraz
                    </Text>
                  </View>
                )}
              </View>
              <Button
                label="Generuj zadania"
                loading={generatePlan.isPending}
                disabled={text.length < 10}
                fullWidth
                onPress={handleGenerate}
              />
            </View>
          </Card>

          {isGenerating && <AiLoadingAnimation />}

          {!isGenerating && totalCount > 0 && (
            <View className="gap-6">
              <View>
                <Text className="text-on-surface font-headline text-xl">
                  AI wygenerowało {taskCount} task
                  {taskCount !== 1 ? "i" : ""} i {eventCount} event
                  {eventCount !== 1 ? "y" : ""}
                </Text>
                <Text className="text-on-surface-variant font-body text-sm mt-1">
                  Zaakceptuj, edytuj lub odrzuć każdą propozycję.
                </Text>
              </View>

              {taskCount > 0 && (
                <View className="gap-4">
                  <Text className="text-on-surface font-headline text-base">
                    Zadania
                  </Text>
                  {proposals!.tasks.map((task) => {
                    const cat = task.categoryId
                      ? categoryMap.get(task.categoryId)
                      : undefined;
                    return (
                      <View
                        key={task.taskId}
                        className="bg-surface-container-lowest rounded-2xl overflow-hidden"
                        style={{
                          borderLeftWidth: 4,
                          borderLeftColor: PRIORITY_COLORS[task.priority],
                        }}
                      >
                        <View className="p-5 gap-3">
                          <View className="flex-row flex-wrap gap-2">
                            <PriorityBadge priority={task.priority} />
                            {cat && (
                              <ColorBadge label={cat.name} color={cat.color} />
                            )}
                          </View>
                          <Text className="font-headline text-on-surface text-base">
                            {task.title}
                          </Text>
                          {task.description ? (
                            <Text className="text-on-surface-variant font-body text-sm">
                              {task.description}
                            </Text>
                          ) : null}
                          <View className="flex-row items-center gap-4 flex-wrap">
                            {task.estimatedDuration > 0 && (
                              <View className="flex-row items-center gap-1">
                                <MaterialIcons
                                  name="schedule"
                                  size={14}
                                  color="#777587"
                                />
                                <Text className="text-on-surface-variant font-body text-xs">
                                  {formatDuration(task.estimatedDuration)}
                                </Text>
                              </View>
                            )}
                            {task.dueDateTime && (
                              <View className="flex-row items-center gap-1">
                                <MaterialIcons
                                  name="event"
                                  size={14}
                                  color="#777587"
                                />
                                <Text className="text-on-surface-variant font-body text-xs">
                                  {formatDateTime(task.dueDateTime)}
                                </Text>
                              </View>
                            )}
                          </View>
                          <View className="flex-row items-center gap-3 mt-1">
                            <TouchableOpacity
                              onPress={() => rejectTask.mutate(task.taskId)}
                              className="p-2"
                            >
                              <MaterialIcons
                                name="close"
                                size={22}
                                color="#ba1a1a"
                              />
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={() => setEditingTask(task)}
                              className="p-2"
                            >
                              <MaterialIcons
                                name="edit"
                                size={22}
                                color="#777587"
                              />
                            </TouchableOpacity>
                            <Button
                              label="✓ Akceptuj"
                              onPress={() =>
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
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}

              {eventCount > 0 && (
                <View className="gap-4">
                  <Text className="text-on-surface font-headline text-base">
                    Wydarzenia
                  </Text>
                  {manualEvents.map((event) => {
                    const startTime = new Date(
                      event.startDateTime,
                    ).toLocaleTimeString("pl-PL", {
                      hour: "2-digit",
                      minute: "2-digit",
                    });
                    const endTime = new Date(
                      event.endDateTime,
                    ).toLocaleTimeString("pl-PL", {
                      hour: "2-digit",
                      minute: "2-digit",
                    });
                    const dateStr = new Date(
                      event.startDateTime,
                    ).toLocaleDateString("pl-PL", {
                      day: "numeric",
                      month: "short",
                    });

                    return (
                      <View
                        key={event.eventId}
                        className="bg-surface-container-lowest rounded-2xl border border-dashed border-secondary overflow-hidden"
                        style={{
                          borderLeftWidth: 4,
                          borderLeftColor: "#f59e0b",
                        }}
                      >
                        <View className="p-5 gap-3">
                          <View className="flex-row items-center gap-2">
                            <View className="bg-secondary/10 px-2 py-0.5 rounded">
                              <Text className="text-secondary font-label text-[10px] uppercase">
                                Proposed by: AI
                              </Text>
                            </View>
                          </View>
                          <Text className="font-headline text-on-surface text-base">
                            {event.title}
                          </Text>
                          <View className="flex-row items-center gap-4">
                            <View className="flex-row items-center gap-1">
                              <MaterialIcons
                                name="schedule"
                                size={14}
                                color="#777587"
                              />
                              <Text className="text-on-surface-variant font-body text-xs">
                                {startTime} - {endTime}
                              </Text>
                            </View>
                            <View className="flex-row items-center gap-1">
                              <MaterialIcons
                                name="event"
                                size={14}
                                color="#777587"
                              />
                              <Text className="text-on-surface-variant font-body text-xs">
                                {dateStr}
                              </Text>
                            </View>
                            <Text className="text-on-surface-variant font-body text-xs">
                              All Day: {event.allDay ? "Yes" : "No"}
                            </Text>
                          </View>
                          <View className="flex-row items-center gap-3 mt-1">
                            <TouchableOpacity
                              onPress={() => rejectEvent.mutate(event.eventId)}
                              className="p-2"
                            >
                              <MaterialIcons
                                name="close"
                                size={22}
                                color="#ba1a1a"
                              />
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={() => setEditingEvent(event)}
                              className="p-2"
                            >
                              <MaterialIcons
                                name="edit"
                                size={22}
                                color="#777587"
                              />
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={() =>
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
                              className="p-2"
                            >
                              <MaterialIcons
                                name="check-circle"
                                size={24}
                                color="#006b58"
                              />
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          )}

          {totalCount === 0 && !proposalsLoading && !isGenerating && (
            <EmptyState
              title="Brak propozycji"
              description="Wpisz opis i wygeneruj zadania z AI"
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {editingTask && (
        <EditTaskModal
          task={editingTask}
          visible={!!editingTask}
          onClose={() => setEditingTask(null)}
          loading={acceptTask.isPending}
          categories={categories ?? []}
          statuses={statuses ?? []}
          onSave={(data) => {
            acceptTask.mutate(
              { taskId: editingTask.taskId, data },
              { onSuccess: () => setEditingTask(null) },
            );
          }}
        />
      )}

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
