import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
  Platform,
  useWindowDimensions,
} from "react-native";
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { Button, Input } from "../atoms";
import { PriorityBadge, ColorBadge } from "../atoms";
import { InlineDatePicker } from "../atoms";
import { Avatar } from "../atoms/Avatar";
import { LinkCheckboxModal } from "../molecules";
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
  parseApiDateTime,
  toLocalDateTimeString,
  normalizeDueDateTime,
  getEffectiveTaskDueDateTime,
  resolveTaskDueDateTimeForSave,
} from "@/lib/utils";
import {
  useEditTask,
  useDeleteTask,
  useCreateTask,
  useSetTaskAssignees,
  useCategories,
  useTaskStatuses,
  useEvents,
  useTasks,
  useNotes,
  useSyncEntityNoteLinks,
} from "@/lib/hooks";
import { useThemeStore } from "@/lib/stores/theme";
import { useWorkspaceStore } from "@/lib/stores/workspace";

type TaskSaveData = {
  title: string;
  description: string;
  priority: TaskPriority;
  statusId: string;
  categoryId?: string;
  estimatedDuration: number;
  dueDateTime?: string;
};

interface TaskDetailModalProps {
  task: Task | null;
  categories: Category[];
  statuses: TaskStatus[];
  visible: boolean;
  onClose: () => void;
  forceEdit?: boolean;
  onSaveCustom?: (data: TaskSaveData) => void;
  saveLoading?: boolean;
  saveLabel?: string;
  showDelete?: boolean;
  onDeleteCustom?: () => void;
  acceptAction?: { label: string; onPress: () => void; loading?: boolean };
  rejectAction?: { label: string; onPress: () => void; loading?: boolean };
}

const NO_OUTLINE =
  Platform.OS === "web" ? ({ outlineStyle: "none" } as const) : undefined;

export function TaskDetailModal({
  task: taskProp,
  categories,
  statuses,
  visible,
  onClose,
  forceEdit = false,
  onSaveCustom,
  saveLoading,
  saveLabel = "Zapisz",
  showDelete = true,
  onDeleteCustom,
  acceptAction,
  rejectAction,
}: TaskDetailModalProps) {
  const editTask = useEditTask();
  const deleteTask = useDeleteTask();
  const setAssignees = useSetTaskAssignees();
  const router = useRouter();
  const themeMode = useThemeStore((s) => s.mode);
  const isDark = themeMode === "dark";
  const pColors = isDark ? PRIORITY_COLORS_DARK : PRIORITY_COLORS;
  const { data: allEvents } = useEvents();
  const { data: liveTasks } = useTasks();
  const { data: allNotes } = useNotes();
  const workspaceMembers = useWorkspaceStore(
    (s) => s.getActiveWorkspace()?.assignedUsers ?? [],
  );
  const { width } = useWindowDimensions();
  const isWide = Platform.OS === "web" && width >= 768;
  const isNarrow = width < 600;
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
  const [assigneeIds, setAssigneeIds] = useState<string[]>([]);
  const [noteLinkOpen, setNoteLinkOpen] = useState(false);
  const [draftLinkedNoteIds, setDraftLinkedNoteIds] = useState<string[]>([]);
  const syncEntityNoteLinks = useSyncEntityNoteLinks();

  function toggleAssignee(userId: string) {
    setAssigneeIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  }

  const task = useMemo(() => {
    if (!taskProp) return null;
    return liveTasks?.find((t) => t.taskId === taskProp.taskId) ?? taskProp;
  }, [taskProp, liveTasks]);

  useEffect(() => {
    if (visible && task) {
      setEditing(forceEdit || !!onSaveCustom);
      if (forceEdit || onSaveCustom) startEdit();
    } else {
      setEditing(false);
    }
    setShowDuePicker(false);
  }, [task?.taskId, visible, forceEdit, onSaveCustom]);

  // ESC closes the detail modal; Ctrl/Cmd+Enter confirms while editing.
  useEffect(() => {
    if (Platform.OS !== "web" || !visible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && editing) {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, onClose, editing, title, description, priority, statusId, categoryId, estimatedDuration, dueDate, dueHour, dueMin]);

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

  const assignedMembers = useMemo(() => {
    const ids = task?.assignedUserIds ?? [];
    return workspaceMembers.filter((m) => ids.includes(m.userId));
  }, [task?.assignedUserIds, workspaceMembers]);

  const linkedNotes = useMemo(() => {
    if (!task || !allNotes) return [];
    return allNotes.filter((n) => n.linkedTaskIds?.includes(task.taskId));
  }, [task, allNotes]);

  const noteLinkSections = useMemo(
    () => [
      {
        label: "Notatki",
        emptyMessage: "Brak notatek w tym workspace.",
        items: (allNotes ?? []).map((n) => ({
          id: n.id,
          label: n.title || "Bez tytułu",
          subtitle:
            n.noteDescription?.trim() ||
            n.content.text.trim().slice(0, 80) ||
            undefined,
          searchText: `${n.noteDescription ?? ""} ${n.content.text}`,
        })),
        selectedIds: draftLinkedNoteIds,
        onToggle: (id: string) =>
          setDraftLinkedNoteIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
          ),
      },
    ],
    [allNotes, draftLinkedNoteIds],
  );

  function openNoteLinkModal() {
    if (!task) return;
    setDraftLinkedNoteIds(
      (allNotes ?? [])
        .filter((n) => n.linkedTaskIds.includes(task.taskId))
        .map((n) => n.id),
    );
    setNoteLinkOpen(true);
  }

  function saveTaskNoteLinks() {
    if (!task) return;
    syncEntityNoteLinks.mutate(
      {
        kind: "task",
        entityId: task.taskId,
        selectedNoteIds: draftLinkedNoteIds,
      },
      { onSuccess: () => setNoteLinkOpen(false) },
    );
  }

  function openLinkedNote(noteId: string) {
    onClose();
    router.push(`/(app)/notes?noteId=${encodeURIComponent(noteId)}` as never);
  }

  function startEdit() {
    if (!task) return;
    setTitle(task.title);
    setDescription(task.description);
    setPriority(task.priority);
    setStatusId(task.statusId);
    setCategoryId(task.categoryId);
    setAssigneeIds(task.assignedUserIds ?? []);
    setEstimatedDuration(
      task.estimatedDuration > 0 ? String(task.estimatedDuration) : "",
    );
    const effectiveDue = getEffectiveTaskDueDateTime(task, relatedEvents);
    setDueDate(effectiveDue ?? "");
    setDueDateObj(effectiveDue ? parseApiDateTime(effectiveDue) : new Date());
    if (effectiveDue) {
      const d = parseApiDateTime(effectiveDue);
      setDueHour(String(d.getHours()).padStart(2, "0"));
      setDueMin(String(d.getMinutes()).padStart(2, "0"));
    } else {
      setDueHour("12");
      setDueMin("00");
    }
    setShowDuePicker(false);
    setEditing(true);
  }

  function buildSaveData(): TaskSaveData {
    if (!task) throw new Error("no task");
    return {
      title,
      description,
      priority,
      statusId,
      categoryId: categoryId ?? undefined,
      estimatedDuration: estimatedDuration
        ? parseInt(estimatedDuration, 10)
        : task.estimatedDuration,
      dueDateTime: dueDate
        ? toLocalDateTimeString(
            new Date(
              dueDateObj.getFullYear(),
              dueDateObj.getMonth(),
              dueDateObj.getDate(),
              parseInt(dueHour) || 0,
              parseInt(dueMin) || 0,
            ),
          )
        : undefined,
    };
  }

  function handleSave() {
    if (!task) return;
    const data = buildSaveData();
    if (onSaveCustom) {
      onSaveCustom(data);
      return;
    }
    // Persist assignee changes alongside the edit (only when they differ).
    const current = task.assignedUserIds ?? [];
    const changed =
      current.length !== assigneeIds.length ||
      current.some((id) => !assigneeIds.includes(id));
    if (changed) {
      setAssignees.mutate({ taskId: task.taskId, userIds: assigneeIds });
    }
    editTask.mutate(
      { taskId: task.taskId, data },
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
          dueDateTime: resolveTaskDueDateTimeForSave(task, relatedEvents),
        },
      },
      { onSuccess: onClose },
    );
  }

  if (!task) return null;

  return (
    <>
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 bg-black/40 items-center justify-center p-4"
        onPress={onClose}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="bg-surface rounded-2xl w-full max-w-3xl max-h-[90%] overflow-hidden border border-outline-variant"
        >
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
                    variant="soft"
                  />
                  {task.source === TaskSource.AI_PARSED && (
                    <View className="flex-row items-center gap-1 px-2 py-0.5 rounded-sm">
                      <MaterialIcons
                        name="auto-awesome"
                        size={12}
                        color="#5B4EE0"
                      />
                      <Text className="text-[#5B4EE0] text-[11px] font-label">
                        AI
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
            <View className="px-6 pb-3">
              {editing ? (
                <Input value={title} onChangeText={setTitle} />
              ) : (
                <Text className="font-display text-on-surface text-2xl leading-8">
                  {task.title}
                </Text>
              )}
            </View>

            {!editing && (
              <View className="px-6 pb-4 flex-row flex-wrap gap-2">
                {cat && (
                  <View className="flex-row items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-container-low border border-outline-variant">
                    <View
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor: getCategoryDisplayColor(
                          cat.color,
                          isDark,
                        ),
                      }}
                    />
                    <Text className="text-on-surface-variant font-label text-xs">
                      {cat.name}
                    </Text>
                  </View>
                )}
                {status && (
                  <View
                    className="px-2.5 py-1 rounded-lg border border-outline-variant"
                    style={{ backgroundColor: `${status.color}18` }}
                  >
                    <Text
                      className="font-label text-xs"
                      style={{ color: status.color }}
                    >
                      {status.name}
                    </Text>
                  </View>
                )}
                {task.estimatedDuration > 0 && (
                  <View className="flex-row items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-container-low border border-outline-variant">
                    <MaterialIcons name="schedule" size={12} color="#9ca3af" />
                    <Text className="text-on-surface-variant font-label text-xs">
                      {formatDuration(task.estimatedDuration)}
                    </Text>
                  </View>
                )}
                {task.dueDateTime && (
                  <View className="flex-row items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-container-low border border-outline-variant">
                    <MaterialIcons
                      name="calendar-today"
                      size={12}
                      color="#9ca3af"
                    />
                    <Text
                      className={`font-label text-xs ${
                        isOverdue(task.dueDateTime)
                          ? "text-error"
                          : "text-on-surface-variant"
                      }`}
                    >
                      {formatDateTime(task.dueDateTime)}
                    </Text>
                  </View>
                )}
              </View>
            )}

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
                      className="bg-surface-container-lowest rounded-xl p-4 text-on-surface font-body text-sm border border-outline-variant"
                      style={[{ minHeight: 120 }, NO_OUTLINE]}
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
                                dueDateTime: resolveTaskDueDateTimeForSave(
                                  task,
                                  relatedEvents,
                                ),
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
                                const d = parseApiDateTime(dueDate);
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
                              setDueDate(toLocalDateTimeString(d));
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
                              className="bg-surface-container-lowest rounded-xl h-10 w-14 text-center text-on-surface font-body text-sm border border-outline-variant"
                              style={NO_OUTLINE}
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
                              className="bg-surface-container-lowest rounded-xl h-10 w-14 text-center text-on-surface font-body text-sm border border-outline-variant"
                              style={NO_OUTLINE}
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

                {/* Assignees */}
                <View>
                  <Text className="text-on-surface-variant font-label text-xs uppercase tracking-widest mb-2">
                    Przypisani
                  </Text>
                  {editing ? (
                    workspaceMembers.length === 0 ? (
                      <Text className="text-on-surface-variant font-body text-sm">
                        Brak członków workspace
                      </Text>
                    ) : (
                      <View className="flex-row gap-2 flex-wrap">
                        {workspaceMembers.map((m) => {
                          const selected = assigneeIds.includes(m.userId);
                          return (
                            <TouchableOpacity
                              key={m.userId}
                              onPress={() => toggleAssignee(m.userId)}
                              className={`flex-row items-center gap-1.5 pl-1 pr-2.5 py-1 rounded-full border ${
                                selected
                                  ? "border-transparent bg-accent/15"
                                  : "border-outline-variant"
                              }`}
                            >
                              <Avatar
                                fullName={m.fullName ?? m.email ?? "?"}
                                size="sm"
                              />
                              <Text
                                className={`text-xs font-label ${
                                  selected
                                    ? "text-accent"
                                    : "text-on-surface-variant"
                                }`}
                              >
                                {m.fullName ?? m.email ?? "Użytkownik"}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    )
                  ) : assignedMembers.length === 0 ? (
                    <Text className="text-on-surface-variant font-body text-sm">
                      Nikt nie jest przypisany
                    </Text>
                  ) : (
                    <View className="flex-row flex-wrap gap-2">
                      {assignedMembers.map((m) => (
                        <View
                          key={m.userId}
                          className="flex-row items-center gap-1.5 pl-1 pr-2.5 py-1 rounded-full bg-surface-container-low border border-outline-variant"
                        >
                          <Avatar
                            fullName={m.fullName ?? m.email ?? "?"}
                            size="sm"
                          />
                          <Text className="text-on-surface font-body text-xs">
                            {m.fullName ?? m.email ?? "Użytkownik"}
                          </Text>
                        </View>
                      ))}
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
                        <View className="bg-accent/10 rounded-lg w-10 h-10 items-center justify-center">
                          <MaterialIcons
                            name="event"
                            size={20}
                            color={isDark ? "#9b8cff" : "#4d41df"}
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

            {/* Linked notes */}
            {!editing && (
              <View className="px-6 pb-4">
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-on-surface-variant font-label text-xs uppercase tracking-widest">
                    Powiązane notatki
                  </Text>
                  <TouchableOpacity
                    onPress={openNoteLinkModal}
                    className="flex-row items-center gap-1 px-2 py-1 rounded-lg bg-surface-container-low border border-outline-variant"
                  >
                    <MaterialIcons name="link" size={14} color="#9b9791" />
                    <Text className="text-on-surface-variant font-label text-xs">
                      Podłącz
                    </Text>
                  </TouchableOpacity>
                </View>
                {linkedNotes.length > 0 ? (
                  <View className="flex-row flex-wrap gap-2">
                    {linkedNotes.map((n) => (
                      <TouchableOpacity
                        key={n.id}
                        onPress={() => openLinkedNote(n.id)}
                        activeOpacity={0.7}
                        className="flex-row items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-container-low border border-outline-variant"
                      >
                        <MaterialIcons
                          name="sticky-note-2"
                          size={14}
                          color="#9b9791"
                        />
                        <Text
                          className="text-on-surface font-body text-xs"
                          numberOfLines={1}
                        >
                          {n.title || "Bez tytułu"}
                        </Text>
                        <MaterialIcons
                          name="arrow-forward"
                          size={12}
                          color="#9b9791"
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : (
                  <Text className="text-on-surface-variant font-body text-sm">
                    Brak powiązanych notatek.
                  </Text>
                )}
              </View>
            )}

            {/* Action buttons */}
            <View
              className={`px-6 py-4 border-t border-outline-variant ${
                isNarrow ? "flex-col" : "flex-row items-center"
              }`}
              style={{ gap: 12 }}
            >
              {editing ? (
                <>
                  {showDelete && !isNarrow && (
                    <TouchableOpacity
                      onPress={onDeleteCustom ?? handleDelete}
                      className="flex-row items-center gap-1.5 mr-auto"
                    >
                      <MaterialIcons
                        name="delete-outline"
                        size={18}
                        color="#ef4444"
                      />
                      <Text className="text-error font-headline text-sm">
                        Usuń
                      </Text>
                    </TouchableOpacity>
                  )}
                  {!showDelete && !isNarrow && <View className="flex-1" />}
                  <Button
                    label={saveLabel}
                    icon="check"
                    fullWidth={isNarrow}
                    loading={saveLoading ?? editTask.isPending}
                    onPress={handleSave}
                  />
                  <Button
                    variant="outline"
                    label="Anuluj"
                    fullWidth={isNarrow}
                    onPress={() => {
                      if (onSaveCustom) onClose();
                      else setEditing(false);
                    }}
                  />
                  {showDelete && isNarrow && (
                    <TouchableOpacity
                      onPress={onDeleteCustom ?? handleDelete}
                      className="flex-row items-center justify-center gap-1.5 py-2"
                    >
                      <MaterialIcons
                        name="delete-outline"
                        size={18}
                        color="#ef4444"
                      />
                      <Text className="text-error font-headline text-sm">
                        Usuń
                      </Text>
                    </TouchableOpacity>
                  )}
                </>
              ) : acceptAction ? (
                <>
                  {rejectAction && !isNarrow && (
                    <TouchableOpacity
                      onPress={rejectAction.onPress}
                      className="flex-row items-center gap-1.5 mr-auto"
                    >
                      <MaterialIcons name="close" size={18} color="#ef4444" />
                      <Text className="text-error font-headline text-sm">
                        {rejectAction.label}
                      </Text>
                    </TouchableOpacity>
                  )}
                  {!rejectAction && !isNarrow && <View className="flex-1" />}
                  <Button
                    label={acceptAction.label}
                    icon="check"
                    fullWidth={isNarrow}
                    loading={acceptAction.loading}
                    onPress={acceptAction.onPress}
                  />
                  <Button
                    variant="outline"
                    label="Edytuj"
                    fullWidth={isNarrow}
                    onPress={startEdit}
                  />
                  {rejectAction && isNarrow && (
                    <TouchableOpacity
                      onPress={rejectAction.onPress}
                      className="flex-row items-center justify-center gap-1.5 py-2"
                    >
                      <MaterialIcons name="close" size={18} color="#ef4444" />
                      <Text className="text-error font-headline text-sm">
                        {rejectAction.label}
                      </Text>
                    </TouchableOpacity>
                  )}
                </>
              ) : (
                <>
                  <Button
                    label="Edytuj"
                    fullWidth={isNarrow}
                    onPress={startEdit}
                  />
                  <Button
                    variant="outline"
                    label="Oznacz jako zakończone"
                    fullWidth={isNarrow}
                    loading={editTask.isPending}
                    onPress={handleMarkComplete}
                  />
                  <TouchableOpacity
                    onPress={handleDelete}
                    className={`flex-row items-center gap-1.5 ${
                      isNarrow ? "justify-center py-2" : "mr-auto"
                    }`}
                  >
                    <MaterialIcons
                      name="delete-outline"
                      size={18}
                      color="#ef4444"
                    />
                    <Text className="text-error font-headline text-sm">
                      Usuń
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
    <LinkCheckboxModal
      visible={noteLinkOpen}
      title="Podłącz notatki do zadania"
      searchPlaceholder="Szukaj notatek…"
      sections={noteLinkSections}
      onClose={() => setNoteLinkOpen(false)}
      onSave={saveTaskNoteLinks}
      saving={syncEntityNoteLinks.isPending}
    />
    </>
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

  const resolveDefaultStatusId = () => {
    if (defaultStatusId) return defaultStatusId;
    const todo = statuses.find((s) => {
      const name = s.name.trim().toLowerCase();
      return name === "to do" || name === "todo" || name === "do zrobienia";
    });
    return todo?.statusId ?? statuses[0]?.statusId ?? "";
  };

  useEffect(() => {
    if (visible) {
      setStatusId(resolveDefaultStatusId());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, defaultStatusId, statuses]);

  // Ctrl/Cmd+Enter confirms the task once it has been filled in.
  useEffect(() => {
    if (Platform.OS !== "web" || !visible) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        handleCreate();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, title, statusId, description, priority, categoryId, estimatedDuration]);

  function reset() {
    setTitle("");
    setDescription("");
    setPriority(TaskPriority.MEDIUM);
    setStatusId(resolveDefaultStatusId());
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
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        className="flex-1 bg-black/50 items-center justify-center p-6"
        onPress={onClose}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="bg-surface-container-lowest rounded-2xl p-6 w-full max-w-lg gap-4"
        >
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
              className="bg-surface-container-lowest rounded-xl p-4 text-on-surface font-body text-base border border-outline-variant"
              style={[{ minHeight: 80 }, NO_OUTLINE]}
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
        </Pressable>
      </Pressable>
    </Modal>
  );
}
