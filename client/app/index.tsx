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

// Single accent — the Arena violet. One accent, used everywhere a highlight is needed.
const ACCENT = "#5b4ee0";
const INK = "#1a1a18";
const DANGER = "#dc2c4f";

// Real elevation for landing cards (the app surfaces stay flat by design; the
// marketing page needs depth so white cards read against the cream paper bg).
const cardShadow =
  Platform.OS === "web"
    ? {
        boxShadow:
          "0 1px 2px rgba(16,24,40,0.04), 0 6px 16px rgba(16,24,40,0.07)",
      }
    : {
        shadowColor: "#101828",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 3,
      };

const accentTint = (alpha: number) => `rgba(91,78,224,${alpha})`;

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
        {/* Header */}
        <View className="px-6 md:px-12 py-5 flex-row items-center justify-between max-w-5xl w-full self-center">
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

        {/* Hero */}
        <View className="max-w-5xl w-full self-center px-6 pt-12 pb-10 items-center gap-6">
          <View
            className="flex-row items-center gap-1.5 px-3.5 py-1.5 rounded-full"
            style={{ backgroundColor: accentTint(0.08) }}
          >
            <MaterialIcons name="auto-awesome" size={13} color={ACCENT} />
            <Text
              className="font-label text-label-md"
              style={{ color: ACCENT }}
            >
              Ordovita v2.0 is now live
            </Text>
          </View>

          <Text className="text-on-surface font-display text-headline-lg-mobile md:text-display-lg text-center max-w-3xl">
            Your Premium{" "}
            <Text className="font-display" style={{ color: ACCENT }}>
              Workspace
            </Text>{" "}
            for Ultimate Clarity.
          </Text>

          <Text className="text-on-surface-variant font-body text-body-lg text-center max-w-2xl">
            Minimalist task management. Reduce cognitive load, focus on what
            matters, and organize your day with clarity.
          </Text>

          <View
            className={`gap-4 mt-4 ${isWide ? "flex-row" : "flex-col w-full max-w-md"}`}
          >
            <DownloadButton
              icon="desktop-windows"
              label="Download for Windows"
              onPress={() => openDownload(WINDOWS_INSTALLER_URL)}
            />
            <DownloadButton
              icon="laptop-mac"
              label="Download for macOS"
              onPress={() => openDownload(MACOS_INSTALLER_URL)}
            />
          </View>
          <Text className="text-text-tertiary font-body text-body-md">
            Also available on web · Free 14-day trial
          </Text>
        </View>

        {/* App preview */}
        <View className="max-w-5xl w-full self-center px-6 pb-16">
          <LandingAppPreview />
        </View>

        {/* Features */}
        <View className="max-w-5xl w-full self-center px-6 pb-16 items-center gap-4">
          <Text className="text-on-surface font-display text-headline-md text-center">
            Designed for Focus
          </Text>
          <Text className="text-on-surface-variant font-body text-body-lg text-center max-w-xl">
            Everything you need to manage complex workflows, without the visual
            clutter.
          </Text>
          <View
            className={`gap-4 mt-6 w-full ${isWide ? "flex-row" : "flex-col"}`}
          >
            <FocusCard
              icon="checklist"
              title="Task Management"
              desc="Kanban, filters, priorities — all in one place."
            />
            <FocusCard
              icon="calendar-today"
              title="Smart Calendar"
              desc="Plan your day with events and a clear month view."
            />
            <FocusCard
              icon="auto-awesome"
              title="AI Planning"
              desc="Natural-language task creation and smart suggestions."
            />
          </View>
        </View>

        {/* Footer */}
        <View className="border-t border-outline-variant">
          <View className="max-w-5xl w-full self-center px-6 py-8 gap-4 md:flex-row md:items-center md:justify-between">
            <View className="flex-row items-center gap-2">
              <OrdovitaLogo size="sm" showTagline={false} />
            </View>
            <View className="flex-row flex-wrap items-center gap-x-6 gap-y-2">
              <FooterLink
                label="Log In"
                onPress={() => router.push("/(auth)/login")}
              />
              <FooterLink
                label="Privacy Policy"
                onPress={() => router.push("/privacy-policy" as never)}
              />
              <FooterLink
                label="Terms of Service"
                onPress={() => router.push("/terms-of-service" as never)}
              />
              <FooterLink
                label="kontakt@ordovita.pl"
                onPress={() =>
                  Platform.OS === "web"
                    ? (window.location.href = "mailto:kontakt@ordovita.pl")
                    : Linking.openURL("mailto:kontakt@ordovita.pl")
                }
              />
            </View>
          </View>
          <View className="max-w-5xl w-full self-center px-6 pb-8">
            <Text className="text-text-tertiary font-body text-xs">
              © 2026 Ordovita · ordovita.pl
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function FooterLink({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress}>
      <Text className="text-on-surface-variant font-body text-sm">{label}</Text>
    </TouchableOpacity>
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
      activeOpacity={0.9}
      className="flex-1 flex-row items-center justify-center gap-3 bg-surface-container-lowest rounded-xl px-6 py-4 border border-outline-variant"
      style={cardShadow}
    >
      <MaterialIcons name={icon} size={20} color={INK} />
      <Text className="text-on-surface font-headline text-sm">{label}</Text>
    </TouchableOpacity>
  );
}

function LandingAppPreview() {
  return (
    <View
      className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-6 md:p-8 overflow-hidden"
      style={cardShadow}
    >
      <View className="flex-row gap-4">
        <View className="hidden md:flex w-44 gap-2">
          <OrdovitaLogo size="sm" showTagline />
          <View className="h-px bg-outline-variant my-1" />
          {["Dashboard", "Tasks", "Calendar"].map((item, i) => (
            <View
              key={item}
              className="h-8 rounded-lg px-3 justify-center"
              style={i === 0 ? { backgroundColor: accentTint(0.1) } : undefined}
            >
              <Text
                className="text-xs font-label"
                style={{ color: i === 0 ? ACCENT : "#6b6965" }}
              >
                {item}
              </Text>
            </View>
          ))}
        </View>

        <View className="flex-1 gap-4">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-on-surface font-display text-title-lg">
                Good morning, Alex.
              </Text>
              <Text className="text-on-surface-variant font-body text-body-md mt-0.5">
                You have 5 tasks to complete today.
              </Text>
            </View>
            <Text className="text-text-tertiary font-body text-sm">
              Mon, Oct 24
            </Text>
          </View>

          <View className="flex-row gap-3">
            {[
              { label: "Tasks Today", value: "5", color: INK },
              { label: "Events", value: "2", color: DANGER },
              { label: "Pending AI", value: "1", color: ACCENT },
            ].map((s) => (
              <View
                key={s.label}
                className="flex-1 bg-surface-container-lowest rounded-xl p-3 border border-outline-variant"
              >
                <View
                  className="w-7 h-7 rounded-lg items-center justify-center mb-2"
                  style={{ backgroundColor: `${s.color}1a` }}
                >
                  <MaterialIcons name="circle" size={8} color={s.color} />
                </View>
                <Text className="text-on-surface font-headline text-xl">
                  {s.value}
                </Text>
                <Text className="text-text-tertiary font-label text-[10px] uppercase mt-0.5">
                  {s.label}
                </Text>
              </View>
            ))}
          </View>

          <View className="gap-2">
            <Text className="text-on-surface font-headline text-sm">
              Today&apos;s Focus
            </Text>
            <View className="bg-surface-container-lowest rounded-xl p-3 border border-outline-variant flex-row items-center gap-3">
              <View className="w-4 h-4 rounded-full border-2 border-outline" />
              <View className="flex-1">
                <Text className="text-on-surface font-headline text-sm">
                  Review Q3 Marketing Strategy
                </Text>
                <Text className="text-on-surface-variant font-body text-xs">
                  Due 10:00 AM
                </Text>
              </View>
            </View>
            <View
              className="rounded-xl p-3 flex-row items-center gap-2"
              style={{
                backgroundColor: accentTint(0.06),
                borderWidth: 1,
                borderColor: accentTint(0.25),
              }}
            >
              <MaterialIcons name="auto-awesome" size={16} color={ACCENT} />
              <Text className="text-on-surface font-headline text-sm flex-1">
                AI Suggested: Weekly Sync
              </Text>
              <View
                className="px-3 py-1 rounded-lg"
                style={{ backgroundColor: ACCENT }}
              >
                <Text className="text-white font-label text-[10px]">Add</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

function FocusCard({
  icon,
  title,
  desc,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  desc: string;
}) {
  return (
    <View
      className="flex-1 bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant"
      style={cardShadow}
    >
      <View
        className="w-10 h-10 rounded-xl items-center justify-center"
        style={{ backgroundColor: accentTint(0.1) }}
      >
        <MaterialIcons name={icon} size={22} color={ACCENT} />
      </View>
      <Text className="text-on-surface font-headline text-title-lg mt-3">
        {title}
      </Text>
      <Text className="text-on-surface-variant font-body text-body-md mt-1">
        {desc}
      </Text>
    </View>
  );
}
