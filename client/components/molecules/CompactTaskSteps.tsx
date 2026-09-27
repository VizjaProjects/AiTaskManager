import { useMemo, useState } from "react";
import {
  GestureResponderEvent,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import type { Task, WorkspaceUser } from "@/lib/types";
import { useSetTaskStepCompleted } from "@/lib/hooks";
import { useWorkspaceStore } from "@/lib/stores/workspace";
import { useT } from "@/lib/i18n";
import { ProgressBar } from "@/components/atoms/ProgressBar";
import { StepCheckbox, StrikeText } from "@/components/atoms/StepCheckbox";
import { Fold } from "./Fold";
import { useReducedMotion } from "@/lib/utils/useReducedMotion";

interface CompactTaskStepsProps {
  task: Task;
  density?: "list" | "kanban";
}

function stopCardPress(event: GestureResponderEvent) {
  event.stopPropagation();
}

function StepAvatar({ member }: { member?: WorkspaceUser }) {
  if (!member) return null;
  const name = member.fullName ?? member.email ?? "?";
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <View
      accessibilityLabel={name}
      className="w-5 h-5 rounded-full bg-primary-fixed items-center justify-center"
    >
      <Text className="text-primary font-headline text-[8px]">{initials}</Text>
    </View>
  );
}

export function CompactTaskSteps({
  task,
  density = "kanban",
}: CompactTaskStepsProps) {
  const t = useT();
  const [expanded, setExpanded] = useState(false);
  const reduced = useReducedMotion();
  const completeStep = useSetTaskStepCompleted();
  const activeWorkspace = useWorkspaceStore((state) => state.getActiveWorkspace());
  const members = activeWorkspace?.assignedUsers ?? [];
  const steps = useMemo(
    () => [...task.steps].sort((a, b) => a.position - b.position),
    [task.steps],
  );

  if (steps.length === 0) return null;

  const completed = steps.filter((step) => step.completed).length;
  const progress = (completed / steps.length) * 100;

  return (
    <View
      className={`${density === "list" ? "mt-0.5" : "mt-2.5"} border-t border-outline-variant`}
    >
      <TouchableOpacity
        accessibilityLabel={
          expanded ? t("taskSteps.collapse") : t("taskSteps.expand")
        }
        activeOpacity={0.7}
        className="min-h-9 flex-row items-center gap-2 pt-2"
        onPress={(event) => {
          stopCardPress(event);
          setExpanded((current) => !current);
        }}
      >
        <MaterialIcons name="checklist" size={14} color="#8a8680" />
        <Text className="text-on-surface-variant font-label text-[11px]">
          {completed}/{steps.length}
        </Text>
        <ProgressBar
          value={progress}
          className="h-1 flex-1 rounded-full bg-surface-container"
        />
        <MaterialIcons
          name={expanded ? "keyboard-arrow-up" : "keyboard-arrow-down"}
          size={18}
          color="#8a8680"
        />
      </TouchableOpacity>

      <Fold open={expanded} reduceMotion={reduced}>
        <ScrollView
          nestedScrollEnabled
          showsVerticalScrollIndicator={steps.length > 6}
          style={{ maxHeight: density === "list" ? 260 : 224 }}
          contentContainerStyle={{ paddingTop: 4, paddingBottom: 4, gap: 2 }}
          onTouchStart={stopCardPress}
        >
          {steps.map((step) => {
            const member = members.find(
              (candidate) => candidate.userId === step.assignedUserId,
            );
            return (
              <View
                key={step.stepId}
                className="min-h-9 flex-row items-center gap-2 px-1.5 py-1 rounded-md"
              >
                <StepCheckbox
                  checked={step.completed}
                  size={20}
                  radius={4}
                  accessibilityLabel={
                    step.completed
                      ? t("taskSteps.markOpen")
                      : t("taskSteps.markDone")
                  }
                  disabled={completeStep.isPending || !task.accepted}
                  onPress={(event) => {
                    stopCardPress(event);
                    completeStep.mutate({
                      taskId: task.taskId,
                      stepId: step.stepId,
                      completed: !step.completed,
                    });
                  }}
                />
                <StrikeText
                  done={step.completed}
                  className="text-on-surface font-body text-xs leading-4"
                  lineHeight={16}
                  numberOfLines={2}
                  doneOpacity={0.55}
                >
                  {step.title}
                </StrikeText>
                <StepAvatar member={member} />
              </View>
            );
          })}
        </ScrollView>
      </Fold>
    </View>
  );
}
