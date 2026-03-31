import { View, Text, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import type { CalendarEvent } from "@/lib/types";
import { EventStatus } from "@/lib/types";

interface EventCardProps {
  event: CalendarEvent;
  onPress?: () => void;
}

export function EventCard({ event, onPress }: EventCardProps) {
  const isProposed = event.status === EventStatus.PROPOSED;
  const startTime = new Date(event.startDateTime).toLocaleTimeString("pl-PL", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const endTime = new Date(event.endDateTime).toLocaleTimeString("pl-PL", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      className={`flex-row items-center gap-4 p-4 rounded-2xl ${
        isProposed
          ? "border border-dashed border-secondary bg-secondary-fixed/10"
          : "bg-surface-container-lowest"
      }`}
    >
      <View className="items-center">
        <Text className="text-on-surface font-headline text-sm">
          {startTime}
        </Text>
        <Text className="text-on-surface-variant font-body text-xs">
          {endTime}
        </Text>
      </View>
      <View className="w-0.5 h-10 bg-primary rounded-full" />
      <View className="flex-1">
        <Text
          className="font-headline text-on-surface text-sm"
          numberOfLines={1}
        >
          {event.title}
        </Text>
        {event.allDay && (
          <Text className="text-on-surface-variant font-body text-xs">
            Cały dzień
          </Text>
        )}
      </View>
      {isProposed && (
        <MaterialIcons name="auto-awesome" size={16} color="#006b58" />
      )}
    </TouchableOpacity>
  );
}
