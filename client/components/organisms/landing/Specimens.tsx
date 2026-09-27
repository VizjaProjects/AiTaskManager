import { useMemo, type ReactNode } from "react";
import { Platform, Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Svg, { Ellipse, Path, Rect } from "react-native-svg";
import { useLocale, useT } from "@/lib/i18n";
import { useThemeStore } from "@/lib/stores";
import { EVENT_COLOR_OPTIONS } from "@/lib/utils/eventColors";
import { getBrandTokens, getUiTokens } from "@/lib/utils/uiTokens";

/*
 * Landing-page fragments of the real UI. Each one only shows what the app actually does;
 * they are illustrations, so screen readers get the feature description next to them instead.
 */

const BLUE = EVENT_COLOR_OPTIONS[1];
const VIOLET = EVENT_COLOR_OPTIONS[0];
const GREEN = EVENT_COLOR_OPTIONS[2];

function useBrand() {
  return getBrandTokens(useThemeStore((s) => s.mode) === "dark");
}

function Card({ children, padded = true }: { children: ReactNode; padded?: boolean }) {
  return (
    <View
      aria-hidden
      importantForAccessibility="no-hide-descendants"
      className={`bg-brand-surface border border-brand-line ${padded ? "px-4 py-3.5" : ""}`}
      style={{ borderRadius: 12 }}
    >
      {children}
    </View>
  );
}

function thisWeekDay(index: number, hour = 0) {
  const d = new Date();
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7) + index);
  d.setHours(hour, 0, 0, 0);
  return d;
}

export function TaskSpecimen() {
  const t = useT();
  const locale = useLocale();
  const brand = useBrand();
  const aiAccent = getUiTokens(useThemeStore((s) => s.mode) === "dark").accent;
  const due = thisWeekDay(4, 16);
  const dueLabel = `${due.toLocaleDateString(locale, { weekday: "short", day: "numeric", month: "short" })}, ${due.toLocaleTimeString(locale, { hour: "numeric", minute: "2-digit" })}`;

  return (
    <Card>
      <View className="gap-2.5">
        <View className="flex-row items-center gap-2">
          <Text className="px-2 py-0.5 rounded-full bg-brand-error-soft text-brand-error font-headline text-xs">
            {t("priority.high")}
          </Text>
          <View className="flex-row items-center gap-1.5">
            <View className="w-2 h-2 rounded-full" style={{ backgroundColor: BLUE }} />
            <Text className="text-brand-ink font-headline text-xs">{t("landing.specCategory")}</Text>
          </View>
          <View className="ml-auto flex-row items-center gap-1">
            <MaterialIcons name="auto-awesome" size={13} color={aiAccent} />
            <Text className="text-brand-muted font-body text-[11px]">AI</Text>
          </View>
        </View>
        <Text className="text-brand-ink font-headline text-[15px]">{t("landing.demoTaskTitle")}</Text>
        <View className="flex-row gap-3">
          <Text className="text-brand-ink font-body text-xs">{dueLabel}</Text>
          <Text className="text-brand-muted font-body text-xs">{t("landing.specDuration")}</Text>
        </View>
        <View className="gap-2 pt-2.5 border-t border-brand-line-soft">
          <View className="flex-row items-center gap-2.5">
            <View className="flex-1 h-1 rounded-sm bg-brand-line-soft overflow-hidden">
              <View className="h-full bg-brand-accent" style={{ width: "50%" }} />
            </View>
            <Text className="text-brand-muted font-body text-xs">{t("landing.specSteps")}</Text>
          </View>
          <View className="flex-row items-center gap-2">
            <View className="w-4 h-4 rounded bg-brand-accent items-center justify-center">
              <MaterialIcons name="check" size={12} color={brand.onAccent} />
            </View>
            <Text className="text-brand-muted font-body text-[13px] line-through">{t("landing.specStep1")}</Text>
          </View>
          <View className="flex-row items-center gap-2">
            <View className="w-4 h-4 rounded border border-brand-field" />
            <Text className="text-brand-ink font-body text-[13px]">{t("landing.specStep2")}</Text>
          </View>
        </View>
      </View>
    </Card>
  );
}

// Event dots per day of month; fixed so the month looks lived-in the same way every visit.
const MONTH_DOTS: Record<number, string[]> = {
  3: [GREEN], 8: [BLUE], 11: [GREEN, BLUE], 15: [VIOLET], 17: [GREEN], 21: [GREEN],
  22: [BLUE], 24: [GREEN], 25: [GREEN, BLUE], 29: [BLUE], 30: [GREEN],
};

export function MonthSpecimen() {
  const t = useT();
  const locale = useLocale();
  const brand = useBrand();

  const { title, weekdays, cells, today } = useMemo(() => {
    const now = new Date();
    const first = new Date(now.getFullYear(), now.getMonth(), 1);
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const lead = (first.getDay() + 6) % 7;
    const label = first.toLocaleDateString(locale, { month: "long", year: "numeric" });
    return {
      title: label.charAt(0).toUpperCase() + label.slice(1),
      weekdays: Array.from({ length: 7 }, (_, i) =>
        thisWeekDay(i).toLocaleDateString(locale, { weekday: "short" }).replace(".", ""),
      ),
      cells: [...Array.from({ length: lead }, () => 0), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)],
      today: now.getDate(),
    };
  }, [locale]);

  return (
    <Card padded={false}>
      <View className="px-3.5 py-3 gap-2">
        <View className="flex-row items-center justify-between">
          <Text className="text-brand-ink font-headline text-sm">{title}</Text>
          <View className="flex-row items-center gap-2">
            <View className="flex-row p-0.5 rounded-md bg-brand-paper">
              {[t("cal.viewDay"), t("cal.viewWeek"), t("cal.viewMonth")].map((v, i) => (
                <Text
                  key={v}
                  className={`px-2 py-0.5 rounded font-body text-[11px] ${
                    i === 2 ? "bg-brand-surface text-brand-ink border border-brand-line" : "text-brand-muted"
                  }`}
                >
                  {v}
                </Text>
              ))}
            </View>
            <View className="w-7 h-7 rounded-md border border-brand-line items-center justify-center">
              <MaterialIcons name="print" size={16} color={brand.ink} />
            </View>
          </View>
        </View>
        <View className="flex-row">
          {weekdays.map((w) => (
            <Text key={w} className="text-brand-muted font-body text-[11px] text-center" style={{ width: `${100 / 7}%` }}>
              {w}
            </Text>
          ))}
        </View>
        <View className="flex-row flex-wrap">
          {cells.map((day, i) => (
            <View key={i} className="h-[34px] items-center justify-center gap-[3px]" style={{ width: `${100 / 7}%` }}>
              {day > 0 && (
                <>
                  <View
                    className={`w-[22px] h-[22px] rounded-full items-center justify-center ${day === today ? "bg-brand-ink" : ""}`}
                  >
                    <Text
                      className={`text-xs ${day === today ? "text-brand-paper font-headline" : "text-brand-ink font-body"}`}
                    >
                      {day}
                    </Text>
                  </View>
                  <View className="flex-row gap-0.5 h-1">
                    {(MONTH_DOTS[day] ?? []).map((c, k) => (
                      <View key={k} className="w-1 h-1 rounded-full" style={{ backgroundColor: c }} />
                    ))}
                  </View>
                </>
              )}
            </View>
          ))}
        </View>
      </View>
    </Card>
  );
}

export function NoteSpecimen() {
  const t = useT();
  const brand = useBrand();
  const dots =
    Platform.OS === "web"
      ? ({
          backgroundImage: "radial-gradient(var(--color-brand-line) 1px, transparent 1px)",
          backgroundSize: "18px 18px",
          backgroundPosition: "9px 9px",
        } as object)
      : null;

  return (
    <View className="gap-2.5">
      <Card padded={false}>
        <View className="overflow-hidden" style={[{ height: 184, borderRadius: 12 }, dots]}>
          <Svg viewBox="0 0 360 184" width="100%" height={184} fill="none" strokeLinecap="round" strokeLinejoin="round">
            <Path stroke={brand.ink} strokeWidth={2.6} d="M24 36c6-8 10-9 12-3s5 5 9-1 7-7 10-1 5 4 9-2 7-6 10 0 5 3 9-2 6-5 9 0 4 2 8-2M112 36c4-6 8-7 10-2s5 4 8-1" />
            <Path stroke={brand.ink} strokeWidth={1.6} d="M22 50c40-3 80-3 118-1" />
            <Rect stroke={brand.ink} strokeWidth={1.8} x={26} y={70} width={13} height={13} rx={2} transform="rotate(-3 32 76)" />
            <Path stroke={brand.ink} strokeWidth={2.2} d="M28 76l4 5 9-12" />
            <Path stroke={brand.ink} strokeWidth={2} d="M52 80c5-6 9-7 11-2s4 3 7-1 6-5 8 0 5 3 9-2 7-4 9 1 4 3 8-1 7-4 9 0M112 80c4-4 8-6 10-1s5 2 8-2" />
            <Rect stroke={brand.ink} strokeWidth={1.8} x={26} y={100} width={13} height={13} rx={2} transform="rotate(2 32 106)" />
            <Path stroke={brand.ink} strokeWidth={2} d="M52 110c5-6 9-6 11-1s5 2 8-2 6-4 8 1 4 3 8-2 7-5 9 0 5 2 9-2M118 110c3-4 7-5 9-1 2 5 6 2 9-2 3-3 6-3 7 1" />
            <Rect stroke={brand.ink} strokeWidth={1.8} x={26} y={130} width={13} height={13} rx={2} transform="rotate(-2 32 136)" />
            <Path stroke={brand.ink} strokeWidth={2} d="M52 140c5-5 8-6 10-1s5 3 8-1 7-5 9 0 4 2 8-2" />
            <Ellipse stroke={brand.error} strokeWidth={2} cx={270} cy={96} rx={44} ry={26} transform="rotate(-6 270 96)" />
            <Path stroke={brand.error} strokeWidth={2.4} d="M252 96c4-5 8-6 10-2s5 3 8-1 6-4 8 0 5 2 8-2" />
            <Path stroke={brand.error} strokeWidth={2} d="M226 90c-18-4-40-6-62-2M172 82l-8 6 9 4" />
          </Svg>
        </View>
      </Card>
      <View aria-hidden className="self-start flex-row items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-accent-soft">
        <MaterialIcons name="link" size={14} color={brand.accentText} />
        <Text className="text-brand-accent-text font-headline text-xs">{t("landing.demoTaskTitle")}</Text>
      </View>
    </View>
  );
}

export function CommentSpecimen() {
  const t = useT();
  const brand = useBrand();
  const author = t("landing.specCommentAuthor");
  const mentioned = t("landing.specMentioned");
  const initials = author
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2);

  return (
    <View className="gap-2.5">
      <Card>
        <View className="flex-row gap-3">
          <View className="w-8 h-8 rounded-full bg-brand-accent-soft items-center justify-center">
            <Text className="text-brand-accent-text font-headline text-xs">{initials}</Text>
          </View>
          <View className="flex-1 gap-1">
            <View className="flex-row items-baseline gap-2">
              <Text className="text-brand-ink font-headline text-sm">{author}</Text>
              <Text className="text-brand-muted font-body text-xs">{t("landing.specCommentTime")}</Text>
            </View>
            <Text className="text-brand-ink font-body text-sm leading-[21px]">
              <Text className="bg-brand-accent-soft text-brand-accent-text font-headline">@{mentioned}</Text>{" "}
              {t("landing.specCommentBody")}
            </Text>
          </View>
        </View>
      </Card>
      <View aria-hidden className="flex-row gap-2 items-start">
        <MaterialIcons name="info-outline" size={15} color={brand.muted} style={{ marginTop: 1 }} />
        <Text className="flex-1 text-brand-muted font-body text-[13px] leading-[19px]">
          {t("landing.specMentionHint", { name: mentioned })}
        </Text>
      </View>
    </View>
  );
}

// Provider names as the profile settings list them.
const PROVIDERS = ["Groq", "OpenAI", "Anthropic", "Google", "Azure OpenAI"];

export function AiSettingsSpecimen() {
  const t = useT();
  const brand = useBrand();
  return (
    <View
      aria-hidden
      importantForAccessibility="no-hide-descendants"
      className="bg-brand-surface border border-brand-line px-6 py-[22px] gap-4"
      style={{ borderRadius: 16 }}
    >
      <Text className="text-brand-ink font-headline text-[15px]">{t("landing.aiSettings")}</Text>
      <View className="gap-2">
        <Text className="text-brand-muted font-body text-[13px]">{t("landing.aiProvider")}</Text>
        <View className="flex-row flex-wrap gap-1.5">
          {PROVIDERS.map((p) => {
            const selected = p === "Anthropic";
            return (
              <Text
                key={p}
                className={`px-3 py-[7px] rounded-lg text-[13px] ${
                  selected
                    ? "bg-brand-ink text-brand-paper font-headline"
                    : "bg-brand-surface border border-brand-line text-brand-ink font-body"
                }`}
              >
                {p}
              </Text>
            );
          })}
        </View>
      </View>
      <View className="gap-2">
        <Text className="text-brand-muted font-body text-[13px]">{t("landing.aiKey")}</Text>
        <View className="h-11 rounded-input border border-brand-field flex-row items-center gap-2.5 px-3.5">
          <MaterialIcons name="lock-outline" size={16} color={brand.muted} />
          <Text className="text-brand-ink font-body text-[15px] tracking-[2px]" numberOfLines={1}>
            ••••••••••••••••••••
          </Text>
        </View>
        <Text className="text-brand-muted font-body text-xs">{t("landing.aiKeyNote")}</Text>
      </View>
      <Text className="pt-3.5 border-t border-brand-line-soft text-brand-muted font-body text-[13px] leading-5">
        {t("landing.aiCustom")}
      </Text>
    </View>
  );
}
