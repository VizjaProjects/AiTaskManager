import { View, Text, TouchableOpacity } from "react-native";
import { useState, useMemo } from "react";
import { MaterialIcons } from "@expo/vector-icons";

const WEEK_DAYS_SHORT = ["Pn", "Wt", "Śr", "Cz", "Pt", "So", "Nd"];

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

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

interface InlineDatePickerProps {
  value: Date;
  onChange: (date: Date) => void;
}

export function InlineDatePicker({ value, onChange }: InlineDatePickerProps) {
  const [viewMonth, setViewMonth] = useState(
    new Date(value.getFullYear(), value.getMonth(), 1),
  );

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const monthDays = useMemo(
    () => getMonthDays(viewMonth.getFullYear(), viewMonth.getMonth()),
    [viewMonth],
  );

  const monthLabel = viewMonth.toLocaleDateString("pl-PL", {
    month: "long",
    year: "numeric",
  });

  return (
    <View className="bg-surface-container-low rounded-2xl p-3">
      {/* Month navigation */}
      <View className="flex-row items-center justify-between mb-2">
        <TouchableOpacity
          onPress={() =>
            setViewMonth(
              new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1),
            )
          }
          className="p-1.5 rounded-lg"
          activeOpacity={0.6}
        >
          <MaterialIcons name="chevron-left" size={22} color="#777587" />
        </TouchableOpacity>
        <Text className="text-on-surface font-headline text-sm capitalize">
          {monthLabel}
        </Text>
        <TouchableOpacity
          onPress={() =>
            setViewMonth(
              new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1),
            )
          }
          className="p-1.5 rounded-lg"
          activeOpacity={0.6}
        >
          <MaterialIcons name="chevron-right" size={22} color="#777587" />
        </TouchableOpacity>
      </View>

      {/* Day-of-week headers */}
      <View className="flex-row mb-1">
        {WEEK_DAYS_SHORT.map((d) => (
          <View key={d} className="flex-1 items-center py-1">
            <Text className="text-on-surface-variant font-label text-[10px] uppercase">
              {d}
            </Text>
          </View>
        ))}
      </View>

      {/* Day grid */}
      {Array.from({ length: 6 }, (_, weekIdx) => (
        <View key={weekIdx} className="flex-row">
          {monthDays.slice(weekIdx * 7, weekIdx * 7 + 7).map((d, i) => {
            const isToday = isSameDay(d.date, today);
            const isSelected = isSameDay(d.date, value);
            return (
              <TouchableOpacity
                key={i}
                onPress={() => {
                  onChange(d.date);
                  if (!d.currentMonth) {
                    setViewMonth(
                      new Date(d.date.getFullYear(), d.date.getMonth(), 1),
                    );
                  }
                }}
                className="flex-1 items-center justify-center"
                style={{
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: isSelected
                    ? "#4d41df"
                    : isToday
                      ? "rgba(77, 65, 223, 0.12)"
                      : "transparent",
                }}
                activeOpacity={0.6}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: isSelected || isToday ? "700" : "400",
                    color: isSelected
                      ? "#ffffff"
                      : !d.currentMonth
                        ? "#777587"
                        : isToday
                          ? "#4d41df"
                          : undefined,
                  }}
                  className={
                    !isSelected && d.currentMonth && !isToday
                      ? "text-on-surface"
                      : ""
                  }
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
}
