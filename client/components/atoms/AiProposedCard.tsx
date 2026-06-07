import { View, Text, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { PriorityBadge } from "./Badge";
import { TaskPriority } from "@/lib/types";

interface AiProposedCardProps {
  title: string;
  description?: string;
  type?: "task" | "event";
  priority?: TaskPriority;
  duration?: string;
  dueDate?: string;
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
  onAccept,
  onDismiss,
  onEdit,
  onPreview,
  loading,
}: AiProposedCardProps) {
  const isEvent = type === "event";

  return (
    <View className="rounded-2xl bg-surface-container-lowest border border-outline-variant overflow-hidden">
      <View className="p-5 gap-3">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-1.5">
            <MaterialIcons
              name={isEvent ? "event" : "task-alt"}
              size={14}
              color="#9ca3af"
            />
            <Text className="text-[11px] font-label uppercase tracking-wide text-on-surface-variant">
              {isEvent ? "Proposed Event" : "Proposed Task"}
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

        {(duration || dueDate) && (
          <View className="flex-row flex-wrap items-center gap-4">
            {duration && (
              <View className="flex-row items-center gap-1.5">
                <MaterialIcons name="schedule" size={14} color="#9ca3af" />
                <Text className="text-on-surface-variant font-body text-xs">
                  {duration}
                </Text>
              </View>
            )}
            {dueDate && (
              <View className="flex-row items-center gap-1.5">
                <MaterialIcons name="calendar-today" size={14} color="#9ca3af" />
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
          <MaterialIcons name="close" size={16} color="#ef4444" />
          <Text className="text-on-surface font-headline text-sm">Reject</Text>
        </TouchableOpacity>

        {onEdit && (
          <TouchableOpacity
            onPress={onEdit}
            disabled={loading}
            className="w-11 h-11 items-center justify-center rounded-xl border border-outline-variant bg-surface-container-lowest"
          >
            <MaterialIcons name="edit" size={18} color="#9ca3af" />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={onAccept}
          disabled={loading}
          className="flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-xl bg-action"
        >
          <MaterialIcons name="check" size={16} color="#f0f0f0" />
          <Text className="text-on-action font-headline text-sm">
            {loading ? "..." : "Accept"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
