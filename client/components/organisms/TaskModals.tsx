import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
  Platform,
  Alert,
  useWindowDimensions,
} from "react-native";
import { useState, useMemo, useEffect, type ReactNode } from "react";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { Button, Input } from "../atoms";
import { InlineDatePicker } from "../atoms";
import { Avatar } from "../atoms/Avatar";
import { MentionText } from "../atoms/MentionText";
import {
  DraftTaskStepsEditor,
  LinkCheckboxModal,
  MentionInput,
  TaskHistorySection,
  TaskStepsSection,
} from "../molecules";
import type {
  Task,
  Category,
  TaskStatus,
  CalendarEvent,
  CreateTaskStepInput,
  WorkspaceMember,
} from "@/lib/types";
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
  getInitials,
} from "@/lib/utils";
import { getUiTokens } from "@/lib/utils/uiTokens";
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
  useTaskComments,
  useAddComment,
  useEditComment,
  useDeleteComment,
  useWorkspaceUsers,
} from "@/lib/hooks";
import { extractMentionedMembers } from "@/lib/utils/mentions";
import { useThemeStore } from "@/lib/stores/theme";
import { useWorkspaceStore } from "@/lib/stores/workspace";

import { useAuthStore } from "@/lib/stores/auth";
import { useT, useLocale } from "@/lib/i18n";

type TaskSaveData = {
  title: string;
  description: string;
  priority: TaskPriority;
  statusId: string;
  categoryId?: string;
  estimatedDuration: number;
  dueDateTime?: string;
};

type TaskDetailTab = "details" | "steps" | "links" | "comments" | "history";

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
  Platform.OS === "web" ? ({ outlineWidth: 0 } as const) : undefined;

/** Width of the property rail on wide screens. */
const RAIL_WIDTH = 288;
/** Above this length the description is clamped behind a "show more" toggle. */
const DESCRIPTION_CLAMP_CHARS = 200;

const PRIORITY_ICON: Record<TaskPriority, keyof typeof MaterialIcons.glyphMap> =
  {
    [TaskPriority.CRITICAL]: "keyboard-double-arrow-up",
    [TaskPriority.HIGH]: "keyboard-arrow-up",
    [TaskPriority.MEDIUM]: "remove",
    [TaskPriority.LOW]: "keyboard-arrow-down",
  };

const PRIORITY_LABEL_KEY: Record<TaskPriority, string> = {
  [TaskPriority.CRITICAL]: "priority.critical",
  [TaskPriority.HIGH]: "priority.high",
  [TaskPriority.MEDIUM]: "priority.medium",
  [TaskPriority.LOW]: "priority.low",
};

/** One `label ······ value` line of the property rail. */
function RailRow({
  label,
  onPress,
  children,
}: {
  label: string;
  onPress?: () => void;
  children: ReactNode;
}) {
  return (
    <View className="flex-row items-center justify-between gap-3 py-[7px]">
      <Text className="text-on-surface-variant font-body text-xs">{label}</Text>
      {onPress ? (
        <TouchableOpacity
          onPress={onPress}
          activeOpacity={0.7}
          className="flex-row items-center gap-1.5 flex-shrink px-2 py-1 rounded-md"
          style={{ marginRight: -8, minWidth: 0 }}
        >
          {children}
        </TouchableOpacity>
      ) : (
        <View
          className="flex-row items-center gap-1.5 flex-shrink"
          style={{ minWidth: 0 }}
        >
          {children}
        </View>
      )}
    </View>
  );
}

/** Inline option list that unfolds under a rail row instead of a popover. */
function RailPicker({ children }: { children: ReactNode }) {
  return (
    <View className="rounded-lg border border-outline-variant bg-surface-container-lowest p-1 mb-1.5 gap-0.5">
      {children}
    </View>
  );
}

function RailOption({
  active,
  onPress,
  children,
}: {
  active: boolean;
  onPress: () => void;
  children: ReactNode;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className={`flex-row items-center gap-2 px-2 py-1.5 rounded-md ${
        active ? "bg-surface-container-low" : ""
      }`}
    >
      {children}
    </TouchableOpacity>
  );
}

function RailDivider() {
  return <View className="h-px bg-border-subtle my-2.5" />;
}

/** 24px avatar used in the rail's overlapping assignee stack. */
function RailAvatar({
  name,
  overlap,
  isDark,
}: {
  name: string;
  overlap: boolean;
  isDark: boolean;
}) {
  return (
    <View
      className="rounded-full items-center justify-center bg-primary-fixed"
      style={{
        width: 24,
        height: 24,
        marginLeft: overlap ? -6 : 0,
        borderWidth: 1,
        borderColor: isDark ? "#1c1c1c" : "#ffffff",
      }}
    >
      <Text className="font-label text-primary" style={{ fontSize: 10 }}>
        {getInitials(name)}
      </Text>
    </View>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <Text className="text-text-tertiary font-label text-[11px] uppercase tracking-widest">
      {children}
    </Text>
  );
}

export function TaskDetailModal({
  task: taskProp,
  categories,
  statuses,
  visible,
  onClose,
  forceEdit = false,
  onSaveCustom,
  saveLoading,
  saveLabel,
  showDelete = true,
  onDeleteCustom,
  acceptAction,
  rejectAction,
}: TaskDetailModalProps) {
  const editTask = useEditTask();
  const t = useT();
  const locale = useLocale();
  const deleteTask = useDeleteTask();
  const setAssignees = useSetTaskAssignees();
  const router = useRouter();
  const themeMode = useThemeStore((s) => s.mode);
  const isDark = themeMode === "dark";
  const pColors = isDark ? PRIORITY_COLORS_DARK : PRIORITY_COLORS;
  const { data: allEvents } = useEvents();
  const { data: liveTasks } = useTasks();
  const { data: allNotes } = useNotes();
  // Select the stable workspace object (not a derived array): returning
  // `?? []` *inside* the selector creates a new array every render, which
  // Zustand treats as a changed value → infinite re-render (React #185).
  const activeWorkspace = useWorkspaceStore((s) => s.getActiveWorkspace());
  const workspaceMembers = activeWorkspace?.assignedUsers ?? [];
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
  const [activeTab, setActiveTab] = useState<TaskDetailTab>("details");
  const [descExpanded, setDescExpanded] = useState(false);
  const [railPicker, setRailPicker] = useState<
    "status" | "priority" | "assignees" | null
  >(null);
  const syncEntityNoteLinks = useSyncEntityNoteLinks();
  const ui = getUiTokens(isDark);
  const accent = isDark ? "#9b8cff" : "#5b4ee0";

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

  const commentsEnabled = !onSaveCustom && !!task && task.accepted;
  // Propozycje AI nie mają jeszcze wpisów historii — zakładka tylko dla zapisanych.
  const historyEnabled = !onSaveCustom && !!task && task.accepted;
  const { data: taskComments } = useTaskComments(
    commentsEnabled && task ? task.taskId : null,
  );

  useEffect(() => {
    if (visible && task) {
      setEditing(forceEdit || !!onSaveCustom);
      setActiveTab(
        !task.accepted && task.steps.length > 0 ? "steps" : "details",
      );
      if (forceEdit || onSaveCustom) startEdit();
    } else {
      setEditing(false);
    }
    setShowDuePicker(false);
    setDescExpanded(false);
    setRailPicker(null);
    // `forceEdit`/`onSaveCustom` are intentionally excluded: they are stable in
    // behaviour per modal instance but `onSaveCustom` is often an inline
    // function (new identity each render). Including it would re-run startEdit()
    // every render → setState loop (React error #185). Re-sync only when the
    // modal opens or the task changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task?.taskId, visible]);

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
  }, [
    visible,
    onClose,
    editing,
    title,
    description,
    priority,
    statusId,
    categoryId,
    estimatedDuration,
    dueDate,
    dueHour,
    dueMin,
  ]);

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

  // Tab counters carry the weight of the folded-away content, so the rail can
  // stay dense: Steps shows done/total, Links the number of attached items.
  const stepsDone = task?.steps.filter((s) => s.completed).length ?? 0;
  const linksCount = relatedEvents.length + linkedNotes.length;
  const detailTabs: [
    TaskDetailTab,
    keyof typeof MaterialIcons.glyphMap,
    string,
    string | null,
  ][] = [
    ["details", "info-outline", t("taskModal.tabDetails"), null],
    [
      "steps",
      "checklist",
      t("taskModal.tabSteps"),
      task?.steps.length ? `${stepsDone}/${task.steps.length}` : null,
    ],
    [
      "links",
      "link",
      t("taskModal.tabLinks"),
      linksCount > 0 ? String(linksCount) : null,
    ],
    ...(historyEnabled
      ? ([["history", "history", t("taskModal.tabHistory"), null]] as [
          TaskDetailTab,
          keyof typeof MaterialIcons.glyphMap,
          string,
          string | null,
        ][])
      : []),
  ];

  const noteLinkSections = useMemo(
    () => [
      {
        label: t("nav.notes"),
        emptyMessage: t("taskModal.noNotesInWorkspace"),
        items: (allNotes ?? []).map((n) => ({
          id: n.id,
          label: n.title || t("taskModal.noteFallback"),
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

  /**
   * Edit a single field from the property rail. `PUT task` replaces the whole
   * record, so every unchanged field has to be sent back untouched.
   */
  function applyTaskPatch(
    patch: Partial<TaskSaveData>,
    onSuccess?: () => void,
  ) {
    if (!task) return;
    editTask.mutate(
      {
        taskId: task.taskId,
        data: {
          title: task.title,
          description: task.description,
          priority: task.priority,
          statusId: task.statusId,
          categoryId: task.categoryId ?? undefined,
          estimatedDuration: task.estimatedDuration,
          dueDateTime: resolveTaskDueDateTimeForSave(task, relatedEvents),
          ...patch,
        },
      },
      onSuccess ? { onSuccess } : undefined,
    );
  }

  // `PUT assignees` replaces the list wholesale — always send the full set.
  function toggleTaskAssignee(userId: string) {
    if (!task) return;
    const current = task.assignedUserIds ?? [];
    setAssignees.mutate({
      taskId: task.taskId,
      userIds: current.includes(userId)
        ? current.filter((id) => id !== userId)
        : [...current, userId],
    });
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
    applyTaskPatch({ statusId: doneStatus.statusId }, onClose);
  }

  if (!task) return null;

  // Terminem rządzi powiązane wydarzenie, jeśli istnieje (pułapka 10).
  const effectiveDue = getEffectiveTaskDueDateTime(task, relatedEvents);
  const assignedIds = task.assignedUserIds ?? [];
  const descriptionIsLong =
    task.description.length > DESCRIPTION_CLAMP_CHARS ||
    task.description.split("\n").length > 3;

  /** Dense metadata column — every row is `label ······ value`. */
  const propertyRail = (
    <View>
      <RailRow
        label={t("taskModal.status")}
        onPress={() => setRailPicker((p) => (p === "status" ? null : "status"))}
      >
        {status ? (
          <>
            <View
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: status.color }}
            />
            <Text
              className="text-on-surface font-body text-[12.5px] flex-shrink"
              numberOfLines={1}
            >
              {status.name}
            </Text>
          </>
        ) : (
          <Text className="text-on-surface-variant font-body text-[12.5px]">
            —
          </Text>
        )}
        <MaterialIcons
          name={railPicker === "status" ? "expand-less" : "expand-more"}
          size={15}
          color={ui.textMuted}
        />
      </RailRow>
      {railPicker === "status" && (
        <RailPicker>
          {statuses.map((s) => (
            <RailOption
              key={s.statusId}
              active={s.statusId === task.statusId}
              onPress={() => {
                setRailPicker(null);
                if (s.statusId !== task.statusId)
                  applyTaskPatch({ statusId: s.statusId });
              }}
            >
              <View
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: s.color }}
              />
              <Text
                className="text-on-surface font-body text-xs flex-1"
                numberOfLines={1}
              >
                {s.name}
              </Text>
              {s.statusId === task.statusId && (
                <MaterialIcons
                  name="check"
                  size={14}
                  color={ui.textSecondary}
                />
              )}
            </RailOption>
          ))}
        </RailPicker>
      )}

      <RailRow
        label={t("taskModal.priority")}
        onPress={() =>
          setRailPicker((p) => (p === "priority" ? null : "priority"))
        }
      >
        <MaterialIcons
          name={PRIORITY_ICON[task.priority]}
          size={15}
          color={pColors[task.priority]}
        />
        <Text className="text-on-surface font-body text-[12.5px]">
          {t(PRIORITY_LABEL_KEY[task.priority])}
        </Text>
        <MaterialIcons
          name={railPicker === "priority" ? "expand-less" : "expand-more"}
          size={15}
          color={ui.textMuted}
        />
      </RailRow>
      {railPicker === "priority" && (
        <RailPicker>
          {Object.values(TaskPriority).map((p) => (
            <RailOption
              key={p}
              active={p === task.priority}
              onPress={() => {
                setRailPicker(null);
                if (p !== task.priority) applyTaskPatch({ priority: p });
              }}
            >
              <MaterialIcons
                name={PRIORITY_ICON[p]}
                size={15}
                color={pColors[p]}
              />
              <Text className="text-on-surface font-body text-xs flex-1">
                {t(PRIORITY_LABEL_KEY[p])}
              </Text>
              {p === task.priority && (
                <MaterialIcons
                  name="check"
                  size={14}
                  color={ui.textSecondary}
                />
              )}
            </RailOption>
          ))}
        </RailPicker>
      )}

      <RailRow label={t("taskModal.category")}>
        {cat ? (
          <>
            <View
              className="w-[7px] h-[7px] rounded-full"
              style={{
                backgroundColor: getCategoryDisplayColor(cat.color, isDark),
              }}
            />
            <Text
              className="text-on-surface font-body text-[12.5px] flex-shrink"
              numberOfLines={1}
            >
              {cat.name}
            </Text>
          </>
        ) : (
          <Text className="text-on-surface-variant font-body text-[12.5px]">
            {t("taskModal.none")}
          </Text>
        )}
      </RailRow>

      <RailDivider />

      <RailRow label={t("taskModal.dueDate")}>
        <Text
          className={`font-body text-[12.5px] ${
            effectiveDue && isOverdue(effectiveDue)
              ? "text-error"
              : "text-on-surface"
          }`}
        >
          {effectiveDue ? formatDateTime(effectiveDue) : "—"}
        </Text>
      </RailRow>
      <RailRow label={t("taskModal.duration")}>
        <Text className="text-on-surface font-body text-[12.5px]">
          {task.estimatedDuration > 0
            ? formatDuration(task.estimatedDuration)
            : "—"}
        </Text>
      </RailRow>
      <RailRow label={t("taskModal.createdAt")}>
        <Text className="text-on-surface-variant font-body text-[12.5px]">
          {formatDateTime(task.createdAt)}
        </Text>
      </RailRow>

      <RailDivider />

      <RailRow label={t("taskModal.assignees")}>
        {assignedMembers.length === 0 && workspaceMembers.length === 0 ? (
          <Text className="text-on-surface-variant font-body text-[12.5px]">
            {t("taskModal.nobodyAssigned")}
          </Text>
        ) : (
          <View className="flex-row items-center">
            {assignedMembers.map((m, i) => (
              <RailAvatar
                key={m.userId}
                name={m.fullName ?? m.email ?? "?"}
                overlap={i > 0}
                isDark={isDark}
              />
            ))}
            {workspaceMembers.length > 0 && (
              <TouchableOpacity
                accessibilityLabel={t("taskModal.assignees")}
                onPress={() =>
                  setRailPicker((p) => (p === "assignees" ? null : "assignees"))
                }
                className="items-center justify-center rounded-full"
                style={{
                  width: 24,
                  height: 24,
                  marginLeft: assignedMembers.length > 0 ? 4 : 0,
                  borderWidth: 1,
                  borderStyle: "dashed",
                  borderColor: ui.borderHover,
                }}
              >
                <MaterialIcons
                  name={railPicker === "assignees" ? "close" : "add"}
                  size={14}
                  color={ui.textMuted}
                />
              </TouchableOpacity>
            )}
          </View>
        )}
      </RailRow>
      {railPicker === "assignees" && (
        <RailPicker>
          {workspaceMembers.map((m) => {
            const selected = assignedIds.includes(m.userId);
            return (
              <RailOption
                key={m.userId}
                active={selected}
                onPress={() => toggleTaskAssignee(m.userId)}
              >
                <RailAvatar
                  name={m.fullName ?? m.email ?? "?"}
                  overlap={false}
                  isDark={isDark}
                />
                <Text
                  className="text-on-surface font-body text-xs flex-1"
                  numberOfLines={1}
                >
                  {m.fullName ?? m.email ?? t("common.user")}
                </Text>
                {selected && (
                  <MaterialIcons
                    name="check"
                    size={14}
                    color={ui.textSecondary}
                  />
                )}
              </RailOption>
            );
          })}
        </RailPicker>
      )}
    </View>
  );

  /**
   * Read view of the Details tab: content owns the width, metadata is squeezed
   * into the rail, and the composer stays pinned while the thread scrolls.
   */
  const detailsPane = (
    <View className={`flex-1 ${isWide ? "flex-row" : ""}`}>
      <View className="flex-1" style={{ minWidth: 0 }}>
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingTop: 20,
            paddingBottom: 20,
            gap: 22,
          }}
        >
          <View className="gap-2">
            <SectionLabel>{t("taskModal.description")}</SectionLabel>
            {task.description ? (
              <>
                <Text
                  className="text-on-surface font-body text-sm leading-6"
                  numberOfLines={
                    descriptionIsLong && !descExpanded ? 3 : undefined
                  }
                >
                  {task.description}
                </Text>
                {descriptionIsLong && (
                  <TouchableOpacity
                    onPress={() => setDescExpanded((v) => !v)}
                    className="flex-row items-center gap-1 self-start"
                  >
                    <MaterialIcons
                      name={descExpanded ? "expand-less" : "expand-more"}
                      size={16}
                      color={accent}
                    />
                    <Text
                      className="font-label text-xs"
                      style={{ color: accent }}
                    >
                      {descExpanded
                        ? t("taskModal.showLess")
                        : t("taskModal.showFullDescription")}
                    </Text>
                  </TouchableOpacity>
                )}
              </>
            ) : (
              <Text className="text-on-surface-variant font-body text-sm">
                {t("taskModal.noDescription")}
              </Text>
            )}
          </View>

          {/* Narrow screens have no rail — the properties fold in as a card. */}
          {!isWide && (
            <View className="rounded-xl border border-outline-variant px-4 py-2">
              {propertyRail}
            </View>
          )}

          {commentsEnabled && (
            <View className="gap-3">
              <View className="flex-row items-center gap-2">
                <SectionLabel>{t("comments.title")}</SectionLabel>
                {!!taskComments?.length && (
                  <Text className="text-text-tertiary font-body text-[11px]">
                    {taskComments.length}
                  </Text>
                )}
                <View className="flex-1 h-px bg-border-subtle" />
              </View>
              <TaskCommentsThread taskId={task.taskId} isDark={isDark} />
            </View>
          )}
        </ScrollView>

        {commentsEnabled && (
          <View className="px-6 pt-2 pb-4 border-t border-outline-variant">
            <TaskCommentComposer
              taskId={task.taskId}
              assignedUserIds={assignedIds}
              isDark={isDark}
            />
          </View>
        )}
      </View>

      {isWide && (
        <View
          className="border-l border-outline-variant"
          style={{ width: RAIL_WIDTH }}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 18 }}
          >
            {propertyRail}
          </ScrollView>
        </View>
      )}
    </View>
  );

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
            className="bg-surface rounded-xl w-full max-w-5xl overflow-hidden border border-outline-variant"
            style={{ height: isNarrow ? "95%" : "90%", maxHeight: 860 }}
          >
              {/* Header: breadcrumb, title, live status pill */}
              <View className="px-6 pt-5 pb-1">
                <View className="flex-row items-start justify-between gap-4">
                  <View className="flex-1" style={{ minWidth: 0 }}>
                    <View className="flex-row items-center gap-1 mb-2">
                      <Text className="text-text-tertiary font-label text-[11px] uppercase tracking-[0.06em]">
                        {t("nav.tasks")}
                      </Text>
                      {cat && (
                        <>
                          <MaterialIcons
                            name="chevron-right"
                            size={14}
                            color={ui.textMuted}
                          />
                          <Text
                            className="text-text-tertiary font-label text-[11px] uppercase tracking-[0.06em] flex-shrink"
                            numberOfLines={1}
                          >
                            {cat.name}
                          </Text>
                        </>
                      )}
                    </View>
                    {editing ? (
                      <Input value={title} onChangeText={setTitle} />
                    ) : (
                      <View className="flex-row items-center flex-wrap gap-x-3 gap-y-2">
                        <Text className="font-display text-on-surface text-2xl leading-8">
                          {task.title}
                        </Text>
                        {status && (
                          <View
                            className="flex-row items-center gap-1.5 px-2.5 py-[3px] rounded-full border"
                            style={{
                              backgroundColor: `${status.color}1A`,
                              borderColor: `${status.color}66`,
                            }}
                          >
                            <View
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: status.color }}
                            />
                            <Text
                              className="font-label text-[11px]"
                              style={{ color: status.color }}
                            >
                              {status.name}
                            </Text>
                          </View>
                        )}
                        {task.source === TaskSource.AI_PARSED && (
                          <View className="flex-row items-center gap-1">
                            <MaterialIcons
                              name="auto-awesome"
                              size={13}
                              color={accent}
                            />
                            <Text
                              className="text-[11px] font-label"
                              style={{ color: accent }}
                            >
                              AI
                            </Text>
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      setEditing(false);
                      onClose();
                    }}
                    className="p-1 rounded-md"
                  >
                    <MaterialIcons
                      name="close"
                      size={22}
                      color={ui.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View className="px-6 pt-3 border-b border-outline-variant flex-row gap-0.5">
                {detailTabs.map(([tabId, icon, label, count]) => {
                  const selected = activeTab === tabId;
                  return (
                    <TouchableOpacity
                      key={tabId}
                      accessibilityState={{ selected }}
                      className={`min-h-10 flex-row items-center justify-center gap-1.5 px-2.5 border-b-2 ${
                        selected ? "border-primary" : "border-transparent"
                      }`}
                      onPress={() => setActiveTab(tabId)}
                    >
                      <MaterialIcons
                        name={icon}
                        size={15}
                        color={selected ? accent : ui.textSecondary}
                      />
                      <Text
                        className={`font-label text-xs ${
                          selected ? "text-primary" : "text-on-surface-variant"
                        }`}
                      >
                        {label}
                      </Text>
                      {count && (
                        <Text className="text-text-tertiary font-body text-[11px]">
                          {count}
                        </Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

            {activeTab === "details" && !editing ? (
              detailsPane
            ) : (
            <ScrollView
              className="flex-1"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingTop: 20, paddingBottom: 20 }}
            >

              {activeTab === "steps" ? (
                <View className="px-6">
                  <TaskStepsSection
                    task={task}
                    editable={editing}
                    allowCompletion={task.accepted}
                  />
                </View>
              ) : null}

              {activeTab === "history" ? (
                <View className="px-6">
                  <TaskHistorySection taskId={task.taskId} />
                </View>
              ) : null}

              {/* Details in edit mode — the read view is the property-rail pane */}
              {activeTab === "details" ? <View
                className={`px-6 pb-4 ${isWide ? "flex-row gap-6" : "gap-4"}`}
              >
                {/* Left column: description + category */}
                <View className={`${isWide ? "flex-1" : ""} gap-4`}>
                  <View className="gap-2">
                    <SectionLabel>{t("taskModal.description")}</SectionLabel>
                    <TextInput
                      className="bg-surface-container-lowest rounded-xl p-4 text-on-surface font-body text-sm border border-outline-variant"
                      style={[{ minHeight: 120 }, NO_OUTLINE]}
                      multiline
                      textAlignVertical="top"
                      value={description}
                      onChangeText={setDescription}
                      placeholderTextColor="#6b6965"
                      placeholder={t("taskModal.descPlaceholder")}
                    />
                  </View>

                  <View className="gap-2">
                    <SectionLabel>{t("taskModal.category")}</SectionLabel>
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
                          {t("taskModal.none")}
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
                </View>

                {/* Right column: status, priority, times */}
                <View className={`${isWide ? "w-56" : ""} gap-4`}>
                  {/* Status */}
                  <View className="gap-2">
                    <SectionLabel>{t("taskModal.status")}</SectionLabel>
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

                  {/* Priority */}
                  <View className="gap-2">
                    <SectionLabel>{t("taskModal.priority")}</SectionLabel>
                    <View className="flex-row gap-2 flex-wrap">
                      {Object.values(TaskPriority).map((p) => (
                        <TouchableOpacity
                          key={p}
                          onPress={() => setPriority(p)}
                          className={`flex-row items-center gap-1.5 px-3 py-1.5 rounded-full border ${
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
                          <MaterialIcons
                            name={PRIORITY_ICON[p]}
                            size={14}
                            color={priority === p ? "#ffffff" : pColors[p]}
                          />
                          <Text
                            className={`text-xs font-label ${
                              priority === p
                                ? "text-white"
                                : "text-on-surface-variant"
                            }`}
                          >
                            {t(PRIORITY_LABEL_KEY[p])}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* Duration */}
                  <View className="gap-1">
                    <SectionLabel>{t("taskModal.duration")}</SectionLabel>
                    <Input
                      value={estimatedDuration}
                      onChangeText={setEstimatedDuration}
                      placeholder={t("taskModal.minPlaceholder")}
                      keyboardType="numeric"
                    />
                  </View>

                  {/* Due date */}
                  <View className="gap-1">
                    <SectionLabel>{t("taskModal.dueDate")}</SectionLabel>
                      <View>
                        <TouchableOpacity
                          onPress={() => setShowDuePicker(!showDuePicker)}
                          className="flex-row items-center justify-between bg-surface-container-low rounded-xl px-4 py-3"
                        >
                          <Text className="text-on-surface font-body text-sm">
                            {dueDate
                              ? (() => {
                                  const d = parseApiDateTime(dueDate);
                                  return `${d.toLocaleDateString(locale, {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                  })} ${dueHour}:${dueMin}`;
                                })()
                              : t("taskModal.pickDate")}
                          </Text>
                          <MaterialIcons
                            name={
                              showDuePicker ? "expand-less" : "calendar-today"
                            }
                            size={18}
                            color="#6b6965"
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
                                {t("taskModal.hour")}
                              </Text>
                              <TextInput
                                value={dueHour}
                                onChangeText={(v) =>
                                  setDueHour(v.replace(/\D/g, "").slice(0, 2))
                                }
                                maxLength={2}
                                placeholder="HH"
                                placeholderTextColor="#6b6965"
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
                                placeholderTextColor="#6b6965"
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
                                {t("taskModal.removeDue")}
                              </Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                  </View>

                  {/* Assignees */}
                  <View className="gap-2">
                    <SectionLabel>{t("taskModal.assignees")}</SectionLabel>
                    {workspaceMembers.length === 0 ? (
                      <Text className="text-on-surface-variant font-body text-sm">
                        {t("taskModal.noMembers")}
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
                                {m.fullName ?? m.email ?? t("common.user")}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    )}
                  </View>
                </View>
              </View> : null}

              {/* Related events */}
              {activeTab === "links" && relatedEvents.length > 0 && (
                <View className="px-6 pb-4">
                  <Text className="text-on-surface-variant font-label text-xs uppercase tracking-widest mb-3">
                    {t("taskModal.relatedEvents")}
                  </Text>
                  <View className="flex-row flex-wrap gap-3">
                    {relatedEvents.map((evt) => {
                      const evtDate = new Date(evt.startDateTime);
                      const evtTime = evtDate.toLocaleTimeString(locale, {
                        hour: "2-digit",
                        minute: "2-digit",
                      });
                      const evtDay = evtDate.toLocaleDateString(locale, {
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
                              color={isDark ? "#9b8cff" : "#5b4ee0"}
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
              {activeTab === "links" && (
                <View className="px-6 pb-4">
                  <View className="flex-row items-center justify-between mb-3">
                    <Text className="text-on-surface-variant font-label text-xs uppercase tracking-widest">
                      {t("taskModal.relatedNotes")}
                    </Text>
                    <TouchableOpacity
                      onPress={openNoteLinkModal}
                      className="flex-row items-center gap-1 px-2 py-1 rounded-lg bg-surface-container-low border border-outline-variant"
                    >
                      <MaterialIcons name="link" size={14} color="#9b9791" />
                      <Text className="text-on-surface-variant font-label text-xs">
                        {t("taskModal.link")}
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
                            {n.title || t("taskModal.noteFallback")}
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
                      {t("taskModal.noLinkedNotes")}
                    </Text>
                  )}
                </View>
              )}

            </ScrollView>
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
                          color="#C0392B"
                        />
                        <Text className="text-error font-headline text-sm">
                          {t("common.delete")}
                        </Text>
                      </TouchableOpacity>
                    )}
                    {!showDelete && !isNarrow && <View className="flex-1" />}
                    <Button
                      label={saveLabel ?? t("common.save")}
                      icon="check"
                      fullWidth={isNarrow}
                      loading={saveLoading ?? editTask.isPending}
                      onPress={handleSave}
                    />
                    <Button
                      variant="outline"
                      label={t("common.cancel")}
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
                          color="#C0392B"
                        />
                        <Text className="text-error font-headline text-sm">
                          {t("common.delete")}
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
                        <MaterialIcons name="close" size={18} color="#C0392B" />
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
                      label={t("taskModal.edit")}
                      fullWidth={isNarrow}
                      onPress={startEdit}
                    />
                    {rejectAction && isNarrow && (
                      <TouchableOpacity
                        onPress={rejectAction.onPress}
                        className="flex-row items-center justify-center gap-1.5 py-2"
                      >
                        <MaterialIcons name="close" size={18} color="#C0392B" />
                        <Text className="text-error font-headline text-sm">
                          {rejectAction.label}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </>
                ) : (
                  <>
                    <Button
                      label={t("taskModal.markComplete")}
                      icon="check"
                      fullWidth={isNarrow}
                      loading={editTask.isPending}
                      onPress={handleMarkComplete}
                    />
                    <Button
                      variant="outline"
                      label={t("taskModal.edit")}
                      fullWidth={isNarrow}
                      onPress={startEdit}
                    />
                    <TouchableOpacity
                      onPress={handleDelete}
                      className={`flex-row items-center gap-1.5 ${
                        isNarrow ? "justify-center py-2" : "ml-auto"
                      }`}
                    >
                      <MaterialIcons
                        name="delete-outline"
                        size={18}
                        color="#C0392B"
                      />
                      <Text className="text-error font-headline text-sm">
                        {t("common.delete")}
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
          </Pressable>
        </Pressable>
      </Modal>
      <LinkCheckboxModal
        visible={noteLinkOpen}
        title={t("taskModal.linkNotesTitle")}
        searchPlaceholder={t("taskModal.searchNotes")}
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
  const t = useT();
  const cThemeMode = useThemeStore((s) => s.mode);
  const cPColors =
    cThemeMode === "dark" ? PRIORITY_COLORS_DARK : PRIORITY_COLORS;
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>(TaskPriority.MEDIUM);
  const [statusId, setStatusId] = useState(defaultStatusId ?? "");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [estimatedDuration, setEstimatedDuration] = useState("");
  const [steps, setSteps] = useState<CreateTaskStepInput[]>([]);

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
  }, [
    visible,
    title,
    statusId,
    description,
    priority,
    categoryId,
    estimatedDuration,
    steps,
  ]);

  function reset() {
    setTitle("");
    setDescription("");
    setPriority(TaskPriority.MEDIUM);
    setStatusId(resolveDefaultStatusId());
    setCategoryId(null);
    setEstimatedDuration("");
    setSteps([]);
  }

  function handleCreate() {
    if (!title.trim() || !statusId) return;
    const normalizedSteps = steps
      .map((step) => ({ ...step, title: step.title.trim() }))
      .filter((step) => step.title.length > 0);
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
        steps: normalizedSteps,
      },
      {
        onSuccess: () => {
          reset();
          onClose();
        },
      },
    );
  }

  const selectedStatus = statuses.find((s) => s.statusId === statusId);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 bg-black/50 items-center justify-center p-4"
        onPress={onClose}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="bg-surface rounded-2xl w-full max-w-lg max-h-[90%] overflow-hidden border border-outline-variant shadow-modal"
        >
          {/* Header */}
          <View className="flex-row items-center justify-between px-5 py-4 border-b border-outline-variant">
            <View className="flex-row items-center gap-2.5">
              <View className="w-7 h-7 rounded-lg bg-primary-fixed items-center justify-center">
                <MaterialIcons name="add-task" size={16} color="#5b4ee0" />
              </View>
              <Text className="font-headline text-on-surface text-base">
                {t("tasks.newTask")}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              className="p-1 rounded-md hover:bg-surface-container-low"
            >
              <MaterialIcons name="close" size={20} color="#9b9791" />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: 20, gap: 18 }}
          >
            {/* Title — leads, borderless and prominent */}
            <View className="w-full">
              <TextInput
                className="text-on-surface font-headline text-lg pb-1"
                style={NO_OUTLINE}
                value={title}
                onChangeText={setTitle}
                placeholder={t("taskModal.namePlaceholder")}
                placeholderTextColor="#b8b4af"
                autoFocus={Platform.OS === "web"}
              />
              <View className="h-px bg-outline-variant" />
            </View>

            {/* Description */}
            <View className="w-full">
              <Text className="text-on-surface-variant font-label text-[11px] mb-1.5">
                {t("taskModal.descLabel")}
              </Text>
              <TextInput
                className="bg-surface-container-lowest rounded-lg px-3.5 py-3 text-on-surface font-body text-sm border border-outline-variant"
                style={[{ minHeight: 76 }, NO_OUTLINE]}
                multiline
                textAlignVertical="top"
                value={description}
                onChangeText={setDescription}
                placeholder={t("taskModal.descOptional")}
                placeholderTextColor="#b8b4af"
              />
            </View>

            <DraftTaskStepsEditor steps={steps} onChange={setSteps} />

            {/* Priority — soft-tinted chips with a color dot */}
            <View className="w-full">
              <Text className="text-on-surface-variant font-label text-[11px] mb-1.5">
                {t("taskModal.priority")}
              </Text>
              <View className="flex-row gap-1.5 flex-wrap">
                {Object.values(TaskPriority).map((p) => {
                  const active = priority === p;
                  return (
                    <TouchableOpacity
                      key={p}
                      onPress={() => setPriority(p)}
                      className="flex-row items-center gap-1.5 px-2.5 py-1.5 rounded-lg border"
                      style={
                        active
                          ? {
                              backgroundColor: `${cPColors[p]}1A`,
                              borderColor: cPColors[p],
                            }
                          : { borderColor: "transparent" }
                      }
                    >
                      <View
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: cPColors[p] }}
                      />
                      <Text
                        className="text-xs font-label"
                        style={{
                          color: active ? cPColors[p] : "#6b6965",
                        }}
                      >
                        {p}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Status */}
            <View className="w-full">
              <Text className="text-on-surface-variant font-label text-[11px] mb-1.5">
                {t("taskModal.status")}
              </Text>
              <View className="flex-row gap-1.5 flex-wrap">
                {statuses.map((s) => {
                  const active = statusId === s.statusId;
                  return (
                    <TouchableOpacity
                      key={s.statusId}
                      onPress={() => setStatusId(s.statusId)}
                      className="flex-row items-center gap-1.5 px-2.5 py-1.5 rounded-lg border"
                      style={
                        active
                          ? {
                              backgroundColor: `${s.color}1A`,
                              borderColor: s.color,
                            }
                          : { borderColor: "transparent" }
                      }
                    >
                      <View
                        className="w-2 h-2 rounded-[2px]"
                        style={{ backgroundColor: s.color }}
                      />
                      <Text
                        className="text-xs font-label"
                        style={{ color: active ? s.color : "#6b6965" }}
                      >
                        {s.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Category */}
            <View className="w-full">
              <Text className="text-on-surface-variant font-label text-[11px] mb-1.5">
                {t("taskModal.category")}
              </Text>
              <View className="flex-row gap-1.5 flex-wrap">
                <TouchableOpacity
                  onPress={() => setCategoryId(null)}
                  className="px-2.5 py-1.5 rounded-lg border"
                  style={{
                    borderColor: !categoryId ? "#c8c4be" : "transparent",
                    backgroundColor: !categoryId
                      ? "rgba(0,0,0,0.03)"
                      : "transparent",
                  }}
                >
                  <Text className="text-xs font-label text-on-surface-variant">
                    {t("taskModal.none")}
                  </Text>
                </TouchableOpacity>
                {categories.map((c) => {
                  const active = categoryId === c.categoryId;
                  return (
                    <TouchableOpacity
                      key={c.categoryId}
                      onPress={() => setCategoryId(c.categoryId)}
                      className="flex-row items-center gap-1.5 px-2.5 py-1.5 rounded-lg border"
                      style={
                        active
                          ? {
                              backgroundColor: `${c.color}1A`,
                              borderColor: c.color,
                            }
                          : { borderColor: "transparent" }
                      }
                    >
                      <View
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: c.color }}
                      />
                      <Text
                        className="text-xs font-label"
                        style={{ color: active ? c.color : "#6b6965" }}
                      >
                        {c.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Duration */}
            <View className="w-40">
              <Text className="text-on-surface-variant font-label text-[11px] mb-1.5">
                {t("taskModal.duration")}
              </Text>
              <View className="flex-row items-center bg-surface-container-lowest rounded-lg border border-outline-variant pr-3">
                <TextInput
                  className="flex-1 px-3.5 py-2.5 text-on-surface font-body text-sm"
                  style={NO_OUTLINE}
                  value={estimatedDuration}
                  onChangeText={setEstimatedDuration}
                  placeholder={t("taskModal.durationExample")}
                  placeholderTextColor="#b8b4af"
                  keyboardType="numeric"
                />
                <Text className="text-text-tertiary font-label text-xs">
                  {t("taskModal.minPlaceholder")}
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Footer */}
          <View className="flex-row items-center justify-between px-5 py-3.5 border-t border-outline-variant">
            <View className="flex-row items-center gap-1.5">
              {selectedStatus && (
                <>
                  <View
                    className="w-2 h-2 rounded-[2px]"
                    style={{ backgroundColor: selectedStatus.color }}
                  />
                  <Text className="text-text-tertiary font-body text-xs">
                    {selectedStatus.name}
                  </Text>
                </>
              )}
            </View>
            <View className="flex-row gap-2.5">
              <Button
                variant="outline"
                label={t("common.cancel")}
                onPress={onClose}
              />
              <Button
                label={t("tasks.createTask")}
                icon="check"
                loading={createTask.isPending}
                disabled={!title.trim() || !statusId}
                onPress={handleCreate}
              />
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/**
 * Comment composer. Split from the thread so the Details pane can pin it below
 * a scrolling list instead of letting it scroll away.
 */
function TaskCommentComposer({
  taskId,
  assignedUserIds,
  isDark,
}: {
  taskId: string;
  assignedUserIds: string[];
  isDark: boolean;
}) {
  const t = useT();
  const currentUser = useAuthStore((s) => s.user);
  const { data: mentionTargets } = useWorkspaceUsers();
  const setAssignees = useSetTaskAssignees();
  const addComment = useAddComment();
  const [draft, setDraft] = useState("");

  const accent = isDark ? "#9b8cff" : "#5b4ee0";

  const pendingAssignees = useMemo(() => {
    const assigned = new Set(assignedUserIds);
    return extractMentionedMembers(draft, mentionTargets).filter(
      (member) => !assigned.has(member.userId),
    );
  }, [draft, mentionTargets, assignedUserIds]);

  async function submit() {
    const content = draft.trim();
    if (!content || addComment.isPending || setAssignees.isPending) return;

    if (pendingAssignees.length) {
      try {
        await setAssignees.mutateAsync({
          taskId,
          userIds: [
            ...assignedUserIds,
            ...pendingAssignees.map((member) => member.userId),
          ],
        });
      } catch {}
    }

    addComment.mutate({ taskId, content }, { onSuccess: () => setDraft("") });
  }

  return (
    <View className="flex-row items-start gap-3">
      <Avatar fullName={currentUser?.fullName ?? "?"} size="sm" />
      <View className="flex-1">
        <MentionInput
          value={draft}
          onChangeText={setDraft}
          members={mentionTargets}
          isDark={isDark}
          placeholder={t("comments.placeholder")}
        />
        <View className="flex-row items-center justify-end gap-2 mt-2">
          {pendingAssignees.length > 0 ? (
            <View className="flex-row items-center gap-1.5 mr-auto flex-1">
              <MaterialIcons name="person-add" size={13} color={accent} />
              <Text
                className="text-on-surface-variant font-body text-xs flex-1"
                numberOfLines={2}
              >
                {t("comments.mentionWillAssign", {
                  names: pendingAssignees
                    .map((member) => member.fullName)
                    .join(", "),
                })}
              </Text>
            </View>
          ) : (
            mentionTargets.length > 0 &&
            !draft.trim() && (
              <Text className="text-on-surface-variant font-body text-xs mr-auto">
                {t("comments.mentionTip")}
              </Text>
            )
          )}
          <TouchableOpacity
            onPress={submit}
            disabled={!draft.trim() || addComment.isPending}
            className="flex-row items-center gap-1.5 px-4 py-2 rounded-full"
            style={{
              backgroundColor: draft.trim() ? accent : "#3a3a42",
              opacity: draft.trim() ? 1 : 0.5,
            }}
          >
            <MaterialIcons name="send" size={15} color="#ffffff" />
            <Text className="text-white font-label text-xs">
              {t("comments.send")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

/** Comment thread, newest first. Rendered above the pinned composer. */
function TaskCommentsThread({
  taskId,
  isDark,
}: {
  taskId: string;
  isDark: boolean;
}) {
  const t = useT();
  const currentUser = useAuthStore((s) => s.user);
  const { data: comments, isLoading } = useTaskComments(taskId);
  const { data: mentionTargets } = useWorkspaceUsers();
  const activeWorkspace = useWorkspaceStore((s) => s.getActiveWorkspace());
  const editComment = useEditComment();
  const deleteComment = useDeleteComment();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");

  const accent = isDark ? "#9b8cff" : "#5b4ee0";

  const highlightMembers = useMemo<WorkspaceMember[]>(
    () =>
      (activeWorkspace?.assignedUsers ?? [])
        .filter((u) => !!u.fullName)
        .map((u) => ({
          userId: u.userId,
          fullName: u.fullName as string,
          email: u.email ?? "",
        })),
    [activeWorkspace],
  );

  const list = useMemo(
    () =>
      [...(comments ?? [])].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [comments],
  );

  function saveEdit(commentId: string) {
    const content = editDraft.trim();
    if (!content) return;
    editComment.mutate(
      { taskId, commentId, content },
      { onSuccess: () => setEditingId(null) },
    );
  }

  function confirmDelete(commentId: string) {
    const run = () => deleteComment.mutate({ taskId, commentId });
    if (Platform.OS === "web") {
      if (typeof window !== "undefined" && window.confirm(t("comments.deleteConfirm")))
        run();
    } else {
      Alert.alert("", t("comments.deleteConfirm"), [
        { text: t("comments.cancel"), style: "cancel" },
        { text: t("comments.delete"), style: "destructive", onPress: run },
      ]);
    }
  }

  return (
    <View>
      {isLoading ? (
        <Text className="text-on-surface-variant font-body text-sm">…</Text>
      ) : list.length === 0 ? (
        <View className="items-center py-6 gap-2">
          <MaterialIcons
            name="chat-bubble-outline"
            size={28}
            color={isDark ? "#4a4a52" : "#c8c4bd"}
          />
          <Text className="text-on-surface-variant font-body text-sm text-center">
            {t("comments.empty")}
          </Text>
        </View>
      ) : (
        <View className="gap-3">
          {list.map((c) => {
            const mine = c.authorId === currentUser?.userId;
            const isEditing = editingId === c.commentId;
            const edited = c.updatedAt !== c.createdAt;
            return (
              <View key={c.commentId} className="flex-row items-start gap-3">
                <Avatar fullName={c.authorName || "?"} size="sm" />
                <View className="flex-1 bg-surface-container-low rounded-xl px-4 py-3 border border-outline-variant">
                  <View className="flex-row items-center gap-2 mb-1">
                    <Text
                      className="text-on-surface font-headline text-sm flex-shrink"
                      numberOfLines={1}
                    >
                      {c.authorName || "?"}
                    </Text>
                    <Text className="text-on-surface-variant font-body text-xs">
                      {formatDateTime(c.createdAt)}
                    </Text>
                    {edited && (
                      <Text className="text-on-surface-variant font-body text-xs italic">
                        ({t("comments.edited")})
                      </Text>
                    )}
                    {mine && !isEditing && (
                      <View className="flex-row items-center gap-1 ml-auto">
                        <TouchableOpacity
                          onPress={() => {
                            setEditingId(c.commentId);
                            setEditDraft(c.content);
                          }}
                          hitSlop={8}
                        >
                          <MaterialIcons
                            name="edit"
                            size={15}
                            color="#9b9791"
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => confirmDelete(c.commentId)}
                          hitSlop={8}
                        >
                          <MaterialIcons
                            name="delete-outline"
                            size={16}
                            color="#C0392B"
                          />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                  {isEditing ? (
                    <View className="gap-2">
                      <MentionInput
                        value={editDraft}
                        onChangeText={setEditDraft}
                        members={mentionTargets}
                        isDark={isDark}
                        autoFocus
                        minHeight={40}
                      />
                      <View className="flex-row justify-end gap-2">
                        <TouchableOpacity
                          onPress={() => setEditingId(null)}
                          className="px-3 py-1.5 rounded-full border border-outline-variant"
                        >
                          <Text className="text-on-surface-variant font-label text-xs">
                            {t("comments.cancel")}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => saveEdit(c.commentId)}
                          disabled={!editDraft.trim() || editComment.isPending}
                          className="px-3 py-1.5 rounded-full"
                          style={{ backgroundColor: accent }}
                        >
                          <Text className="text-white font-label text-xs">
                            {t("comments.save")}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <MentionText
                      content={c.content}
                      members={highlightMembers}
                      currentUserId={currentUser?.userId}
                      isDark={isDark}
                      className="text-on-surface font-body text-sm leading-5"
                    />
                  )}
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}
