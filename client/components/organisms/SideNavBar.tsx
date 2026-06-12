import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { NavItem } from "../molecules/NavItem";
import { WorkspaceSwitcher } from "../molecules/WorkspaceSwitcher";
import { OrdovitaLogo } from "../atoms/OrdovitaLogo";
import { useAuthStore, useThemeStore } from "@/lib/stores";
import { Role } from "@/lib/types";

const NAV_ITEMS: Array<{
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  path: string;
  match?: string[];
  badge?: string;
}> = [
  {
    icon: "dashboard",
    label: "Dashboard",
    path: "/(app)/dashboard",
    match: ["/dashboard"],
  },
  {
    icon: "auto-awesome",
    label: "AI Task",
    path: "/(app)/ai-task",
    match: ["/ai-task"],
  },
  {
    icon: "calendar-today",
    label: "Calendar",
    path: "/(app)/calendar",
    match: ["/calendar"],
  },
  {
    icon: "checklist",
    label: "Tasks",
    path: "/(app)/tasks",
    match: ["/tasks"],
  },
  {
    icon: "sticky-note-2",
    label: "Notes",
    path: "/(app)/notes",
    match: ["/notes"],
  },
  {
    icon: "tune",
    label: "Categories & Statuses",
    path: "/(app)/categories",
    match: ["/categories", "/statuses"],
  },
  {
    icon: "bar-chart",
    label: "Statistics",
    path: "/(app)/statistics",
    match: ["/statistics"],
    badge: "In Progress",
  },
  {
    icon: "settings",
    label: "Settings",
    path: "/(app)/profile",
    match: ["/profile"],
  },
];

export function SideNavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { mode, toggle } = useThemeStore();

  function isActive(matches: string[]) {
    return matches.some((m) => pathname.startsWith(m) || pathname.includes(m));
  }

  return (
    <View className="w-sidebar h-full bg-background px-3 py-5 justify-between border-r border-outline-variant">
      <View className="flex-1">
        <TouchableOpacity
          className="px-2 mb-4"
          onPress={() => router.push("/(app)/dashboard")}
        >
          <OrdovitaLogo size="md" showTagline />
        </TouchableOpacity>

        <View className="px-2 mb-5">
          <WorkspaceSwitcher />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          <View className="gap-0.5 px-1">
            {NAV_ITEMS.map((item) => (
              <NavItem
                key={item.path}
                icon={item.icon}
                label={item.label}
                badge={item.badge}
                active={isActive(
                  item.match ?? [item.path.replace("/(app)", "")],
                )}
                onPress={() => router.push(item.path as never)}
              />
            ))}
            {user?.role === Role.ADMIN && (
              <NavItem
                icon="poll"
                label="Surveys"
                active={pathname.includes("admin-survey")}
                onPress={() => router.push("/(app)/admin-surveys" as never)}
              />
            )}
            {user?.role === Role.USER && (
              <NavItem
                icon="assignment"
                label="Ankiety"
                active={
                  pathname.includes("/surveys") ||
                  pathname.includes("/survey-onboarding") ||
                  pathname.includes("/my-responses")
                }
                onPress={() => router.push("/(app)/surveys" as never)}
              />
            )}
          </View>
        </ScrollView>
      </View>

      <View className="gap-0.5 px-1 pt-4 border-t border-outline-variant/15">
        <TouchableOpacity
          onPress={() => logout()}
          className="flex-row items-center gap-3 px-4 py-2.5 rounded-xl"
        >
          <MaterialIcons name="logout" size={20} color="#9ca3af" />
          <Text className="text-on-surface-variant font-body text-body-md">
            Sign Out
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={toggle}
          className="flex-row items-center gap-3 px-4 py-2.5 rounded-xl"
        >
          <MaterialIcons
            name={mode === "dark" ? "light-mode" : "dark-mode"}
            size={20}
            color="#9ca3af"
          />
          <Text className="text-on-surface-variant font-body text-body-md">
            Theme
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
