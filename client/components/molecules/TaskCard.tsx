import { View, Text, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import type { Task, Category, TaskStatus } from "@/lib/types";
import { TaskPriority, TaskSource } from "@/lib/types";
import { PriorityBadge, ColorBadge } from "../atoms";
import {
  PRIORITY_COLORS,
  formatDate,
  formatDuration,
  isOverdue,
  isDueToday,
} from "@/lib/utils";

interface TaskCardProps {
  task: Task;
  category?: Category;
  status?: TaskStatus;
  onPress?: () => void;
}

export function TaskCard({ task, category, status, onPress }: TaskCardProps) {
  const borderColor = PRIORITY_COLORS[task.priority];
  const overdue = isOverdue(task.dueDateTime);
  const today = isDueToday(task.dueDateTime);

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      className="bg-surface-container-lowest rounded-2xl p-5 flex-row items-center gap-4"
    >
      <View
        className="w-1.5 h-12 rounded-full"
        style={{ backgroundColor: borderColor }}
      />
      <View className="flex-1 gap-1.5">
        <Text
          className="font-headline text-on-surface text-base"
          numberOfLines={1}
        >
          {task.title}
        </Text>
        <View className="flex-row items-center gap-3">
          <PriorityBadge priority={task.priority} />
          {category && (
            <ColorBadge label={category.name} color={category.color} />
          )}
        </View>
      </View>
      <View className="items-end gap-1">
        {task.dueDateTime && (
          <Text
            className={`text-xs font-label ${
              overdue
                ? "text-error"
                : today
                  ? "text-amber-500"
                  : "text-on-surface-variant"
            }`}
          >
            {formatDate(task.dueDateTime)}
          </Text>
        )}
        {task.estimatedDuration > 0 && (
          <Text className="text-xs text-on-surface-variant font-body">
            {formatDuration(task.estimatedDuration)}
          </Text>
        )}
        {task.source === TaskSource.AI_PARSED && (
          <MaterialIcons name="auto-awesome" size={14} color="#006b58" />
        )}
      </View>
    </TouchableOpacity>
  );
}
