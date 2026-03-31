import {
  View,
  Text,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Modal,
} from "react-native";
import { useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { PageLayout } from "@/components/organisms";
import { Button, Card, EmptyState, Input } from "@/components/atoms";
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
import type { Task, CalendarEvent } from "@/lib/types";
import { TaskPriority, EventStatus, ProposedBy } from "@/lib/types";
import { PRIORITY_COLORS, formatDateTime, formatDuration } from "@/lib/utils";

function EditTaskModal({
  task,
  visible,
  onClose,
  onSave,
  loading,
}: {
  task: Task;
  visible: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  loading: boolean;
}) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [priority, setPriority] = useState(task.priority);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/50 items-center justify-center p-6">
        <View className="bg-surface-container-lowest rounded-2xl p-6 w-full max-w-lg gap-4">
          <Text className="font-headline text-on-surface text-lg">
            Edytuj propozycję zadania
          </Text>
          <Input label="Tytuł" value={title} onChangeText={setTitle} />
          <View className="w-full">
            <Text className="text-on-surface-variant font-label text-xs uppercase tracking-widest mb-2">
              Opis
            </Text>
            <TextInput
              className="bg-surface-container-low rounded-xl p-4 min-h-[80px] text-on-surface font-body text-base"
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
                      priority === p ? "text-white" : "text-on-surface-variant"
                    }`}
                  >
                    {p}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
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
                  statusId: task.statusId,
                })
              }
            />
          </View>
        </View>
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

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/50 items-center justify-center p-6">
        <View className="bg-surface-container-lowest rounded-2xl p-6 w-full max-w-lg gap-4">
          <Text className="font-headline text-on-surface text-lg">
            Edytuj propozycję wydarzenia
          </Text>
          <Input label="Tytuł" value={title} onChangeText={setTitle} />
          <View className="flex-row gap-3 justify-end mt-2">
            <Button variant="outline" label="Anuluj" onPress={onClose} />
            <Button
              label="Zapisz i akceptuj"
              loading={loading}
              onPress={() =>
                onSave({
                  title,
                  startDateTime: event.startDateTime,
                  endDateTime: event.endDateTime,
                  allDay: event.allDay,
                  status: EventStatus.ACCEPTED,
                })
              }
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function AiTaskScreen() {
  const [text, setText] = useState("");
  const generatePlan = useGenerateAiPlan();
  const { data: proposals, isLoading: proposalsLoading } = useAiProposals();
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
    await generatePlan.mutateAsync({ text });
    setText("");
  }

  const taskCount = proposals?.tasks?.length ?? 0;
  const eventCount = proposals?.events?.length ?? 0;
  const totalCount = taskCount + eventCount;

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
              <TextInput
                className="bg-surface-container-low rounded-xl p-4 min-h-[120px] text-on-surface font-body text-base"
                placeholder="Np. Muszę przygotować prezentację na piątek, spotkanie z klientem w środę o 14..."
                placeholderTextColor="#777587"
                multiline
                textAlignVertical="top"
                value={text}
                onChangeText={setText}
              />
              <Button
                label="Generuj zadania"
                loading={generatePlan.isPending}
                disabled={text.length < 10}
                fullWidth
                onPress={handleGenerate}
              />
            </View>
          </Card>

          {totalCount > 0 && (
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
                  {proposals!.events.map((event) => {
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

          {totalCount === 0 && !proposalsLoading && (
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
