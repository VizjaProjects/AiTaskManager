import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Modal,
  Pressable,
  Platform,
  Dimensions,
  useWindowDimensions,
} from "react-native";
import { createPortal } from "react-dom";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
  type RefObject,
} from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { PageLayout } from "@/components/organisms";
import {
  TaskDetailModal,
  CreateTaskModal,
} from "@/components/organisms/TaskModals";
import {
  EmptyState,
  TaskCardSkeleton,
  PriorityBadge,
  ColorBadge,
} from "@/components/atoms";
import {
  useTasks,
  useCategories,
  useTaskStatuses,
  useEditTask,
  useSetTaskAssignees,
  useNotes,
  useEvents,
} from "@/lib/hooks";
import { TaskPriority, TaskSource } from "@/lib/types";
import type { Task, Category, TaskStatus } from "@/lib/types";
import {
  PRIORITY_COLORS,
  formatDate,
  formatDuration,
  getCategoryDisplayColor,
  resolveTaskCategoryId,
  resolveTaskDueDateTimeForSave,
} from "@/lib/utils";
import { useThemeStore } from "@/lib/stores";
import { useWorkspaceStore } from "@/lib/stores/workspace";
import { getInitials } from "@/lib/utils";

type ViewMode = "kanban" | "list";
type ListGrouping = "status" | "category-status";
type ColumnSort = "default" | "updated" | "category" | "priority";

const COLUMN_ORDER_KEY = "kanban-column-order";

function loadColumnOrder(): string[] {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    try {
      const saved = window.localStorage.getItem(COLUMN_ORDER_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
  }
  return [];
}

function saveColumnOrder(order: string[]) {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    window.localStorage.setItem(COLUMN_ORDER_KEY, JSON.stringify(order));
  }
}

function DraggableCard({
  taskId,
  children,
}: {
  taskId: string;
  children: React.ReactNode;
}) {
  const ref = useRef<View>(null);

  useEffect(() => {
    if (Platform.OS !== "web" || !ref.current) return;
    const el = ref.current as unknown as HTMLElement;
    el.draggable = true;
    el.style.cursor = "grab";
    el.dataset.taskCard = "true";
    const onStart = (e: DragEvent) => {
      e.stopPropagation();
      e.dataTransfer?.setData("application/task-id", taskId);
      e.dataTransfer?.setData("text/plain", taskId);
      if (e.dataTransfer) e.dataTransfer.effectAllowed = "move";
      el.style.opacity = "0.5";
    };
    const onEnd = () => {
      el.style.opacity = "1";
    };
    el.addEventListener("dragstart", onStart);
    el.addEventListener("dragend", onEnd);
    return () => {
      el.removeEventListener("dragstart", onStart);
      el.removeEventListener("dragend", onEnd);
      el.draggable = false;
      el.style.cursor = "";
    };
  }, [taskId]);

  return <View ref={ref}>{children}</View>;
}

function KanbanTaskCard({
  task,
  category,
  onPress,
  isCompleted,
}: {
  task: Task;
  category?: Category;
  onPress: () => void;
  isCompleted?: boolean;
}) {
  const members = useWorkspaceStore(
    (s) => s.getActiveWorkspace()?.assignedUsers ?? [],
  );
  const setAssignees = useSetTaskAssignees();
  const router = useRouter();
  const { data: allNotes } = useNotes();
  const [assignOpen, setAssignOpen] = useState(false);
  const assignees = members.filter((m) =>
    (task.assignedUserIds ?? []).includes(m.userId),
  );
  const linkedNotes = (allNotes ?? []).filter((n) =>
    n.linkedTaskIds?.includes(task.taskId),
  );

  function openLinkedNote(noteId: string) {
    router.push(`/(app)/notes?noteId=${encodeURIComponent(noteId)}` as never);
  }

  function toggleMember(userId: string) {
    const current = task.assignedUserIds ?? [];
    const next = current.includes(userId)
      ? current.filter((id) => id !== userId)
      : [...current, userId];
    setAssignees.mutate({ taskId: task.taskId, userIds: next });
  }

  return (
    <DraggableCard taskId={task.taskId}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-4 gap-2.5 w-full"
        style={isCompleted ? { opacity: 0.55 } : undefined}
      >
        <View className="flex-row items-center gap-2 flex-wrap">
          <PriorityBadge priority={task.priority} />
          {category && (
            <ColorBadge label={category.name} color={category.color} />
          )}
          {task.source === TaskSource.AI_PARSED && (
            <View className="flex-row items-center gap-1 px-2 py-0.5 rounded-full bg-primary-fixed">
              <MaterialIcons name="auto-awesome" size={10} color="#4d41df" />
              <Text className="text-primary text-[9px] font-label">AI</Text>
            </View>
          )}
          {linkedNotes.length > 0 && (
            <View className="flex-row items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-surface-container border border-outline-variant">
              <MaterialIcons name="sticky-note-2" size={11} color="#777587" />
              <Text className="text-on-surface-variant text-[9px] font-label">
                {linkedNotes.length}
              </Text>
            </View>
          )}
        </View>

        <Text
          className="font-headline text-on-surface text-base leading-5"
          numberOfLines={3}
          style={
            isCompleted ? { textDecorationLine: "line-through" } : undefined
          }
        >
          {task.title}
        </Text>

        {task.description ? (
          <Text
            className="text-on-surface-variant font-body text-body-md leading-5"
            numberOfLines={3}
            style={
              isCompleted ? { textDecorationLine: "line-through" } : undefined
            }
          >
            {task.description}
          </Text>
        ) : null}

        {linkedNotes.length > 0 && (
          <View className="flex-row flex-wrap gap-1.5">
            {linkedNotes.slice(0, 3).map((n) => (
              <TouchableOpacity
                key={n.id}
                onPress={() => openLinkedNote(n.id)}
                activeOpacity={0.7}
                className="flex-row items-center gap-1 px-2 py-0.5 rounded-md bg-surface-container border border-outline-variant max-w-[92%]"
              >
                <MaterialIcons name="sticky-note-2" size={11} color="#777587" />
                <Text
                  className="text-on-surface-variant font-body text-[10px] shrink"
                  numberOfLines={1}
                >
                  {n.title || "Notatka"}
                </Text>
              </TouchableOpacity>
            ))}
            {linkedNotes.length > 3 && (
              <Text className="text-on-surface-variant font-body text-[10px] self-center">
                +{linkedNotes.length - 3}
              </Text>
            )}
          </View>
        )}

        <View className="flex-row items-center justify-between mt-0.5">
          {task.dueDateTime ? (
            <View className="flex-row items-center gap-1.5">
              <MaterialIcons name="calendar-today" size={14} color="#777587" />
              <Text className="text-on-surface-variant font-body text-xs">
                {formatDate(task.dueDateTime)}
              </Text>
            </View>
          ) : (
            <View />
          )}

          {/* Quick-assign control: avatar stack, or a dashed circle if empty. */}
          <TouchableOpacity
            onPress={() => setAssignOpen(true)}
            hitSlop={8}
            className="flex-row items-center"
          >
            {assignees.length === 0 ? (
              <View className="w-7 h-7 rounded-full items-center justify-center border border-dashed border-outline">
                <MaterialIcons name="person-add" size={14} color="#9ca3af" />
              </View>
            ) : (
              <>
                {assignees.slice(0, 4).map((m, i) => (
                  <View
                    key={m.userId}
                    className="w-6 h-6 rounded-full bg-primary-fixed items-center justify-center border border-surface-container-lowest"
                    style={{ marginLeft: i === 0 ? 0 : -6 }}
                  >
                    <Text className="text-primary text-[9px] font-headline">
                      {getInitials(m.fullName ?? m.email ?? "?")}
                    </Text>
                  </View>
                ))}
                {assignees.length > 4 && (
                  <View
                    className="w-6 h-6 rounded-full bg-surface-container items-center justify-center border border-surface-container-lowest"
                    style={{ marginLeft: -6 }}
                  >
                    <Text className="text-on-surface-variant text-[9px] font-headline">
                      +{assignees.length - 4}
                    </Text>
                  </View>
                )}
              </>
            )}
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      <Modal
        visible={assignOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setAssignOpen(false)}
      >
        <Pressable
          className="flex-1 bg-black/40 items-center justify-center px-6"
          onPress={() => setAssignOpen(false)}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            className="w-full max-w-[360px] bg-surface-container-lowest rounded-2xl border border-outline-variant overflow-hidden"
          >
            <View className="flex-row items-center justify-between px-5 pt-4 pb-3 border-b border-outline-variant">
              <Text className="text-on-surface font-headline text-base">
                Przypisz osoby
              </Text>
              <TouchableOpacity
                onPress={() => setAssignOpen(false)}
                className="p-1"
              >
                <MaterialIcons name="close" size={20} color="#9b9791" />
              </TouchableOpacity>
            </View>
            {members.length === 0 ? (
              <Text className="text-on-surface-variant font-body text-sm px-5 py-4">
                Brak członków workspace. Dodaj ich w ustawieniach workspace.
              </Text>
            ) : (
              <ScrollView style={{ maxHeight: 320 }}>
                {members.map((m) => {
                  const checked = (task.assignedUserIds ?? []).includes(
                    m.userId,
                  );
                  const name = m.fullName ?? m.email ?? "Użytkownik";
                  return (
                    <TouchableOpacity
                      key={m.userId}
                      onPress={() => toggleMember(m.userId)}
                      className="flex-row items-center gap-3 px-5 py-2.5"
                    >
                      <View className="w-8 h-8 rounded-full bg-primary-fixed items-center justify-center">
                        <Text className="text-primary text-[10px] font-headline">
                          {getInitials(name)}
                        </Text>
                      </View>
                      <Text
                        className="flex-1 text-on-surface font-body text-sm"
                        numberOfLines={1}
                      >
                        {name}
                      </Text>
                      <MaterialIcons
                        name={checked ? "check-box" : "check-box-outline-blank"}
                        size={20}
                        color={checked ? "#4d41df" : "#9b9791"}
                      />
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </DraggableCard>
  );
}

function DropColumn({
  statusId,
  onDrop,
  isDragOver,
  setDragOverId,
  onCreateInColumn,
  children,
}: {
  statusId: string;
  onDrop: (taskId: string, statusId: string) => void;
  isDragOver: boolean;
  setDragOverId: (id: string | null) => void;
  onCreateInColumn?: (statusId: string) => void;
  children: React.ReactNode;
}) {
  const ref = useRef<View>(null);

  useEffect(() => {
    if (Platform.OS !== "web" || !ref.current) return;
    const el = ref.current as unknown as HTMLElement;
    const handleOver = (e: DragEvent) => {
      const types = e.dataTransfer?.types ?? [];
      if (
        types.includes("application/task-id") ||
        types.includes("text/plain")
      ) {
        e.preventDefault();
        if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
        setDragOverId(statusId);
      }
    };
    const handleLeave = (e: DragEvent) => {
      if (!el.contains(e.relatedTarget as Node)) {
        setDragOverId(null);
      }
    };
    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOverId(null);
      const taskId =
        e.dataTransfer?.getData("application/task-id") ||
        e.dataTransfer?.getData("text/plain");
      if (taskId) onDrop(taskId, statusId);
    };
    el.addEventListener("dragover", handleOver);
    el.addEventListener("dragleave", handleLeave);
    el.addEventListener("drop", handleDrop);
    const handleDblClick = (e: MouseEvent) => {
      const targetEl = e.target as HTMLElement | null;
      if (targetEl && targetEl.closest("[data-task-card]")) return;
      onCreateInColumn?.(statusId);
    };
    el.addEventListener("dblclick", handleDblClick);
    return () => {
      el.removeEventListener("dragover", handleOver);
      el.removeEventListener("dragleave", handleLeave);
      el.removeEventListener("drop", handleDrop);
      el.removeEventListener("dblclick", handleDblClick);
    };
  }, [statusId, onDrop, setDragOverId, onCreateInColumn]);

  return (
    <View
      ref={ref}
      className={`w-72 rounded-2xl p-3 ${
        isDragOver
          ? "bg-primary/10 border-2 border-dashed border-primary"
          : "bg-surface-container-low/50"
      }`}
      style={{ alignSelf: "stretch" }}
    >
      {children}
    </View>
  );
}

export default function TasksScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && width >= 1024;
  const { data: tasks, isLoading, refetch } = useTasks();
  const { data: events } = useEvents();
  const { data: categories } = useCategories();
  const { data: statuses, isLoading: statusesLoading } = useTaskStatuses();
  const editTask = useEditTask();
  const isDark = useThemeStore((s) => s.mode) === "dark";
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>(() =>
    Platform.OS === "web" && Dimensions.get("window").width >= 1024
      ? "kanban"
      : "list",
  );
  const [listGrouping, setListGrouping] = useState<ListGrouping>("status");
  const [selectedPriorities, setSelectedPriorities] = useState<
    Set<TaskPriority>
  >(new Set());
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<Set<string>>(
    new Set(),
  );
  const [selectedStatusIds, setSelectedStatusIds] = useState<Set<string>>(
    new Set(),
  );
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [dropdownPos, setDropdownPos] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const priorityBtnRef = useRef<View>(null);
  const categoryBtnRef = useRef<View>(null);
  const statusBtnRef = useRef<View>(null);

  const openDropdownAt = useCallback(
    (name: string, ref: RefObject<View | null>) => {
      if (openDropdown === name) {
        setOpenDropdown(null);
        setDropdownPos(null);
        return;
      }
      if (Platform.OS === "web" && ref.current) {
        const el = ref.current as unknown as HTMLElement;
        const rect = el.getBoundingClientRect();
        setDropdownPos({ top: rect.bottom + 4, left: rect.left });
      }
      setOpenDropdown(name);
    },
    [openDropdown],
  );

  const [showCreate, setShowCreate] = useState(false);
  const [createStatusId, setCreateStatusId] = useState<string | undefined>();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [columnOrder, setColumnOrder] = useState<string[]>(loadColumnOrder);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);
  const [columnSorts, setColumnSorts] = useState<Record<string, ColumnSort>>(
    {},
  );
  const [openSortMenu, setOpenSortMenu] = useState<string | null>(null);
  const [sortMenuPos, setSortMenuPos] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const sortBtnRefs = useRef<Record<string, HTMLElement | null>>({});

  const isDoneStatus = useCallback(
    (statusId: string) => {
      const status = statuses?.find((s) => s.statusId === statusId);
      if (!status) return false;
      const name = status.name.toLowerCase();
      return (
        name === "done" ||
        name === "completed" ||
        name === "zakończone" ||
        name === "ukończone"
      );
    },
    [statuses],
  );

  useEffect(() => {
    if (params.taskId && tasks) {
      const t = tasks.find((t) => t.taskId === params.taskId);
      if (t) setSelectedTask(t);
    }
  }, [params.taskId, tasks]);

  const orderedStatuses = useMemo(() => {
    if (!statuses) return [];
    if (columnOrder.length === 0) return statuses;
    const statusMap = new Map(statuses.map((s) => [s.statusId, s]));
    const ordered: TaskStatus[] = [];
    for (const id of columnOrder) {
      const s = statusMap.get(id);
      if (s) {
        ordered.push(s);
        statusMap.delete(id);
      }
    }
    for (const s of statusMap.values()) ordered.push(s);
    return ordered;
  }, [statuses, columnOrder]);

  const defaultCreateStatusId = useMemo(() => {
    const list = statuses ?? [];
    const todo = list.find((s) => {
      const name = s.name.trim().toLowerCase();
      return name === "to do" || name === "todo" || name === "do zrobienia";
    });
    return todo?.statusId ?? orderedStatuses[0]?.statusId;
  }, [statuses, orderedStatuses]);

  function moveColumn(statusId: string, direction: -1 | 1) {
    const ids = orderedStatuses.map((s) => s.statusId);
    const idx = ids.indexOf(statusId);
    const newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= ids.length) return;
    [ids[idx], ids[newIdx]] = [ids[newIdx], ids[idx]];
    setColumnOrder(ids);
    saveColumnOrder(ids);
  }

  const categoryMap = useMemo(() => {
    const m = new Map<string, Category>();
    categories?.forEach((c) => m.set(c.categoryId, c));
    return m;
  }, [categories]);

  const filteredTasks = useMemo(() => {
    let result = tasks ?? [];
    if (selectedPriorities.size > 0)
      result = result.filter((t) => selectedPriorities.has(t.priority));
    if (selectedCategoryIds.size > 0)
      result = result.filter(
        (t) => t.categoryId != null && selectedCategoryIds.has(t.categoryId),
      );
    if (selectedStatusIds.size > 0)
      result = result.filter((t) => selectedStatusIds.has(t.statusId));
    if (!showCompleted)
      result = result.filter((t) => !isDoneStatus(t.statusId));
    return result;
  }, [
    tasks,
    selectedPriorities,
    selectedCategoryIds,
    selectedStatusIds,
    showCompleted,
    isDoneStatus,
  ]);

  const groupedByStatus = useMemo(() => {
    const groups = new Map<string, Task[]>();
    orderedStatuses.forEach((s) => groups.set(s.statusId, []));
    filteredTasks.forEach((t) => {
      const list = groups.get(t.statusId) ?? [];
      list.push(t);
      groups.set(t.statusId, list);
    });
    return groups;
  }, [filteredTasks, orderedStatuses]);

  const PRIORITY_ORDER: Record<string, number> = {
    CRITICAL: 0,
    HIGH: 1,
    MEDIUM: 2,
    LOW: 3,
  };

  const sortColumnTasks = useCallback(
    (tasks: Task[], sort: ColumnSort): Task[] => {
      if (sort === "default") return tasks;
      return [...tasks].sort((a, b) => {
        switch (sort) {
          case "updated":
            return (
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
            );
          case "priority":
            return (
              (PRIORITY_ORDER[a.priority] ?? 9) -
              (PRIORITY_ORDER[b.priority] ?? 9)
            );
          case "category": {
            const catA = a.categoryId
              ? (categoryMap.get(a.categoryId)?.name ?? "")
              : "zzz";
            const catB = b.categoryId
              ? (categoryMap.get(b.categoryId)?.name ?? "")
              : "zzz";
            return catA.localeCompare(catB);
          }
          default:
            return 0;
        }
      });
    },
    [categoryMap],
  );

  const groupedByCategoryStatus = useMemo(() => {
    const result: Array<{
      categoryId: string | null;
      categoryName: string;
      categoryColor: string;
      groups: Array<{
        status: TaskStatus;
        tasks: Task[];
      }>;
    }> = [];

    const catIds = new Set<string | null>();
    filteredTasks.forEach((t) => catIds.add(t.categoryId));

    const sortedCatIds = Array.from(catIds).sort((a, b) => {
      if (!a) return 1;
      if (!b) return -1;
      const ca = categoryMap.get(a);
      const cb = categoryMap.get(b);
      return (ca?.name ?? "").localeCompare(cb?.name ?? "");
    });

    for (const catId of sortedCatIds) {
      const catTasks = filteredTasks.filter((t) => t.categoryId === catId);
      const cat = catId ? categoryMap.get(catId) : undefined;
      const statusGroups: Array<{ status: TaskStatus; tasks: Task[] }> = [];

      for (const s of orderedStatuses) {
        const sTasks = catTasks.filter((t) => t.statusId === s.statusId);
        if (sTasks.length > 0) statusGroups.push({ status: s, tasks: sTasks });
      }

      if (statusGroups.length > 0) {
        result.push({
          categoryId: catId,
          categoryName: cat?.name ?? "Bez kategorii",
          categoryColor: cat?.color ?? "#777587",
          groups: statusGroups,
        });
      }
    }
    return result;
  }, [filteredTasks, orderedStatuses, categoryMap]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleDropTask = useCallback(
    (taskId: string, newStatusId: string) => {
      const task = tasks?.find((t) => t.taskId === taskId);
      if (!task || task.statusId === newStatusId) return;
      editTask.mutate({
        taskId,
        data: {
          title: task.title,
          description: task.description,
          priority: task.priority,
          statusId: newStatusId,
          categoryId: resolveTaskCategoryId(task.categoryId, categories),
          estimatedDuration: task.estimatedDuration,
          dueDateTime: resolveTaskDueDateTimeForSave(task, events),
        },
      });
    },
    [tasks, events, editTask, categories],
  );

  const priorities = Object.values(TaskPriority);

  if (isLoading || statusesLoading) {
    return (
      <PageLayout>
        <View className="gap-3 mt-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <TaskCardSkeleton key={i} />
          ))}
        </View>
      </PageLayout>
    );
  }

  return (
    <PageLayout searchPlaceholder="Search tasks...">
      <View className="gap-4 flex-1">
        <View className="flex-row items-center gap-2">
          <Text className="text-on-surface font-headline text-headline-md">
            All Tasks
          </Text>
          <View className="bg-surface-container px-2.5 py-0.5 rounded-full">
            <Text className="text-on-surface-variant font-label text-label-md">
              {tasks?.length ?? 0}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center justify-between flex-wrap gap-2">
          <View className="flex-row items-center gap-3">
            <View className="flex-row bg-surface-container-low rounded-full p-1">
              <TouchableOpacity
                onPress={() => setViewMode("list")}
                className={`px-4 py-2 rounded-full ${viewMode === "list" ? "bg-primary" : ""}`}
              >
                <Text
                  className={`text-xs font-label ${viewMode === "list" ? "text-on-primary" : "text-on-surface-variant"}`}
                >
                  List
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setViewMode("kanban")}
                className={`px-4 py-2 rounded-full ${viewMode === "kanban" ? "bg-primary" : ""}`}
              >
                <Text
                  className={`text-xs font-label ${viewMode === "kanban" ? "text-on-primary" : "text-on-surface-variant"}`}
                >
                  Kanban
                </Text>
              </TouchableOpacity>
            </View>

            {viewMode === "list" && (
              <View className="flex-row bg-surface-container-low rounded-full p-1">
                <TouchableOpacity
                  onPress={() => setListGrouping("status")}
                  className={`px-3 py-1.5 rounded-full ${listGrouping === "status" ? "bg-secondary" : ""}`}
                >
                  <Text
                    className={`text-[10px] font-label ${listGrouping === "status" ? "text-white" : "text-on-surface-variant"}`}
                  >
                    Status
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setListGrouping("category-status")}
                  className={`px-3 py-1.5 rounded-full ${listGrouping === "category-status" ? "bg-secondary" : ""}`}
                >
                  <Text
                    className={`text-[10px] font-label ${listGrouping === "category-status" ? "text-white" : "text-on-surface-variant"}`}
                  >
                    Kategoria + Status
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <TouchableOpacity
            onPress={() => {
              setCreateStatusId(defaultCreateStatusId);
              setShowCreate(true);
            }}
            className="bg-primary rounded-xl px-4 py-2.5 flex-row items-center gap-2"
          >
            <MaterialIcons
              name="add"
              size={18}
              color={isDark ? "#121212" : "#fff"}
            />
            <Text className="text-on-primary font-headline text-sm">
              New Task
            </Text>
          </TouchableOpacity>
        </View>

        {/* Close dropdown overlay */}
        {(openDropdown || openSortMenu) &&
          Platform.OS === "web" &&
          createPortal(
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => {
                setOpenDropdown(null);
                setDropdownPos(null);
                setOpenSortMenu(null);
                setSortMenuPos(null);
              }}
              style={{
                position: "fixed" as any,
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 99990,
              }}
            />,
            document.body,
          )}

        {/* Portaled dropdown panels */}
        {openDropdown === "priority" &&
          dropdownPos &&
          Platform.OS === "web" &&
          createPortal(
            <View
              className="bg-surface-container-lowest rounded-xl shadow-card py-1"
              style={{
                position: "fixed" as any,
                top: dropdownPos.top,
                left: dropdownPos.left,
                minWidth: 160,
                zIndex: 99999,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 12,
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  if (selectedPriorities.size === priorities.length) {
                    setSelectedPriorities(new Set());
                  } else {
                    setSelectedPriorities(new Set(priorities));
                  }
                }}
                className="flex-row items-center gap-2.5 px-3 py-2.5 border-b border-outline-variant/30"
              >
                <MaterialIcons
                  name={
                    selectedPriorities.size === priorities.length
                      ? "check-box"
                      : "check-box-outline-blank"
                  }
                  size={18}
                  color={
                    selectedPriorities.size === priorities.length
                      ? "#4d41df"
                      : "#777587"
                  }
                />
                <Text className="text-xs font-label text-on-surface-variant">
                  Zaznacz wszystko
                </Text>
              </TouchableOpacity>
              {priorities.map((p) => {
                const active = selectedPriorities.has(p);
                return (
                  <TouchableOpacity
                    key={p}
                    onPress={() => {
                      setSelectedPriorities((prev) => {
                        const next = new Set(prev);
                        if (active) next.delete(p);
                        else next.add(p);
                        return next;
                      });
                    }}
                    className="flex-row items-center gap-2.5 px-3 py-2.5"
                  >
                    <MaterialIcons
                      name={active ? "check-box" : "check-box-outline-blank"}
                      size={18}
                      color={active ? PRIORITY_COLORS[p] : "#777587"}
                    />
                    <View
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: PRIORITY_COLORS[p] }}
                    />
                    <Text
                      className={`text-xs font-label ${active ? "text-on-surface" : "text-on-surface-variant"}`}
                    >
                      {p}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>,
            document.body,
          )}

        {openDropdown === "category" &&
          dropdownPos &&
          Platform.OS === "web" &&
          createPortal(
            <View
              className="bg-surface-container-lowest rounded-xl shadow-card py-1"
              style={{
                position: "fixed" as any,
                top: dropdownPos.top,
                left: dropdownPos.left,
                minWidth: 200,
                zIndex: 99999,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 12,
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  const allIds = new Set(
                    (categories ?? []).map((c) => c.categoryId),
                  );
                  if (selectedCategoryIds.size === allIds.size) {
                    setSelectedCategoryIds(new Set());
                  } else {
                    setSelectedCategoryIds(allIds);
                  }
                }}
                className="flex-row items-center gap-2.5 px-3 py-2.5 border-b border-outline-variant/30"
              >
                <MaterialIcons
                  name={
                    selectedCategoryIds.size === (categories?.length ?? 0)
                      ? "check-box"
                      : "check-box-outline-blank"
                  }
                  size={18}
                  color={
                    selectedCategoryIds.size === (categories?.length ?? 0)
                      ? "#4d41df"
                      : "#777587"
                  }
                />
                <Text className="text-xs font-label text-on-surface-variant">
                  Zaznacz wszystko
                </Text>
              </TouchableOpacity>
              {categories?.map((cat) => {
                const active = selectedCategoryIds.has(cat.categoryId);
                return (
                  <TouchableOpacity
                    key={cat.categoryId}
                    onPress={() => {
                      setSelectedCategoryIds((prev) => {
                        const next = new Set(prev);
                        if (active) next.delete(cat.categoryId);
                        else next.add(cat.categoryId);
                        return next;
                      });
                    }}
                    className="flex-row items-center gap-2.5 px-3 py-2.5"
                  >
                    <MaterialIcons
                      name={active ? "check-box" : "check-box-outline-blank"}
                      size={18}
                      color={
                        active
                          ? getCategoryDisplayColor(cat.color, isDark)
                          : "#777587"
                      }
                    />
                    <View
                      className="w-2.5 h-2.5 rounded-full"
                      style={{
                        backgroundColor: getCategoryDisplayColor(
                          cat.color,
                          isDark,
                        ),
                      }}
                    />
                    <Text
                      className={`text-xs font-label ${active ? "text-on-surface" : "text-on-surface-variant"}`}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>,
            document.body,
          )}

        {openDropdown === "status" &&
          dropdownPos &&
          Platform.OS === "web" &&
          createPortal(
            <View
              className="bg-surface-container-lowest rounded-xl shadow-card py-1"
              style={{
                position: "fixed" as any,
                top: dropdownPos.top,
                left: dropdownPos.left,
                minWidth: 200,
                zIndex: 99999,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 12,
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  const allIds = new Set(
                    (statuses ?? []).map((s) => s.statusId),
                  );
                  if (selectedStatusIds.size === allIds.size) {
                    setSelectedStatusIds(new Set());
                  } else {
                    setSelectedStatusIds(allIds);
                  }
                }}
                className="flex-row items-center gap-2.5 px-3 py-2.5 border-b border-outline-variant/30"
              >
                <MaterialIcons
                  name={
                    selectedStatusIds.size === (statuses?.length ?? 0)
                      ? "check-box"
                      : "check-box-outline-blank"
                  }
                  size={18}
                  color={
                    selectedStatusIds.size === (statuses?.length ?? 0)
                      ? "#4d41df"
                      : "#777587"
                  }
                />
                <Text className="text-xs font-label text-on-surface-variant">
                  Zaznacz wszystko
                </Text>
              </TouchableOpacity>
              {statuses?.map((s) => {
                const active = selectedStatusIds.has(s.statusId);
                return (
                  <TouchableOpacity
                    key={s.statusId}
                    onPress={() => {
                      setSelectedStatusIds((prev) => {
                        const next = new Set(prev);
                        if (active) next.delete(s.statusId);
                        else next.add(s.statusId);
                        return next;
                      });
                    }}
                    className="flex-row items-center gap-2.5 px-3 py-2.5"
                  >
                    <MaterialIcons
                      name={active ? "check-box" : "check-box-outline-blank"}
                      size={18}
                      color={active ? s.color : "#777587"}
                    />
                    <View
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: s.color }}
                    />
                    <Text
                      className={`text-xs font-label ${active ? "text-on-surface" : "text-on-surface-variant"}`}
                    >
                      {s.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>,
            document.body,
          )}

        {/* Portaled sort menu */}
        {openSortMenu &&
          sortMenuPos &&
          Platform.OS === "web" &&
          createPortal(
            <View
              className="bg-surface-container-lowest rounded-xl shadow-card py-1"
              style={{
                position: "fixed" as any,
                top: sortMenuPos.top,
                left: sortMenuPos.left,
                minWidth: 180,
                zIndex: 99999,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 12,
              }}
            >
              {(
                [
                  { key: "default", label: "Domyślne", icon: "remove" },
                  {
                    key: "updated",
                    label: "Ostatnio zmienione",
                    icon: "update",
                  },
                  { key: "priority", label: "Priorytet", icon: "flag" },
                  { key: "category", label: "Kategoria", icon: "folder" },
                ] as const
              ).map((opt) => {
                const currentSort = columnSorts[openSortMenu] ?? "default";
                return (
                  <TouchableOpacity
                    key={opt.key}
                    onPress={() => {
                      setColumnSorts((prev) => ({
                        ...prev,
                        [openSortMenu]: opt.key,
                      }));
                      setOpenSortMenu(null);
                      setSortMenuPos(null);
                    }}
                    className="flex-row items-center gap-2.5 px-3 py-2.5"
                  >
                    <MaterialIcons
                      name={opt.icon as any}
                      size={16}
                      color={currentSort === opt.key ? "#4d41df" : "#777587"}
                    />
                    <Text
                      className={`text-xs font-label ${
                        currentSort === opt.key
                          ? "text-primary"
                          : "text-on-surface-variant"
                      }`}
                    >
                      {opt.label}
                    </Text>
                    {currentSort === opt.key && (
                      <MaterialIcons
                        name="check"
                        size={14}
                        color="#4d41df"
                        style={{ marginLeft: "auto" as any }}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>,
            document.body,
          )}

        {/* Filters */}
        <View
          className="flex-row items-center gap-2 flex-wrap"
          style={{ zIndex: 20 }}
        >
          {/* Priority dropdown */}
          <View
            ref={priorityBtnRef}
            style={{ position: "relative", zIndex: 30 }}
          >
            <TouchableOpacity
              onPress={() => openDropdownAt("priority", priorityBtnRef)}
              className={`flex-row items-center gap-1.5 px-3 py-2 rounded-xl border ${
                selectedPriorities.size > 0
                  ? "bg-primary/10 border-primary"
                  : "bg-surface-container-high border-outline-variant"
              }`}
            >
              <MaterialIcons
                name="flag"
                size={14}
                color={selectedPriorities.size > 0 ? "#4d41df" : "#777587"}
              />
              <Text
                className={`text-xs font-label ${selectedPriorities.size > 0 ? "text-primary" : "text-on-surface-variant"}`}
              >
                Priorytet
                {selectedPriorities.size > 0
                  ? ` (${selectedPriorities.size})`
                  : ""}
              </Text>
              <MaterialIcons
                name={
                  openDropdown === "priority" ? "expand-less" : "expand-more"
                }
                size={16}
                color="#777587"
              />
            </TouchableOpacity>
          </View>

          {/* Category dropdown */}
          {(categories?.length ?? 0) > 0 && (
            <View
              ref={categoryBtnRef}
              style={{ position: "relative", zIndex: 29 }}
            >
              <TouchableOpacity
                onPress={() => openDropdownAt("category", categoryBtnRef)}
                className={`flex-row items-center gap-1.5 px-3 py-2 rounded-xl border ${
                  selectedCategoryIds.size > 0
                    ? "bg-primary/10 border-primary"
                    : "bg-surface-container-high border-outline-variant"
                }`}
              >
                <MaterialIcons
                  name="folder"
                  size={14}
                  color={selectedCategoryIds.size > 0 ? "#4d41df" : "#777587"}
                />
                <Text
                  className={`text-xs font-label ${selectedCategoryIds.size > 0 ? "text-primary" : "text-on-surface-variant"}`}
                >
                  Kategoria
                  {selectedCategoryIds.size > 0
                    ? ` (${selectedCategoryIds.size})`
                    : ""}
                </Text>
                <MaterialIcons
                  name={
                    openDropdown === "category" ? "expand-less" : "expand-more"
                  }
                  size={16}
                  color="#777587"
                />
              </TouchableOpacity>
            </View>
          )}

          {/* Status dropdown */}
          {(statuses?.length ?? 0) > 0 && (
            <View
              ref={statusBtnRef}
              style={{ position: "relative", zIndex: 28 }}
            >
              <TouchableOpacity
                onPress={() => openDropdownAt("status", statusBtnRef)}
                className={`flex-row items-center gap-1.5 px-3 py-2 rounded-xl border ${
                  selectedStatusIds.size > 0
                    ? "bg-primary/10 border-primary"
                    : "bg-surface-container-high border-outline-variant"
                }`}
              >
                <MaterialIcons
                  name="view-kanban"
                  size={14}
                  color={selectedStatusIds.size > 0 ? "#4d41df" : "#777587"}
                />
                <Text
                  className={`text-xs font-label ${selectedStatusIds.size > 0 ? "text-primary" : "text-on-surface-variant"}`}
                >
                  Status
                  {selectedStatusIds.size > 0
                    ? ` (${selectedStatusIds.size})`
                    : ""}
                </Text>
                <MaterialIcons
                  name={
                    openDropdown === "status" ? "expand-less" : "expand-more"
                  }
                  size={16}
                  color="#777587"
                />
              </TouchableOpacity>
            </View>
          )}

          {(selectedPriorities.size > 0 ||
            selectedCategoryIds.size > 0 ||
            selectedStatusIds.size > 0) && (
            <TouchableOpacity
              onPress={() => {
                setSelectedPriorities(new Set());
                setSelectedCategoryIds(new Set());
                setSelectedStatusIds(new Set());
                setOpenDropdown(null);
              }}
              className="px-3 py-2"
            >
              <Text className="text-xs font-label text-primary">Wyczyść</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={() => setShowCompleted((v) => !v)}
            className={`flex-row items-center gap-1.5 px-3 py-2 rounded-xl border ${
              showCompleted
                ? "bg-primary/10 border-primary"
                : "bg-surface-container-high border-outline-variant"
            }`}
          >
            <MaterialIcons
              name={showCompleted ? "visibility" : "visibility-off"}
              size={14}
              color={showCompleted ? "#4d41df" : "#777587"}
            />
            <Text
              className={`text-xs font-label ${showCompleted ? "text-primary" : "text-on-surface-variant"}`}
            >
              Ukończone
            </Text>
          </TouchableOpacity>
        </View>

        {!tasks?.length ? (
          <EmptyState
            title="Brak zadań"
            description="Utwórz swoje pierwsze zadanie lub pozwól AI zaplanować Twój dzień"
            primaryAction={{
              label: "Utwórz zadanie",
              onPress: () => {
                setCreateStatusId(orderedStatuses[0]?.statusId);
                setShowCreate(true);
              },
            }}
          />
        ) : viewMode === "kanban" ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 16, paddingBottom: 32 }}
            style={{ flex: 1 }}
          >
            {orderedStatuses.map((status, colIdx) => {
              if (!showCompleted && isDoneStatus(status.statusId)) return null;
              const rawTasks = groupedByStatus.get(status.statusId) ?? [];
              const colSort = columnSorts[status.statusId] ?? "default";
              const statusTasks = sortColumnTasks(rawTasks, colSort);
              const isSortOpen = openSortMenu === status.statusId;
              return (
                <DropColumn
                  key={status.statusId}
                  statusId={status.statusId}
                  onDrop={handleDropTask}
                  isDragOver={dragOverId === status.statusId}
                  setDragOverId={setDragOverId}
                  onCreateInColumn={(sid) => {
                    setCreateStatusId(sid);
                    setShowCreate(true);
                  }}
                >
                  <View className="flex-row items-center justify-between mb-4 px-1">
                    <View className="flex-row items-center gap-2">
                      <View
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: status.color }}
                      />
                      <Text className="font-headline text-on-surface text-sm">
                        {status.name}
                      </Text>
                      <View className="bg-surface-container-high px-2 py-0.5 rounded-full">
                        <Text className="text-xs font-label text-on-surface-variant">
                          {statusTasks.length}
                        </Text>
                      </View>
                    </View>
                    <View className="flex-row items-center gap-0.5">
                      {colIdx > 0 && (
                        <TouchableOpacity
                          onPress={() => moveColumn(status.statusId, -1)}
                          className="p-1"
                        >
                          <MaterialIcons
                            name="chevron-left"
                            size={18}
                            color="#777587"
                          />
                        </TouchableOpacity>
                      )}
                      {colIdx < orderedStatuses.length - 1 && (
                        <TouchableOpacity
                          onPress={() => moveColumn(status.statusId, 1)}
                          className="p-1"
                        >
                          <MaterialIcons
                            name="chevron-right"
                            size={18}
                            color="#777587"
                          />
                        </TouchableOpacity>
                      )}
                      <View>
                        <TouchableOpacity
                          className="p-1"
                          ref={(el: any) => {
                            if (Platform.OS === "web" && el) {
                              sortBtnRefs.current[status.statusId] =
                                el as unknown as HTMLElement;
                            }
                          }}
                          onPress={() => {
                            if (isSortOpen) {
                              setOpenSortMenu(null);
                              setSortMenuPos(null);
                            } else {
                              const el = sortBtnRefs.current[status.statusId];
                              if (el) {
                                const rect = el.getBoundingClientRect();
                                setSortMenuPos({
                                  top: rect.bottom + 4,
                                  left: rect.right - 180,
                                });
                              }
                              setOpenSortMenu(status.statusId);
                            }
                          }}
                        >
                          <MaterialIcons
                            name="sort"
                            size={18}
                            color={
                              colSort !== "default" ? "#4d41df" : "#777587"
                            }
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>

                  <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ gap: 10 }}
                    style={{ flex: 1 }}
                  >
                    {statusTasks.map((task) => (
                      <KanbanTaskCard
                        key={task.taskId}
                        task={task}
                        category={
                          task.categoryId
                            ? categoryMap.get(task.categoryId)
                            : undefined
                        }
                        onPress={() => setSelectedTask(task)}
                        isCompleted={isDoneStatus(task.statusId)}
                      />
                    ))}
                  </ScrollView>
                </DropColumn>
              );
            })}
          </ScrollView>
        ) : listGrouping === "status" ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            contentContainerStyle={{ gap: 16, paddingBottom: 32 }}
          >
            {orderedStatuses.map((status) => {
              if (!showCompleted && isDoneStatus(status.statusId)) return null;
              const statusTasks = groupedByStatus.get(status.statusId) ?? [];
              if (statusTasks.length === 0) return null;
              return (
                <View key={status.statusId} className="gap-2">
                  <View className="flex-row items-center gap-2 px-1">
                    <View
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: status.color }}
                    />
                    <Text className="font-headline text-on-surface text-sm">
                      {status.name}
                    </Text>
                    <Text className="text-xs text-on-surface-variant font-body">
                      ({statusTasks.length})
                    </Text>
                  </View>
                  {statusTasks.map((task) => (
                    <KanbanTaskCard
                      key={task.taskId}
                      task={task}
                      category={
                        task.categoryId
                          ? categoryMap.get(task.categoryId)
                          : undefined
                      }
                      onPress={() => setSelectedTask(task)}
                      isCompleted={isDoneStatus(task.statusId)}
                    />
                  ))}
                </View>
              );
            })}
          </ScrollView>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            contentContainerStyle={{ gap: 20, paddingBottom: 32 }}
          >
            {groupedByCategoryStatus.map((catGroup) => (
              <View key={catGroup.categoryId ?? "none"} className="gap-3">
                <View className="flex-row items-center gap-2 px-1">
                  <View
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: getCategoryDisplayColor(
                        catGroup.categoryColor,
                        isDark,
                      ),
                    }}
                  />
                  <Text className="font-headline text-on-surface text-base">
                    {catGroup.categoryName}
                  </Text>
                </View>
                {catGroup.groups.map(({ status, tasks: sTasks }) => (
                  <View key={status.statusId} className="gap-2 ml-4">
                    <View className="flex-row items-center gap-2 px-1">
                      <View
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: status.color }}
                      />
                      <Text className="font-label text-on-surface-variant text-xs">
                        {status.name} ({sTasks.length})
                      </Text>
                    </View>
                    {sTasks.map((task) => (
                      <KanbanTaskCard
                        key={task.taskId}
                        task={task}
                        category={
                          task.categoryId
                            ? categoryMap.get(task.categoryId)
                            : undefined
                        }
                        onPress={() => setSelectedTask(task)}
                        isCompleted={isDoneStatus(task.statusId)}
                      />
                    ))}
                  </View>
                ))}
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      <TaskDetailModal
        task={selectedTask}
        categories={categories ?? []}
        statuses={statuses ?? []}
        visible={!!selectedTask}
        onClose={() => setSelectedTask(null)}
      />

      <CreateTaskModal
        visible={showCreate}
        onClose={() => setShowCreate(false)}
        defaultStatusId={createStatusId}
        categories={categories ?? []}
        statuses={statuses ?? []}
      />
    </PageLayout>
  );
}
