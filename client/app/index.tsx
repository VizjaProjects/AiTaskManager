import {
  Linking,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { Button, OrdovitaLogo } from "@/components/atoms";
import { useAuthStore } from "@/lib/stores";

const WINDOWS_INSTALLER_URL = "/downloads/Ordovita-Setup.exe";
const MACOS_INSTALLER_URL = "/downloads/Ordovita-macOS-arm64.dmg";
const PRIMARY = "#4d41df";

export default function Index() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { width } = useWindowDimensions();
  const isWide = Platform.OS === "web" && width >= 1024;

  if (isAuthenticated) {
    router.replace("/(app)/dashboard");
    return null;
  }

  function openDownload(url: string) {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      window.location.href = url;
      return;
    }
    Linking.openURL(`https://ordovita.pl${url}`);
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1">
        <View className="px-6 md:px-12 py-5 flex-row items-center justify-between max-w-6xl w-full self-center">
          <OrdovitaLogo size="md" showTagline={false} />
          <View className="flex-row items-center gap-3">
            <Button
              label="Log In"
              variant="outline"
              onPress={() => router.push("/(auth)/login")}
            />
            <Button
              label="Sign Up"
              icon="arrow-forward"
              onPress={() => router.push("/(auth)/register")}
            />
          </View>
        </View>

        <View className="max-w-4xl w-full self-center px-6 py-12 items-center gap-6">
          <View className="px-4 py-1.5 rounded-full bg-primary-fixed">
            <Text className="text-primary font-label text-label-md">
              ✨ Ordovita v2.0 is now live
            </Text>
          </View>
          <Text className="text-on-surface font-headline text-headline-lg-mobile md:text-display-lg text-center">
            Your Premium{" "}
            <Text className="text-primary">Workspace</Text> for Ultimate
            Clarity.
          </Text>
          <Text className="text-on-surface-variant font-body text-body-lg text-center max-w-2xl">
            Minimalist task management. Reduce cognitive load, focus on what
            matters, and organize your day with clarity.
          </Text>

          <View className={`flex-row gap-4 mt-4 ${isWide ? "" : "flex-col w-full"}`}>
            <DownloadButton
              icon="desktop-windows"
              label="DOWNLOAD FOR Windows"
              onPress={() => openDownload(WINDOWS_INSTALLER_URL)}
            />
            <DownloadButton
              icon="laptop-mac"
              label="DOWNLOAD FOR macOS"
              onPress={() => openDownload(MACOS_INSTALLER_URL)}
            />
          </View>
          <Text className="text-on-surface-variant font-body text-body-md">
            Also available on web. Free 14-day trial.
          </Text>
        </View>

        <View className="max-w-5xl w-full self-center px-6 pb-12">
          <LandingAppPreview />
        </View>

        <View className="max-w-4xl w-full self-center px-6 pb-16 items-center gap-4">
          <Text className="text-on-surface font-headline text-headline-md text-center">
            Designed for Focus
          </Text>
          <Text className="text-on-surface-variant font-body text-body-lg text-center max-w-xl">
            Everything you need to manage complex workflows, without the visual
            clutter.
          </Text>
          <View className={`gap-4 mt-6 w-full ${isWide ? "flex-row" : "flex-col"}`}>
            <FocusCard icon="checklist" title="Task Management" desc="Kanban, filters, priorities — all in one place." />
            <FocusCard icon="calendar-today" title="Smart Calendar" desc="Plan your day with events and clear month view." />
            <FocusCard icon="auto-awesome" title="AI Planning" desc="Natural language task creation and smart suggestions." />
          </View>
          <View className="flex-row gap-6 mt-8">
            <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
              <Text className="text-primary font-headline text-sm">Log In</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push("/privacy-policy" as never)}>
              <Text className="text-on-surface-variant font-body text-sm">Privacy Policy</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push("/terms-of-service" as never)}>
              <Text className="text-on-surface-variant font-body text-sm">Terms of Service</Text>
            </TouchableOpacity>
          </View>
          <Text className="text-on-surface-variant font-body text-xs mt-4">
            kontakt@ordovita.pl | https://ordovita.pl
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function DownloadButton({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-1 flex-row items-center justify-center gap-3 bg-surface-container-lowest rounded-xl px-6 py-4 shadow-card"
    >
      <MaterialIcons name={icon} size={22} color={PRIMARY} />
      <Text className="text-on-surface font-headline text-sm">{label}</Text>
    </TouchableOpacity>
  );
}

function LandingAppPreview() {
  return (
    <View className="bg-surface-container-lowest rounded-3xl shadow-card p-6 md:p-8 overflow-hidden">
      <View className="flex-row gap-4">
        <View className="hidden md:flex w-44 gap-2">
          <OrdovitaLogo size="sm" showTagline />
          <View className="h-8 rounded-lg bg-primary-fixed" />
          {["Dashboard", "Tasks", "Calendar"].map((item, i) => (
            <View
              key={item}
              className={`h-8 rounded-lg px-3 justify-center ${i === 0 ? "bg-primary-fixed" : "bg-surface-container-low"}`}
            >
              <Text className={`text-xs font-label ${i === 0 ? "text-primary" : "text-on-surface-variant"}`}>
                {item}
              </Text>
            </View>
          ))}
        </View>

        <View className="flex-1 gap-4">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-on-surface font-headline text-title-lg">
                Good morning, Alex.
              </Text>
              <Text className="text-on-surface-variant font-body text-body-md mt-0.5">
                You have 5 tasks to complete today.
              </Text>
            </View>
            <Text className="text-on-surface-variant font-body text-sm">Mon, Oct 24</Text>
          </View>

          <View className="flex-row gap-3">
            {[
              { label: "Tasks Today", value: "5", color: PRIMARY, bg: "#f0eeff" },
              { label: "Events", value: "2", color: "#dc2c4f", bg: "#fff0f0" },
              { label: "Pending AI", value: "1", color: "#FBBF24", bg: "#fffbeb" },
            ].map((s) => (
              <View key={s.label} className="flex-1 bg-surface-container-lowest rounded-xl p-3 shadow-card">
                <View className="w-7 h-7 rounded-lg items-center justify-center mb-2" style={{ backgroundColor: s.bg }}>
                  <MaterialIcons name="circle" size={8} color={s.color} />
                </View>
                <Text className="text-on-surface font-headline text-xl">{s.value}</Text>
                <Text className="text-on-surface-variant font-label text-[10px] uppercase mt-0.5">{s.label}</Text>
              </View>
            ))}
          </View>

          <View className="gap-2">
            <Text className="text-on-surface font-headline text-sm">Today&apos;s Focus</Text>
            <View className="bg-surface-container-lowest rounded-xl p-3 shadow-card flex-row items-center gap-3">
              <View className="w-4 h-4 rounded-full border-2 border-outline-variant" />
              <View className="flex-1">
                <Text className="text-on-surface font-headline text-sm">Review Q3 Marketing Strategy</Text>
                <Text className="text-on-surface-variant font-body text-xs">Due 10:00 AM</Text>
              </View>
            </View>
            <View className="rounded-xl border-2 border-dashed border-ai-proposed/50 bg-ai-proposed/5 p-3 flex-row items-center gap-2">
              <MaterialIcons name="auto-awesome" size={16} color="#FBBF24" />
              <Text className="text-on-surface font-headline text-sm flex-1">AI Suggested: Weekly Sync</Text>
              <View className="bg-primary px-3 py-1 rounded-lg">
                <Text className="text-white font-label text-[10px]">Add</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

function FocusCard({ icon, title, desc }: { icon: keyof typeof MaterialIcons.glyphMap; title: string; desc: string }) {
  return (
    <View className="flex-1 bg-surface-container-lowest rounded-2xl p-5 shadow-card">
      <View className="w-10 h-10 rounded-xl bg-primary-fixed items-center justify-center">
        <MaterialIcons name={icon} size={22} color={PRIMARY} />
      </View>
      <Text className="text-on-surface font-headline text-title-lg mt-3">{title}</Text>
      <Text className="text-on-surface-variant font-body text-body-md mt-1">{desc}</Text>
    </View>
  );
}
