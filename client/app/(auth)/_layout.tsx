import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#fbf8ff" },
        animation: "slide_from_right",
      }}
    />
  );
}
