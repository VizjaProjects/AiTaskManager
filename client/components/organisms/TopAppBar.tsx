import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { Avatar } from "../atoms/Avatar";
import { useAuthStore } from "@/lib/stores";

interface TopAppBarProps {
  title: string;
  showSearch?: boolean;
}

export function TopAppBar({ title, showSearch = true }: TopAppBarProps) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  return (
    <View className="flex-row items-center justify-between px-6 py-4 bg-surface/80">
      <Text className="text-on-surface font-headline text-xl">{title}</Text>

      <View className="flex-row items-center gap-3">
        {showSearch && (
          <TouchableOpacity
            className="p-2 rounded-full"
            onPress={() => router.push("/(app)/search" as never)}
          >
            <MaterialIcons name="search" size={22} color="#777587" />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          className="p-2 rounded-full"
          onPress={() => router.push("/(app)/notifications" as never)}
        >
          <MaterialIcons name="notifications-none" size={22} color="#777587" />
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
  );
}
