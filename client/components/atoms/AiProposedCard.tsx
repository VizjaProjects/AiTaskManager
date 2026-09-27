import { View, Text, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { PriorityBadge } from "./Badge";
import { PopCheck } from "./PopCheck";
import { Fold } from "@/components/molecules/Fold";
import { useReducedMotion } from "@/lib/utils/useReducedMotion";
import { TaskPriority } from "@/lib/types";
import type { TaskStep } from "@/lib/types";
import { useT } from "@/lib/i18n";
import { useThemeStore } from "@/lib/stores";
import { getUiTokens } from "@/lib/utils/uiTokens";

interface AiProposedCardProps {
  title: string;
  description?: string;
  type?: "task" | "event";
  priority?: TaskPriority;
  duration?: string;
  dueDate?: string;
  steps?: TaskStep[];
  onAccept: () => void;
  onDismiss: () => void;
  onEdit?: () => void;
  onPreview?: () => void;
  loading?: boolean;
  /** Set once the server accepted it: the card folds into a one-line receipt. */
  receipt?: { label: string; actionLabel: string; onAction: () => void } | null;
}

export function AiProposedCard({
  title,
  description,
  type = "task",
  priority,
  duration,
  dueDate,
  steps = [],
  onAccept,
  onDismiss,
  onEdit,
  onPreview,
  loading,
  receipt,
}: AiProposedCardProps) {
  const t = useT();
  const reduced = useReducedMotion();
  const ui = getUiTokens(useThemeStore((s) => s.mode === "dark"));
  const accepted = !!receipt;
  const isEvent = type === "event";
  const orderedSteps = [...steps].sort((a, b) => a.position - b.position);
  const completedSteps = orderedSteps.filter((step) => step.completed).length;
  const stepProgress =
    orderedSteps.length === 0 ? 0 : (completedSteps / orderedSteps.length) * 100;

  return (
    <View
      className={`rounded-2xl bg-surface-container-lowest border overflow-hidden transition-colors duration-300 ${
        accepted ? "border-success" : "border-outline-variant"
      }`}
    >
      <View className="p-5">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-1.5">
            <MaterialIcons
              name={isEvent ? "event" : "task-alt"}
              size={14}
              color={ui.iconMuted}
            />
            <Text className="text-[11px] font-label uppercase tracking-wide text-on-surface-variant">
              {isEvent ? t("aiTask.proposedEvent") : t("aiTask.proposedTask")}
            </Text>
          </View>
          {priority && <PriorityBadge priority={priority} variant="soft" />}
        </View>

        <TouchableOpacity
          className="mt-3"
          onPress={onPreview}
          disabled={!onPreview || accepted}
          activeOpacity={onPreview ? 0.7 : 1}
        >
          <Text className="text-on-surface font-headline text-title-lg">{title}</Text>
        </TouchableOpacity>

        <Fold open={!accepted} gap={12} reduceMotion={reduced}>
          <View className="gap-3">
            {description ? (
              <Text className="text-on-surface-variant font-body text-body-md leading-5">
                {description}
              </Text>
            ) : null}

            {!isEvent && orderedSteps.length > 0 ? (
              <View className="gap-2">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-1.5">
                    <MaterialIcons name="checklist" size={14} color={ui.iconMuted} />
                    <Text className="text-on-surface-variant font-label text-xs">
                      {t("taskSteps.title")}
                    </Text>
                  </View>
                  <Text className="text-text-tertiary font-label text-[11px]">
                    {completedSteps}/{orderedSteps.length}
                  </Text>
                </View>
                <View className="h-1 rounded-full bg-surface-container overflow-hidden">
                  <View
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${stepProgress}%` }}
                  />
                </View>
                {orderedSteps.slice(0, 3).map((step) => (
                  <View key={step.stepId} className="flex-row items-start gap-2">
                    <View className="w-3.5 h-3.5 mt-0.5 rounded-sm border border-outline" />
                    <Text
                      className="flex-1 text-on-surface-variant font-body text-xs"
                      numberOfLines={1}
                    >
                      {step.title}
                    </Text>
                  </View>
                ))}
                {orderedSteps.length > 3 ? (
                  <Text className="text-text-tertiary font-label text-[11px] pl-5">
                    {t("taskSteps.more", { count: orderedSteps.length - 3 })}
                  </Text>
                ) : null}
              </View>
            ) : null}

            {(duration || dueDate) && (
              <View className="flex-row flex-wrap items-center gap-4">
                {duration && (
                  <View className="flex-row items-center gap-1.5">
                    <MaterialIcons name="schedule" size={14} color={ui.iconMuted} />
                    <Text className="text-on-surface-variant font-body text-xs">
                      {duration}
                    </Text>
                  </View>
                )}
                {dueDate && (
                  <View className="flex-row items-center gap-1.5">
                    <MaterialIcons name="calendar-today" size={14} color={ui.iconMuted} />
                    <Text className="text-on-surface-variant font-body text-xs">
                      {dueDate}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </Fold>

        <Fold open={accepted} gap={14} reduceMotion={reduced}>
          {receipt ? (
            <View className="flex-row items-start gap-2.5">
              <PopCheck size={20} delay={240} />
              <View className="flex-1 gap-1">
                <Text className="text-on-surface font-body text-sm leading-5">{receipt.label}</Text>
                <TouchableOpacity
                  accessibilityRole="link"
                  onPress={receipt.onAction}
                  className="self-start py-1"
                >
                  <Text className="text-on-surface font-headline text-sm underline">
                    {receipt.actionLabel}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : null}
        </Fold>
      </View>

      <Fold open={!accepted} reduceMotion={reduced}>
        <View className="flex-row items-center gap-2 px-4 pb-4">
          <TouchableOpacity
            onPress={onDismiss}
            disabled={loading}
            className="flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest"
          >
            <MaterialIcons name="close" size={16} color={ui.critical} />
            <Text className="text-on-surface font-headline text-sm">
              {t("aiTask.reject")}
            </Text>
          </TouchableOpacity>

          {onEdit && (
            <TouchableOpacity
              onPress={onEdit}
              disabled={loading}
              className="w-11 h-11 items-center justify-center rounded-xl border border-outline-variant bg-surface-container-lowest"
            >
              <MaterialIcons name="edit" size={18} color={ui.iconMuted} />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={onAccept}
            disabled={loading}
            className="flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-xl bg-action"
          >
            <MaterialIcons name="check" size={16} color={ui.onAction} />
            <Text className="text-on-action font-headline text-sm">
              {loading ? "..." : t("aiTask.accept")}
            </Text>
          </TouchableOpacity>
        </View>
      </Fold>
    </View>
  );
}
