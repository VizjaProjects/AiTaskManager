import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  Platform,
  useWindowDimensions,
  Pressable,
  ScrollView,
} from "react-native";
import { useRouter, usePathname } from "expo-router";
import { useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { OrdovitaLogo } from "../atoms/OrdovitaLogo";
import { NavItem } from "../molecules/NavItem";
import { UserMenu } from "../molecules/UserMenu";
import { WorkspaceSwitcher } from "../molecules/WorkspaceSwitcher";
import {
  NotificationsDrawer,
  useNotificationItems,
} from "./NotificationsDrawer";
import { SearchModal } from "./SearchModal";
import { useAuthStore } from "@/lib/stores";
import { useT } from "@/lib/i18n";
import { Role } from "@/lib/types";

const DRAWER_NAV_ITEMS: Array<{
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  path: string;
  badge?: string;
}> = [
  { icon: "dashboard", label: "nav.dashboard", path: "/(app)/dashboard" },
  { icon: "auto-awesome", label: "nav.aiTask", path: "/(app)/ai-task" },
  { icon: "calendar-today", label: "nav.calendar", path: "/(app)/calendar" },
  { icon: "checklist", label: "nav.tasks", path: "/(app)/tasks" },
  { icon: "sticky-note-2", label: "nav.notes", path: "/(app)/notes" },
  { icon: "tune", label: "nav.categoriesStatuses", path: "/(app)/categories" },
  {
    icon: "bar-chart",
    label: "nav.statistics",
    path: "/(app)/statistics",
    badge: "common.inProgress",
  },
  { icon: "assignment", label: "nav.surveys", path: "/(app)/surveys" },
  { icon: "poll", label: "nav.surveysAdmin", path: "/(app)/admin-surveys" },
  { icon: "workspaces", label: "nav.plansAdmin", path: "/(app)/admin-plans" },
  { icon: "group", label: "nav.usersAdmin", path: "/(app)/admin-users" },
];

interface AppHeaderProps {
  title?: string;
  showSearch?: boolean;
  searchPlaceholder?: string;
}

export function AppHeader({
  title,
  showSearch = true,
  searchPlaceholder,
}: AppHeaderProps) {
  const router = useRouter();
  const t = useT();
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && width >= 1024;
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const hasNotifications = useNotificationItems().length > 0;

  const drawerItems = DRAWER_NAV_ITEMS.filter((item) => {
    const isAdminItem = item.path.includes("admin");
    // Admin-only items hidden from non-admins.
    if (isAdminItem && user?.role !== Role.ADMIN) return false;
    // User-only surveys hidden from non-users.
    if (
      item.path.includes("surveys") &&
      !isAdminItem &&
      user?.role !== Role.USER
    )
      return false;
    // Admins use the app only for management: keep notes + admin items, hide the
    // personal productivity sections (dashboard, AI task, calendar, tasks, …).
    if (
      user?.role === Role.ADMIN &&
      !isAdminItem &&
      item.path !== "/(app)/notes"
    )
      return false;
    return true;
  });

  return (
    <>
      <View className="flex-row items-center gap-3 px-margin-desktop py-2.5 bg-background border-b border-border-subtle">
        {!isDesktop && (
          <TouchableOpacity
            className="p-2 -ml-1 rounded-md"
            onPress={() => setDrawerOpen(true)}
          >
            <MaterialIcons name="menu" size={24} color="#6b6965" />
          </TouchableOpacity>
        )}

        {!isDesktop && title && (
          <Text
            className="text-on-surface font-display text-xl flex-1"
            numberOfLines={1}
          >
            {title}
          </Text>
        )}

        {isDesktop && showSearch && (
          <TouchableOpacity
            className="flex-1 flex-row items-center bg-surface rounded-md px-3.5 py-2 border border-outline-variant"
            onPress={() => setSearchOpen(true)}
            activeOpacity={0.9}
          >
            <MaterialIcons name="search" size={18} color="#9b9791" />
            <Text className="flex-1 ml-2 text-text-tertiary font-body text-body-md">
              {searchPlaceholder ?? t("search.placeholder")}
            </Text>
          </TouchableOpacity>
        )}

        <View className="flex-row items-center gap-2 ml-auto">
          {!isDesktop && showSearch && (
            <TouchableOpacity
              className="p-2 rounded-md"
              onPress={() => setSearchOpen(true)}
            >
              <MaterialIcons name="search" size={22} color="#6b6965" />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            className="p-2 rounded-md relative"
            onPress={() => setNotificationsOpen(true)}
          >
            <MaterialIcons
              name="notifications-none"
              size={22}
              color="#6b6965"
            />
            {hasNotifications && (
              <View className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#C0392B]" />
            )}
          </TouchableOpacity>

          <UserMenu />
        </View>
      </View>

      <NotificationsDrawer
        visible={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />
      <SearchModal visible={searchOpen} onClose={() => setSearchOpen(false)} />

      {!isDesktop && (
        <Modal
          visible={drawerOpen}
          transparent
          animationType="none"
          onRequestClose={() => setDrawerOpen(false)}
        >
          <View className="flex-1 flex-row">
            <View
              className="h-full bg-surface-container-lowest px-3 py-6"
              style={{ width: Math.min(width * 0.78, 300) }}
            >
              <View className="flex-row items-center justify-between mb-6 px-2">
                <OrdovitaLogo size="sm" showTagline />
                <TouchableOpacity
                  className="p-2 rounded-md"
                  onPress={() => setDrawerOpen(false)}
                >
                  <MaterialIcons name="close" size={22} color="#6b6965" />
                </TouchableOpacity>
              </View>

              <ScrollView
                className="flex-1"
                contentContainerStyle={{ gap: 2 }}
                showsVerticalScrollIndicator={false}
              >
                <WorkspaceSwitcher onSelected={() => setDrawerOpen(false)} />
                {drawerItems.map((item) => {
                  const active = pathname.startsWith(
                    item.path.replace("/(app)", ""),
                  );
                  return (
                    <NavItem
                      key={item.path}
                      icon={item.icon}
                      label={t(item.label)}
                      badge={item.badge ? t(item.badge) : undefined}
                      active={active}
                      onPress={() => {
                        setDrawerOpen(false);
                        router.push(item.path as never);
                      }}
                    />
                  );
                })}
              </ScrollView>

              <View className="gap-0.5 pt-4 border-t border-border-subtle">
                <TouchableOpacity
                  onPress={async () => {
                    setDrawerOpen(false);
                    await logout();
                    router.replace("/(auth)/login");
                  }}
                  className="flex-row items-center gap-3 px-4 py-2.5"
                >
                  <MaterialIcons name="logout" size={20} color="#6b6965" />
                  <Text className="text-on-surface-variant font-body text-sm">
                    {t("common.signOut")}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <Pressable
              className="flex-1 bg-black/40"
              onPress={() => setDrawerOpen(false)}
            />
          </View>
        </Modal>
      )}
    </>
  );
}
