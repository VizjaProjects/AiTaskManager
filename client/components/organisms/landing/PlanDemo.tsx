import { useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import { Animated, Platform, Text, View } from "react-native";
import { BrandButton } from "@/components/atoms";
import { MORPH_EASING } from "@/components/molecules/Fold";
import { LandPulse } from "@/components/molecules/LandPulse";
import { useLocale, useT } from "@/lib/i18n";
import { useThemeStore } from "@/lib/stores";
import { EVENT_COLOR_OPTIONS, eventPillStyle } from "@/lib/utils/eventColors";
import { getBrandTokens } from "@/lib/utils/uiTokens";
import { useReducedMotion } from "@/lib/utils/useReducedMotion";

type Key = "task" | "call";
type Stage = "pending" | "flying" | "landed" | "rejected";
/**
 * How an accepted item shows in the grid: "flying" keeps its place (for measuring) but invisible,
 * "landed" pulses after the flight, "appeared" is the reduced-motion arrival (fade + glow in place).
 */
export type SlotState = "hidden" | "flying" | "shown" | "landed" | "appeared";
type Rect = { x: number; y: number; w: number; h: number };

const FIRST_HOUR = 9;
const TEAL = EVENT_COLOR_OPTIONS[6];
const BLUE = EVENT_COLOR_OPTIONS[1];
const COLOR: Record<Key, string> = { call: TEAL, task: BLUE };
const FLIGHT_MS = 640;
const APPEAR_MS = 320;

function StepBadge({ n }: { n: number }) {
  return (
    <View className="w-6 h-6 rounded-full bg-brand-ink items-center justify-center">
      <Text className="text-brand-paper font-headline text-xs">{n}</Text>
    </View>
  );
}

function StepLabel({ n, label }: { n: number; label: string }) {
  return (
    <View className="flex-row items-center gap-2.5">
      <StepBadge n={n} />
      <Text className="text-brand-ink font-headline text-sm">{label}</Text>
    </View>
  );
}

function ProposalCard({
  title,
  meta,
  where,
  stage,
  onAccept,
  onReject,
  large,
  cardRef,
}: {
  title: string;
  meta: string;
  where: string;
  stage: Stage;
  onAccept: () => void;
  onReject: () => void;
  large?: boolean;
  cardRef: RefObject<View | null>;
}) {
  const t = useT();
  if (stage === "rejected") return null;

  if (stage !== "pending") {
    return (
      <FadeIn duration={220}>
        <View className="rounded-input border border-brand-line bg-brand-accent-soft px-3.5 py-3 gap-0.5">
          <Text className="text-brand-ink font-headline text-[15px]">{title}</Text>
          <Text className="text-brand-accent-text font-body text-[13px]">{where}</Text>
        </View>
      </FadeIn>
    );
  }

  return (
    <View
      ref={cardRef}
      className="rounded-input border border-dashed border-brand-proposal-edge bg-brand-proposal p-3.5 gap-3"
    >
      <View className="gap-1">
        <Text className="text-brand-ink font-headline text-[15px]">{title}</Text>
        <Text className="text-brand-proposal-text font-body text-[13px]">{meta}</Text>
      </View>
      <View className="flex-row gap-2">
        <BrandButton
          label={t("landing.demoAccept")}
          variant="ink"
          size="sm"
          onPress={onAccept}
          style={{ flex: 1, minHeight: large ? 44 : 38 }}
        />
        <BrandButton
          label={t("landing.demoReject")}
          variant="surface"
          size="sm"
          onPress={onReject}
          style={{ flex: 1, minHeight: large ? 44 : 38 }}
        />
      </View>
    </View>
  );
}

function startOfWeek(date: Date) {
  const d = new Date(date);
  const day = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

function FadeIn({
  duration,
  style,
  children,
  innerRef,
}: {
  duration: number;
  style?: object;
  children: ReactNode;
  innerRef?: RefObject<View | null>;
}) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(v, { toValue: 1, duration, useNativeDriver: false }).start();
  }, [v, duration]);
  return (
    <Animated.View ref={innerRef as never} style={[style, { opacity: v }]}>
      {children}
    </Animated.View>
  );
}

type WeekBlock = {
  day: number;
  start: number;
  duration: number;
  label: string;
  kind: "event" | "neutral";
  color?: string;
  slot?: SlotState;
  slotRef?: RefObject<View | null>;
};

/**
 * Static week grid used as product preview on the landing page and login.
 * The week is always the current one, so the "today" column and the now-line are real.
 * Only accepted items appear here: the real calendar never shows AI proposals.
 */
export function WeekPreview({
  rowHeight = 52,
  call = "hidden",
  report = "hidden",
  callRef,
  reportRef,
  showStep = false,
  showViewSwitch = true,
  showHeader = true,
  dense = false,
  firstDay = 0,
  dayCount = 5,
  firstHour = FIRST_HOUR,
  hourCount = 8,
}: {
  rowHeight?: number;
  call?: SlotState;
  report?: SlotState;
  callRef?: RefObject<View | null>;
  reportRef?: RefObject<View | null>;
  showStep?: boolean;
  showViewSwitch?: boolean;
  showHeader?: boolean;
  /** Phone variant: narrower hour column and smaller type. */
  dense?: boolean;
  /** Visible slice of Mon–Fri, e.g. firstDay 2 + dayCount 3 = Wed–Fri. */
  firstDay?: number;
  dayCount?: number;
  firstHour?: number;
  hourCount?: number;
}) {
  const t = useT();
  const locale = useLocale();
  const isDark = useThemeStore((s) => s.mode) === "dark";

  const now = new Date();
  const monday = startOfWeek(now);
  const todayIndex = (now.getDay() + 6) % 7;
  const nowOffset = now.getHours() + now.getMinutes() / 60 - firstHour;
  const showNow = todayIndex < 5 && nowOffset > 0 && nowOffset < hourCount;

  const days = useMemo(
    () =>
      Array.from({ length: dayCount }, (_, k) => {
        const index = firstDay + k;
        const d = new Date(monday);
        d.setDate(monday.getDate() + index);
        return {
          index,
          weekday: d.toLocaleDateString(locale, { weekday: "short" }).replace(".", ""),
          day: d.getDate(),
        };
      }),
    [monday.getTime(), locale, firstDay, dayCount],
  );

  const hours = useMemo(
    () =>
      Array.from({ length: hourCount }, (_, i) =>
        new Date(2000, 0, 1, firstHour + i).toLocaleTimeString(locale, {
          hour: "numeric",
          minute: "2-digit",
        }),
      ),
    [locale, firstHour, hourCount],
  );

  const blocks: WeekBlock[] = [
    { day: 0, start: 0, duration: 0.75, label: t("landing.demoStandup"), kind: "event", color: TEAL },
    { day: 1, start: 2, duration: 2, label: t("landing.demoWorkshop"), kind: "event", color: BLUE },
    { day: 2, start: 1, duration: 1.4, label: t("landing.demoBudget"), kind: "neutral" },
    { day: 4, start: 1, duration: 1, label: t("landing.demoWeekly"), kind: "event", color: TEAL },
    // A task with a due date creates a regular calendar event.
    { day: 3, start: 5, duration: 0.5, label: t("landing.demoEventTitle"), kind: "event", color: TEAL, slot: call, slotRef: callRef },
    { day: 4, start: 7, duration: 0.8, label: t("landing.demoTaskTitle"), kind: "event", color: BLUE, slot: report, slotRef: reportRef },
  ];
  const skipHours = firstHour - FIRST_HOUR;
  const visible = blocks.filter(
    (b) => b.slot !== "hidden" && b.start + b.duration > skipHours && b.start < skipHours + hourCount,
  );

  const gridHeight = rowHeight * hourCount;
  const gridLines =
    Platform.OS === "web"
      ? ({
          backgroundImage: `repeating-linear-gradient(to bottom, transparent 0, transparent ${rowHeight - 1}px, var(--color-brand-line-soft) ${rowHeight - 1}px, var(--color-brand-line-soft) ${rowHeight}px)`,
        } as object)
      : null;
  const inset = dense ? 4 : 6;

  return (
    <View className="flex-1">
      {showHeader && (
        <View className="h-[60px] px-6 flex-row items-center justify-between border-b border-brand-line">
          <View className="flex-row items-center gap-2.5">
            {showStep && <StepBadge n={3} />}
            <Text className="text-brand-ink font-headline text-[15px]">
              {t("landing.demoWeek", {
                date: monday.toLocaleDateString(locale, { day: "numeric", month: "long" }),
              })}
            </Text>
          </View>
          {showViewSwitch && (
            <View className="flex-row p-[3px] rounded-lg bg-brand-paper">
              {[t("cal.viewDay"), t("cal.viewWeek"), t("cal.viewMonth")].map((v, i) => (
                <Text
                  key={v}
                  className={`px-3 py-1 rounded-md font-body text-[13px] ${
                    i === 1 ? "bg-brand-surface text-brand-ink border border-brand-line" : "text-brand-muted"
                  }`}
                >
                  {v}
                </Text>
              ))}
            </View>
          )}
        </View>
      )}

      <View className="flex-row">
        <View style={{ width: dense ? 44 : 56, paddingTop: dense ? 36 : 44 }}>
          {hours.map((h) => (
            <Text
              key={h}
              className={`text-brand-muted font-body text-right ${dense ? "text-[11px] pr-1.5" : "text-xs pr-2"}`}
              style={{ height: rowHeight }}
            >
              {h}
            </Text>
          ))}
        </View>

        {days.map((d) => {
          const i = d.index;
          const isToday = i === todayIndex;
          return (
            <View
              key={i}
              className={`flex-1 border-l border-brand-line-soft ${isToday ? "bg-brand-accent-soft" : ""}`}
            >
              <View
                className="flex-row items-center justify-center gap-1.5 border-b border-brand-line-soft"
                style={{ height: dense ? 36 : 44 }}
              >
                <Text className={`font-body text-[13px] ${isToday ? "text-brand-ink" : "text-brand-muted"}`}>
                  {d.weekday}
                </Text>
                {isToday ? (
                  <View className="w-6 h-6 rounded-full bg-brand-ink items-center justify-center">
                    <Text className="text-brand-paper font-headline text-xs">{d.day}</Text>
                  </View>
                ) : (
                  <Text className="text-brand-muted font-body text-[13px]">{d.day}</Text>
                )}
              </View>
              <View style={[{ height: gridHeight, position: "relative", overflow: "hidden" }, gridLines]}>
                {visible
                  .filter((b) => b.day === i)
                  .map((b) => {
                    const pill = b.kind === "event" && b.color ? eventPillStyle(b.color, isDark) : null;
                    const base = {
                      position: "absolute" as const,
                      top: (b.start - skipHours) * rowHeight + (dense ? 3 : 4),
                      left: inset,
                      right: inset,
                      height: b.duration * rowHeight - (dense ? 4 : 6),
                      paddingHorizontal: dense ? 5 : 7,
                      paddingVertical: b.duration <= 0.5 ? 1 : b.duration < 1 ? 3 : 6,
                      borderRadius: 6,
                      borderWidth: 1,
                      opacity: b.slot === "flying" ? 0 : 1,
                    };
                    const kindClass = b.kind === "neutral" ? "bg-brand-surface border-brand-field" : "";
                    const label = (
                      <Text
                        className={`font-headline text-brand-ink ${dense ? "text-[11px] leading-[14px]" : "text-xs"}`}
                        numberOfLines={b.duration < 1 ? 1 : 2}
                      >
                        {b.label}
                      </Text>
                    );
                    if (b.slot === "appeared") {
                      return (
                        <FadeIn
                          key={b.label}
                          innerRef={b.slotRef}
                          duration={APPEAR_MS}
                          style={[base, pill ? { backgroundColor: pill.bg, borderColor: pill.border } : null]}
                        >
                          {b.color && <LandPulse color={b.color} radius={6} still delay={APPEAR_MS} />}
                          {label}
                        </FadeIn>
                      );
                    }
                    return (
                      <View
                        key={b.label}
                        ref={b.slotRef}
                        className={kindClass}
                        style={[base, pill ? { backgroundColor: pill.bg, borderColor: pill.border } : null]}
                      >
                        {b.slot === "landed" && b.color && <LandPulse color={b.color} radius={6} />}
                        {label}
                      </View>
                    );
                  })}
                {showNow && isToday && (
                  <View
                    className="bg-brand-now"
                    style={{ position: "absolute", left: 0, right: 0, height: 2, top: nowOffset * rowHeight }}
                  />
                )}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

type Flight = { id: number; key: Key; label: string; from: Rect; dense: boolean };

/**
 * The accepted proposal card itself becomes the calendar event: it shrinks into its
 * slot and turns from proposal amber into the event colour. The slot is measured every
 * frame, because on the phone the grid sits below the cards and moves up as they collapse.
 */
function ProposalFlight({
  flight,
  measureSlot,
  onDone,
}: {
  flight: Flight;
  measureSlot: (cb: (r: Rect) => void) => void;
  onDone: () => void;
}) {
  const isDark = useThemeStore((s) => s.mode) === "dark";
  const brand = getBrandTokens(isDark);
  const pill = eventPillStyle(COLOR[flight.key], isDark);
  const { from } = flight;
  const pos = useRef(new Animated.ValueXY({ x: from.x, y: from.y })).current;
  const size = useRef(new Animated.ValueXY({ x: from.w, y: from.h })).current;
  const progress = useRef(new Animated.Value(0)).current;
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    let frame = 0;
    let target = from;
    let switched = false;
    const start = Date.now();
    const tick = () => {
      measureSlot((r) => {
        target = r;
      });
      const t = Math.min(1, (Date.now() - start) / FLIGHT_MS);
      const e = MORPH_EASING(t);
      pos.setValue({ x: from.x + (target.x - from.x) * e, y: from.y + (target.y - from.y) * e });
      size.setValue({ x: from.w + (target.w - from.w) * e, y: from.h + (target.h - from.h) * e });
      progress.setValue(e);
      if (!switched && t >= 0.35) {
        switched = true;
        setSolid(true);
      }
      if (t < 1) frame = requestAnimationFrame(tick);
      else onDone();
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flight.id]);

  return (
    <Animated.View
      pointerEvents="none"
      aria-hidden
      importantForAccessibility="no-hide-descendants"
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        zIndex: 20,
        overflow: "hidden",
        width: size.x,
        height: size.y,
        paddingHorizontal: flight.dense ? 5 : 7,
        // Matches the slot: short items get less vertical padding.
        paddingVertical: flight.key === "call" ? 1 : 3,
        borderWidth: 1,
        borderStyle: solid ? "solid" : "dashed",
        borderRadius: progress.interpolate({ inputRange: [0, 1], outputRange: [10, 6] }),
        backgroundColor: progress.interpolate({ inputRange: [0, 1], outputRange: [brand.proposal, pill.bg] }),
        borderColor: progress.interpolate({ inputRange: [0, 1], outputRange: [brand.proposalEdge, pill.border] }),
        transform: pos.getTranslateTransform(),
      }}
    >
      <Animated.Text
        numberOfLines={1}
        className={`font-headline text-brand-ink ${flight.dense ? "text-[11px] leading-[14px]" : "text-xs"}`}
        style={{ opacity: progress.interpolate({ inputRange: [0, 0.35, 1], outputRange: [0, 0, 1] }) }}
      >
        {flight.label}
      </Animated.Text>
    </Animated.View>
  );
}

/**
 * Hero demo: a sentence turns into AI proposals that the visitor can accept or reject.
 * An accepted proposal flies into the calendar. `compact` is the phone layout (3-day view).
 */
export function PlanDemo({ compact = false }: { compact?: boolean }) {
  const t = useT();
  const isDark = useThemeStore((s) => s.mode) === "dark";
  const brand = getBrandTokens(isDark);
  const reduced = useReducedMotion();
  const [stage, setStage] = useState<Record<Key, Stage>>({ task: "pending", call: "pending" });
  const [flights, setFlights] = useState<Partial<Record<Key, Flight>>>({});
  const flightId = useRef(0);

  const rootRef = useRef<View>(null);
  const cardRefs = { task: useRef<View>(null), call: useRef<View>(null) };
  const slotRefs = { task: useRef<View>(null), call: useRef<View>(null) };

  const revealKey = useRef<Key | null>(null);

  // The target slot may sit below the fold (e.g. Friday 16:00 on a laptop): bring it into view,
  // otherwise the item lands where nobody sees it. The flight follows because it chases the slot.
  useEffect(() => {
    const key = revealKey.current;
    revealKey.current = null;
    const el = key ? (slotRefs[key].current as unknown as HTMLElement | null) : null;
    if (Platform.OS !== "web" || !el?.scrollIntoView) return;
    el.style.scrollMargin = "32px";
    el.scrollIntoView({ block: "nearest", inline: "nearest", behavior: reduced ? "auto" : "smooth" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  const done = stage.task !== "pending" && stage.call !== "pending";
  const setOne = (key: Key, value: Stage) => setStage((s) => ({ ...s, [key]: value }));

  function measure(ref: RefObject<View | null>, cb: (r: Rect) => void) {
    const root = rootRef.current;
    const node = ref.current;
    if (!root || !node) return;
    root.measureInWindow((rx, ry) => node.measureInWindow((x, y, w, h) => cb({ x: x - rx, y: y - ry, w, h })));
  }

  function accept(key: Key) {
    revealKey.current = key;
    if (reduced || !cardRefs[key].current) {
      setOne(key, "landed");
      return;
    }
    const label = t(key === "task" ? "landing.demoTaskTitle" : "landing.demoEventTitle");
    measure(cardRefs[key], (from) => {
      setFlights((f) => ({ ...f, [key]: { id: ++flightId.current, key, label, from, dense: compact } }));
      setOne(key, "flying");
    });
  }

  function land(key: Key) {
    setFlights((f) => {
      const next = { ...f };
      delete next[key];
      return next;
    });
    setOne(key, "landed");
  }

  const slot = (key: Key): SlotState => {
    const s = stage[key];
    if (s === "flying") return "flying";
    if (s === "landed") return reduced ? "appeared" : "landed";
    return "hidden";
  };

  const proposals = (
    <View className="gap-3">
      <StepLabel n={2} label={t("landing.demoProposals")} />
      <ProposalCard
        title={t("landing.demoTaskTitle")}
        meta={compact ? t("landing.demoTaskMetaShort") : t("landing.demoTaskMeta")}
        where={t("landing.demoTaskWhere")}
        stage={stage.task}
        onAccept={() => accept("task")}
        onReject={() => setOne("task", "rejected")}
        large={compact}
        cardRef={cardRefs.task}
      />
      <ProposalCard
        title={t("landing.demoEventTitle")}
        meta={compact ? t("landing.demoEventMetaShort") : t("landing.demoEventMeta")}
        where={t("landing.demoCallWhere")}
        stage={stage.call}
        onAccept={() => accept("call")}
        onReject={() => setOne("call", "rejected")}
        large={compact}
        cardRef={cardRefs.call}
      />
      {done && (
        <BrandButton
          label={t("landing.demoReset")}
          variant="ghost"
          size="sm"
          onPress={() => {
            setFlights({});
            setStage({ task: "pending", call: "pending" });
          }}
          style={{ alignSelf: "flex-start", paddingHorizontal: 0 }}
        />
      )}
    </View>
  );

  // The visitor's sentence reads as a sent message, not as a field to type in.
  const prompt = (
    <View className="gap-2.5">
      <StepLabel n={1} label={t("landing.demoPrompt")} />
      <View
        className="bg-brand-paper px-3.5 py-3 self-start"
        style={{ borderTopLeftRadius: 14, borderTopRightRadius: 14, borderBottomRightRadius: 14, borderBottomLeftRadius: 4 }}
      >
        <Text className="text-brand-ink font-body text-[15px] leading-6">
          {compact ? t("landing.demoInputShort") : t("landing.demoInput")}
        </Text>
      </View>
    </View>
  );

  const flightLayer = (Object.keys(flights) as Key[]).map((key) => {
    const f = flights[key]!;
    return (
      <ProposalFlight
        key={f.id}
        flight={f}
        measureSlot={(cb) => measure(slotRefs[key], cb)}
        onDone={() => land(key)}
      />
    );
  });

  const week = (
    <WeekPreview
      showStep={!compact}
      showHeader={!compact}
      dense={compact}
      rowHeight={compact ? 44 : 52}
      firstDay={compact ? 2 : 0}
      dayCount={compact ? 3 : 5}
      firstHour={compact ? 13 : FIRST_HOUR}
      hourCount={compact ? 4 : 8}
      call={slot("call")}
      report={slot("task")}
      callRef={slotRefs.call}
      reportRef={slotRefs.task}
    />
  );

  if (compact) {
    return (
      <View
        ref={rootRef}
        accessibilityLabel={t("landing.demoLabel")}
        className="bg-brand-surface border border-brand-line p-4 gap-[18px]"
        style={{ borderRadius: 16, position: "relative" }}
      >
        {prompt}
        {proposals}
        <View className="gap-2.5">
          <StepLabel n={3} label={t("landing.demoCalendar3")} />
          <View className="border border-brand-line overflow-hidden" style={{ borderRadius: 10 }}>
            {week}
          </View>
        </View>
        {flightLayer}
      </View>
    );
  }

  return (
    <View ref={rootRef} style={{ position: "relative" }}>
      <View
        accessibilityLabel={t("landing.demoLabel")}
        className="bg-brand-surface border border-brand-line flex-row overflow-hidden"
        style={{ borderRadius: 16, ...(Platform.OS === "web" ? ({ boxShadow: brand.shadow } as object) : null) }}
      >
        <View className="w-[380px] p-7 gap-[22px] border-r border-brand-line">
          {prompt}
          {proposals}
        </View>
        {week}
      </View>
      {flightLayer}
    </View>
  );
}
