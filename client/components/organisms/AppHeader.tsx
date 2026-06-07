import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  Platform,
  useWindowDimensions,
  Pressable,
} from "react-native";
import { useRouter, usePathname } from "expo-router";
import { useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { Avatar } from "../atoms/Avatar";
import { OrdovitaLogo } from "../atoms/OrdovitaLogo";
import { NavItem } from "../molecules/NavItem";
import { NotificationsDrawer } from "./NotificationsDrawer";
import { SearchModal } from "./SearchModal";
import { useAuthStore, useThemeStore } from "@/lib/stores";
import { Role } from "@/lib/types";

const DRAWER_NAV_ITEMS: Array<{
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  path: string;
  badge?: string;
}> = [
  { icon: "dashboard", label: "Dashboard", path: "/(app)/dashboard" },
  { icon: "auto-awesome", label: "AI Task", path: "/(app)/ai-task" },
  { icon: "calendar-today", label: "Kalendarz", path: "/(app)/calendar" },
  { icon: "checklist", label: "Zadania", path: "/(app)/tasks" },
  { icon: "tune", label: "Kategorie i statusy", path: "/(app)/categories" },
  { icon: "bar-chart", label: "Statystyki", path: "/(app)/statistics", badge: "In Progress" },
  { icon: "assignment", label: "Ankiety", path: "/(app)/surveys" },
  { icon: "poll", label: "Surveys", path: "/(app)/admin-surveys" },
  { icon: "settings", label: "Ustawienia", path: "/(app)/profile" },
];

interface AppHeaderProps {
  title?: string;
  showSearch?: boolean;
  searchPlaceholder?: string;
}

export function AppHeader({
  title,
  showSearch = true,
  searchPlaceholder = "Search tasks, events...",
}: AppHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { mode, toggle } = useThemeStore();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && width >= 1024;
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const drawerItems = DRAWER_NAV_ITEMS.filter((item) => {
    if (item.path.includes("admin-surveys") && user?.role !== Role.ADMIN)
      return false;
    if (
      item.path.includes("surveys") &&
      !item.path.includes("admin") &&
      user?.role !== Role.USER
    )
      return false;
    if (item.path.includes("admin") && user?.role !== Role.ADMIN) return false;
    return true;
  });

  return (
    <>
      <View className="flex-row items-center gap-3 px-margin-desktop py-3 bg-background border-b border-outline-variant">
        {!isDesktop && (
          <TouchableOpacity
            className="p-2 -ml-1 rounded-full"
            onPress={() => setDrawerOpen(true)}
          >
            <MaterialIcons name="menu" size={24} color="#9ca3af" />
          </TouchableOpacity>
        )}

        {!isDesktop && title && (
          <Text
            className="text-on-surface font-headline text-lg flex-1"
            numberOfLines={1}
          >
            {title}
          </Text>
        )}

        {isDesktop && showSearch && (
          <TouchableOpacity
            className="flex-1 flex-row items-center bg-surface-container-lowest rounded-full px-4 py-2.5 border border-outline-variant"
            onPress={() => setSearchOpen(true)}
            activeOpacity={0.9}
          >
            <MaterialIcons name="search" size={20} color="#9ca3af" />
            <Text className="flex-1 ml-2 text-on-surface-variant font-body text-body-md">
              {searchPlaceholder}
            </Text>
          </TouchableOpacity>
        )}

        <View className="flex-row items-center gap-2 ml-auto">
          {!isDesktop && showSearch && (
            <TouchableOpacity
              className="p-2 rounded-full"
              onPress={() => setSearchOpen(true)}
            >
              <MaterialIcons name="search" size={22} color="#9ca3af" />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            className="p-2 rounded-full relative"
            onPress={() => setNotificationsOpen(true)}
          >
            <MaterialIcons name="notifications-none" size={22} color="#9ca3af" />
            <View className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-secondary" />
          </TouchableOpacity>

          {user && (
            <TouchableOpacity
              onPress={() => router.push("/(app)/profile" as never)}
            >
              <Avatar fullName={user.fullName} size="sm" />
            </TouchableOpacity>
          )}
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
                  className="p-2 rounded-full"
                  onPress={() => setDrawerOpen(false)}
                >
                  <MaterialIcons name="close" size={22} color="#9ca3af" />
                </TouchableOpacity>
              </View>

              <View className="gap-0.5 flex-1">
                {drawerItems.map((item) => {
                  const active = pathname.startsWith(
                    item.path.replace("/(app)", ""),
                  );
                  return (
                    <NavItem
                      key={item.path}
                      icon={item.icon}
                      label={item.label}
                      badge={item.badge}
                      active={active}
                      onPress={() => {
                        setDrawerOpen(false);
                        router.push(item.path as never);
                      }}
                    />
                  );
                })}
              </View>

              <View className="gap-0.5 pt-4 border-t border-outline-variant/15">
                <TouchableOpacity
                  onPress={() => {
                    setDrawerOpen(false);
                    logout();
                  }}
                  className="flex-row items-center gap-3 px-4 py-2.5"
                >
                  <MaterialIcons name="logout" size={20} color="#9ca3af" />
                  <Text className="text-on-surface-variant font-body text-sm">Sign Out</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={toggle}
                  className="flex-row items-center gap-3 px-4 py-2.5"
                >
                  <MaterialIcons
                    name={mode === "dark" ? "light-mode" : "dark-mode"}
                    size={20}
                    color="#9ca3af"
                  />
                  <Text className="text-on-surface-variant font-body text-sm">Theme</Text>
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
