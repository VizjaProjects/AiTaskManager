import { View, Text, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import type { Task, Category, TaskStatus } from "@/lib/types";
import { TaskPriority, TaskSource } from "@/lib/types";
import { PriorityBadge, ColorBadge } from "../atoms";
import { formatDate, formatDuration, isOverdue, isDueToday } from "@/lib/utils";
import { CompactTaskSteps } from "./CompactTaskSteps";

interface TaskCardProps {
  task: Task;
  category?: Category;
  status?: TaskStatus;
  onPress?: () => void;
}

export function TaskCard({ task, category, status, onPress }: TaskCardProps) {
  const overdue = isOverdue(task.dueDateTime);
  const today = isDueToday(task.dueDateTime);

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      className="bg-surface rounded-md border border-outline-variant px-3.5 py-3 flex-row items-center gap-3"
    >
      <View className="flex-1 gap-2">
        <View className="flex-row items-center gap-2">
          <PriorityBadge priority={task.priority} />
          {category && (
            <ColorBadge label={category.name} color={category.color} />
          )}
          {task.source === TaskSource.AI_PARSED && (
            <View className="flex-row items-center gap-1 ml-auto">
              <MaterialIcons name="auto-awesome" size={12} color="#9b9791" />
              <Text className="text-[11px] font-label text-text-tertiary">
                AI
              </Text>
            </View>
          )}
        </View>
        <Text
          className="font-body text-on-surface text-body-md"
          numberOfLines={1}
        >
          {task.title}
        </Text>
        <View className="flex-row items-center gap-3">
          {task.dueDateTime && (
            <Text
              className={`text-xs font-body ${
                overdue
                  ? "text-[#C0392B]"
                  : today
                    ? "text-[#B7770D]"
                    : "text-text-tertiary"
              }`}
            >
              {formatDate(task.dueDateTime)}
            </Text>
          )}
          {task.estimatedDuration > 0 && (
            <Text className="text-xs text-text-tertiary font-body">
              {formatDuration(task.estimatedDuration)}
            </Text>
          )}
        </View>
        <CompactTaskSteps task={task} density="list" />
      </View>
    </TouchableOpacity>
  );
}
