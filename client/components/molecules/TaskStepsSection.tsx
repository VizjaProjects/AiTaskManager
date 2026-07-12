import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useMemo, useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import type {
  CreateTaskStepInput,
  Task,
  TaskStep,
  WorkspaceUser,
} from "@/lib/types";
import {
  useCreateTaskStep,
  useDeleteTaskStep,
  useEditTaskStep,
  useReorderTaskSteps,
  useSetTaskStepCompleted,
} from "@/lib/hooks";
import { useWorkspaceStore } from "@/lib/stores/workspace";
import { useT } from "@/lib/i18n";

const NO_OUTLINE =
  Platform.OS === "web" ? ({ outlineWidth: 0 } as const) : undefined;

interface AssigneePickerProps {
  visible: boolean;
  members: WorkspaceUser[];
  selectedUserId: string | null;
  onSelect: (userId: string | null) => void;
  onClose: () => void;
}

function AssigneePicker({
  visible,
  members,
  selectedUserId,
  onSelect,
  onClose,
}: AssigneePickerProps) {
  const t = useT();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        className="flex-1 bg-black/40 items-center justify-center px-5"
        onPress={onClose}
      >
        <Pressable
          className="w-full max-w-sm bg-surface border border-outline-variant rounded-xl overflow-hidden"
          onPress={(event) => event.stopPropagation()}
        >
          <View className="flex-row items-center justify-between px-4 py-3 border-b border-outline-variant">
            <Text className="font-headline text-on-surface text-base">
              {t("taskSteps.assign")}
            </Text>
            <TouchableOpacity
              accessibilityLabel={t("common.close")}
              className="w-9 h-9 items-center justify-center"
              onPress={onClose}
            >
              <MaterialIcons name="close" size={20} color="#9b9791" />
            </TouchableOpacity>
          </View>
          <ScrollView style={{ maxHeight: 360 }}>
            <TouchableOpacity
              className="flex-row items-center gap-3 px-4 py-3 border-b border-outline-variant"
              onPress={() => onSelect(null)}
            >
              <View className="w-8 h-8 rounded-full border border-dashed border-outline items-center justify-center">
                <MaterialIcons name="person-off" size={16} color="#9b9791" />
              </View>
              <Text className="flex-1 text-on-surface font-body text-sm">
                {t("taskSteps.unassigned")}
              </Text>
              {selectedUserId === null ? (
                <MaterialIcons name="check" size={18} color="#5b4ee0" />
              ) : null}
            </TouchableOpacity>
            {members.map((member) => {
              const name = member.fullName ?? member.email ?? t("common.user");
              const initials = name
                .split(/\s+/)
                .filter(Boolean)
                .slice(0, 2)
                .map((part) => part[0]?.toUpperCase())
                .join("");
              return (
                <TouchableOpacity
                  key={member.userId}
                  className="flex-row items-center gap-3 px-4 py-3 border-b border-outline-variant"
                  onPress={() => onSelect(member.userId)}
                >
                  <View className="w-8 h-8 rounded-full bg-primary-fixed items-center justify-center">
                    <Text className="text-primary font-headline text-xs">{initials}</Text>
                  </View>
                  <Text className="flex-1 text-on-surface font-body text-sm" numberOfLines={1}>
                    {name}
                  </Text>
                  {selectedUserId === member.userId ? (
                    <MaterialIcons name="check" size={18} color="#5b4ee0" />
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function MemberAvatar({ member }: { member?: WorkspaceUser }) {
  if (!member) return null;
  const name = member.fullName ?? member.email ?? "?";
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
  return (
    <View className="w-6 h-6 rounded-full bg-primary-fixed items-center justify-center">
      <Text className="text-primary font-headline text-[9px]">{initials}</Text>
    </View>
  );
}

interface TaskStepsSectionProps {
  task: Task;
  editable?: boolean;
  allowCompletion?: boolean;
}

export function TaskStepsSection({
  task,
  editable = false,
  allowCompletion = true,
}: TaskStepsSectionProps) {
  const t = useT();
  const activeWorkspace = useWorkspaceStore((state) => state.getActiveWorkspace());
  const members = activeWorkspace?.assignedUsers ?? [];
  const createStep = useCreateTaskStep();
  const editStep = useEditTaskStep();
  const deleteStep = useDeleteTaskStep();
  const completeStep = useSetTaskStepCompleted();
  const reorderSteps = useReorderTaskSteps();
  const [newTitle, setNewTitle] = useState("");
  const [editingStepId, setEditingStepId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [assigneeStepId, setAssigneeStepId] = useState<string | null>(null);
  const [actionStepId, setActionStepId] = useState<string | null>(null);

  const steps = useMemo(
    () => [...(task.steps ?? [])].sort((a, b) => a.position - b.position),
    [task.steps],
  );
  const completedCount = steps.filter((step) => step.completed).length;
  const progress = steps.length === 0 ? 0 : (completedCount / steps.length) * 100;
  const selectedAssigneeStep = steps.find((step) => step.stepId === assigneeStepId);

  function addStep() {
    const title = newTitle.trim();
    if (!title || steps.length >= 20 || createStep.isPending) return;
    createStep.mutate(
      { taskId: task.taskId, data: { title } },
      { onSuccess: () => setNewTitle("") },
    );
  }

  function startEditing(step: TaskStep) {
    setEditingStepId(step.stepId);
    setEditingTitle(step.title);
    setActionStepId(null);
  }

  function saveEditing(step: TaskStep) {
    const title = editingTitle.trim();
    if (!title) return;
    editStep.mutate(
      {
        taskId: task.taskId,
        stepId: step.stepId,
        data: { title, assignedUserId: step.assignedUserId },
      },
      { onSuccess: () => setEditingStepId(null) },
    );
  }

  function moveStep(index: number, direction: -1 | 1) {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= steps.length) return;
    const reordered = [...steps];
    [reordered[index], reordered[nextIndex]] = [reordered[nextIndex], reordered[index]];
    reorderSteps.mutate({
      taskId: task.taskId,
      stepIds: reordered.map((step) => step.stepId),
    });
  }

  return (
    <View className="gap-3">
      <View className="flex-row items-center justify-between gap-3">
        <View className="flex-row items-center gap-2">
          <MaterialIcons name="checklist" size={17} color="#6b6965" />
          <Text className="text-on-surface font-headline text-sm">
            {t("taskSteps.title")}
          </Text>
        </View>
        <Text className="text-text-tertiary font-label text-xs">
          {completedCount}/{steps.length}
        </Text>
      </View>

      {steps.length > 0 ? (
        <View className="h-1.5 rounded-full bg-surface-container overflow-hidden">
          <View
            className="h-full rounded-full bg-primary"
            style={{ width: `${progress}%` }}
          />
        </View>
      ) : null}

      <View className="gap-1.5">
        {steps.map((step, index) => {
          const member = members.find((candidate) => candidate.userId === step.assignedUserId);
          const isEditing = editingStepId === step.stepId;
          return (
            <View
              key={step.stepId}
              className={`min-h-11 flex-row flex-wrap items-center gap-2 px-2.5 py-1.5 rounded-lg border ${
                actionStepId === step.stepId
                  ? "border-outline bg-surface-container-low"
                  : "border-transparent bg-surface-container-low/60"
              }`}
            >
              <TouchableOpacity
                accessibilityLabel={
                  step.completed ? t("taskSteps.markOpen") : t("taskSteps.markDone")
                }
                disabled={!allowCompletion || completeStep.isPending}
                className={`w-7 h-7 rounded-md border items-center justify-center ${
                  step.completed ? "bg-primary border-primary" : "border-outline"
                }`}
                onPress={() =>
                  completeStep.mutate({
                    taskId: task.taskId,
                    stepId: step.stepId,
                    completed: !step.completed,
                  })
                }
              >
                {step.completed ? (
                  <MaterialIcons name="check" size={16} color="#ffffff" />
                ) : null}
              </TouchableOpacity>

              {isEditing ? (
                <TextInput
                  autoFocus
                  className="flex-1 text-on-surface font-body text-sm border-b border-primary py-1"
                  style={NO_OUTLINE}
                  value={editingTitle}
                  maxLength={200}
                  onChangeText={setEditingTitle}
                  onSubmitEditing={() => saveEditing(step)}
                />
              ) : (
                <Text
                  className="flex-1 text-on-surface font-body text-sm"
                  style={step.completed ? { textDecorationLine: "line-through", opacity: 0.6 } : undefined}
                >
                  {step.title}
                </Text>
              )}

              <MemberAvatar member={member} />

              {editable && isEditing ? (
                <TouchableOpacity
                  accessibilityLabel={t("common.save")}
                  className="w-8 h-8 rounded-md bg-primary items-center justify-center"
                  onPress={() => saveEditing(step)}
                >
                  <MaterialIcons name="check" size={17} color="#ffffff" />
                </TouchableOpacity>
              ) : null}

              {editable && !isEditing ? (
                <TouchableOpacity
                  accessibilityLabel={t("taskSteps.actions")}
                  className="w-8 h-8 rounded-md items-center justify-center"
                  onPress={() =>
                    setActionStepId((current) =>
                      current === step.stepId ? null : step.stepId,
                    )
                  }
                >
                  <MaterialIcons name="more-vert" size={18} color="#8a8680" />
                </TouchableOpacity>
              ) : null}

              {editable && actionStepId === step.stepId ? (
                <View className="w-full flex-row items-center justify-end pt-1 border-t border-outline-variant">
                    <TouchableOpacity
                      accessibilityLabel={t("common.edit")}
                      className="w-8 h-8 items-center justify-center"
                      onPress={() => startEditing(step)}
                    >
                      <MaterialIcons name="edit" size={15} color="#9b9791" />
                    </TouchableOpacity>
                  <TouchableOpacity
                    accessibilityLabel={t("taskSteps.assign")}
                    className="w-8 h-8 items-center justify-center"
                    onPress={() => setAssigneeStepId(step.stepId)}
                  >
                    <MaterialIcons name="person-add" size={16} color="#9b9791" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    accessibilityLabel={t("taskSteps.moveUp")}
                    disabled={index === 0 || reorderSteps.isPending}
                    className="w-7 h-8 items-center justify-center"
                    style={{ opacity: index === 0 ? 0.3 : 1 }}
                    onPress={() => moveStep(index, -1)}
                  >
                    <MaterialIcons name="keyboard-arrow-up" size={18} color="#9b9791" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    accessibilityLabel={t("taskSteps.moveDown")}
                    disabled={index === steps.length - 1 || reorderSteps.isPending}
                    className="w-7 h-8 items-center justify-center"
                    style={{ opacity: index === steps.length - 1 ? 0.3 : 1 }}
                    onPress={() => moveStep(index, 1)}
                  >
                    <MaterialIcons name="keyboard-arrow-down" size={18} color="#9b9791" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    accessibilityLabel={t("common.delete")}
                    className="w-8 h-8 items-center justify-center"
                    onPress={() =>
                      deleteStep.mutate(
                        { taskId: task.taskId, stepId: step.stepId },
                        { onSuccess: () => setActionStepId(null) },
                      )
                    }
                  >
                    <MaterialIcons name="delete-outline" size={16} color="#C0392B" />
                  </TouchableOpacity>
                </View>
              ) : null}
            </View>
          );
        })}
      </View>

      {steps.length === 0 && !editable ? (
        <Text className="text-text-tertiary font-body text-sm">
          {t("taskSteps.empty")}
        </Text>
      ) : null}

      {editable && steps.length < 20 ? (
        <View className="flex-row items-center gap-2">
          <TextInput
            className="flex-1 min-h-10 px-3 py-2 rounded-lg border border-outline-variant text-on-surface font-body text-sm"
            style={NO_OUTLINE}
            value={newTitle}
            maxLength={200}
            placeholder={t("taskSteps.addPlaceholder")}
            placeholderTextColor="#9b9791"
            onChangeText={setNewTitle}
            onSubmitEditing={addStep}
          />
          <TouchableOpacity
            accessibilityLabel={t("taskSteps.add")}
            disabled={!newTitle.trim() || createStep.isPending}
            className="w-10 h-10 rounded-lg bg-primary items-center justify-center"
            style={{ opacity: newTitle.trim() ? 1 : 0.4 }}
            onPress={addStep}
          >
            <MaterialIcons name="add" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
      ) : null}

      <AssigneePicker
        visible={!!assigneeStepId}
        members={members}
        selectedUserId={selectedAssigneeStep?.assignedUserId ?? null}
        onClose={() => setAssigneeStepId(null)}
        onSelect={(assignedUserId) => {
          if (!selectedAssigneeStep) return;
          editStep.mutate(
            {
              taskId: task.taskId,
              stepId: selectedAssigneeStep.stepId,
              data: { title: selectedAssigneeStep.title, assignedUserId },
            },
            { onSuccess: () => setAssigneeStepId(null) },
          );
        }}
      />
    </View>
  );
}

interface DraftTaskStepsEditorProps {
  steps: CreateTaskStepInput[];
  onChange: (steps: CreateTaskStepInput[]) => void;
}

export function DraftTaskStepsEditor({ steps, onChange }: DraftTaskStepsEditorProps) {
  const t = useT();
  const activeWorkspace = useWorkspaceStore((state) => state.getActiveWorkspace());
  const members = activeWorkspace?.assignedUsers ?? [];
  const [newTitle, setNewTitle] = useState("");
  const [assignIndex, setAssignIndex] = useState<number | null>(null);

  function addDraft() {
    const title = newTitle.trim();
    if (!title || steps.length >= 20) return;
    onChange([...steps, { title }]);
    setNewTitle("");
  }

  function move(index: number, direction: -1 | 1) {
    const next = index + direction;
    if (next < 0 || next >= steps.length) return;
    const reordered = [...steps];
    [reordered[index], reordered[next]] = [reordered[next], reordered[index]];
    onChange(reordered);
  }

  return (
    <View className="gap-2">
      <View className="flex-row items-center justify-between">
        <Text className="text-on-surface-variant font-label text-[11px]">
          {t("taskSteps.title")}
        </Text>
        <Text className="text-text-tertiary font-label text-[11px]">{steps.length}/20</Text>
      </View>
      {steps.map((step, index) => {
        const member = members.find((candidate) => candidate.userId === step.assignedUserId);
        return (
          <View
            key={`draft-step-${index}`}
            className="flex-row items-center gap-2 px-2 py-1.5 rounded-lg bg-surface-container-low"
          >
            <MaterialIcons name="drag-indicator" size={16} color="#9b9791" />
            <TextInput
              className="flex-1 min-h-8 text-on-surface font-body text-sm"
              style={NO_OUTLINE}
              value={step.title}
              maxLength={200}
              onChangeText={(title) =>
                onChange(
                  steps.map((candidate, candidateIndex) =>
                    candidateIndex === index ? { ...candidate, title } : candidate,
                  ),
                )
              }
            />
            <MemberAvatar member={member} />
            <TouchableOpacity
              accessibilityLabel={t("taskSteps.assign")}
              className="w-8 h-8 items-center justify-center"
              onPress={() => setAssignIndex(index)}
            >
              <MaterialIcons name="person-add" size={16} color="#9b9791" />
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityLabel={t("taskSteps.moveUp")}
              disabled={index === 0}
              className="w-7 h-8 items-center justify-center"
              style={{ opacity: index === 0 ? 0.3 : 1 }}
              onPress={() => move(index, -1)}
            >
              <MaterialIcons name="keyboard-arrow-up" size={18} color="#9b9791" />
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityLabel={t("taskSteps.moveDown")}
              disabled={index === steps.length - 1}
              className="w-7 h-8 items-center justify-center"
              style={{ opacity: index === steps.length - 1 ? 0.3 : 1 }}
              onPress={() => move(index, 1)}
            >
              <MaterialIcons name="keyboard-arrow-down" size={18} color="#9b9791" />
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityLabel={t("common.delete")}
              className="w-8 h-8 items-center justify-center"
              onPress={() => onChange(steps.filter((_, candidateIndex) => candidateIndex !== index))}
            >
              <MaterialIcons name="close" size={17} color="#C0392B" />
            </TouchableOpacity>
          </View>
        );
      })}
      {steps.length < 20 ? (
        <View className="flex-row gap-2">
          <TextInput
            className="flex-1 min-h-10 px-3 py-2 rounded-lg border border-outline-variant text-on-surface font-body text-sm"
            style={NO_OUTLINE}
            value={newTitle}
            maxLength={200}
            placeholder={t("taskSteps.addPlaceholder")}
            placeholderTextColor="#9b9791"
            onChangeText={setNewTitle}
            onSubmitEditing={addDraft}
          />
          <TouchableOpacity
            accessibilityLabel={t("taskSteps.add")}
            disabled={!newTitle.trim()}
            className="w-10 h-10 rounded-lg bg-primary items-center justify-center"
            style={{ opacity: newTitle.trim() ? 1 : 0.4 }}
            onPress={addDraft}
          >
            <MaterialIcons name="add" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
      ) : null}
      <AssigneePicker
        visible={assignIndex !== null}
        members={members}
        selectedUserId={assignIndex === null ? null : steps[assignIndex]?.assignedUserId ?? null}
        onClose={() => setAssignIndex(null)}
        onSelect={(assignedUserId) => {
          if (assignIndex === null) return;
          onChange(
            steps.map((step, index) =>
              index === assignIndex
                ? { ...step, assignedUserId: assignedUserId ?? undefined }
                : step,
            ),
          );
          setAssignIndex(null);
        }}
      />
    </View>
  );
}
