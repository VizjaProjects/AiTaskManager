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
import { useNavigation } from "expo-router";
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
import { useQueryClient } from "@tanstack/react-query";

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
    const s = new Date(event.startDateTime);
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
      const s = new Date(event.startDateTime);
      const e = new Date(event.endDateTime);
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
          startDateTime: start.toISOString(),
          endDateTime: end.toISOString(),
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
  const { data: events } = useEvents();
  const editEvent = useEditEvent();
  const queryClient = useQueryClient();
  const navigation = useNavigation();
  const themeMode = useThemeStore((s) => s.mode);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    });
    return unsubscribe;
  }, [navigation, queryClient]);

  const isDark = themeMode === "dark";
  const gridBorderColor = isDark ? "#464560" : "#c7c4d8";
  const gridLineColor = isDark ? "#313448" : "#e0dff0";
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && width >= 1024;
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewType, setViewType] = useState<ViewType>(
    Platform.OS === "web" && width >= 1024 ? "week" : "day",
  );
  const [showCreate, setShowCreate] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [dragSel, setDragSel] = useState<DragSelection | null>(null);
  const [createStartH, setCreateStartH] = useState("09");
  const [createStartM, setCreateStartM] = useState("00");
  const [createEndH, setCreateEndH] = useState("10");
  const [createEndM, setCreateEndM] = useState("00");

  const gridRef = useRef<View>(null);
  const weekDaysRef = useRef<Date[]>([]);
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

  function layoutOverlappingEvents(dayEvts: CalendarEvent[]) {
    if (dayEvts.length === 0) return [];
    const sorted = [...dayEvts].sort(
      (a, b) =>
        new Date(a.startDateTime).getTime() -
        new Date(b.startDateTime).getTime(),
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
      const s = new Date(evt.startDateTime).getTime();
      const e = new Date(evt.endDateTime).getTime();
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
        const s = new Date(evt.startDateTime).getTime();
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

    let mode: "idle" | "pending" | "grid-drag" | "event-drag" | "event-resize" =
      "idle";
    let startX = 0;
    let startY = 0;
    let startCol = 0;
    let startH = 0;
    let draggedEvtId: string | null = null;
    let draggedEvtHeight = 0;
    let draggedEvtTitle = "";
    let draggedEvtColor = "";
    let draggedEvtDurationH = 1;
    let isResizeHandle = false;
    const THRESHOLD = 6;

    function getPos(e: MouseEvent) {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const colWidth = rect.width / 7;
      const colIdx = Math.min(6, Math.max(0, Math.floor(x / colWidth)));
      const rawHour = 7 + y / HOUR_HEIGHT;
      const hour = Math.round(rawHour * 2) / 2;
      return { colIdx, hour: Math.max(7, Math.min(24, hour)), y };
    }

    function onMouseDown(e: MouseEvent) {
      if (e.button !== 0) return;
      const target = e.target as HTMLElement;
      const resizeHandle = target.closest(
        "[data-resize-handle]",
      ) as HTMLElement | null;
      const eventEl = (resizeHandle ?? target).closest(
        "[data-event-id]",
      ) as HTMLElement | null;
      startX = e.clientX;
      startY = e.clientY;
      const pos = getPos(e);
      startCol = pos.colIdx;
      startH = pos.hour;
      isResizeHandle = !!resizeHandle;
      if (eventEl) {
        draggedEvtId = eventEl.getAttribute("data-event-id");
        draggedEvtHeight = eventEl.offsetHeight;
        draggedEvtTitle = eventEl.getAttribute("data-event-title") || "";
        draggedEvtColor = eventEl.getAttribute("data-event-color") || "#4d41df";
        const durAttr = eventEl.getAttribute("data-event-duration");
        draggedEvtDurationH = durAttr ? parseFloat(durAttr) : 1;
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
          el.style.cursor = "ns-resize";
          setResizingEventId(draggedEvtId);
        } else if (draggedEvtId) {
          mode = "event-drag";
          el.style.cursor = "grabbing";
          setDraggingEventId(draggedEvtId);
        } else {
          mode = "grid-drag";
          el.style.cursor = "crosshair";
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
        const snapHour = 7 + snapTop / HOUR_HEIGHT;
        const endHour = snapHour + draggedEvtDurationH;
        const fmtH = (h: number) => {
          const hh = Math.floor(h);
          const mm = Math.round((h % 1) * 60);
          return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
        };
        setDragPreview({
          colIdx: pos.colIdx,
          top: snapTop,
          height: draggedEvtDurationH * HOUR_HEIGHT,
          title: draggedEvtTitle,
          color: draggedEvtColor,
          startLabel: fmtH(snapHour),
          endLabel: fmtH(endHour),
        });
        e.preventDefault();
      }

      if (mode === "event-resize" && draggedEvtId) {
        const pos = getPos(e);
        const rawEndHour = 7 + pos.y / HOUR_HEIGHT;
        const snapEndHour = Math.round(rawEndHour * 4) / 4;
        const evts = (window as any).__calendarEvents as
          | CalendarEvent[]
          | undefined;
        const evt = evts?.find((ev) => ev.eventId === draggedEvtId);
        if (evt) {
          const evtStart = new Date(evt.startDateTime);
          const evtStartH = evtStart.getHours() + evtStart.getMinutes() / 60;
          const minEndH = evtStartH + 0.25;
          const clampedEndH = Math.max(minEndH, Math.min(24, snapEndHour));
          const newHeight = (clampedEndH - evtStartH) * HOUR_HEIGHT;
          const topPx = (evtStartH - 7) * HOUR_HEIGHT;
          const fmtH = (h: number) => {
            const hh = Math.floor(h);
            const mm = Math.round((h % 1) * 60);
            return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
          };
          setResizePreview({
            colIdx: startCol,
            top: topPx,
            height: newHeight,
            title: draggedEvtTitle,
            color: draggedEvtColor,
            startLabel: fmtH(evtStartH),
            endLabel: fmtH(clampedEndH),
          });
        }
        e.preventDefault();
      }
    }

    function onMouseUp(e: MouseEvent) {
      const prevMode = mode;
      mode = "idle";
      el.style.cursor = "";

      if (prevMode === "grid-drag") {
        setDragSel((sel) => {
          if (sel) dragEndRef.current?.(sel.colIdx, sel.startHour, sel.endHour);
          return null;
        });
      } else if (prevMode === "event-drag" && draggedEvtId) {
        const pos = getPos(e);
        const snapHour =
          7 +
          (Math.round(pos.y / (HOUR_HEIGHT / 4)) * (HOUR_HEIGHT / 4)) /
            HOUR_HEIGHT;
        const evtId = draggedEvtId;
        justFinishedDragRef.current = true;
        setTimeout(() => {
          justFinishedDragRef.current = false;
        }, 50);
        setDraggingEventId(null);
        setDragPreview(null);
        // Move the event
        const evts = (window as any).__calendarEvents as
          | CalendarEvent[]
          | undefined;
        const evt = evts?.find((ev) => ev.eventId === evtId);
        if (evt) {
          const targetDay = weekDaysRef.current[pos.colIdx];
          if (targetDay) {
            const oldStart = new Date(evt.startDateTime);
            const oldEnd = new Date(evt.endDateTime);
            const dur = oldEnd.getTime() - oldStart.getTime();
            const newStart = new Date(targetDay);
            const hourInt = Math.floor(snapHour);
            const minInt = Math.round((snapHour % 1) * 60);
            newStart.setHours(hourInt, minInt, 0, 0);
            const newEnd = new Date(newStart.getTime() + dur);
            editEvent.mutate({
              eventId: evt.eventId,
              data: {
                title: evt.title,
                startDateTime: newStart.toISOString(),
                endDateTime: newEnd.toISOString(),
                allDay: evt.allDay,
                status: evt.status,
              },
            });
          }
        }
      } else if (prevMode === "event-resize" && draggedEvtId) {
        const pos = getPos(e);
        const rawEndHour = 7 + pos.y / HOUR_HEIGHT;
        const snapEndHour = Math.round(rawEndHour * 4) / 4;
        const evtId = draggedEvtId;
        justFinishedDragRef.current = true;
        setTimeout(() => {
          justFinishedDragRef.current = false;
        }, 50);
        setResizingEventId(null);
        setResizePreview(null);
        const evts = (window as any).__calendarEvents as
          | CalendarEvent[]
          | undefined;
        const evt = evts?.find((ev) => ev.eventId === evtId);
        if (evt) {
          const evtStart = new Date(evt.startDateTime);
          const evtStartH = evtStart.getHours() + evtStart.getMinutes() / 60;
          const minEndH = evtStartH + 0.25;
          const clampedEndH = Math.max(minEndH, Math.min(24, snapEndHour));
          const newEnd = new Date(evtStart);
          const endHH = Math.floor(clampedEndH);
          const endMM = Math.round((clampedEndH % 1) * 60);
          newEnd.setHours(endHH, endMM, 0, 0);
          editEvent.mutate({
            eventId: evt.eventId,
            data: {
              title: evt.title,
              startDateTime: evt.startDateTime,
              endDateTime: newEnd.toISOString(),
              allDay: evt.allDay,
              status: evt.status,
            },
          });
        }
      } else {
        // click without drag
        setDraggingEventId(null);
        setDragPreview(null);
        setResizingEventId(null);
        setResizePreview(null);
      }

      draggedEvtId = null;
      isResizeHandle = false;
    }

    el.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      el.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  // Expose events to the mouse handler
  useEffect(() => {
    (window as any).__calendarEvents = events;
    return () => {
      delete (window as any).__calendarEvents;
    };
  }, [events]);

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
        style={{ borderBottomWidth: 1, borderBottomColor: gridBorderColor }}
      >
        <View className="w-14" />
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

      {/* Time grid */}
      <ScrollView showsVerticalScrollIndicator={false}>
        <View
          style={{ height: HOURS.length * HOUR_HEIGHT, position: "relative" }}
        >
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
              <View className="w-14 pr-2 items-end" style={{ marginTop: -7 }}>
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
            className="absolute flex-row"
            style={{ left: 56, right: 0, top: 0, bottom: 0 }}
          >
            {displayDays.map((day, colIdx) => {
              const dayEvts = getEventsForDay(day);
              const laidOut = layoutOverlappingEvents(dayEvts);
              return (
                <View key={colIdx} className="flex-1 relative">
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
                    const widthPct = `${100 / totalCols}%`;
                    const leftPct = `${(evtCol / totalCols) * 100}%`;
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
                        className="absolute rounded-md px-1.5 py-1 overflow-hidden"
                        {...({
                          dataSet: {
                            eventId: evt.eventId,
                            eventTitle: evt.title,
                            eventColor: color,
                            eventDuration: String(
                              (new Date(evt.endDateTime).getTime() -
                                new Date(evt.startDateTime).getTime()) /
                                3600000,
                            ),
                          },
                        } as any)}
                        style={{
                          top: pos.top,
                          height: pos.height,
                          left: leftPct as any,
                          width: widthPct as any,
                          paddingHorizontal: 3,
                          backgroundColor:
                            draggingEventId === evt.eventId ||
                            resizingEventId === evt.eventId
                              ? `${color}10`
                              : `${color}20`,
                          borderLeftWidth: 3,
                          borderLeftColor: color,
                          borderStyle: isProposed ? "dashed" : "solid",
                          zIndex: 2,
                          opacity:
                            draggingEventId === evt.eventId ||
                            resizingEventId === evt.eventId
                              ? 0
                              : 1,
                          ...(Platform.OS === "web"
                            ? { cursor: "grab" as any }
                            : {}),
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
                        {/* Resize handle at bottom edge */}
                        {Platform.OS === "web" && (
                          <View
                            {...({ dataSet: { resizeHandle: "true" } } as any)}
                            style={{
                              position: "absolute",
                              bottom: 0,
                              left: 0,
                              right: 0,
                              height: 6,
                              cursor: "ns-resize" as any,
                            }}
                          />
                        )}
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
                  top: (dragSel.startHour - 7) * HOUR_HEIGHT,
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

  return (
    <PageLayout title="Good morning">
      <View className="flex-1 gap-4">
        <View className="flex-row items-center justify-between flex-wrap gap-2">
          <View className="flex-row items-center gap-3 flex-wrap">
            <Text className="text-on-surface font-headline text-lg">
              {viewType === "day"
                ? selectedDate.toLocaleDateString("pl-PL", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  })
                : `Week ${weekNumber}`}
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
            className="bg-primary rounded-xl px-3 py-2 flex-row items-center gap-1"
          >
            <MaterialIcons name="add" size={18} color="#fff" />
            {isDesktop && (
              <Text className="text-white font-headline text-sm">
                + New Event
              </Text>
            )}
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
