import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useMemo, useCallback, useEffect, useRef } from "react";
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
} from "@/lib/hooks";
import { TaskPriority, TaskSource } from "@/lib/types";
import type { Task, Category, TaskStatus } from "@/lib/types";
import { PRIORITY_COLORS, formatDate, formatDuration } from "@/lib/utils";

type ViewMode = "kanban" | "list";
type ListGrouping = "status" | "category-status";

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

function KanbanTaskCard({
  task,
  category,
  onPress,
}: {
  task: Task;
  category?: Category;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      className="bg-surface-container-lowest rounded-2xl overflow-hidden"
      style={{
        borderLeftWidth: 4,
        borderLeftColor: PRIORITY_COLORS[task.priority],
      }}
    >
      <View className="p-4 gap-2.5">
        <View className="flex-row items-center gap-2 flex-wrap">
          <PriorityBadge priority={task.priority} />
          {task.source === TaskSource.AI_PARSED && (
            <View className="flex-row items-center gap-1 px-1.5 py-0.5 rounded bg-secondary/10">
              <MaterialIcons name="auto-awesome" size={10} color="#006b58" />
              <Text className="text-secondary text-[9px] font-label">AI</Text>
            </View>
          )}
        </View>
        <Text
          className="font-headline text-on-surface text-sm"
          numberOfLines={2}
        >
          {task.title}
        </Text>
        {task.description ? (
          <Text
            className="text-on-surface-variant font-body text-xs"
            numberOfLines={2}
          >
            {task.description}
          </Text>
        ) : null}
        <View className="flex-row items-center gap-3 flex-wrap">
          {category && (
            <ColorBadge label={category.name} color={category.color} />
          )}
          {task.estimatedDuration > 0 && (
            <View className="flex-row items-center gap-1">
              <MaterialIcons name="schedule" size={12} color="#777587" />
              <Text className="text-on-surface-variant font-body text-[11px]">
                {formatDuration(task.estimatedDuration)}
              </Text>
            </View>
          )}
        </View>
        {task.dueDateTime && (
          <Text className="text-on-surface-variant font-body text-[11px]">
            {formatDate(task.dueDateTime)}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
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
    const onStart = (e: DragEvent) => {
      e.dataTransfer?.setData("application/task-id", taskId);
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
    };
  }, [taskId]);

  return <View ref={ref}>{children}</View>;
}

function DropColumn({
  statusId,
  onDrop,
  isDragOver,
  setDragOverId,
  children,
}: {
  statusId: string;
  onDrop: (taskId: string, statusId: string) => void;
  isDragOver: boolean;
  setDragOverId: (id: string | null) => void;
  children: React.ReactNode;
}) {
  const ref = useRef<View>(null);

  useEffect(() => {
    if (Platform.OS !== "web" || !ref.current) return;
    const el = ref.current as unknown as HTMLElement;
    const handleOver = (e: DragEvent) => {
      if (e.dataTransfer?.types.includes("application/task-id")) {
        e.preventDefault();
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
      setDragOverId(null);
      const taskId = e.dataTransfer?.getData("application/task-id");
      if (taskId) onDrop(taskId, statusId);
    };
    el.addEventListener("dragover", handleOver);
    el.addEventListener("dragleave", handleLeave);
    el.addEventListener("drop", handleDrop);
    return () => {
      el.removeEventListener("dragover", handleOver);
      el.removeEventListener("dragleave", handleLeave);
      el.removeEventListener("drop", handleDrop);
    };
  }, [statusId, onDrop, setDragOverId]);

  return (
    <View
      ref={ref}
      className={`w-72 rounded-2xl p-3 ${
        isDragOver
          ? "bg-primary/10 border-2 border-dashed border-primary"
          : "bg-surface-container-low/50"
      }`}
    >
      {children}
    </View>
  );
}

export default function TasksScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { data: tasks, isLoading, refetch } = useTasks();
  const { data: categories } = useCategories();
  const { data: statuses } = useTaskStatuses();
  const editTask = useEditTask();
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("kanban");
  const [listGrouping, setListGrouping] = useState<ListGrouping>("status");
  const [selectedPriority, setSelectedPriority] = useState<TaskPriority | null>(
    null,
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );
  const [showCreate, setShowCreate] = useState(false);
  const [createStatusId, setCreateStatusId] = useState<string | undefined>();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [columnOrder, setColumnOrder] = useState<string[]>(loadColumnOrder);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

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
    if (selectedPriority)
      result = result.filter((t) => t.priority === selectedPriority);
    if (selectedCategoryId)
      result = result.filter((t) => t.categoryId === selectedCategoryId);
    return result;
  }, [tasks, selectedPriority, selectedCategoryId]);

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
          categoryId: task.categoryId ?? undefined,
          estimatedDuration: task.estimatedDuration,
          dueDateTime: task.dueDateTime ?? undefined,
        },
      });
    },
    [tasks, editTask],
  );

  const priorities = Object.values(TaskPriority);

  if (isLoading) {
    return (
      <PageLayout title="Tasks">
        <View className="gap-3 mt-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <TaskCardSkeleton key={i} />
          ))}
        </View>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Tasks">
      <View className="gap-4 flex-1">
        <View className="flex-row items-center justify-between flex-wrap gap-2">
          <View className="flex-row items-center gap-3">
            <View className="flex-row bg-surface-container-low rounded-full p-1">
              <TouchableOpacity
                onPress={() => setViewMode("list")}
                className={`px-4 py-2 rounded-full ${viewMode === "list" ? "bg-primary" : ""}`}
              >
                <Text
                  className={`text-xs font-label ${viewMode === "list" ? "text-white" : "text-on-surface-variant"}`}
                >
                  List
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setViewMode("kanban")}
                className={`px-4 py-2 rounded-full ${viewMode === "kanban" ? "bg-primary" : ""}`}
              >
                <Text
                  className={`text-xs font-label ${viewMode === "kanban" ? "text-white" : "text-on-surface-variant"}`}
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
              setCreateStatusId(orderedStatuses[0]?.statusId);
              setShowCreate(true);
            }}
            className="bg-primary rounded-xl px-4 py-2.5 flex-row items-center gap-2"
          >
            <MaterialIcons name="add" size={18} color="#fff" />
            <Text className="text-white font-headline text-sm">New Task</Text>
          </TouchableOpacity>
        </View>

        {/* Filters */}
        <View className="flex-row items-center gap-2 flex-wrap">
          {priorities.map((p) => {
            const active = selectedPriority === p;
            return (
              <TouchableOpacity
                key={p}
                onPress={() => setSelectedPriority(active ? null : p)}
                className={`px-3 py-1.5 rounded-full ${
                  active
                    ? ""
                    : "bg-surface-container-high border border-outline"
                }`}
                style={
                  active ? { backgroundColor: PRIORITY_COLORS[p] } : undefined
                }
              >
                <Text
                  className={`text-xs font-label ${
                    active ? "text-white" : "text-on-surface"
                  }`}
                >
                  {p}
                </Text>
              </TouchableOpacity>
            );
          })}

          {(categories?.length ?? 0) > 0 && (
            <View className="w-px h-6 bg-outline mx-1" />
          )}

          {categories?.map((cat) => {
            const active = selectedCategoryId === cat.categoryId;
            return (
              <TouchableOpacity
                key={cat.categoryId}
                onPress={() =>
                  setSelectedCategoryId(active ? null : cat.categoryId)
                }
                className={`flex-row items-center gap-1.5 px-3 py-1.5 rounded-full ${
                  active
                    ? "bg-primary-fixed border border-primary"
                    : "bg-surface-container-high border border-outline"
                }`}
              >
                <View
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: cat.color }}
                />
                <Text
                  className={`text-xs font-label ${
                    active ? "text-primary" : "text-on-surface"
                  }`}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}

          {(selectedPriority || selectedCategoryId) && (
            <TouchableOpacity
              onPress={() => {
                setSelectedPriority(null);
                setSelectedCategoryId(null);
              }}
              className="px-3 py-1.5"
            >
              <Text className="text-xs font-label text-primary">Wyczyść</Text>
            </TouchableOpacity>
          )}
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
            secondaryAction={{
              label: "AI Planner",
              onPress: () => router.push("/(app)/ai-task" as never),
            }}
          />
        ) : viewMode === "kanban" ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 16, paddingBottom: 32 }}
          >
            {orderedStatuses.map((status, colIdx) => {
              const statusTasks = groupedByStatus.get(status.statusId) ?? [];
              return (
                <DropColumn
                  key={status.statusId}
                  statusId={status.statusId}
                  onDrop={handleDropTask}
                  isDragOver={dragOverId === status.statusId}
                  setDragOverId={setDragOverId}
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
                      <TouchableOpacity className="p-1">
                        <MaterialIcons
                          name="more-horiz"
                          size={18}
                          color="#777587"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ gap: 10 }}
                  >
                    {statusTasks.map((task) => (
                      <DraggableCard key={task.taskId} taskId={task.taskId}>
                        <KanbanTaskCard
                          task={task}
                          category={
                            task.categoryId
                              ? categoryMap.get(task.categoryId)
                              : undefined
                          }
                          onPress={() => setSelectedTask(task)}
                        />
                      </DraggableCard>
                    ))}
                  </ScrollView>

                  <TouchableOpacity
                    onPress={() => {
                      setCreateStatusId(status.statusId);
                      setShowCreate(true);
                    }}
                    className="flex-row items-center gap-2 mt-3 px-2 py-2"
                  >
                    <MaterialIcons name="add" size={18} color="#4d41df" />
                    <Text className="text-primary font-label text-sm">
                      Add Task
                    </Text>
                  </TouchableOpacity>
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
                    style={{ backgroundColor: catGroup.categoryColor }}
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

      {!showCreate && (
        <TouchableOpacity
          onPress={() => {
            setCreateStatusId(orderedStatuses[0]?.statusId);
            setShowCreate(true);
          }}
          className="absolute bottom-6 right-6 bg-secondary rounded-2xl px-6 py-4 flex-row items-center gap-2 shadow-lg"
          style={{ elevation: 8 }}
        >
          <MaterialIcons name="auto-awesome" size={20} color="#fff" />
          <Text className="text-white font-headline text-sm">
            Generate Smart Tasks
          </Text>
        </TouchableOpacity>
      )}
    </PageLayout>
  );
}
