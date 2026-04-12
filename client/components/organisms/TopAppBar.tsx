import {
  View,
  Text,
  TouchableOpacity,
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
import { NotificationsDrawer } from "./NotificationsDrawer";
import { SearchModal } from "./SearchModal";
import { useAuthStore, useThemeStore } from "@/lib/stores";

const DRAWER_NAV_ITEMS: Array<{
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  path: string;
}> = [
  { icon: "dashboard", label: "Dashboard", path: "/(app)/dashboard" },
  { icon: "auto-awesome", label: "AI Task", path: "/(app)/ai-task" },
  { icon: "calendar-today", label: "Kalendarz", path: "/(app)/calendar" },
  { icon: "checklist", label: "Zadania", path: "/(app)/tasks" },
  { icon: "category", label: "Kategorie", path: "/(app)/categories" },
  { icon: "toggle-on", label: "Statusy", path: "/(app)/statuses" },
  { icon: "settings", label: "Ustawienia", path: "/(app)/profile" },
];

interface TopAppBarProps {
  title: string;
  showSearch?: boolean;
}

export function TopAppBar({ title, showSearch = true }: TopAppBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && width >= 1024;
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <View className="flex-row items-center justify-between px-4 py-3 bg-surface/80">
        <View className="flex-row items-center gap-2">
          {!isDesktop && (
            <TouchableOpacity
              className="p-2 -ml-1 rounded-full"
              onPress={() => setDrawerOpen(true)}
            >
              <MaterialIcons name="menu" size={24} color="#777587" />
            </TouchableOpacity>
          )}
          <Text
            className="text-on-surface font-headline text-lg"
            numberOfLines={1}
          >
            {title}
          </Text>
        </View>

        <View className="flex-row items-center gap-1">
          {showSearch && (
            <TouchableOpacity
              className="p-2 rounded-full"
              onPress={() => setSearchOpen(true)}
            >
              <MaterialIcons name="search" size={22} color="#777587" />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            className="p-2 rounded-full"
            onPress={() => setNotificationsOpen(true)}
          >
            <MaterialIcons
              name="notifications-none"
              size={22}
              color="#777587"
            />
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

      {/* Mobile drawer */}
      {!isDesktop && (
        <Modal
          visible={drawerOpen}
          transparent
          animationType="none"
          onRequestClose={() => setDrawerOpen(false)}
        >
          <View className="flex-1 flex-row">
            {/* Drawer panel */}
            <View
              className="h-full bg-surface-container-lowest px-4 py-6"
              style={{ width: Math.min(width * 0.78, 300) }}
            >
              <View className="flex-row items-center justify-between mb-6 px-2">
                <OrdovitaLogo size="sm" />
                <TouchableOpacity
                  className="p-2 rounded-full"
                  onPress={() => setDrawerOpen(false)}
                >
                  <MaterialIcons name="close" size={22} color="#777587" />
                </TouchableOpacity>
              </View>

              <View className="gap-0.5 flex-1">
                {DRAWER_NAV_ITEMS.map((item) => {
                  const active = pathname.startsWith(
                    item.path.replace("/(app)", ""),
                  );
                  return (
                    <TouchableOpacity
                      key={item.path}
                      activeOpacity={0.85}
                      onPress={() => {
                        setDrawerOpen(false);
                        router.push(item.path as never);
                      }}
                      className={`flex-row items-center gap-3 px-4 py-3.5 rounded-xl ${
                        active ? "bg-primary/10" : ""
                      }`}
                    >
                      <MaterialIcons
                        name={item.icon}
                        size={22}
                        color={active ? "#4d41df" : "#777587"}
                      />
                      <Text
                        className={`text-sm ${
                          active
                            ? "text-primary font-headline"
                            : "text-on-surface-variant font-body"
                        }`}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View className="gap-3 pt-4 border-t border-outline-variant/30">
                <TouchableOpacity
                  onPress={() => {
                    toggle();
                  }}
                  className="flex-row items-center gap-3 px-4 py-2"
                >
                  <MaterialIcons
                    name={mode === "dark" ? "light-mode" : "dark-mode"}
                    size={20}
                    color="#777587"
                  />
                  <Text className="text-on-surface-variant font-body text-sm">
                    {mode === "dark" ? "Jasny motyw" : "Ciemny motyw"}
                  </Text>
                </TouchableOpacity>

                {user && (
                  <View className="flex-row items-center gap-3 px-4 py-2">
                    <Avatar fullName={user.fullName} size="sm" />
                    <Text
                      className="text-on-surface font-label text-sm flex-1"
                      numberOfLines={1}
                    >
                      {user.fullName}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Backdrop */}
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
