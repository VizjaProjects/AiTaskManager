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
import {
  queryCalendarGridElement,
  findCalendarEventElement,
  isCalendarResizeHandle,
  readDataAttr,
  viewToHTMLElement,
} from "@/lib/utils/webDom";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation, useLocalSearchParams } from "expo-router";
import { PageLayout } from "@/components/organisms";
import { Button, Input, InlineDatePicker } from "@/components/atoms";
import {
  useEvents,
  useCreateEvent,
  useEditEvent,
  useDeleteEvent,
} from "@/lib/hooks";
import { ProposedBy, EventStatus } from "@/lib/types";
import type { CalendarEvent, EditEventRequest } from "@/lib/types";
import { useThemeStore } from "@/lib/stores";
import { parseApiDateTime, toLocalDateTimeString } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";

const WEEK_DAYS_SHORT = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];
const GRID_START_HOUR = 0;
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const HOUR_HEIGHT = 60;
const GRID_HEIGHT = HOURS.length * HOUR_HEIGHT;
const TIME_GUTTER_WIDTH = 56;
const SCROLLBAR_GUTTER = Platform.OS === "web" ? 17 : 0;

function hourToTop(hour: number) {
  return (hour - GRID_START_HOUR) * HOUR_HEIGHT;
}

function yToHour(y: number) {
  const raw = GRID_START_HOUR + y / HOUR_HEIGHT;
  return Math.round(raw * 4) / 4;
}

function formatHourLabel(h: number) {
  const hh = Math.floor(h);
  const mm = Math.round((h % 1) * 60);
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

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

const MONTH_PILL_PALETTE = [
  { bg: "#fef3c7", border: "#fcd34d", text: "#92400e" },
  { bg: "#dcfce7", border: "#86efac", text: "#166534" },
  { bg: "#ede9fe", border: "#c4b5fd", text: "#5b21b6" },
  { bg: "#ffe4e6", border: "#fda4af", text: "#9f1239" },
  { bg: "#dbeafe", border: "#93c5fd", text: "#1e40af" },
];

const MONTH_PILL_PALETTE_DARK = [
  { bg: "#3a3020", border: "#a16207", text: "#fcd34d" },
  { bg: "#1a3028", border: "#15803d", text: "#86efac" },
  { bg: "#2a2040", border: "#7c3aed", text: "#c4b5fd" },
  { bg: "#3a2028", border: "#be123c", text: "#fda4af" },
  { bg: "#1a2840", border: "#1d4ed8", text: "#93c5fd" },
];

function getMonthPillStyle(index: number, isDark: boolean) {
  const palette = isDark ? MONTH_PILL_PALETTE_DARK : MONTH_PILL_PALETTE;
  return palette[index % palette.length];
}

function formatCalendarTitle(
  viewType: ViewType,
  selectedDate: Date,
  weekStart: Date,
): string {
  if (viewType === "day") {
    return selectedDate.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }
  if (viewType === "week") {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    const sameMonth = weekStart.getMonth() === weekEnd.getMonth();
    const sameYear = weekStart.getFullYear() === weekEnd.getFullYear();
    if (sameMonth && sameYear) {
      return `${weekStart.toLocaleDateString("en-US", { month: "long", day: "numeric" })} – ${weekEnd.toLocaleDateString("en-US", { day: "numeric", year: "numeric" })}`;
    }
    const startStr = weekStart.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: sameYear ? undefined : "numeric",
    });
    const endStr = weekEnd.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    return `${startStr} – ${endStr}`;
  }
  return selectedDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
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
  }, [
    visible,
    initialStartHour,
    initialStartMin,
    initialEndHour,
    initialEndMin,
  ]);

  function handleCreate() {
    if (!title.trim()) return;
    const start = new Date(defaultDate);
    start.setHours(parseInt(startHour), parseInt(startMin), 0, 0);
    const end = new Date(defaultDate);
    end.setHours(parseInt(endHour), parseInt(endMin), 0, 0);

    createEvent.mutate(
      {
        title: title.trim(),
        startDateTime: toLocalDateTimeString(start),
        endDateTime: toLocalDateTimeString(end),
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

function EditCalendarEventModal({
  event,
  visible,
  onClose,
}: {
  event: CalendarEvent;
  visible: boolean;
  onClose: () => void;
}) {
  const editEvent = useEditEvent();
  const deleteEvent = useDeleteEvent();
  const [title, setTitle] = useState(event.title);
  const [eventDate, setEventDate] = useState(() => {
    const s = parseApiDateTime(event.startDateTime);
    return new Date(s.getFullYear(), s.getMonth(), s.getDate());
  });
  const [startHour, setStartHour] = useState("09");
  const [startMin, setStartMin] = useState("00");
  const [endHour, setEndHour] = useState("10");
  const [endMin, setEndMin] = useState("00");
  const [allDay, setAllDay] = useState(event.allDay);

  useEffect(() => {
    if (visible) {
      setTitle(event.title);
      setAllDay(event.allDay);
      const s = parseApiDateTime(event.startDateTime);
      const e = parseApiDateTime(event.endDateTime);
      setEventDate(new Date(s.getFullYear(), s.getMonth(), s.getDate()));
      setStartHour(String(s.getHours()).padStart(2, "0"));
      setStartMin(String(s.getMinutes()).padStart(2, "0"));
      setEndHour(String(e.getHours()).padStart(2, "0"));
      setEndMin(String(e.getMinutes()).padStart(2, "0"));
    }
  }, [visible, event]);

  function handleSave() {
    if (!title.trim()) return;
    const start = new Date(eventDate);
    start.setHours(parseInt(startHour), parseInt(startMin), 0, 0);
    const end = new Date(eventDate);
    end.setHours(parseInt(endHour), parseInt(endMin), 0, 0);

    editEvent.mutate(
      {
        eventId: event.eventId,
        data: {
          title: title.trim(),
          startDateTime: toLocalDateTimeString(start),
          endDateTime: toLocalDateTimeString(end),
          allDay,
          status: event.status,
        },
      },
      { onSuccess: onClose },
    );
  }

  function handleDelete() {
    deleteEvent.mutate(event.eventId, { onSuccess: onClose });
  }

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/50 items-center justify-center p-6">
        <View className="bg-surface-container-lowest rounded-2xl p-6 w-full max-w-md gap-4">
          <View className="flex-row items-center justify-between">
            <Text className="font-headline text-on-surface text-lg">
              Edytuj wydarzenie
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
          <View>
            <Text className="text-on-surface-variant font-label text-xs uppercase tracking-widest mb-2">
              Data
            </Text>
            <InlineDatePicker value={eventDate} onChange={setEventDate} />
          </View>
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
            <Button
              variant="error"
              label="Usuń"
              loading={deleteEvent.isPending}
              onPress={handleDelete}
            />
            <Button variant="outline" label="Anuluj" onPress={onClose} />
            <Button
              label="Zapisz"
              loading={editEvent.isPending}
              disabled={!title.trim()}
              onPress={handleSave}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function CalendarScreen() {
  const gridRef = useRef<View>(null);
  const weekScrollRef = useRef<ScrollView>(null);
  const weekDaysRef = useRef<Date[]>([]);
  const editEventMutateRef = useRef<
    (vars: { eventId: string; data: EditEventRequest }) => void
  >(() => {});
  const eventsRef = useRef<CalendarEvent[] | undefined>(undefined);
  const openEventEditRef = useRef<(evt: CalendarEvent) => void>(() => {});
  const autoScrollKeyRef = useRef("");

  const { data: events } = useEvents();
  const editEvent = useEditEvent();
  editEventMutateRef.current = editEvent.mutate;
  eventsRef.current = events;
  const queryClient = useQueryClient();
  const navigation = useNavigation();
  const params = useLocalSearchParams();
  const themeMode = useThemeStore((s) => s.mode);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    });
    return unsubscribe;
  }, [navigation, queryClient]);

  useEffect(() => {
    if (params.eventId && events) {
      const e = events.find((ev) => ev.eventId === params.eventId);
      if (e) setEditingEvent(e);
    }
  }, [params.eventId, events]);

  const isDark = themeMode === "dark";
  const gridBorderColor = isDark ? "#464560" : "#c7c4d8";
  const gridLineColor = isDark ? "#313448" : "#e0dff0";
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && width >= 1024;
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewType, setViewType] = useState<ViewType>("week");
  const [showCreate, setShowCreate] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  openEventEditRef.current = setEditingEvent;
  const [dragSel, setDragSel] = useState<DragSelection | null>(null);
  const [createStartH, setCreateStartH] = useState("09");
  const [createStartM, setCreateStartM] = useState("00");
  const [createEndH, setCreateEndH] = useState("10");
  const [createEndM, setCreateEndM] = useState("00");

  const displayDaysRef = useRef<Date[]>([]);
  const [gridReady, setGridReady] = useState(0);
  const dragEndRef = useRef<
    ((colIdx: number, startH: number, endH: number) => void) | null
  >(null);
  const [draggingEventId, setDraggingEventId] = useState<string | null>(null);
  const [resizingEventId, setResizingEventId] = useState<string | null>(null);
  const justFinishedDragRef = useRef(false);
  const [dragPreview, setDragPreview] = useState<{
    colIdx: number;
    top: number;
    height: number;
    title: string;
    color: string;
    startLabel: string;
    endLabel: string;
  } | null>(null);
  const [resizePreview, setResizePreview] = useState<{
    colIdx: number;
    top: number;
    height: number;
    title: string;
    color: string;
    startLabel: string;
    endLabel: string;
  } | null>(null);

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

  const displayDays = useMemo(
    () => (viewType === "day" ? [selectedDate] : weekDays),
    [viewType, selectedDate, weekDays],
  );
  displayDaysRef.current = displayDays;

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
      const start = parseApiDateTime(e.startDateTime);
      const end = parseApiDateTime(e.endDateTime);
      return isSameDay(start, day) || isSameDay(end, day);
    });
  }

  function getTimedEventsForDay(day: Date) {
    return getEventsForDay(day).filter((e) => !e.allDay);
  }

  function getAllDayEventsForDay(day: Date) {
    return getEventsForDay(day).filter((e) => e.allDay);
  }

  function getEventPosition(event: CalendarEvent) {
    const start = parseApiDateTime(event.startDateTime);
    const end = parseApiDateTime(event.endDateTime);
    const startHour = start.getHours() + start.getMinutes() / 60;
    let endHour = end.getHours() + end.getMinutes() / 60;
    if (!isSameDay(start, end)) endHour = 24;
    const bottomHour = Math.max(startHour + 0.25, Math.min(24, endHour));
    return {
      top: hourToTop(startHour),
      height: Math.max(hourToTop(bottomHour) - hourToTop(startHour), 24),
    };
  }

  const handleViewTypeChange = useCallback(
    (next: ViewType) => {
      if (next === "month") {
        autoScrollKeyRef.current = "";
      }
      if (next !== "month" && viewType === "month") {
        const daysWithEvents = monthDays
          .filter((d) => d.currentMonth && getEventsForDay(d.date).length > 0)
          .map((d) => d.date);
        if (daysWithEvents.length > 0) {
          const preferred =
            daysWithEvents.find((d) => isSameDay(d, selectedDate)) ??
            daysWithEvents[0];
          setSelectedDate(new Date(preferred));
        }
      }
      setViewType(next);
    },
    [viewType, monthDays, selectedDate, events],
  );

  function layoutOverlappingEvents(dayEvts: CalendarEvent[]) {
    if (dayEvts.length === 0) return [];
    const sorted = [...dayEvts].sort(
      (a, b) =>
        parseApiDateTime(a.startDateTime).getTime() -
        parseApiDateTime(b.startDateTime).getTime(),
    );
    const columns: CalendarEvent[][] = [];
    const eventColumnMap = new Map<
      string,
      { colIdx: number; totalCols: number }
    >();
    const groups: CalendarEvent[][] = [];
    let currentGroup: CalendarEvent[] = [];
    let groupEnd = 0;
    for (const evt of sorted) {
      const s = parseApiDateTime(evt.startDateTime).getTime();
      const e = parseApiDateTime(evt.endDateTime).getTime();
      if (currentGroup.length === 0 || s < groupEnd) {
        currentGroup.push(evt);
        groupEnd = Math.max(groupEnd, e);
      } else {
        groups.push(currentGroup);
        currentGroup = [evt];
        groupEnd = e;
      }
    }
    if (currentGroup.length > 0) groups.push(currentGroup);
    for (const group of groups) {
      const cols: CalendarEvent[][] = [];
      for (const evt of group) {
        const s = parseApiDateTime(evt.startDateTime).getTime();
        let placed = false;
        for (let c = 0; c < cols.length; c++) {
          const lastInCol = cols[c][cols[c].length - 1];
          const lastEnd = new Date(lastInCol.endDateTime).getTime();
          if (s >= lastEnd) {
            cols[c].push(evt);
            placed = true;
            eventColumnMap.set(evt.eventId, { colIdx: c, totalCols: 0 });
            break;
          }
        }
        if (!placed) {
          cols.push([evt]);
          eventColumnMap.set(evt.eventId, {
            colIdx: cols.length - 1,
            totalCols: 0,
          });
        }
      }
      const totalCols = cols.length;
      for (const evt of group) {
        const info = eventColumnMap.get(evt.eventId)!;
        info.totalCols = totalCols;
      }
    }
    return dayEvts.map((evt) => ({
      event: evt,
      ...(eventColumnMap.get(evt.eventId) ?? { colIdx: 0, totalCols: 1 }),
    }));
  }

  dragEndRef.current = (colIdx: number, startH: number, endH: number) => {
    const day = displayDaysRef.current[colIdx];
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
    if (Platform.OS !== "web" || viewType === "month") return;

    let grid: HTMLElement | null = null;
    let cancelled = false;
    let retryFrame = 0;
    const cleanupFns: Array<() => void> = [];

    let mode: "idle" | "pending" | "grid-drag" | "event-drag" | "event-resize" =
      "idle";
    let startX = 0;
    let startY = 0;
    let startCol = 0;
    let startH = 0;
    let draggedEvtId: string | null = null;
    let draggedEvtTitle = "";
    let draggedEvtColor = "";
    let draggedEvtDurationH = 1;
    let isResizeHandle = false;
    const THRESHOLD = 5;

    function resolveGrid(): HTMLElement | null {
      return (
        queryCalendarGridElement() ??
        viewToHTMLElement(gridRef.current) ??
        null
      );
    }

    function getPos(e: MouseEvent) {
      if (!grid) return { colIdx: 0, hour: GRID_START_HOUR, y: 0 };
      const rect = grid.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const colCount = Math.max(1, displayDaysRef.current.length);
      const colWidth = rect.width / colCount;
      const colIdx = Math.min(
        colCount - 1,
        Math.max(0, Math.floor(x / colWidth)),
      );
      const hour = Math.max(0, Math.min(24, yToHour(y)));
      return { colIdx, hour, y };
    }

    function readEventMeta(eventEl: HTMLElement) {
      return {
        id: readDataAttr(eventEl, "event-id") ?? "",
        title: readDataAttr(eventEl, "event-title") ?? "",
        color: readDataAttr(eventEl, "event-color") ?? "#4d41df",
        duration: parseFloat(readDataAttr(eventEl, "event-duration") ?? "1"),
      };
    }

    function onMouseDown(e: MouseEvent) {
      if (e.button !== 0 || !grid) return;
      const target = e.target as HTMLElement;
      if (!grid.contains(target)) return;

      const eventEl = findCalendarEventElement(target, grid);
      isResizeHandle = eventEl ? isCalendarResizeHandle(target) : false;

      startX = e.clientX;
      startY = e.clientY;
      const pos = getPos(e);
      startCol = pos.colIdx;
      startH = pos.hour;

      if (eventEl) {
        const meta = readEventMeta(eventEl);
        draggedEvtId = meta.id || null;
        draggedEvtTitle = meta.title;
        draggedEvtColor = meta.color;
        draggedEvtDurationH = Number.isFinite(meta.duration) ? meta.duration : 1;
        mode = "pending";
      } else {
        draggedEvtId = null;
        mode = "pending";
      }
    }

    function onMouseMove(e: MouseEvent) {
      if (mode === "idle") return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (mode === "pending" && dist >= THRESHOLD) {
        if (draggedEvtId && isResizeHandle) {
          mode = "event-resize";
          if (grid) grid.style.cursor = "ns-resize";
          setResizingEventId(draggedEvtId);
        } else if (draggedEvtId) {
          mode = "event-drag";
          if (grid) grid.style.cursor = "grabbing";
          setDraggingEventId(draggedEvtId);
        } else {
          mode = "grid-drag";
          if (grid) grid.style.cursor = "crosshair";
          setDragSel({
            colIdx: startCol,
            startHour: startH,
            endHour: Math.min(24, startH + 0.5),
          });
        }
        e.preventDefault();
      }

      if (mode === "grid-drag") {
        const pos = getPos(e);
        const minEnd = startH + 0.5;
        const endH = Math.max(minEnd, pos.hour);
        setDragSel({ colIdx: startCol, startHour: startH, endHour: endH });
        e.preventDefault();
      }

      if (mode === "event-drag") {
        const pos = getPos(e);
        const snapTop =
          Math.round(pos.y / (HOUR_HEIGHT / 4)) * (HOUR_HEIGHT / 4);
        const snapHour = yToHour(snapTop);
        setDragPreview({
          colIdx: pos.colIdx,
          top: snapTop,
          height: draggedEvtDurationH * HOUR_HEIGHT,
          title: draggedEvtTitle,
          color: draggedEvtColor,
          startLabel: formatHourLabel(snapHour),
          endLabel: formatHourLabel(snapHour + draggedEvtDurationH),
        });
        e.preventDefault();
      }

      if (mode === "event-resize" && draggedEvtId) {
        const pos = getPos(e);
        const snapEndHour = yToHour(pos.y);
        const evt = eventsRef.current?.find((ev) => ev.eventId === draggedEvtId);
        if (evt) {
          const evtStart = parseApiDateTime(evt.startDateTime);
          const evtStartH =
            evtStart.getHours() + evtStart.getMinutes() / 60;
          const clampedEndH = Math.max(
            evtStartH + 0.25,
            Math.min(24, snapEndHour),
          );
          setResizePreview({
            colIdx: startCol,
            top: hourToTop(evtStartH),
            height: hourToTop(clampedEndH) - hourToTop(evtStartH),
            title: draggedEvtTitle,
            color: draggedEvtColor,
            startLabel: formatHourLabel(evtStartH),
            endLabel: formatHourLabel(clampedEndH),
          });
        }
        e.preventDefault();
      }
    }

    function onMouseUp(e: MouseEvent) {
      const prevMode = mode;
      const moved =
        Math.sqrt(
          (e.clientX - startX) ** 2 + (e.clientY - startY) ** 2,
        ) >= THRESHOLD;
      mode = "idle";
      if (grid) grid.style.cursor = "";

      if (prevMode === "grid-drag") {
        setDragSel((sel) => {
          if (sel) dragEndRef.current?.(sel.colIdx, sel.startHour, sel.endHour);
          return null;
        });
      } else if (prevMode === "event-drag" && draggedEvtId) {
        const pos = getPos(e);
        const snapTop =
          Math.round(pos.y / (HOUR_HEIGHT / 4)) * (HOUR_HEIGHT / 4);
        const snapHour = yToHour(snapTop);
        const evtId = draggedEvtId;
        justFinishedDragRef.current = true;
        setTimeout(() => {
          justFinishedDragRef.current = false;
        }, 100);
        setDraggingEventId(null);
        setDragPreview(null);
        const evt = eventsRef.current?.find((ev) => ev.eventId === evtId);
        const targetDay = displayDaysRef.current[pos.colIdx];
        if (evt && targetDay) {
          const oldStart = parseApiDateTime(evt.startDateTime);
          const oldEnd = parseApiDateTime(evt.endDateTime);
          const dur = oldEnd.getTime() - oldStart.getTime();
          const newStart = new Date(
            targetDay.getFullYear(),
            targetDay.getMonth(),
            targetDay.getDate(),
            Math.floor(snapHour),
            Math.round((snapHour % 1) * 60),
            0,
            0,
          );
          const newEnd = new Date(newStart.getTime() + dur);
          editEventMutateRef.current({
            eventId: evt.eventId,
            data: {
              title: evt.title,
              startDateTime: toLocalDateTimeString(newStart),
              endDateTime: toLocalDateTimeString(newEnd),
              allDay: evt.allDay,
              status: evt.status,
            },
          });
        }
      } else if (prevMode === "event-resize" && draggedEvtId) {
        const pos = getPos(e);
        const snapEndHour = yToHour(pos.y);
        const evtId = draggedEvtId;
        justFinishedDragRef.current = true;
        setTimeout(() => {
          justFinishedDragRef.current = false;
        }, 100);
        setResizingEventId(null);
        setResizePreview(null);
        const evt = eventsRef.current?.find((ev) => ev.eventId === evtId);
        if (evt) {
          const evtStart = parseApiDateTime(evt.startDateTime);
          const evtStartH =
            evtStart.getHours() + evtStart.getMinutes() / 60;
          const clampedEndH = Math.max(
            evtStartH + 0.25,
            Math.min(24, snapEndHour),
          );
          const newEnd = new Date(evtStart);
          newEnd.setHours(
            Math.floor(clampedEndH),
            Math.round((clampedEndH % 1) * 60),
            0,
            0,
          );
          editEventMutateRef.current({
            eventId: evt.eventId,
            data: {
              title: evt.title,
              startDateTime: evt.startDateTime,
              endDateTime: toLocalDateTimeString(newEnd),
              allDay: evt.allDay,
              status: evt.status,
            },
          });
        }
      } else if (prevMode === "pending" && draggedEvtId && !moved) {
        const evt = eventsRef.current?.find((ev) => ev.eventId === draggedEvtId);
        if (evt) openEventEditRef.current(evt);
        setDraggingEventId(null);
        setDragPreview(null);
        setResizingEventId(null);
        setResizePreview(null);
      } else {
        setDraggingEventId(null);
        setDragPreview(null);
        setResizingEventId(null);
        setResizePreview(null);
      }

      draggedEvtId = null;
      isResizeHandle = false;
    }

    const attach = () => {
      if (cancelled) return;
      grid = resolveGrid();
      if (!grid) {
        retryFrame = requestAnimationFrame(attach);
        return;
      }

      grid.style.userSelect = "none";
      (grid.style as CSSStyleDeclaration & { touchAction?: string }).touchAction =
        "none";

      grid.addEventListener("mousedown", onMouseDown, true);
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
      cleanupFns.push(() => {
        grid?.removeEventListener("mousedown", onMouseDown, true);
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
      });
    };

    attach();

    return () => {
      cancelled = true;
      cancelAnimationFrame(retryFrame);
      cleanupFns.forEach((fn) => fn());
      grid = null;
    };
  }, [viewType, gridReady]);

  // Expose events to the mouse handler
  useEffect(() => {
    (window as any).__calendarEvents = events;
    return () => {
      delete (window as any).__calendarEvents;
    };
  }, [events]);

  useEffect(() => {
    if (viewType === "month") return;
    const key = `${viewType}-${weekStart.toISOString()}`;
    if (autoScrollKeyRef.current === key) return;
    autoScrollKeyRef.current = key;

    let earliestHour = 8;
    if (events?.length) {
      for (const day of displayDays) {
        for (const evt of getTimedEventsForDay(day)) {
          const h =
            parseApiDateTime(evt.startDateTime).getHours() +
            parseApiDateTime(evt.startDateTime).getMinutes() / 60;
          if (h < earliestHour) earliestHour = h;
        }
      }
    }
    const scrollY = Math.max(0, hourToTop(earliestHour) - 16);
    const t = setTimeout(() => {
      weekScrollRef.current?.scrollTo({ y: scrollY, animated: false });
    }, 80);
    return () => clearTimeout(t);
  }, [viewType, weekStart, events, displayDays]);

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

  const accentColor = isDark ? "#9b8cff" : "#4d41df";
  const cellBorder = isDark ? "#2a2a2a" : "#e5e7eb";

  const monthGrid = (
    <View className="flex-1 bg-surface-container-lowest rounded-2xl border border-outline-variant overflow-hidden">
      <View
        className="flex-row"
        style={{ borderBottomWidth: 1, borderBottomColor: cellBorder }}
      >
        {WEEK_DAYS_SHORT.map((d) => (
          <View
            key={d}
            className="flex-1 items-center py-3"
            style={{ borderLeftWidth: d === "MO" ? 0 : 1, borderLeftColor: cellBorder }}
          >
            <Text className="text-on-surface-variant font-headline text-[11px] tracking-wide">
              {d}
            </Text>
          </View>
        ))}
      </View>
      {Array.from({ length: 6 }, (_, weekIdx) => (
        <View
          key={weekIdx}
          className="flex-row"
          style={{
            minHeight: 108,
            borderTopWidth: weekIdx > 0 ? 1 : 0,
            borderTopColor: cellBorder,
          }}
        >
          {monthDays.slice(weekIdx * 7, weekIdx * 7 + 7).map((d, i) => {
            const dayEvents = getEventsForDay(d.date);
            const isToday = isSameDay(d.date, today);
            const isSelected = isSameDay(d.date, selectedDate);
            return (
              <TouchableOpacity
                key={i}
                onPress={() => setSelectedDate(d.date)}
                onLongPress={() => {
                  setSelectedDate(d.date);
                  setShowCreate(true);
                }}
                className="flex-1 p-2"
                style={{
                  borderLeftWidth: i > 0 ? 1 : 0,
                  borderLeftColor: cellBorder,
                  backgroundColor: isSelected
                    ? isDark
                      ? "#222228"
                      : "#f9fafb"
                    : "transparent",
                }}
              >
                <View className="items-start mb-1.5">
                  {isToday ? (
                    <View
                      className="w-7 h-7 rounded-full items-center justify-center"
                      style={{ backgroundColor: accentColor }}
                    >
                      <Text className="text-white font-headline text-xs">
                        {d.day}
                      </Text>
                    </View>
                  ) : (
                    <Text
                      className={`text-xs font-body pl-1 ${
                        !d.currentMonth
                          ? "text-outline"
                          : "text-on-surface"
                      }`}
                    >
                      {d.day}
                    </Text>
                  )}
                </View>
                {dayEvents.slice(0, 3).map((evt, evtIdx) => {
                  const pill = getMonthPillStyle(evtIdx, isDark);
                  return (
                    <TouchableOpacity
                      key={evt.eventId}
                      onPress={() => {
                        setSelectedDate(d.date);
                        setEditingEvent(evt);
                      }}
                      className="mt-0.5 px-1.5 py-0.5 rounded-full"
                      style={{
                        backgroundColor: pill.bg,
                        borderWidth: 1,
                        borderColor: pill.border,
                      }}
                    >
                      <Text
                        numberOfLines={1}
                        className="text-[9px] font-label"
                        style={{ color: pill.text }}
                      >
                        {evt.title}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
                {dayEvents.length > 3 && (
                  <Text className="text-[9px] text-on-surface-variant pl-1 mt-0.5">
                    +{dayEvents.length - 3} more
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );

  const miniCalendar = (
    <View className="bg-surface-container-lowest rounded-2xl p-4 shadow-card">
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
    <View className="bg-surface-container-lowest rounded-2xl p-4 shadow-card">
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
    <View className="flex-1 bg-surface-container-lowest rounded-2xl overflow-hidden shadow-card">
      {/* Day header row */}
      <View
        className="flex-row"
        style={{
          borderBottomWidth: 1,
          borderBottomColor: gridBorderColor,
          paddingRight: SCROLLBAR_GUTTER,
        }}
      >
        <View style={{ width: TIME_GUTTER_WIDTH }} />
        {displayDays.map((day, i) => {
          const isToday = isSameDay(day, today);
          const dayOfWeek = day.getDay();
          const dayLabel = WEEK_DAYS_SHORT[dayOfWeek === 0 ? 6 : dayOfWeek - 1];
          return (
            <TouchableOpacity
              key={i}
              onPress={() => setSelectedDate(day)}
              className="flex-1 items-center py-3"
              style={{
                borderLeftWidth: 1,
                borderLeftColor: gridBorderColor,
              }}
            >
              <Text
                className={`text-[10px] font-label uppercase ${
                  isToday ? "text-primary" : "text-on-surface-variant"
                }`}
              >
                {dayLabel}
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

      {/* All-day events row */}
      <View
        className="flex-row"
        style={{
          borderBottomWidth: 1,
          borderBottomColor: gridBorderColor,
          paddingRight: SCROLLBAR_GUTTER,
        }}
      >
        <View
          style={{
            width: TIME_GUTTER_WIDTH,
            paddingRight: 8,
            alignItems: "flex-end",
            justifyContent: "center",
          }}
        >
          <Text className="text-on-surface-variant font-body text-[9px]">
            all-day
          </Text>
        </View>
        {displayDays.map((day, colIdx) => {
          const allDayEvts = getAllDayEventsForDay(day);
          return (
            <View
              key={colIdx}
              className="flex-1 min-h-[36px] gap-0.5"
              style={{
                borderLeftWidth: 1,
                borderLeftColor: gridBorderColor,
                paddingVertical: 4,
              }}
            >
              {allDayEvts.map((evt) => {
                const color = getEventColor(evt, colIdx);
                return (
                  <TouchableOpacity
                    key={evt.eventId}
                    onPress={() => setEditingEvent(evt)}
                    className="rounded px-1.5 py-0.5"
                    style={{
                      backgroundColor: `${color}25`,
                      borderLeftWidth: 3,
                      borderLeftColor: color,
                    }}
                  >
                    <Text
                      className="text-on-surface font-headline"
                      style={{ fontSize: 9 }}
                      numberOfLines={1}
                    >
                      {evt.title}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          );
        })}
      </View>

      {/* Time grid */}
      <ScrollView
        ref={weekScrollRef}
        className="flex-1"
        showsVerticalScrollIndicator
        nestedScrollEnabled
      >
        <View style={{ height: GRID_HEIGHT, position: "relative" }}>
          {/* Hour rows with labels */}
          {HOURS.map((hour) => (
            <View
              key={hour}
              className="flex-row"
              style={{
                height: HOUR_HEIGHT,
                borderBottomWidth: 1,
                borderBottomColor: gridLineColor,
              }}
            >
              <View
                style={{
                  width: TIME_GUTTER_WIDTH,
                  paddingRight: 8,
                  alignItems: "flex-end",
                  marginTop: -7,
                }}
              >
                <Text className="text-on-surface-variant font-body text-[10px]">
                  {String(hour).padStart(2, "0")}:00
                </Text>
              </View>
              <View className="flex-1 flex-row">
                {displayDays.map((_, colIdx) => (
                  <View
                    key={colIdx}
                    className="flex-1"
                    style={{
                      borderLeftWidth: 1,
                      borderLeftColor: gridLineColor,
                    }}
                  />
                ))}
              </View>
            </View>
          ))}

          {/* Single overlay: events + drag interaction */}
          <View
            ref={gridRef}
            onLayout={() => setGridReady((n) => n + 1)}
            dataSet={{ calendarGrid: "true" }}
            className="absolute flex-row"
            style={{
              left: TIME_GUTTER_WIDTH,
              right: 0,
              top: 0,
              height: GRID_HEIGHT,
              zIndex: 5,
            }}
          >
            {displayDays.map((day, colIdx) => {
              const dayEvts = getTimedEventsForDay(day);
              const laidOut = layoutOverlappingEvents(dayEvts);
              return (
                <View
                  key={colIdx}
                  style={{ flex: 1, position: "relative", height: GRID_HEIGHT }}
                >
                  {laidOut.map(({ event: evt, colIdx: evtCol, totalCols }) => {
                    const pos = getEventPosition(evt);
                    const color = getEventColor(evt, colIdx);
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
                    const colWidth = 100 / totalCols;
                    const leftPct = evtCol * colWidth;
                    const eventDurationH =
                      (parseApiDateTime(evt.endDateTime).getTime() -
                        parseApiDateTime(evt.startDateTime).getTime()) /
                      3600000;
                    const eventStyle = {
                      position: "absolute" as const,
                      top: pos.top,
                      height: pos.height,
                      left: `${leftPct}%`,
                      width: `${colWidth}%`,
                      minWidth: 24,
                      paddingHorizontal: 3,
                      backgroundColor:
                        draggingEventId === evt.eventId ||
                        resizingEventId === evt.eventId
                          ? `${color}10`
                          : `${color}20`,
                      borderLeftWidth: 3,
                      borderLeftColor: color,
                      borderStyle: isProposed
                        ? ("dashed" as const)
                        : ("solid" as const),
                      zIndex: 10,
                      opacity:
                        draggingEventId === evt.eventId ||
                        resizingEventId === evt.eventId
                          ? 0.4
                          : 1,
                      ...(Platform.OS === "web"
                        ? {
                            cursor: "grab" as const,
                            boxSizing: "border-box" as const,
                          }
                        : {}),
                    };
                    const eventDataSet = {
                      eventId: evt.eventId,
                      eventTitle: evt.title,
                      eventColor: color,
                      eventDuration: String(eventDurationH),
                    };
                    const eventBody = (
                      <>
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
                        {Platform.OS === "web" && (
                          <View
                            dataSet={{ resizeHandle: "true" }}
                            style={{
                              position: "absolute",
                              bottom: 0,
                              left: 0,
                              right: 0,
                              height: 6,
                              cursor: "ns-resize" as const,
                            }}
                          />
                        )}
                      </>
                    );

                    if (Platform.OS === "web") {
                      return (
                        <View
                          key={evt.eventId}
                          dataSet={eventDataSet}
                          className="rounded-md px-1.5 py-1 overflow-hidden"
                          style={eventStyle}
                        >
                          {eventBody}
                        </View>
                      );
                    }

                    return (
                      <TouchableOpacity
                        key={evt.eventId}
                        onPress={() => {
                          if (
                            !draggingEventId &&
                            !resizingEventId &&
                            !justFinishedDragRef.current
                          )
                            setEditingEvent(evt);
                        }}
                        activeOpacity={0.7}
                        className="rounded-md px-1.5 py-1 overflow-hidden"
                        dataSet={eventDataSet}
                        style={eventStyle}
                      >
                        {eventBody}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              );
            })}

            {/* Drag preview – ghost card */}
            {dragPreview && (
              <View
                pointerEvents="none"
                style={{
                  position: "absolute",
                  left: `${(dragPreview.colIdx / displayDays.length) * 100}%`,
                  width: `${100 / displayDays.length}%`,
                  top: dragPreview.top,
                  height: dragPreview.height,
                  zIndex: 20,
                }}
              >
                {/* Drop zone indicator line */}
                <View
                  style={{
                    position: "absolute",
                    top: -1,
                    left: 0,
                    right: 0,
                    height: 2,
                    backgroundColor: dragPreview.color,
                    borderRadius: 1,
                  }}
                />
                {/* Ghost event card */}
                <View
                  style={{
                    flex: 1,
                    backgroundColor: `${dragPreview.color}25`,
                    borderLeftWidth: 3,
                    borderLeftColor: dragPreview.color,
                    borderRadius: 6,
                    paddingHorizontal: 6,
                    paddingVertical: 4,
                    borderWidth: 1,
                    borderColor: `${dragPreview.color}50`,
                    overflow: "hidden",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: "700",
                      color: dragPreview.color,
                    }}
                    numberOfLines={1}
                  >
                    {dragPreview.title}
                  </Text>
                  <Text
                    style={{
                      fontSize: 9,
                      color: dragPreview.color,
                      opacity: 0.8,
                    }}
                  >
                    {dragPreview.startLabel} – {dragPreview.endLabel}
                  </Text>
                </View>
              </View>
            )}

            {/* Resize preview – ghost card */}
            {resizePreview && (
              <View
                pointerEvents="none"
                style={{
                  position: "absolute",
                  left: `${(resizePreview.colIdx / displayDays.length) * 100}%`,
                  width: `${100 / displayDays.length}%`,
                  top: resizePreview.top,
                  height: resizePreview.height,
                  zIndex: 20,
                }}
              >
                <View
                  style={{
                    flex: 1,
                    backgroundColor: `${resizePreview.color}25`,
                    borderLeftWidth: 3,
                    borderLeftColor: resizePreview.color,
                    borderRadius: 6,
                    paddingHorizontal: 6,
                    paddingVertical: 4,
                    borderWidth: 1,
                    borderColor: `${resizePreview.color}50`,
                    overflow: "hidden",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: "700",
                      color: resizePreview.color,
                    }}
                    numberOfLines={1}
                  >
                    {resizePreview.title}
                  </Text>
                  <Text
                    style={{
                      fontSize: 9,
                      color: resizePreview.color,
                      opacity: 0.8,
                    }}
                  >
                    {resizePreview.startLabel} – {resizePreview.endLabel}
                  </Text>
                </View>
                {/* Bottom edge indicator */}
                <View
                  style={{
                    position: "absolute",
                    bottom: -1,
                    left: 0,
                    right: 0,
                    height: 2,
                    backgroundColor: resizePreview.color,
                    borderRadius: 1,
                  }}
                />
              </View>
            )}

            {/* Drag selection visual */}
            {dragSel && (
              <View
                pointerEvents="none"
                style={{
                  position: "absolute",
                  left: `${(dragSel.colIdx / displayDays.length) * 100}%`,
                  width: `${100 / displayDays.length}%`,
                  top: hourToTop(dragSel.startHour),
                  height: (dragSel.endHour - dragSel.startHour) * HOUR_HEIGHT,
                  backgroundColor: "rgba(77, 65, 223, 0.12)",
                  borderWidth: 1,
                  borderColor: "#4d41df",
                  borderRadius: 4,
                  borderStyle: "dashed",
                  zIndex: 1,
                }}
              />
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );

  const headerTitle = formatCalendarTitle(viewType, selectedDate, weekStart);

  return (
    <PageLayout>
      <View className="flex-1 gap-4">
        <View className="flex-row items-center justify-between flex-wrap gap-3">
          <View className="flex-row items-center gap-2 flex-wrap">
            <TouchableOpacity
              onPress={prevPeriod}
              className="w-9 h-9 items-center justify-center rounded-lg border border-outline-variant bg-surface-container-lowest"
            >
              <MaterialIcons name="chevron-left" size={22} color="#9ca3af" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={nextPeriod}
              className="w-9 h-9 items-center justify-center rounded-lg border border-outline-variant bg-surface-container-lowest"
            >
              <MaterialIcons name="chevron-right" size={22} color="#9ca3af" />
            </TouchableOpacity>
            <Text className="text-on-surface font-headline text-title-lg ml-1">
              {headerTitle}
            </Text>
            <TouchableOpacity
              onPress={() => setSelectedDate(new Date())}
              className="px-3 py-1.5 rounded-lg border border-outline-variant bg-surface-container-lowest"
            >
              <Text className="text-on-surface-variant font-label text-sm">
                Today
              </Text>
            </TouchableOpacity>
            <View className="flex-row bg-surface-container-low rounded-full p-0.5 border border-outline-variant">
              {(["day", "week", "month"] as ViewType[]).map((v) => (
                <TouchableOpacity
                  key={v}
                  onPress={() => handleViewTypeChange(v)}
                  className="px-3 py-1.5 rounded-full"
                  style={
                    viewType === v ? { backgroundColor: accentColor } : undefined
                  }
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
            className="rounded-xl px-4 py-2.5 flex-row items-center gap-1.5"
            style={{ backgroundColor: accentColor }}
          >
            <MaterialIcons name="add" size={18} color="#fff" />
            {isDesktop && (
              <Text className="text-white font-headline text-sm">
                New Event
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <View className="flex-1">
          {viewType === "month" ? monthGrid : weekTimeGrid}
        </View>
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

      {editingEvent && (
        <EditCalendarEventModal
          event={editingEvent}
          visible={!!editingEvent}
          onClose={() => setEditingEvent(null)}
        />
      )}
    </PageLayout>
  );
}
