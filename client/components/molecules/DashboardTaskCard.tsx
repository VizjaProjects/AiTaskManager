import { View, Text, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import type { Task, Category } from "@/lib/types";
import { PriorityBadge } from "../atoms";
import { formatDuration } from "@/lib/utils";

interface DashboardTaskCardProps {
  task: Task;
  category?: Category;
  onPress?: () => void;
}

export function DashboardTaskCard({
  task,
  category,
  onPress,
}: DashboardTaskCardProps) {
  const dueLabel = task.dueDateTime
    ? new Date(task.dueDateTime).toLocaleDateString("pl-PL", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      className="rounded-2xl bg-surface-container-lowest border border-outline-variant p-4 gap-3 min-h-[140px] justify-between"
    >
      <View className="gap-2">
        <View className="flex-row items-center justify-between gap-2">
          <PriorityBadge priority={task.priority} variant="soft" />
          {category && (
            <View
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: category.color }}
            />
          )}
        </View>
        <Text
          className="font-headline text-on-surface text-body-md leading-5"
          numberOfLines={2}
        >
          {task.title}
        </Text>
        {task.description ? (
          <Text
            className="text-on-surface-variant font-body text-xs leading-4"
            numberOfLines={2}
          >
            {task.description}
          </Text>
        ) : null}
      </View>

      <View className="flex-row items-center gap-3">
        {task.estimatedDuration > 0 && (
          <View className="flex-row items-center gap-1">
            <MaterialIcons name="schedule" size={12} color="#9ca3af" />
            <Text className="text-on-surface-variant font-body text-[10px]">
              {formatDuration(task.estimatedDuration)}
            </Text>
          </View>
        )}
        {dueLabel && (
          <View className="flex-row items-center gap-1 flex-1">
            <MaterialIcons name="calendar-today" size={12} color="#9ca3af" />
            <Text
              className="text-on-surface-variant font-body text-[10px] flex-1"
              numberOfLines={1}
            >
              {dueLabel}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}
