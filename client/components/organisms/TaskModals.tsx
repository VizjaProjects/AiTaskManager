import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Modal,
  Platform,
} from "react-native";
import { useState, useMemo } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { Button, Input } from "../atoms";
import { PriorityBadge, ColorBadge } from "../atoms";
import type { Task, Category, TaskStatus } from "@/lib/types";
import { TaskPriority, TaskSource } from "@/lib/types";
import {
  PRIORITY_COLORS,
  formatDate,
  formatDateTime,
  formatDuration,
  isOverdue,
} from "@/lib/utils";
import {
  useEditTask,
  useDeleteTask,
  useCreateTask,
  useCategories,
  useTaskStatuses,
} from "@/lib/hooks";

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
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>(TaskPriority.MEDIUM);
  const [statusId, setStatusId] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);

  const cat = task?.categoryId
    ? categories.find((c) => c.categoryId === task.categoryId)
    : undefined;
  const status = task
    ? statuses.find((s) => s.statusId === task.statusId)
    : undefined;

  function startEdit() {
    if (!task) return;
    setTitle(task.title);
    setDescription(task.description);
    setPriority(task.priority);
    setStatusId(task.statusId);
    setCategoryId(task.categoryId);
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
          estimatedDuration: task.estimatedDuration,
          dueDateTime: task.dueDateTime ?? undefined,
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
    deleteTask.mutate(task.taskId, { onSuccess: onClose });
  }

  if (!task) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/50 items-center justify-center p-6">
        <View className="bg-surface-container-lowest rounded-2xl w-full max-w-lg overflow-hidden">
          <View
            className="h-1.5"
            style={{ backgroundColor: PRIORITY_COLORS[task.priority] }}
          />
          <ScrollView
            contentContainerStyle={{ padding: 24, gap: 16 }}
            showsVerticalScrollIndicator={false}
          >
            <View className="flex-row items-start justify-between">
              <View className="flex-1 gap-2">
                {editing ? (
                  <Input value={title} onChangeText={setTitle} />
                ) : (
                  <Text className="font-headline text-on-surface text-xl">
                    {task.title}
                  </Text>
                )}
              </View>
              <TouchableOpacity onPress={onClose} className="p-1 ml-2">
                <MaterialIcons name="close" size={24} color="#777587" />
              </TouchableOpacity>
            </View>

            <View className="flex-row flex-wrap gap-2">
              <PriorityBadge priority={task.priority} />
              {cat && <ColorBadge label={cat.name} color={cat.color} />}
              {status && (
                <View
                  className="px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: `${status.color}20` }}
                >
                  <Text
                    className="text-xs font-label"
                    style={{ color: status.color }}
                  >
                    {status.name}
                  </Text>
                </View>
              )}
              {task.source === TaskSource.AI_PARSED && (
                <View className="flex-row items-center gap-1 px-2 py-1 rounded-full bg-secondary/10">
                  <MaterialIcons
                    name="auto-awesome"
                    size={12}
                    color="#006b58"
                  />
                  <Text className="text-secondary text-xs font-label">AI</Text>
                </View>
              )}
            </View>

            {editing ? (
              <View className="gap-3">
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
              </View>
            ) : (
              <View className="gap-3">
                {task.description ? (
                  <Text className="text-on-surface-variant font-body text-sm">
                    {task.description}
                  </Text>
                ) : null}
                <View className="flex-row flex-wrap gap-4">
                  {task.estimatedDuration > 0 && (
                    <View className="flex-row items-center gap-1.5">
                      <MaterialIcons
                        name="schedule"
                        size={16}
                        color="#777587"
                      />
                      <Text className="text-on-surface-variant font-body text-sm">
                        {formatDuration(task.estimatedDuration)}
                      </Text>
                    </View>
                  )}
                  {task.dueDateTime && (
                    <View className="flex-row items-center gap-1.5">
                      <MaterialIcons name="event" size={16} color="#777587" />
                      <Text
                        className={`font-body text-sm ${
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
              </View>
            )}

            <View className="flex-row gap-3 mt-2">
              {editing ? (
                <>
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
                  <Button
                    variant="outline"
                    label="Edytuj"
                    onPress={startEdit}
                  />
                  <Button
                    variant="error"
                    label="Usuń"
                    loading={deleteTask.isPending}
                    onPress={handleDelete}
                  />
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
              className="bg-surface-container-low rounded-xl p-4 min-h-[80px] text-on-surface font-body text-base"
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
