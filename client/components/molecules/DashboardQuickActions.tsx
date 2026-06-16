import { View, Text, TouchableOpacity, Platform } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { useT } from "@/lib/i18n";

type IconName = ComponentProps<typeof MaterialIcons>["name"];

type QuickAction = {
  key: string;
  label: string;
  subtitle: string;
  icon: IconName;
  accent: string;
  accentSoft: string;
  onPress: () => void;
};

interface DashboardQuickActionsProps {
  onAddTask: () => void;
  onAddEvent: () => void;
  onAddNote: () => void;
}

export function DashboardQuickActions({
  onAddTask,
  onAddEvent,
  onAddNote,
}: DashboardQuickActionsProps) {
  const t = useT();

  const actions: QuickAction[] = [
    {
      key: "task",
      label: t("dash.quickTask"),
      subtitle: t("dash.quickTaskDesc"),
      icon: "add-task",
      accent: "#4d41df",
      accentSoft: "rgba(77, 65, 223, 0.12)",
      onPress: onAddTask,
    },
    {
      key: "event",
      label: t("dash.quickEvent"),
      subtitle: t("dash.quickEventDesc"),
      icon: "event",
      accent: "#dc2c4f",
      accentSoft: "rgba(220, 44, 79, 0.12)",
      onPress: onAddEvent,
    },
    {
      key: "note",
      label: t("dash.quickNote"),
      subtitle: t("dash.quickNoteDesc"),
      icon: "sticky-note-2",
      accent: "#006b58",
      accentSoft: "rgba(0, 107, 88, 0.12)",
      onPress: onAddNote,
    },
  ];

  return (
    <View className="gap-2">
      <Text className="text-on-surface-variant font-label text-xs uppercase tracking-widest">
        {t("dash.quickActions")}
      </Text>
      <View className="flex-row flex-wrap gap-3">
        {actions.map((action) => (
          <TouchableOpacity
            key={action.key}
            onPress={action.onPress}
            activeOpacity={0.85}
            className="flex-1 min-w-[140px] rounded-2xl border border-outline-variant bg-surface-container-lowest p-4 gap-3"
            style={
              Platform.OS === "web"
                ? ({ cursor: "pointer" } as never)
                : undefined
            }
          >
            <View
              className="w-10 h-10 rounded-xl items-center justify-center"
              style={{ backgroundColor: action.accentSoft }}
            >
              <MaterialIcons name={action.icon} size={22} color={action.accent} />
            </View>
            <View className="gap-0.5">
              <Text className="text-on-surface font-headline text-sm">
                {action.label}
              </Text>
              <Text
                className="text-on-surface-variant font-body text-xs"
                numberOfLines={2}
              >
                {action.subtitle}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
