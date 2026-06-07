import { View, Text, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import type { CalendarEvent } from "@/lib/types";
import { EventStatus } from "@/lib/types";
import { ProposedBadge } from "../atoms";

interface EventCardProps {
  event: CalendarEvent;
  onPress?: () => void;
  compact?: boolean;
}

export function EventCard({ event, onPress, compact }: EventCardProps) {
  const isProposed = event.status === EventStatus.PROPOSED;
  const start = new Date(event.startDateTime);
  const end = new Date(event.endDateTime);
  const month = start.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
  const day = start.getDate();
  const timeRange = `${start.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" })} – ${end.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" })}`;

  if (compact) {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        className={`flex-row items-center gap-3 py-3 ${
          isProposed ? "opacity-90" : ""
        }`}
      >
        <View className="items-center w-12">
          <Text className="text-label-md font-headline text-on-surface-variant uppercase">
            {month}
          </Text>
          <Text className="text-lg font-headline text-on-surface">{day}</Text>
        </View>
        <View className="flex-1">
          <Text className="font-headline text-on-surface text-body-md" numberOfLines={1}>
            {event.title}
          </Text>
          <Text className="text-on-surface-variant font-body text-body-md">
            {timeRange}
          </Text>
        </View>
        {isProposed && <ProposedBadge />}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      className={`flex-row items-center gap-4 p-4 rounded-2xl border ${
        isProposed
          ? "border-dashed border-ai-proposed bg-ai-proposed/5"
          : "border-outline-variant/30 bg-surface-container-lowest"
      }`}
    >
      <View className="items-center">
        <Text className="text-on-surface font-headline text-sm">
          {start.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" })}
        </Text>
        <Text className="text-on-surface-variant font-body text-xs">
          {end.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" })}
        </Text>
      </View>
      <View className="w-0.5 h-10 bg-primary rounded-full" />
      <View className="flex-1">
        <Text className="font-headline text-on-surface text-sm" numberOfLines={1}>
          {event.title}
        </Text>
      </View>
      {isProposed && <MaterialIcons name="auto-awesome" size={16} color="#FBBF24" />}
    </TouchableOpacity>
  );
}
