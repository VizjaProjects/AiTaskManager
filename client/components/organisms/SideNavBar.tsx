import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { NavItem } from "../molecules/NavItem";
import { WorkspaceSwitcher } from "../molecules/WorkspaceSwitcher";
import { OrdovitaLogo } from "../atoms/OrdovitaLogo";
import { useAuthStore, useThemeStore } from "@/lib/stores";
import { useT } from "@/lib/i18n";
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
    label: "nav.dashboard",
    path: "/(app)/dashboard",
    match: ["/dashboard"],
  },
  {
    icon: "auto-awesome",
    label: "nav.aiTask",
    path: "/(app)/ai-task",
    match: ["/ai-task"],
  },
  {
    icon: "calendar-today",
    label: "nav.calendar",
    path: "/(app)/calendar",
    match: ["/calendar"],
  },
  {
    icon: "checklist",
    label: "nav.tasks",
    path: "/(app)/tasks",
    match: ["/tasks"],
  },
  {
    icon: "sticky-note-2",
    label: "nav.notes",
    path: "/(app)/notes",
    match: ["/notes"],
  },
  {
    icon: "tune",
    label: "nav.categoriesStatuses",
    path: "/(app)/categories",
    match: ["/categories", "/statuses"],
  },
  {
    icon: "bar-chart",
    label: "nav.statistics",
    path: "/(app)/statistics",
    match: ["/statistics"],
    badge: "common.inProgress",
  },
];

export function SideNavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const mode = useThemeStore((s) => s.mode);
  const t = useT();

  const isAdmin = user?.role === Role.ADMIN;

  // Admins use the app purely for management, so the personal productivity
  // sections (dashboard, AI task, calendar, tasks, …) are hidden. Notes stay.
  const ADMIN_MAIN_PATHS = ["/(app)/notes"];
  const mainNavItems = isAdmin
    ? NAV_ITEMS.filter((item) => ADMIN_MAIN_PATHS.includes(item.path))
    : NAV_ITEMS;

  function isActive(matches: string[]) {
    return matches.some((m) => pathname.startsWith(m) || pathname.includes(m));
  }

  async function handleLogout() {
    await logout();
    router.replace("/(auth)/login");
  }

  return (
    <View className="w-sidebar h-full bg-sidebar px-3 py-4 justify-between border-r border-border-subtle">
      <View className="flex-1">
        <TouchableOpacity
          className="px-2 mb-4"
          onPress={() =>
            router.push(isAdmin ? "/(app)/admin-surveys" : "/(app)/dashboard")
          }
        >
          <OrdovitaLogo size="md" showTagline />
        </TouchableOpacity>

        <View className="px-2 mb-4">
          <WorkspaceSwitcher />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          <View className="gap-px px-1">
            {mainNavItems.map((item) => (
              <NavItem
                key={item.path}
                icon={item.icon}
                label={t(item.label)}
                badge={item.badge ? t(item.badge) : undefined}
                active={isActive(
                  item.match ?? [item.path.replace("/(app)", "")],
                )}
                onPress={() => router.push(item.path as never)}
              />
            ))}
            {user?.role === Role.ADMIN && (
              <NavItem
                icon="poll"
                label={t("nav.surveysAdmin")}
                active={pathname.includes("admin-survey")}
                onPress={() => router.push("/(app)/admin-surveys" as never)}
              />
            )}
            {user?.role === Role.ADMIN && (
              <NavItem
                icon="workspaces"
                label={t("nav.plansAdmin")}
                active={pathname.includes("admin-plans")}
                onPress={() => router.push("/(app)/admin-plans" as never)}
              />
            )}
            {user?.role === Role.ADMIN && (
              <NavItem
                icon="group"
                label={t("nav.usersAdmin")}
                active={pathname.includes("admin-users")}
                onPress={() => router.push("/(app)/admin-users" as never)}
              />
            )}
            {user?.role === Role.USER && (
              <NavItem
                icon="assignment"
                label={t("nav.surveys")}
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

      <View className="gap-px px-1 pt-3 border-t border-border-subtle">
        <TouchableOpacity
          onPress={handleLogout}
          className="flex-row items-center gap-2.5 px-3.5 py-2 rounded-md"
        >
          <MaterialIcons
            name="logout"
            size={18}
            color={mode === "dark" ? "rgba(255,255,255,0.5)" : "#6b6965"}
          />
          <Text className="text-on-surface-variant font-body text-body-md">
            {t("common.signOut")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
