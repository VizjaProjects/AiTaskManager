import { View, Text, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { PriorityBadge } from "./Badge";
import { TaskPriority } from "@/lib/types";
import type { TaskStep } from "@/lib/types";
import { useT } from "@/lib/i18n";

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
}: AiProposedCardProps) {
  const t = useT();
  const isEvent = type === "event";
  const orderedSteps = [...steps].sort((a, b) => a.position - b.position);
  const completedSteps = orderedSteps.filter((step) => step.completed).length;
  const stepProgress =
    orderedSteps.length === 0 ? 0 : (completedSteps / orderedSteps.length) * 100;

  return (
    <View className="rounded-2xl bg-surface-container-lowest border border-outline-variant overflow-hidden">
      <View className="p-5 gap-3">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-1.5">
            <MaterialIcons
              name={isEvent ? "event" : "task-alt"}
              size={14}
              color="#9b9791"
            />
            <Text className="text-[11px] font-label uppercase tracking-wide text-on-surface-variant">
              {isEvent ? t("aiTask.proposedEvent") : t("aiTask.proposedTask")}
            </Text>
          </View>
          {priority && <PriorityBadge priority={priority} variant="soft" />}
        </View>

        <TouchableOpacity
          onPress={onPreview}
          disabled={!onPreview}
          activeOpacity={onPreview ? 0.7 : 1}
        >
          <Text className="text-on-surface font-headline text-title-lg">{title}</Text>
        </TouchableOpacity>

        {description ? (
          <Text className="text-on-surface-variant font-body text-body-md leading-5">
            {description}
          </Text>
        ) : null}

        {!isEvent && orderedSteps.length > 0 ? (
          <View className="gap-2">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-1.5">
                <MaterialIcons name="checklist" size={14} color="#9b9791" />
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
                <MaterialIcons name="schedule" size={14} color="#9b9791" />
                <Text className="text-on-surface-variant font-body text-xs">
                  {duration}
                </Text>
              </View>
            )}
            {dueDate && (
              <View className="flex-row items-center gap-1.5">
                <MaterialIcons name="calendar-today" size={14} color="#9b9791" />
                <Text className="text-on-surface-variant font-body text-xs">
                  {dueDate}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>

      <View className="flex-row items-center gap-2 px-4 pb-4">
        <TouchableOpacity
          onPress={onDismiss}
          disabled={loading}
          className="flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest"
        >
          <MaterialIcons name="close" size={16} color="#C0392B" />
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
            <MaterialIcons name="edit" size={18} color="#9b9791" />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={onAccept}
          disabled={loading}
          className="flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-xl bg-action"
        >
          <MaterialIcons name="check" size={16} color="#f0f0f0" />
          <Text className="text-on-action font-headline text-sm">
            {loading ? "..." : t("aiTask.accept")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
