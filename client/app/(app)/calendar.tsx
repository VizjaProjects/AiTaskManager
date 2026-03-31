import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Platform,
  useWindowDimensions,
} from "react-native";
import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { PageLayout } from "@/components/organisms";
import { Button, Input } from "@/components/atoms";
import { useEvents, useCreateEvent } from "@/lib/hooks";
import { ProposedBy, EventStatus } from "@/lib/types";
import type { CalendarEvent } from "@/lib/types";

const WEEK_DAYS_SHORT = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];
const HOURS = Array.from({ length: 17 }, (_, i) => i + 7);
const HOUR_HEIGHT = 60;

const EVENT_COLORS = [
  "#dc2626",
  "#f59e0b",
  "#3b82f6",
  "#10b981",
  "#a855f7",
  "#006b58",
];

function getEventColor(event: CalendarEvent, index: number): string {
  if (event.status === EventStatus.PROPOSED) return "#f59e0b";
  return EVENT_COLORS[index % EVENT_COLORS.length];
}

function getMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  let dayOfWeek = firstDay.getDay();
  if (dayOfWeek === 0) dayOfWeek = 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const days: Array<{ day: number; currentMonth: boolean; date: Date }> = [];
  for (let i = dayOfWeek - 1; i > 0; i--) {
    days.push({
      day: daysInPrevMonth - i + 1,
      currentMonth: false,
      date: new Date(year, month - 1, daysInPrevMonth - i + 1),
    });
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ day: i, currentMonth: true, date: new Date(year, month, i) });
  }
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    days.push({
      day: i,
      currentMonth: false,
      date: new Date(year, month + 1, i),
    });
  }
  return days;
}

function CreateEventModal({
  visible,
  onClose,
  defaultDate,
  initialStartHour,
  initialStartMin,
  initialEndHour,
  initialEndMin,
}: {
  visible: boolean;
  onClose: () => void;
  defaultDate: Date;
  initialStartHour?: string;
  initialStartMin?: string;
  initialEndHour?: string;
  initialEndMin?: string;
}) {
  const createEvent = useCreateEvent();
  const [title, setTitle] = useState("");
  const [startHour, setStartHour] = useState("09");
  const [startMin, setStartMin] = useState("00");
  const [endHour, setEndHour] = useState("10");
  const [endMin, setEndMin] = useState("00");
  const [allDay, setAllDay] = useState(false);

  useEffect(() => {
    if (visible) {
      setTitle("");
      setStartHour(initialStartHour ?? "09");
      setStartMin(initialStartMin ?? "00");
      setEndHour(initialEndHour ?? "10");
      setEndMin(initialEndMin ?? "00");
      setAllDay(false);
    }
  }, [visible, initialStartHour, initialStartMin, initialEndHour, initialEndMin]);

  function handleCreate() {
    if (!title.trim()) return;
    const start = new Date(defaultDate);
    start.setHours(parseInt(startHour), parseInt(startMin), 0, 0);
    const end = new Date(defaultDate);
    end.setHours(parseInt(endHour), parseInt(endMin), 0, 0);

    createEvent.mutate(
      {
        title: title.trim(),
        startDateTime: start.toISOString(),
        endDateTime: end.toISOString(),
        allDay,
        proposedBy: ProposedBy.USER,
      },
      {
        onSuccess: () => {
          setTitle("");
          onClose();
        },
      },
    );
  }

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/50 items-center justify-center p-6">
        <View className="bg-surface-container-lowest rounded-2xl p-6 w-full max-w-md gap-4">
          <View className="flex-row items-center justify-between">
            <Text className="font-headline text-on-surface text-lg">
              Nowe wydarzenie
            </Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={24} color="#777587" />
            </TouchableOpacity>
          </View>
          <Input
            label="Tytuł"
            value={title}
            onChangeText={setTitle}
            placeholder="Nazwa wydarzenia"
          />
          <Text className="text-on-surface-variant font-label text-xs uppercase tracking-widest">
            Data: {defaultDate.toLocaleDateString("pl-PL")}
          </Text>
          <View className="flex-row gap-6">
            <View>
              <Text className="text-on-surface-variant font-label text-xs uppercase tracking-widest mb-2">
                Start
              </Text>
              <View className="flex-row items-center gap-1">
                <TextInput
                  value={startHour}
                  onChangeText={(v) =>
                    setStartHour(v.replace(/\D/g, "").slice(0, 2))
                  }
                  maxLength={2}
                  placeholder="HH"
                  placeholderTextColor="#777587"
                  className="bg-surface-container-low rounded-xl h-12 w-16 text-center text-on-surface font-body text-base"
                />
                <Text className="text-on-surface font-headline text-lg">:</Text>
                <TextInput
                  value={startMin}
                  onChangeText={(v) =>
                    setStartMin(v.replace(/\D/g, "").slice(0, 2))
                  }
                  maxLength={2}
                  placeholder="MM"
                  placeholderTextColor="#777587"
                  className="bg-surface-container-low rounded-xl h-12 w-16 text-center text-on-surface font-body text-base"
                />
              </View>
            </View>
            <View>
              <Text className="text-on-surface-variant font-label text-xs uppercase tracking-widest mb-2">
                Koniec
              </Text>
              <View className="flex-row items-center gap-1">
                <TextInput
                  value={endHour}
                  onChangeText={(v) =>
                    setEndHour(v.replace(/\D/g, "").slice(0, 2))
                  }
                  maxLength={2}
                  placeholder="HH"
                  placeholderTextColor="#777587"
                  className="bg-surface-container-low rounded-xl h-12 w-16 text-center text-on-surface font-body text-base"
                />
                <Text className="text-on-surface font-headline text-lg">:</Text>
                <TextInput
                  value={endMin}
                  onChangeText={(v) =>
                    setEndMin(v.replace(/\D/g, "").slice(0, 2))
                  }
                  maxLength={2}
                  placeholder="MM"
                  placeholderTextColor="#777587"
                  className="bg-surface-container-low rounded-xl h-12 w-16 text-center text-on-surface font-body text-base"
                />
              </View>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => setAllDay(!allDay)}
            className="flex-row items-center gap-2"
          >
            <MaterialIcons
              name={allDay ? "check-box" : "check-box-outline-blank"}
              size={22}
              color="#4d41df"
            />
            <Text className="text-on-surface font-body text-sm">
              Cały dzień
            </Text>
          </TouchableOpacity>
          <View className="flex-row gap-3 justify-end mt-2">
            <Button variant="outline" label="Anuluj" onPress={onClose} />
            <Button
              label="Utwórz"
              loading={createEvent.isPending}
              disabled={!title.trim()}
              onPress={handleCreate}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

type ViewType = "day" | "week" | "month";

interface DragSelection {
  colIdx: number;
  startHour: number;
  endHour: number;
}

export default function CalendarScreen() {
  const { data: events } = useEvents();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && width >= 1024;
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewType, setViewType] = useState<ViewType>("week");
  const [showCreate, setShowCreate] = useState(false);
  const [dragSel, setDragSel] = useState<DragSelection | null>(null);
  const [createStartH, setCreateStartH] = useState("09");
  const [createStartM, setCreateStartM] = useState("00");
  const [createEndH, setCreateEndH] = useState("10");
  const [createEndM, setCreateEndM] = useState("00");

  const gridRef = useRef<View>(null);
  const weekDaysRef = useRef<Date[]>([]);
  const dragEndRef = useRef<
    (colIdx: number, startH: number, endH: number) => void
  >();

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const weekStart = useMemo(() => {
    const d = new Date(selectedDate);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [selectedDate]);

  const weekDays = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const d = new Date(weekStart);
        d.setDate(d.getDate() + i);
        return d;
      }),
    [weekStart],
  );
  weekDaysRef.current = weekDays;

  const weekNumber = useMemo(() => {
    const d = new Date(selectedDate);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
    const week1 = new Date(d.getFullYear(), 0, 4);
    return (
      1 +
      Math.round(
        ((d.getTime() - week1.getTime()) / 86400000 -
          3 +
          ((week1.getDay() + 6) % 7)) /
          7,
      )
    );
  }, [selectedDate]);

  const monthDays = useMemo(
    () => getMonthDays(selectedDate.getFullYear(), selectedDate.getMonth()),
    [selectedDate],
  );

  function isSameDay(a: Date, b: Date) {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  function getEventsForDay(day: Date) {
    return (events ?? []).filter((e) => {
      const start = new Date(e.startDateTime);
      return isSameDay(start, day);
    });
  }

  function getEventPosition(event: CalendarEvent) {
    const start = new Date(event.startDateTime);
    const end = new Date(event.endDateTime);
    const topHour = start.getHours() + start.getMinutes() / 60;
    const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return {
      top: (topHour - 7) * HOUR_HEIGHT,
      height: Math.max(durationHours * HOUR_HEIGHT, 24),
    };
  }

  dragEndRef.current = (colIdx: number, startH: number, endH: number) => {
    const day = weekDaysRef.current[colIdx];
    if (!day) return;
    setSelectedDate(day);
    const sH = Math.floor(startH);
    const sM = Math.round((startH % 1) * 60);
    const eH = Math.floor(endH);
    const eM = Math.round((endH % 1) * 60);
    setCreateStartH(String(sH).padStart(2, "0"));
    setCreateStartM(String(sM).padStart(2, "0"));
    setCreateEndH(String(eH).padStart(2, "0"));
    setCreateEndM(String(eM).padStart(2, "0"));
    setDragSel(null);
    setShowCreate(true);
  };

  useEffect(() => {
    if (Platform.OS !== "web" || !gridRef.current) return;
    const el = gridRef.current as unknown as HTMLElement;
    el.style.userSelect = "none";
    el.style.cursor = "crosshair";

    let isDragging = false;
    let startCol = 0;
    let startH = 0;

    function getPos(e: MouseEvent) {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const colWidth = rect.width / 7;
      const colIdx = Math.min(6, Math.max(0, Math.floor(x / colWidth)));
      const rawHour = 7 + y / HOUR_HEIGHT;
      const hour = Math.round(rawHour * 2) / 2;
      return { colIdx, hour: Math.max(7, Math.min(24, hour)) };
    }

    function onMouseDown(e: MouseEvent) {
      if (e.button !== 0) return;
      const pos = getPos(e);
      isDragging = true;
      startCol = pos.colIdx;
      startH = pos.hour;
      setDragSel({
        colIdx: startCol,
        startHour: startH,
        endHour: Math.min(24, startH + 0.5),
      });
      e.preventDefault();
    }

    function onMouseMove(e: MouseEvent) {
      if (!isDragging) return;
      const pos = getPos(e);
      const minEnd = startH + 0.5;
      const endH = Math.max(minEnd, pos.hour);
      setDragSel({ colIdx: startCol, startHour: startH, endHour: endH });
    }

    function onMouseUp() {
      if (!isDragging) return;
      isDragging = false;
      setDragSel((sel) => {
        if (sel) dragEndRef.current?.(sel.colIdx, sel.startHour, sel.endHour);
        return null;
      });
    }

    el.addEventListener("mousedown", onMouseDown);
    el.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      el.removeEventListener("mousedown", onMouseDown);
      el.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  const prevPeriod = useCallback(() => {
    const d = new Date(selectedDate);
    if (viewType === "week") d.setDate(d.getDate() - 7);
    else if (viewType === "month") d.setMonth(d.getMonth() - 1);
    else d.setDate(d.getDate() - 1);
    setSelectedDate(d);
  }, [selectedDate, viewType]);

  const nextPeriod = useCallback(() => {
    const d = new Date(selectedDate);
    if (viewType === "week") d.setDate(d.getDate() + 7);
    else if (viewType === "month") d.setMonth(d.getMonth() + 1);
    else d.setDate(d.getDate() + 1);
    setSelectedDate(d);
  }, [selectedDate, viewType]);

  const miniCalendar = (
    <View className="bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/40">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-on-surface font-headline text-sm">
          {selectedDate.toLocaleDateString("pl-PL", {
            month: "long",
            year: "numeric",
          })}
        </Text>
        <View className="flex-row gap-1">
          <TouchableOpacity
            onPress={() => {
              const d = new Date(selectedDate);
              d.setMonth(d.getMonth() - 1);
              setSelectedDate(d);
            }}
          >
            <MaterialIcons name="chevron-left" size={20} color="#777587" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              const d = new Date(selectedDate);
              d.setMonth(d.getMonth() + 1);
              setSelectedDate(d);
            }}
          >
            <MaterialIcons name="chevron-right" size={20} color="#777587" />
          </TouchableOpacity>
        </View>
      </View>
      <View className="flex-row mb-1">
        {WEEK_DAYS_SHORT.map((d) => (
          <View key={d} className="flex-1 items-center">
            <Text className="text-on-surface-variant font-label text-[10px]">
              {d}
            </Text>
          </View>
        ))}
      </View>
      {Array.from({ length: 6 }, (_, weekIdx) => (
        <View key={weekIdx} className="flex-row">
          {monthDays.slice(weekIdx * 7, weekIdx * 7 + 7).map((d, i) => {
            const isToday = isSameDay(d.date, today);
            const isSelected = isSameDay(d.date, selectedDate);
            return (
              <TouchableOpacity
                key={i}
                onPress={() => setSelectedDate(d.date)}
                className={`flex-1 items-center py-1 ${
                  isSelected
                    ? "bg-primary rounded-full"
                    : isToday
                      ? "bg-primary-fixed rounded-full"
                      : ""
                }`}
              >
                <Text
                  className={`text-xs font-body ${
                    isSelected
                      ? "text-white font-headline"
                      : !d.currentMonth
                        ? "text-outline-variant"
                        : "text-on-surface"
                  }`}
                >
                  {d.day}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );

  const priorityFilters = (
    <View className="bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/40">
      <Text className="text-on-surface-variant font-label text-xs uppercase tracking-widest mb-3">
        Priorities
      </Text>
      {[
        { label: "Critical Tasks", color: "#dc2626" },
        { label: "High Focus", color: "#f59e0b" },
        { label: "Standard", color: "#3b82f6" },
        { label: "Low Priority", color: "#10b981" },
      ].map((p) => (
        <View key={p.label} className="flex-row items-center gap-2 py-1.5">
          <View
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: p.color }}
          />
          <Text className="text-on-surface font-body text-xs flex-1">
            {p.label}
          </Text>
          <MaterialIcons name="check-box" size={18} color="#4d41df" />
        </View>
      ))}
    </View>
  );

  const weekTimeGrid = (
    <View
      className="flex-1 bg-surface-container-lowest rounded-2xl overflow-hidden border border-outline-variant/40"
      style={{ borderTopWidth: 3, borderTopColor: "#4d41df" }}
    >
      {/* Day header row */}
      <View
        className="flex-row"
        style={{ borderBottomWidth: 1, borderBottomColor: "#c7c4d8" }}
      >
        <View className="w-14" />
        {weekDays.map((day, i) => {
          const isToday = isSameDay(day, today);
          return (
            <TouchableOpacity
              key={i}
              onPress={() => setSelectedDate(day)}
              className="flex-1 items-center py-3"
              style={{
                borderLeftWidth: 1,
                borderLeftColor: "#c7c4d8",
              }}
            >
              <Text
                className={`text-[10px] font-label uppercase ${
                  isToday ? "text-primary" : "text-on-surface-variant"
                }`}
              >
                {WEEK_DAYS_SHORT[i]}
              </Text>
              <Text
                className={`text-lg font-headline mt-0.5 ${
                  isToday ? "text-primary" : "text-on-surface"
                }`}
              >
                {day.getDate()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Time grid */}
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ height: HOURS.length * HOUR_HEIGHT, position: "relative" }}>
          {/* Hour rows with labels */}
          {HOURS.map((hour) => (
            <View
              key={hour}
              className="flex-row"
              style={{
                height: HOUR_HEIGHT,
                borderBottomWidth: 1,
                borderBottomColor: "#e0dff0",
              }}
            >
              <View className="w-14 pr-2 items-end" style={{ marginTop: -7 }}>
                <Text className="text-on-surface-variant font-body text-[10px]">
                  {String(hour).padStart(2, "0")}:00
                </Text>
              </View>
              <View className="flex-1 flex-row">
                {weekDays.map((_, colIdx) => (
                  <View
                    key={colIdx}
                    className="flex-1"
                    style={{
                      borderLeftWidth: 1,
                      borderLeftColor: "#e0dff0",
                    }}
                  />
                ))}
              </View>
            </View>
          ))}

          {/* Events overlay */}
          <View
            className="absolute flex-row"
            style={{ left: 56, right: 0, top: 0, bottom: 0 }}
          >
            {weekDays.map((day, colIdx) => {
              const dayEvts = getEventsForDay(day);
              return (
                <View key={colIdx} className="flex-1 relative">
                  {dayEvts.map((evt, evtIdx) => {
                    const pos = getEventPosition(evt);
                    const color = getEventColor(evt, evtIdx);
                    const isProposed = evt.status === EventStatus.PROPOSED;
                    const startTime = new Date(
                      evt.startDateTime,
                    ).toLocaleTimeString("pl-PL", {
                      hour: "2-digit",
                      minute: "2-digit",
                    });
                    const endTime = new Date(
                      evt.endDateTime,
                    ).toLocaleTimeString("pl-PL", {
                      hour: "2-digit",
                      minute: "2-digit",
                    });
                    return (
                      <View
                        key={evt.eventId}
                        className="absolute rounded-md px-1.5 py-1 overflow-hidden"
                        style={{
                          top: pos.top,
                          height: pos.height,
                          left: 2,
                          right: 2,
                          backgroundColor: `${color}20`,
                          borderLeftWidth: 3,
                          borderLeftColor: color,
                          borderStyle: isProposed ? "dashed" : "solid",
                        }}
                      >
                        {isProposed && (
                          <Text
                            className="font-label uppercase"
                            style={{ fontSize: 7, color }}
                          >
                            PROPOSED
                          </Text>
                        )}
                        <Text
                          className="font-headline text-on-surface"
                          style={{ fontSize: 10 }}
                          numberOfLines={1}
                        >
                          {evt.title}
                        </Text>
                        <Text
                          className="font-body text-on-surface-variant"
                          style={{ fontSize: 8 }}
                        >
                          {startTime} - {endTime}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              );
            })}
          </View>

          {/* Drag interaction overlay (web only) */}
          {Platform.OS === "web" && (
            <View
              ref={gridRef}
              className="absolute"
              style={{ left: 56, right: 0, top: 0, bottom: 0 }}
            >
              {dragSel && (
                <View
                  style={{
                    position: "absolute",
                    left: `${(dragSel.colIdx / 7) * 100}%`,
                    width: `${100 / 7}%`,
                    top: (dragSel.startHour - 7) * HOUR_HEIGHT,
                    height:
                      (dragSel.endHour - dragSel.startHour) * HOUR_HEIGHT,
                    backgroundColor: "rgba(77, 65, 223, 0.12)",
                    borderWidth: 1,
                    borderColor: "#4d41df",
                    borderRadius: 4,
                    borderStyle: "dashed",
                  }}
                />
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );

  return (
    <PageLayout title="Good morning">
      <View className="flex-1 gap-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-4">
            <Text className="text-on-surface font-headline text-xl">
              Week {weekNumber}
            </Text>
            <View className="flex-row bg-surface-container-low rounded-full p-0.5">
              {(["day", "week", "month"] as ViewType[]).map((v) => (
                <TouchableOpacity
                  key={v}
                  onPress={() => setViewType(v)}
                  className={`px-3 py-1.5 rounded-full ${
                    viewType === v ? "bg-primary" : ""
                  }`}
                >
                  <Text
                    className={`text-xs font-label capitalize ${
                      viewType === v ? "text-white" : "text-on-surface-variant"
                    }`}
                  >
                    {v === "day" ? "Day" : v === "week" ? "Week" : "Month"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            onPress={() => {
              setCreateStartH("09");
              setCreateStartM("00");
              setCreateEndH("10");
              setCreateEndM("00");
              setShowCreate(true);
            }}
            className="bg-primary rounded-xl px-4 py-2.5 flex-row items-center gap-2"
          >
            <MaterialIcons name="add" size={18} color="#fff" />
            <Text className="text-white font-headline text-sm">
              + New Event
            </Text>
          </TouchableOpacity>
        </View>

        {isDesktop ? (
          <View className="flex-row flex-1 gap-6">
            <View className="w-56 gap-4">
              {miniCalendar}
              {priorityFilters}
            </View>
            <View className="flex-1">{weekTimeGrid}</View>
          </View>
        ) : (
          <View className="flex-1">
            <View className="flex-row items-center justify-between mb-3">
              <TouchableOpacity onPress={prevPeriod}>
                <MaterialIcons name="chevron-left" size={28} color="#777587" />
              </TouchableOpacity>
              <Text className="text-on-surface font-headline text-base">
                {selectedDate.toLocaleDateString("pl-PL", {
                  month: "long",
                  year: "numeric",
                })}
              </Text>
              <TouchableOpacity onPress={nextPeriod}>
                <MaterialIcons name="chevron-right" size={28} color="#777587" />
              </TouchableOpacity>
            </View>
            {weekTimeGrid}
          </View>
        )}
      </View>

      <CreateEventModal
        visible={showCreate}
        onClose={() => setShowCreate(false)}
        defaultDate={selectedDate}
        initialStartHour={createStartH}
        initialStartMin={createStartM}
        initialEndHour={createEndH}
        initialEndMin={createEndM}
      />
    </PageLayout>
  );
}
