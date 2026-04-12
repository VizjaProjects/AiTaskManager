import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Modal,
  Platform,
  useWindowDimensions,
} from "react-native";
import { useState, useMemo, useEffect } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { Button, Input } from "../atoms";
import { PriorityBadge, ColorBadge } from "../atoms";
import { InlineDatePicker } from "../atoms";
import type { Task, Category, TaskStatus, CalendarEvent } from "@/lib/types";
import { TaskPriority, TaskSource, EventStatus } from "@/lib/types";
import {
  PRIORITY_COLORS,
  PRIORITY_COLORS_DARK,
  formatDate,
  formatDateTime,
  formatDuration,
  isOverdue,
  getCategoryDisplayColor,
} from "@/lib/utils";
import {
  useEditTask,
  useDeleteTask,
  useCreateTask,
  useCategories,
  useTaskStatuses,
  useEvents,
} from "@/lib/hooks";
import { useThemeStore } from "@/lib/stores/theme";

interface TaskDetailModalProps {
  task: Task | null;
  categories: Category[];
  statuses: TaskStatus[];
  visible: boolean;
  onClose: () => void;
}

export function TaskDetailModal({
  task,
  categories,
  statuses,
  visible,
  onClose,
}: TaskDetailModalProps) {
  const editTask = useEditTask();
  const deleteTask = useDeleteTask();
  const themeMode = useThemeStore((s) => s.mode);
  const isDark = themeMode === "dark";
  const pColors = isDark ? PRIORITY_COLORS_DARK : PRIORITY_COLORS;
  const { data: allEvents } = useEvents();
  const { width } = useWindowDimensions();
  const isWide = Platform.OS === "web" && width >= 768;
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>(TaskPriority.MEDIUM);
  const [statusId, setStatusId] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [estimatedDuration, setEstimatedDuration] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [dueDateObj, setDueDateObj] = useState<Date>(new Date());
  const [dueHour, setDueHour] = useState("12");
  const [dueMin, setDueMin] = useState("00");
  const [showDuePicker, setShowDuePicker] = useState(false);

  // Reset editing state when task changes or modal closes
  useEffect(() => {
    setEditing(false);
    setShowDuePicker(false);
  }, [task?.taskId, visible]);

  const cat = task?.categoryId
    ? categories.find((c) => c.categoryId === task.categoryId)
    : undefined;
  const status = task
    ? statuses.find((s) => s.statusId === task.statusId)
    : undefined;

  const relatedEvents = useMemo(() => {
    if (!task || !allEvents) return [];
    return allEvents.filter(
      (e) => e.taskId === task.taskId && e.status !== EventStatus.CANCELLED,
    );
  }, [task, allEvents]);

  function startEdit() {
    if (!task) return;
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
    if (task.dueDateTime) {
      const d = new Date(task.dueDateTime);
      setDueHour(String(d.getHours()).padStart(2, "0"));
      setDueMin(String(d.getMinutes()).padStart(2, "0"));
    } else {
      setDueHour("12");
      setDueMin("00");
    }
    setShowDuePicker(false);
    setEditing(true);
  }

  function handleSave() {
    if (!task) return;
    editTask.mutate(
      {
        taskId: task.taskId,
        data: {
          title,
          description,
          priority,
          statusId,
          categoryId: categoryId ?? undefined,
          estimatedDuration: estimatedDuration
            ? parseInt(estimatedDuration, 10)
            : task.estimatedDuration,
          dueDateTime: dueDate
            ? new Date(
                dueDateObj.getFullYear(),
                dueDateObj.getMonth(),
                dueDateObj.getDate(),
                parseInt(dueHour) || 0,
                parseInt(dueMin) || 0,
              ).toISOString()
            : undefined,
        },
      },
      {
        onSuccess: () => {
          setEditing(false);
          onClose();
        },
      },
    );
  }

  function handleDelete() {
    if (!task) return;
    const id = task.taskId;
    setEditing(false);
    onClose();
    deleteTask.mutate(id);
  }

  function handleMarkComplete() {
    if (!task) return;
    const doneStatus = statuses.find(
      (s) =>
        s.name.toLowerCase() === "done" ||
        s.name.toLowerCase() === "completed" ||
        s.name.toLowerCase() === "zakończone" ||
        s.name.toLowerCase() === "ukończone",
    );
    if (!doneStatus) return;
    editTask.mutate(
      {
        taskId: task.taskId,
        data: {
          title: task.title,
          description: task.description,
          priority: task.priority,
          statusId: doneStatus.statusId,
          categoryId: task.categoryId ?? undefined,
          estimatedDuration: task.estimatedDuration,
          dueDateTime: task.dueDateTime ?? undefined,
        },
      },
      { onSuccess: onClose },
    );
  }

  if (!task) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/50 items-center justify-center p-4">
        <View className="bg-surface-container-lowest rounded-3xl w-full max-w-2xl overflow-hidden shadow-xl">
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: 0 }}
          >
            {/* Header: badges + close */}
            <View className="px-6 pt-6 pb-2">
              <View className="flex-row items-start justify-between">
                <View className="flex-row flex-wrap gap-2 flex-1">
                  <PriorityBadge
                    priority={editing ? priority : task.priority}
                  />
                  {task.source === TaskSource.AI_PARSED && (
                    <View className="flex-row items-center gap-1 px-2.5 py-1 rounded-full bg-secondary/10">
                      <MaterialIcons
                        name="auto-awesome"
                        size={12}
                        color="#006b58"
                      />
                      <Text className="text-secondary text-xs font-label uppercase">
                        AI_PARSED
                      </Text>
                    </View>
                  )}
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setEditing(false);
                    onClose();
                  }}
                  className="p-1"
                >
                  <MaterialIcons name="close" size={24} color="#777587" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Title */}
            <View className="px-6 pb-4">
              {editing ? (
                <Input value={title} onChangeText={setTitle} />
              ) : (
                <Text className="font-headline text-on-surface text-2xl">
                  {task.title}
                </Text>
              )}
            </View>

            {/* Two-column layout */}
            <View
              className={`px-6 pb-4 ${isWide ? "flex-row gap-6" : "gap-4"}`}
            >
              {/* Left column: description + category */}
              <View className={`${isWide ? "flex-1" : ""} gap-4`}>
                <View>
                  <Text className="text-on-surface-variant font-label text-xs uppercase tracking-widest mb-2">
                    Opis zadania
                  </Text>
                  {editing ? (
                    <TextInput
                      className="bg-surface-container-low rounded-xl p-4 text-on-surface font-body text-sm"
                      style={{ minHeight: 120 }}
                      multiline
                      textAlignVertical="top"
                      value={description}
                      onChangeText={setDescription}
                      placeholderTextColor="#777587"
                      placeholder="Opis zadania..."
                    />
                  ) : (
                    <Text className="text-on-surface font-body text-sm leading-5">
                      {task.description || "Brak opisu"}
                    </Text>
                  )}
                </View>

                <View>
                  <Text className="text-on-surface-variant font-label text-xs uppercase tracking-widest mb-2">
                    Kategoria
                  </Text>
                  {editing ? (
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
                            className={`text-xs font-label ${
                              categoryId === c.categoryId
                                ? ""
                                : "text-on-surface-variant"
                            }`}
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
                  ) : cat ? (
                    <View className="flex-row items-center gap-2">
                      <View
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: getCategoryDisplayColor(
                            cat.color,
                            isDark,
                          ),
                        }}
                      />
                      <Text className="text-on-surface font-body text-sm">
                        {cat.name}
                      </Text>
                    </View>
                  ) : (
                    <Text className="text-on-surface-variant font-body text-sm">
                      Brak
                    </Text>
                  )}
                </View>
              </View>

              {/* Right column: status, priority, times */}
              <View className={`${isWide ? "w-56" : ""} gap-4`}>
                {/* Status */}
                <View>
                  <Text className="text-on-surface-variant font-label text-xs uppercase tracking-widest mb-2">
                    Status
                  </Text>
                  {editing ? (
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
                  ) : status ? (
                    <View className="flex-row gap-2 flex-wrap">
                      {statuses.map((s) => (
                        <TouchableOpacity
                          key={s.statusId}
                          disabled={editTask.isPending}
                          onPress={() => {
                            if (s.statusId === task.statusId) return;
                            editTask.mutate({
                              taskId: task.taskId,
                              data: {
                                title: task.title,
                                description: task.description,
                                priority: task.priority,
                                statusId: s.statusId,
                                categoryId: task.categoryId ?? undefined,
                                estimatedDuration: task.estimatedDuration,
                                dueDateTime: task.dueDateTime ?? undefined,
                              },
                            });
                          }}
                          className={`px-3 py-1.5 rounded-full border ${
                            task.statusId === s.statusId
                              ? "border-transparent"
                              : "border-outline-variant"
                          }`}
                          style={
                            task.statusId === s.statusId
                              ? { backgroundColor: s.color }
                              : undefined
                          }
                        >
                          <Text
                            className={`text-xs font-label ${
                              task.statusId === s.statusId
                                ? "text-white"
                                : "text-on-surface-variant"
                            }`}
                          >
                            {s.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  ) : null}
                </View>

                {/* Priority */}
                <View>
                  <Text className="text-on-surface-variant font-label text-xs uppercase tracking-widest mb-2">
                    Priorytet
                  </Text>
                  {editing ? (
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
                              ? { backgroundColor: pColors[p] }
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
                  ) : (
                    <View
                      className="px-3 py-1.5 rounded-lg self-start"
                      style={{
                        backgroundColor: `${pColors[task.priority]}25`,
                      }}
                    >
                      <Text
                        className="text-sm font-headline"
                        style={{ color: pColors[task.priority] }}
                      >
                        {task.priority}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Duration */}
                <View>
                  <Text className="text-on-surface-variant font-label text-xs uppercase tracking-widest mb-1">
                    Czas trwania
                  </Text>
                  {editing ? (
                    <Input
                      value={estimatedDuration}
                      onChangeText={setEstimatedDuration}
                      placeholder="min"
                      keyboardType="numeric"
                    />
                  ) : (
                    <View className="flex-row items-center gap-1.5">
                      <MaterialIcons
                        name="schedule"
                        size={16}
                        color="#777587"
                      />
                      <Text className="text-on-surface font-body text-sm">
                        {task.estimatedDuration > 0
                          ? formatDuration(task.estimatedDuration)
                          : "—"}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Due date */}
                <View>
                  <Text className="text-on-surface-variant font-label text-xs uppercase tracking-widest mb-1">
                    Termin
                  </Text>
                  {editing ? (
                    <View>
                      <TouchableOpacity
                        onPress={() => setShowDuePicker(!showDuePicker)}
                        className="flex-row items-center justify-between bg-surface-container-low rounded-xl px-4 py-3"
                      >
                        <Text className="text-on-surface font-body text-sm">
                          {dueDate
                            ? (() => {
                                const d = new Date(dueDate);
                                return `${d.toLocaleDateString("pl-PL", {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                })} ${dueHour}:${dueMin}`;
                              })()
                            : "Wybierz termin..."}
                        </Text>
                        <MaterialIcons
                          name={
                            showDuePicker ? "expand-less" : "calendar-today"
                          }
                          size={18}
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
                  ) : (
                    <View className="flex-row items-center gap-1.5">
                      <MaterialIcons
                        name="calendar-today"
                        size={16}
                        color="#777587"
                      />
                      <Text
                        className={`font-body text-sm ${
                          task.dueDateTime && isOverdue(task.dueDateTime)
                            ? "text-error"
                            : "text-on-surface"
                        }`}
                      >
                        {task.dueDateTime
                          ? formatDateTime(task.dueDateTime)
                          : "—"}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Created at */}
                {!editing && (
                  <View>
                    <Text className="text-on-surface-variant font-label text-xs uppercase tracking-widest mb-1">
                      Utworzono
                    </Text>
                    <View className="flex-row items-center gap-1.5">
                      <MaterialIcons
                        name="access-time"
                        size={16}
                        color="#777587"
                      />
                      <Text className="text-on-surface font-body text-sm">
                        {formatDateTime(task.createdAt)}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </View>

            {/* Related events */}
            {!editing && relatedEvents.length > 0 && (
              <View className="px-6 pb-4">
                <Text className="text-on-surface-variant font-label text-xs uppercase tracking-widest mb-3">
                  Powiązane wydarzenia
                </Text>
                <View className="flex-row flex-wrap gap-3">
                  {relatedEvents.map((evt) => {
                    const evtDate = new Date(evt.startDateTime);
                    const evtTime = evtDate.toLocaleTimeString("pl-PL", {
                      hour: "2-digit",
                      minute: "2-digit",
                    });
                    const evtDay = evtDate.toLocaleDateString("pl-PL", {
                      day: "numeric",
                      month: "short",
                    });
                    return (
                      <View
                        key={evt.eventId}
                        className="bg-surface-container-low rounded-xl p-3 flex-row items-center gap-3 min-w-[180px]"
                      >
                        <View className="bg-primary/10 rounded-lg w-10 h-10 items-center justify-center">
                          <MaterialIcons
                            name="event"
                            size={20}
                            color="#4d41df"
                          />
                        </View>
                        <View className="flex-1">
                          <Text
                            className="text-on-surface font-headline text-sm"
                            numberOfLines={1}
                          >
                            {evt.title}
                          </Text>
                          <Text className="text-on-surface-variant font-body text-xs">
                            {evtDay}, {evtTime}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Action buttons */}
            <View
              className="px-6 py-4 flex-row items-center border-t border-outline-variant/30"
              style={{ gap: 12 }}
            >
              {editing ? (
                <>
                  <View className="flex-1" />
                  <Button
                    variant="outline"
                    label="Anuluj"
                    onPress={() => setEditing(false)}
                  />
                  <Button
                    label="Zapisz"
                    loading={editTask.isPending}
                    onPress={handleSave}
                  />
                </>
              ) : (
                <>
                  <TouchableOpacity onPress={handleDelete} className="mr-auto">
                    <Text className="text-error font-headline text-sm">
                      Usuń
                    </Text>
                  </TouchableOpacity>
                  <Button
                    variant="outline"
                    label="Oznacz jako zakończone"
                    loading={editTask.isPending}
                    onPress={handleMarkComplete}
                  />
                  <Button label="Edytuj zadanie" onPress={startEdit} />
                </>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

interface CreateTaskModalProps {
  visible: boolean;
  onClose: () => void;
  defaultStatusId?: string;
  categories: Category[];
  statuses: TaskStatus[];
}

export function CreateTaskModal({
  visible,
  onClose,
  defaultStatusId,
  categories,
  statuses,
}: CreateTaskModalProps) {
  const createTask = useCreateTask();
  const cThemeMode = useThemeStore((s) => s.mode);
  const cPColors =
    cThemeMode === "dark" ? PRIORITY_COLORS_DARK : PRIORITY_COLORS;
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>(TaskPriority.MEDIUM);
  const [statusId, setStatusId] = useState(defaultStatusId ?? "");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [estimatedDuration, setEstimatedDuration] = useState("");

  function reset() {
    setTitle("");
    setDescription("");
    setPriority(TaskPriority.MEDIUM);
    setStatusId(defaultStatusId ?? "");
    setCategoryId(null);
    setEstimatedDuration("");
  }

  function handleCreate() {
    if (!title.trim() || !statusId) return;
    createTask.mutate(
      {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        statusId,
        categoryId: categoryId ?? undefined,
        estimatedDuration: estimatedDuration
          ? parseInt(estimatedDuration, 10)
          : undefined,
        source: TaskSource.MANUAL,
      },
      {
        onSuccess: () => {
          reset();
          onClose();
        },
      },
    );
  }

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/50 items-center justify-center p-6">
        <View className="bg-surface-container-lowest rounded-2xl p-6 w-full max-w-lg gap-4">
          <View className="flex-row items-center justify-between">
            <Text className="font-headline text-on-surface text-lg">
              Nowe zadanie
            </Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={24} color="#777587" />
            </TouchableOpacity>
          </View>

          <Input
            label="Tytuł"
            value={title}
            onChangeText={setTitle}
            placeholder="Wpisz tytuł zadania"
          />

          <View className="w-full">
            <Text className="text-on-surface-variant font-label text-xs uppercase tracking-widest mb-2">
              Opis
            </Text>
            <TextInput
              className="bg-surface-container-low rounded-xl p-4 text-on-surface font-body text-base"
              style={{ minHeight: 80 }}
              multiline
              textAlignVertical="top"
              value={description}
              onChangeText={setDescription}
              placeholder="Opcjonalny opis..."
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
                      ? { backgroundColor: cPColors[p] }
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
                    className={`text-xs font-label ${
                      categoryId === c.categoryId
                        ? ""
                        : "text-on-surface-variant"
                    }`}
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

          <View className="flex-row gap-3 justify-end mt-2">
            <Button variant="outline" label="Anuluj" onPress={onClose} />
            <Button
              label="Utwórz zadanie"
              loading={createTask.isPending}
              disabled={!title.trim() || !statusId}
              onPress={handleCreate}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}
