import { useRef } from "react";
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
import { BrandButton, OrdovitaLogo } from "@/components/atoms";
import { PlanDemo } from "@/components/organisms/landing/PlanDemo";
import {
  AiSettingsSpecimen,
  CommentSpecimen,
  MonthSpecimen,
  NoteSpecimen,
  TaskSpecimen,
} from "@/components/organisms/landing/Specimens";
import { useAuthStore } from "@/lib/stores";
import { useT } from "@/lib/i18n";

const WINDOWS_INSTALLER_URL = "/downloads/Ordovita-Setup.exe";
const MACOS_INSTALLER_URL = "/downloads/Ordovita-macOS-arm64.dmg";
const CONTACT_EMAIL = "kontakt@ordovita.pl";

// Mirror of DotNetServer PlanDefaults (Free). The AI limit is counted per day.
const FREE_PLAN = { aiPerDay: 15, privateWorkspaces: 3, publicWorkspaces: 3 };

type SectionKey = "how" | "features" | "start";

function openExternal(url: string) {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    window.location.href = url;
    return;
  }
  Linking.openURL(url.startsWith("/") ? `https://ordovita.pl${url}` : url);
}

export default function Index() {
  const t = useT();
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const { width } = useWindowDimensions();
  const isWide = Platform.OS === "web" && width >= 1024;
  const scrollRef = useRef<ScrollView>(null);
  const sectionY = useRef<Record<SectionKey, number>>({ how: 0, features: 0, start: 0 });

  if (isLoading || isAuthenticated) return null;

  const goRegister = () => router.push("/(auth)/register");
  const goLogin = () => router.push("/(auth)/login");
  const scrollTo = (key: SectionKey) =>
    scrollRef.current?.scrollTo({ y: sectionY.current[key], animated: true });
  const track = (key: SectionKey) => (e: { nativeEvent: { layout: { y: number } } }) => {
    sectionY.current[key] = e.nativeEvent.layout.y;
  };

  const startBody = t(isWide ? "landing.startBody" : "landing.startBodyShort", {
    ai: FREE_PLAN.aiPerDay,
    private: FREE_PLAN.privateWorkspaces,
    public: FREE_PLAN.publicWorkspaces,
  });

  // Each feature is shown as a fragment of the real UI next to its description.
  const features = [
    { title: t("landing.featTasks"), body: t("landing.featTasksDesc"), specimen: <TaskSpecimen /> },
    {
      title: t("landing.featCalendar"),
      body: t(isWide ? "landing.featCalendarDesc" : "landing.featCalendarShort"),
      specimen: <MonthSpecimen />,
    },
    { title: t("landing.featNotes"), body: t("landing.featNotesDesc"), specimen: <NoteSpecimen /> },
    { title: t("landing.featTeam"), body: t("landing.featTeamDesc"), specimen: <CommentSpecimen /> },
  ];
  const aiBody = [t("landing.aiBody1"), t("landing.aiBody2", { limit: FREE_PLAN.aiPerDay })];

  const footerLinks = [
    { label: t("landing.terms"), onPress: () => router.push("/terms-of-service" as never) },
    { label: t("landing.privacy"), onPress: () => router.push("/privacy-policy" as never) },
    { label: CONTACT_EMAIL, onPress: () => openExternal(`mailto:${CONTACT_EMAIL}`) },
  ];

  if (!isWide) {
    return (
      <SafeAreaView nativeID="brand-root" className="flex-1 bg-brand-paper">
        <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
          <View className="w-full self-center" style={{ maxWidth: 600 }}>
            <View className="h-[60px] pl-5 pr-2 flex-row items-center justify-between">
              <OrdovitaLogo size="sm" />
              <TouchableOpacity
                accessibilityRole="link"
                onPress={goLogin}
                className="min-h-11 px-3 justify-center"
              >
                <Text className="text-brand-ink font-headline text-base">{t("auth.login")}</Text>
              </TouchableOpacity>
            </View>

            <View className="px-5 pt-7 pb-10 gap-5">
              <Text
                accessibilityRole="header"
                className="text-brand-ink font-display"
                style={{ fontSize: 40, lineHeight: 42 }}
              >
                {t("landing.heroTitle")}
              </Text>
              <Text className="text-brand-muted font-body text-[17px] leading-[26px]">
                {t("landing.heroBodyMobile")}
              </Text>
              <View className="gap-1 mt-1">
                <BrandButton label={t("landing.ctaPrimary")} size="lg" fullWidth onPress={goRegister} />
                <BrandButton label={t("landing.haveAccount")} variant="ghost" size="lg" fullWidth onPress={goLogin} />
              </View>
            </View>

            <View className="px-5 pb-12">
              <PlanDemo compact />
            </View>

            <View className="px-5 py-10 gap-7 border-t border-brand-line">
              <Text accessibilityRole="header" className="text-brand-ink font-display text-[32px] leading-[37px]">
                {t("landing.featuresTitle")}
              </Text>
              {features.map((f) => (
                <View key={f.title} className="pt-5 border-t border-brand-ink gap-2.5">
                  <Text className="text-brand-ink font-headline text-xl">{f.title}</Text>
                  <Text className="text-brand-muted font-body text-base leading-[26px]">{f.body}</Text>
                  <View className="mt-3">{f.specimen}</View>
                </View>
              ))}
            </View>

            <View className="px-5 pt-10 pb-12 gap-6 border-t border-brand-line">
              <View className="gap-4">
                <Text accessibilityRole="header" className="text-brand-ink font-display text-[32px] leading-[35px]">
                  {t("landing.aiTitle")}
                </Text>
                {aiBody.map((p) => (
                  <Text key={p} className="text-brand-muted font-body text-base leading-[26px]">
                    {p}
                  </Text>
                ))}
              </View>
              <AiSettingsSpecimen />
            </View>

            <View className="px-5 py-10 gap-5 bg-brand-accent-soft">
              <Text accessibilityRole="header" className="text-brand-ink font-display text-[30px] leading-9">
                {t("landing.startTitle")}
              </Text>
              <Text className="text-brand-ink font-body text-base leading-6">{startBody}</Text>
              <BrandButton label={t("landing.ctaPrimary")} size="lg" fullWidth onPress={goRegister} />
              <Text className="text-brand-ink font-body text-sm leading-5">{t("landing.desktopNote")}</Text>
            </View>
          </View>

          <View className="flex-1" />
          <View className="px-5 pt-5 pb-8 border-t border-brand-line gap-2 w-full self-center" style={{ maxWidth: 600 }}>
            {footerLinks.map((l) => (
              <TouchableOpacity key={l.label} accessibilityRole="link" onPress={l.onPress} className="min-h-11 justify-center">
                <Text className="text-brand-muted font-body text-[15px]">{l.label}</Text>
              </TouchableOpacity>
            ))}
            <Text className="text-brand-muted font-body text-sm">
              {t("landing.copyright", { year: new Date().getFullYear() })}
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const heroSize = width >= 1280 ? 80 : 64;
  const gutter = width >= 1280 ? 120 : 48;
  const container = { width: "100%" as const, maxWidth: 1200 + gutter * 2, paddingHorizontal: gutter, alignSelf: "center" as const };

  return (
    <View nativeID="brand-root" className="flex-1 bg-brand-paper">
      <ScrollView ref={scrollRef} className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
        <View style={container} className="h-20 flex-row items-center justify-between">
          <OrdovitaLogo size="md" />
          <View className="flex-row items-center gap-9">
            {([
              ["how", t("landing.navHow")],
              ["features", t("landing.navFeatures")],
              ["start", t("landing.navDownload")],
            ] as const).map(([key, label]) => (
              <TouchableOpacity key={key} accessibilityRole="link" onPress={() => scrollTo(key)} className="min-h-11 justify-center">
                <Text className="text-brand-ink font-body text-[15px]">{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View className="flex-row items-center gap-2">
            <BrandButton label={t("auth.login")} variant="ghost" onPress={goLogin} />
            <BrandButton label={t("landing.signUp")} onPress={goRegister} />
          </View>
        </View>

        <View style={[container, { paddingTop: 72 }]} className="flex-row items-end gap-20">
          <Text
            accessibilityRole="header"
            className="flex-1 text-brand-ink font-display"
            style={{ fontSize: heroSize, lineHeight: heroSize * 1.04, maxWidth: 720 }}
          >
            {t("landing.heroTitle")}
          </Text>
          <View className="gap-6 pb-2" style={{ width: 380 }}>
            <Text className="text-brand-muted font-body text-lg leading-7">{t("landing.heroBody")}</Text>
            <View className="flex-row gap-3">
              <BrandButton label={t("landing.ctaPrimary")} size="lg" onPress={goRegister} />
              <BrandButton label={t("auth.login")} variant="outline" size="lg" onPress={goLogin} />
            </View>
          </View>
        </View>

        <View style={[container, { paddingTop: 56, paddingBottom: 104 }]} onLayout={track("how")}>
          <PlanDemo />
        </View>

        <View style={[container, { paddingBottom: 88 }]} className="flex-row gap-20" onLayout={track("features")}>
          <Text accessibilityRole="header" className="text-brand-ink font-display text-[44px] leading-[48px]" style={{ width: 340 }}>
            {t("landing.featuresTitle")}
          </Text>
          <View className="flex-1 flex-row flex-wrap items-start" style={{ columnGap: 56, rowGap: 64 }}>
            {features.map((f) => (
              <View key={f.title} className="pt-5 border-t border-brand-ink gap-2.5" style={{ width: "46%", flexGrow: 1 }}>
                <Text className="text-brand-ink font-headline text-xl">{f.title}</Text>
                <Text className="text-brand-muted font-body text-base leading-[26px]">{f.body}</Text>
                <View className="mt-3">{f.specimen}</View>
              </View>
            ))}
          </View>
        </View>

        <View style={[container, { paddingBottom: 112 }]}>
          {/* 360 + 60 keeps the specimen on the same edge as the features above (340 + 80). */}
          <View className="flex-row pt-12 border-t border-brand-line" style={{ gap: 60 }}>
            <View className="gap-4" style={{ width: 360 }}>
              <Text accessibilityRole="header" className="text-brand-ink font-display text-[44px] leading-[48px]">
                {t("landing.aiTitle")}
              </Text>
              {aiBody.map((p) => (
                <Text key={p} className="text-brand-muted font-body text-base leading-[26px]">
                  {p}
                </Text>
              ))}
            </View>
            <View className="flex-1" style={{ maxWidth: 560 }}>
              <AiSettingsSpecimen />
            </View>
          </View>
        </View>

        <View style={container} onLayout={track("start")}>
          <View className="bg-brand-accent-soft flex-row gap-20" style={{ borderRadius: 24, paddingVertical: 72, paddingHorizontal: 80 }}>
            <View className="flex-1 gap-6">
              <Text accessibilityRole="header" className="text-brand-ink font-display text-[56px] leading-[60px]">
                {t("landing.startTitle")}
              </Text>
              <Text className="text-brand-ink font-body text-[17px] leading-7" style={{ maxWidth: 520 }}>
                {startBody}
              </Text>
              <BrandButton label={t("landing.ctaPrimary")} size="lg" onPress={goRegister} style={{ alignSelf: "flex-start" }} />
            </View>
            <View style={{ width: 440 }}>
              <Text className="text-brand-ink font-body text-base leading-[26px] mb-2">{t("landing.downloadIntro")}</Text>
              {[
                { name: t("landing.windows"), meta: t("landing.windowsMeta"), url: WINDOWS_INSTALLER_URL },
                { name: t("landing.mac"), meta: t("landing.macMeta"), url: MACOS_INSTALLER_URL },
              ].map((d) => (
                <TouchableOpacity
                  key={d.url}
                  accessibilityRole="link"
                  accessibilityLabel={`${t("landing.download")} ${d.name}`}
                  onPress={() => openExternal(d.url)}
                  className="min-h-16 flex-row items-center justify-between border-b border-brand-line"
                >
                  <View className="gap-0.5">
                    <Text className="text-brand-ink font-headline text-[17px]">{d.name}</Text>
                    <Text className="text-brand-muted font-body text-sm">{d.meta}</Text>
                  </View>
                  <Text className="text-brand-accent-text font-headline text-[15px]">{t("landing.download")}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View className="flex-1" style={{ minHeight: 96 }} />
        <View className="border-t border-brand-line">
          <View style={container} className="py-5 flex-row items-center justify-between">
            <Text className="text-brand-muted font-body text-sm">
              {t("landing.copyright", { year: new Date().getFullYear() })}
            </Text>
            <View className="flex-row gap-7">
              {footerLinks.map((l) => (
                <TouchableOpacity key={l.label} accessibilityRole="link" onPress={l.onPress} className="min-h-11 justify-center">
                  <Text className="text-brand-muted font-body text-sm">{l.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
