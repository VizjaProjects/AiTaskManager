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
import { useT } from "@/lib/i18n";

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
  const t = useT();
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const { width } = useWindowDimensions();
  const isWide = Platform.OS === "web" && width >= 1024;

  if (isLoading || isAuthenticated) return null;

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
              label={t("auth.login")}
              variant="outline"
              onPress={() => router.push("/(auth)/login")}
            />
            <Button
              label={t("auth.register")}
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
              {t("landing.versionBadge")}
            </Text>
          </View>

          <Text className="text-on-surface font-display text-headline-lg-mobile md:text-display-lg text-center max-w-3xl">
            {t("landing.heroPrefix")}{" "}
            <Text className="font-display" style={{ color: ACCENT }}>
              {t("landing.heroAccent")}
            </Text>{" "}
            {t("landing.heroSuffix")}
          </Text>

          <Text className="text-on-surface-variant font-body text-body-lg text-center max-w-2xl">
            {t("landing.heroSubtitle")}
          </Text>

          <View
            className={`gap-4 mt-4 ${isWide ? "flex-row" : "flex-col w-full max-w-md"}`}
          >
            <DownloadButton
              icon="desktop-windows"
              label={t("landing.downloadWindows")}
              onPress={() => openDownload(WINDOWS_INSTALLER_URL)}
            />
            <DownloadButton
              icon="laptop-mac"
              label={t("landing.downloadMac")}
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
            {t("landing.featuresTitle")}
          </Text>
          <Text className="text-on-surface-variant font-body text-body-lg text-center max-w-xl">
            {t("landing.featuresSubtitle")}
          </Text>
          <View
            className={`gap-4 mt-6 w-full ${isWide ? "flex-row" : "flex-col"}`}
          >
            <FocusCard
              icon="checklist"
              title={t("landing.featTasks")}
              desc={t("landing.featTasksDesc")}
            />
            <FocusCard
              icon="calendar-today"
              title={t("landing.featCalendar")}
              desc={t("landing.featCalendarDesc")}
            />
            <FocusCard
              icon="auto-awesome"
              title={t("landing.featAi")}
              desc={t("landing.featAiDesc")}
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
                label={t("auth.login")}
                onPress={() => router.push("/(auth)/login")}
              />
              <FooterLink
                label={t("auth.privacy")}
                onPress={() => router.push("/privacy-policy" as never)}
              />
              <FooterLink
                label={t("auth.terms")}
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
  const t = useT();
  return (
    <View
      className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-6 md:p-8 overflow-hidden"
      style={cardShadow}
    >
      <View className="flex-row gap-4">
        <View className="hidden md:flex w-44 gap-2">
          <OrdovitaLogo size="sm" showTagline />
          <View className="h-px bg-outline-variant my-1" />
          {[
            t("landing.navDashboard"),
            t("landing.navTasks"),
            t("landing.navCalendar"),
          ].map((item, i) => (
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
                {t("landing.previewGreeting")}
              </Text>
              <Text className="text-on-surface-variant font-body text-body-md mt-0.5">
                {t("landing.previewSummary")}
              </Text>
            </View>
            <Text className="text-text-tertiary font-body text-sm">
              {t("landing.previewDate")}
            </Text>
          </View>

          <View className="flex-row gap-3">
            {[
              { label: t("landing.previewTasksToday"), value: "5", color: INK },
              { label: t("landing.previewEvents"), value: "2", color: DANGER },
              { label: t("landing.previewPendingAi"), value: "1", color: ACCENT },
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
              {t("landing.previewTodaysFocus")}
            </Text>
            <View className="bg-surface-container-lowest rounded-xl p-3 border border-outline-variant flex-row items-center gap-3">
              <View className="w-4 h-4 rounded-full border-2 border-outline" />
              <View className="flex-1">
                <Text className="text-on-surface font-headline text-sm">
                  {t("landing.previewTaskTitle")}
                </Text>
                <Text className="text-on-surface-variant font-body text-xs">
                  {t("landing.previewTaskDue")}
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
                {t("landing.previewAiSuggestion")}
              </Text>
              <View
                className="px-3 py-1 rounded-lg"
                style={{ backgroundColor: ACCENT }}
              >
                <Text className="text-white font-label text-[10px]">
                  {t("landing.previewAdd")}
                </Text>
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
