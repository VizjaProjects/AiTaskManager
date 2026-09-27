import { useState, type ReactNode } from "react";
import {
  KeyboardAvoidingView,
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
import { OrdovitaLogo } from "@/components/atoms";
import { WeekPreview } from "@/components/organisms/landing/PlanDemo";
import { useT } from "@/lib/i18n";
import { useThemeStore } from "@/lib/stores";
import { getBrandTokens } from "@/lib/utils/uiTokens";

function LegalLinks() {
  const t = useT();
  const router = useRouter();
  return (
    <View className="flex-row flex-wrap gap-x-2">
      {[
        { label: t("landing.terms"), href: "/terms-of-service" },
        { label: t("landing.privacy"), href: "/privacy-policy" },
      ].map((l) => (
        <TouchableOpacity
          key={l.href}
          accessibilityRole="link"
          onPress={() => router.push(l.href as never)}
          className="min-h-11 justify-center px-2"
        >
          <Text className="text-brand-muted font-body text-sm">{l.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

/**
 * Calendar preview beside the form. It always fits inside its column: below
 * 580 px it shows Wed–Fri, and the row height follows the window height.
 */
function CalendarAside() {
  const { height } = useWindowDimensions();
  const isDark = useThemeStore((s) => s.mode) === "dark";
  const brand = getBrandTokens(isDark);
  const [asideWidth, setAsideWidth] = useState(0);

  const padding = asideWidth >= 640 ? 48 : 40;
  const cardWidth = Math.min(asideWidth - padding * 2, 640);
  const narrow = cardWidth < 580;
  // 60 header + 44 day row + vertical padding
  const rowHeight = Math.max(40, Math.min(60, Math.floor((height - 60 - 44 - padding * 2) / 8)));

  return (
    <View
      aria-hidden
      className="bg-brand-accent-soft justify-center items-center"
      style={{ width: "48%", padding }}
      onLayout={(e) => setAsideWidth(e.nativeEvent.layout.width)}
    >
      {asideWidth > 0 && (
        <View
            className="bg-brand-surface border border-brand-line overflow-hidden"
            style={{
              width: cardWidth,
              borderRadius: 16,
              ...(Platform.OS === "web" ? ({ boxShadow: brand.shadow } as object) : null),
            }}
          >
            <WeekPreview
              rowHeight={rowHeight}
              showViewSwitch={false}
              call="shown"
              report="shown"
              firstDay={narrow ? 2 : 0}
              dayCount={narrow ? 3 : 5}
            />
          </View>
      )}
    </View>
  );
}

/** Screen title (display serif) with an optional supporting line or node below. */
export function AuthHeading({ title, children }: { title: string; children?: ReactNode }) {
  const { width } = useWindowDimensions();
  const isWide = Platform.OS === "web" && width >= 1024;
  return (
    <View className="gap-2.5">
      <Text
        accessibilityRole="header"
        className="text-brand-ink font-display"
        style={{ fontSize: isWide ? 44 : 32, lineHeight: isWide ? 48 : 36 }}
      >
        {title}
      </Text>
      {children}
    </View>
  );
}

/** Inline link styled for the auth screens. */
export function AuthTextLink({
  label,
  onPress,
  tone = "accent",
}: {
  label: string;
  onPress: () => void;
  tone?: "accent" | "ink" | "muted";
}) {
  const { width } = useWindowDimensions();
  // Mouse on wide web: 32px still clears the WCAG 2.2 target size; touch keeps 44px.
  const isWide = Platform.OS === "web" && width >= 1024;
  const color =
    tone === "accent" ? "text-brand-accent-text" : tone === "ink" ? "text-brand-ink" : "text-brand-muted";
  return (
    <TouchableOpacity
      accessibilityRole="link"
      onPress={onPress}
      className={`${isWide ? "min-h-8" : "min-h-11"} justify-center`}
    >
      <Text className={`${color} font-headline text-[15px] underline`}>{label}</Text>
    </TouchableOpacity>
  );
}

/** Error or success message above a form. */
export function AuthAlert({ message, tone = "error" }: { message: string; tone?: "error" | "success" }) {
  return (
    <View
      accessibilityRole="alert"
      className={`rounded-input border px-3.5 py-3 ${
        tone === "error" ? "border-error bg-error-container" : "border-brand-line bg-brand-accent-soft"
      }`}
    >
      <Text
        className={`font-body text-[15px] leading-6 ${
          tone === "error" ? "text-on-error-container" : "text-brand-ink"
        }`}
      >
        {message}
      </Text>
    </View>
  );
}

/**
 * Auth layout in the brand palette. Wide web: form column + calendar preview.
 * Narrow: back arrow + logo, form directly below so the keyboard never hides it.
 */
export function AuthSplitLayout({
  children,
  backHref = "/",
  backLabel,
}: {
  children: ReactNode;
  backHref?: string;
  backLabel?: string;
}) {
  const t = useT();
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const isWide = Platform.OS === "web" && width >= 1024;
  const isDark = useThemeStore((s) => s.mode) === "dark";
  const brand = getBrandTokens(isDark);

  if (isWide) {
    return (
      <View nativeID="brand-root" className="flex-1 flex-row bg-brand-paper">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: width >= 1280 ? 120 : 64,
            paddingVertical: height < 800 ? 16 : 24,
          }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Legal links share the logo row, so the whole height below is for the form. */}
          <View className="flex-row items-center justify-between" style={{ width: 400, maxWidth: "100%" }}>
            <TouchableOpacity
              accessibilityRole="link"
              accessibilityLabel={t("common.backToHome")}
              onPress={() => router.push("/")}
              className="min-h-11 justify-center"
            >
              <OrdovitaLogo size="md" />
            </TouchableOpacity>
            <View style={{ marginRight: -8 }}>
              <LegalLinks />
            </View>
          </View>
          {/* Anchored at the top: the form changes height in place instead of re-centring. */}
          <View
            className="flex-1"
            style={{ paddingTop: Math.round(Math.min(88, Math.max(20, (height - 700) * 0.35 + 28))), paddingBottom: 24 }}
          >
            <View style={{ width: 400, maxWidth: "100%" }}>{children}</View>
          </View>
        </ScrollView>

        <CalendarAside />
      </View>
    );
  }

  return (
    <SafeAreaView nativeID="brand-root" className="flex-1 bg-brand-paper">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="h-14 px-2 flex-row items-center">
          <TouchableOpacity
            accessibilityRole="link"
            accessibilityLabel={backLabel ?? t("common.backToHome")}
            onPress={() => router.push(backHref as never)}
            className="w-11 h-11 items-center justify-center"
          >
            <MaterialIcons name="arrow-back-ios-new" size={20} color={brand.ink} />
          </TouchableOpacity>
          <View className="flex-1 items-center">
            <OrdovitaLogo size="sm" />
          </View>
          <View className="w-11" />
        </View>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20, paddingTop: 20 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="w-full self-center" style={{ maxWidth: 440 }}>
            {children}
          </View>
          <View className="flex-1" />
          <View className="items-center py-4">
            <LegalLinks />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
