import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { cssInterop } from "nativewind";
import { NavItem } from "../molecules/NavItem";
import { Avatar } from "../atoms/Avatar";
import { OrdovitaLogo } from "../atoms/OrdovitaLogo";
import { useAuthStore, useThemeStore } from "@/lib/stores";
import { Role } from "@/lib/types";

cssInterop(LinearGradient, { className: "style" });

const NAV_ITEMS: Array<{
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  path: string;
}> = [
  { icon: "dashboard", label: "Dashboard", path: "/(app)/dashboard" },
  { icon: "auto-awesome", label: "AI Task", path: "/(app)/ai-task" },
  { icon: "calendar-today", label: "Calendar", path: "/(app)/calendar" },
  { icon: "checklist", label: "Tasks", path: "/(app)/tasks" },
  { icon: "category", label: "Categories", path: "/(app)/categories" },
  { icon: "toggle-on", label: "Statuses", path: "/(app)/statuses" },
  { icon: "bar-chart", label: "Statistics", path: "/(app)/statistics" },
  { icon: "settings", label: "Settings", path: "/(app)/profile" },
];

export function SideNavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const { mode, toggle } = useThemeStore();

  return (
    <View className="w-64 h-full bg-surface-container-lowest border-r-0 px-4 py-6 justify-between">
      <View>
        <TouchableOpacity
          className="px-4 mb-8"
          onPress={() => router.push("/(app)/dashboard")}
        >
          <OrdovitaLogo size="md" />
        </TouchableOpacity>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="gap-1">
            {NAV_ITEMS.map((item) => (
              <NavItem
                key={item.path}
                icon={item.icon}
                label={item.label}
                active={pathname.startsWith(item.path.replace("/(app)", ""))}
                onPress={() => router.push(item.path as never)}
              />
            ))}
            {user?.role === Role.ADMIN && (
              <>
                <View className="h-px bg-outline-variant/15 my-3 mx-2" />
                <NavItem
                  icon="poll"
                  label="Surveys"
                  active={pathname.startsWith("/admin-survey")}
                  onPress={() => router.push("/(app)/admin-surveys" as never)}
                />
              </>
            )}
            {user?.role === Role.USER && (
              <>
                <View className="h-px bg-outline-variant/15 my-3 mx-2" />
                <NavItem
                  icon="assignment"
                  label="Ankiety"
                  active={
                    pathname === "/surveys" || pathname.startsWith("/survey")
                  }
                  onPress={() => router.push("/(app)/surveys" as never)}
                />
              </>
            )}
          </View>

          <TouchableOpacity
            className="mt-6"
            onPress={() => router.push("/(app)/tasks" as never)}
          >
            <LinearGradient
              colors={["#4d41df", "#675df9"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="flex-row items-center justify-center gap-2 px-4 py-3 rounded-xl"
            >
              <MaterialIcons name="add" size={20} color="#ffffff" />
              <Text className="text-white font-headline text-sm">New Task</Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <View className="gap-4">
        <TouchableOpacity
          onPress={toggle}
          className="flex-row items-center gap-3 px-4 py-2"
        >
          <MaterialIcons
            name={mode === "dark" ? "light-mode" : "dark-mode"}
            size={20}
            color="#777587"
          />
          <Text className="text-on-surface-variant font-body text-sm">
            {mode === "dark" ? "Light Mode" : "Dark Mode"}
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
  );
}
