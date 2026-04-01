import { Stack } from "expo-router";
import { useThemeStore } from "@/lib/stores";

export default function AuthLayout() {
  const mode = useThemeStore((s) => s.mode);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: mode === "dark" ? "#0f1117" : "#fbf8ff",
        },
        animation: "slide_from_right",
      }}
    />
  );
}
