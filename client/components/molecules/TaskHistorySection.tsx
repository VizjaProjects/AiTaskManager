/**
 * Read-only historia zmian zadania — zawartość zakładki „Historia" w
 * TaskDetailModal.
 *
 * Świadome ograniczenia (zgodne z backendem, nie zgadujemy danych):
 * - Backend wersjonuje DOKŁADNIE 7 pól: Title, Description, Priority,
 *   EstimatedDuration, DueDateTime, Status, Category (RecordHistoryAsync
 *   w EditWorkTaskHandler). Kroki i komentarze NIE są wersjonowane.
 * - TaskHistoryDto nie zwraca nazwy autora, tylko UserId → nazwę rozwiązujemy
 *   z activeWorkspace.assignedUsers, fallback = history.unknownAuthor.
 * - HistoryDate to DateTime.UtcNow z domeny (inaczej niż terminy zadań, które
 *   są lokalnym wall-clockiem) → parsujemy jawnie jako UTC, nie przez
 *   parseApiDateTime.
 */

import { View, Text } from "react-native";
import { useMemo } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { Avatar, EmptyState } from "../atoms";
import { useTaskHistory, useTaskStatuses, useCategories } from "@/lib/hooks";
import { useThemeStore, useWorkspaceStore } from "@/lib/stores";
import { getUiTokens } from "@/lib/utils/uiTokens";
import {
  formatDuration,
  getCategoryDisplayColor,
  PRIORITY_TEXT,
} from "@/lib/utils";
import { useLocale, useT } from "@/lib/i18n";
import { TaskPriority } from "@/lib/types";

type FieldMeta = { icon: keyof typeof MaterialIcons.glyphMap; labelKey: string };

/** Nazwy pól przychodzą z backendu dosłownie (TaskHistoryChange.Field). */
const FIELD_META: Record<string, FieldMeta> = {
  Title: { icon: "title", labelKey: "history.fieldTitle" },
  Status: { icon: "label", labelKey: "history.fieldStatus" },
  Priority: { icon: "flag", labelKey: "history.fieldPriority" },
  Category: { icon: "sell", labelKey: "history.fieldCategory" },
  DueDateTime: { icon: "calendar-today", labelKey: "history.fieldDueDate" },
  EstimatedDuration: { icon: "schedule", labelKey: "history.fieldEstimated" },
  Description: { icon: "notes", labelKey: "history.fieldDescription" },
};

/** Kolejność wyświetlania zmian w obrębie jednej wersji. */
const FIELD_ORDER = Object.keys(FIELD_META);

/** Pola pokazywane w pionie (długi tekst), nie jako pigułki obok siebie. */
const LONG_TEXT_FIELDS = new Set(["Description", "Title"]);

const PRIORITY_LABEL_KEY: Record<TaskPriority, string> = {
  [TaskPriority.CRITICAL]: "priority.critical",
  [TaskPriority.HIGH]: "priority.high",
  [TaskPriority.MEDIUM]: "priority.medium",
  [TaskPriority.LOW]: "priority.low",
};

function parseUtcDateTime(value: string): Date {
  // Backend serializuje DateTime.UtcNow bez offsetu — dokładamy „Z".
  const hasZone = /(?:Z|[+-]\d{2}:\d{2})$/.test(value);
  return new Date(hasZone ? value : `${value}Z`);
}

function toPriority(value: string): TaskPriority {
  // Backend ma URGENT, front CRITICAL (patrz mapPriority w adapters.ts).
  if (value === "URGENT") return TaskPriority.CRITICAL;
  return Object.values(TaskPriority).includes(value as TaskPriority)
    ? (value as TaskPriority)
    : TaskPriority.MEDIUM;
}

export function TaskHistorySection({ taskId }: { taskId: string }) {
  const t = useT();
  const locale = useLocale();
  const isDark = useThemeStore((s) => s.mode) === "dark";
  const ui = getUiTokens(isDark);
  // Ten sam wzorzec co w TaskModals.tsx — accent z DESIGN_SYSTEM.md, nie nowy hex.
  const accent = isDark ? "#9b8cff" : "#5b4ee0";
  const { data: history, isLoading } = useTaskHistory(taskId);
  const { data: statuses } = useTaskStatuses();
  const { data: categories } = useCategories();
  const getActiveWorkspace = useWorkspaceStore((s) => s.getActiveWorkspace);
  const members = getActiveWorkspace()?.assignedUsers ?? [];

  const entries = useMemo(
    () => [...(history ?? [])].sort((a, b) => b.versionNumber - a.versionNumber),
    [history],
  );

  function authorName(userId: string): string {
    const member = members.find((m) => m.userId === userId);
    return member?.fullName || member?.email || t("history.unknownAuthor");
  }

  /**
   * Czas względny bez Intl.RelativeTimeFormat — nie jest gwarantowany
   * w Hermesie, a zakresy PL/EN da się pokryć kluczami bez odmiany przez liczbę.
   */
  function relativeTime(iso: string): string {
    const date = parseUtcDateTime(iso);
    if (Number.isNaN(date.getTime())) return iso;
    const minutes = Math.round((Date.now() - date.getTime()) / 60000);
    if (minutes < 1) return t("history.justNow");
    if (minutes < 60) return t("history.minutesAgo", { n: String(minutes) });
    const hours = Math.round(minutes / 60);
    if (hours < 24) return t("history.hoursAgo", { n: String(hours) });
    const days = Math.round(hours / 24);
    if (days === 1) return t("history.yesterday");
    if (days < 7) return t("history.daysAgo", { n: String(days) });
    return date.toLocaleDateString(locale, {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function absoluteTime(iso: string): string {
    const date = parseUtcDateTime(iso);
    if (Number.isNaN(date.getTime())) return iso;
    return date.toLocaleDateString(locale, {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  type FormattedValue = {
    text: string;
    color?: string;
    muted?: boolean;
    priority?: TaskPriority;
  };

  /** Wartość + opcjonalny kolor semantyczny (tylko priorytet, status, kategoria). */
  function formatValue(field: string, raw: string): FormattedValue {
    if (!raw) return { text: t("history.noValue"), muted: true };
    switch (field) {
      case "DueDateTime": {
        // Termin jest lokalnym wall-clockiem (ToString("o") bez offsetu),
        // więc tu new Date() jest poprawne — inaczej niż dla HistoryDate.
        const date = new Date(raw);
        if (Number.isNaN(date.getTime())) return { text: raw };
        return {
          text: date.toLocaleDateString(locale, {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
      }
      case "EstimatedDuration": {
        const minutes = Number(raw);
        return {
          text: Number.isFinite(minutes) ? formatDuration(minutes) : raw,
        };
      }
      case "Priority": {
        const priority = toPriority(raw);
        return { text: t(PRIORITY_LABEL_KEY[priority]), priority };
      }
      case "Status": {
        const status = statuses?.find((s) => s.name === raw);
        return {
          text: raw,
          color: status
            ? getCategoryDisplayColor(status.color, isDark)
            : undefined,
        };
      }
      case "Category": {
        const category = categories?.find((c) => c.name === raw);
        return {
          text: raw,
          color: category
            ? getCategoryDisplayColor(category.color, isDark)
            : undefined,
        };
      }
      default:
        return { text: raw };
    }
  }

  if (isLoading) {
    return (
      <View className="gap-3">
        {[0, 1, 2].map((i) => (
          <View
            key={i}
            className="bg-surface-container-low rounded-xl border border-outline-variant"
            style={{ height: i === 0 ? 96 : 72 }}
          />
        ))}
      </View>
    );
  }

  if (entries.length === 0) {
    return (
      <View className="py-6">
        <EmptyState
          title={t("history.empty")}
          description={t("history.emptyDesc")}
        />
      </View>
    );
  }

  const changeCount = entries.reduce((sum, e) => sum + e.records.length, 0);

  return (
    <View className="gap-3">
      <Text className="text-text-tertiary font-label text-[11px] uppercase tracking-widest">
        {t("history.summary", {
          versions: String(entries.length),
          changes: String(changeCount),
          last: relativeTime(entries[0].historyDate),
        })}
      </Text>

      {/* Oś czasu: pionowa linia + kropka na każdą wersję */}
      <View className="pl-6 relative">
        <View
          className="absolute w-px"
          style={{ left: 5, top: 8, bottom: 8, backgroundColor: ui.border }}
        />

        {entries.map((entry, index) => {
          const isCurrent = index === 0;
          const created = entry.action === "CREATE";
          const records = [...entry.records].sort(
            (a, b) => FIELD_ORDER.indexOf(a.field) - FIELD_ORDER.indexOf(b.field),
          );

          return (
            <View key={entry.historyId} className="relative mb-3">
              <View
                className="absolute rounded-full"
                style={{
                  left: -24,
                  top: 16,
                  width: 11,
                  height: 11,
                  backgroundColor: isCurrent ? accent : ui.surface,
                  borderWidth: isCurrent ? 0 : 1,
                  borderColor: ui.borderHover,
                }}
              />

              <View className="bg-surface-container-lowest rounded-xl border border-outline-variant px-4 py-3.5">
                <View className="flex-row items-center gap-2.5 flex-wrap mb-3">
                  <View
                    className={`px-1.5 py-0.5 rounded-sm ${
                      isCurrent ? "bg-inverse-surface" : "bg-surface-container-low"
                    }`}
                  >
                    <Text
                      className={`font-label text-[11px] ${
                        isCurrent ? "text-inverse-on-surface" : "text-on-surface"
                      }`}
                    >
                      v{entry.versionNumber}
                    </Text>
                  </View>

                  {isCurrent ? (
                    <View
                      className="px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: ui.selectedBg }}
                    >
                      <Text
                        className="font-label text-[11px]"
                        style={{ color: accent }}
                      >
                        {t("history.badgeCurrent")}
                      </Text>
                    </View>
                  ) : (
                    <View className="px-2 py-0.5 rounded-full bg-surface-container-low border border-outline-variant">
                      <Text className="font-label text-[11px] text-on-surface-variant">
                        {t(
                          created
                            ? "history.badgeCreated"
                            : "history.badgeEdited",
                        )}
                      </Text>
                    </View>
                  )}

                  <Avatar fullName={authorName(entry.userId)} size="sm" />
                  <Text className="text-on-surface font-headline text-sm">
                    {authorName(entry.userId)}
                  </Text>
                  <Text
                    className="text-text-tertiary font-body text-xs"
                    accessibilityLabel={absoluteTime(entry.historyDate)}
                  >
                    · {relativeTime(entry.historyDate)}
                  </Text>
                </View>

                <View className="gap-2">
                  {records.map((record) => {
                    const meta = FIELD_META[record.field];
                    const label = meta ? t(meta.labelKey) : record.field;
                    const prev = formatValue(record.field, record.prevValue);
                    const next = formatValue(record.field, record.nextValue);
                    const stacked = LONG_TEXT_FIELDS.has(record.field);

                    return (
                      <View
                        key={record.recordId}
                        className={
                          stacked ? "gap-1" : "flex-row items-center gap-2.5"
                        }
                      >
                        <View className="flex-row items-center gap-2.5">
                          <MaterialIcons
                            name={meta?.icon ?? "edit"}
                            size={14}
                            color={ui.textMuted}
                          />
                          <Text
                            className="text-text-tertiary font-label text-[11px] uppercase tracking-widest"
                            style={{ width: stacked ? undefined : 120 }}
                          >
                            {label}
                          </Text>
                        </View>

                        <View
                          className={
                            stacked
                              ? "gap-1 pl-6"
                              : "flex-row items-center gap-2 flex-1 flex-wrap"
                          }
                        >
                          <View
                            className="px-2 py-0.5 rounded-sm bg-background border border-outline-variant"
                            style={
                              stacked ? { alignSelf: "flex-start" } : undefined
                            }
                          >
                            <Text
                              className={`font-body text-xs ${
                                prev.muted
                                  ? "text-text-tertiary"
                                  : prev.priority
                                    ? PRIORITY_TEXT[prev.priority]
                                    : "text-on-surface-variant"
                              }`}
                              style={prev.color ? { color: prev.color } : undefined}
                              numberOfLines={stacked ? 3 : 1}
                            >
                              {prev.text}
                            </Text>
                          </View>

                          <MaterialIcons
                            name={stacked ? "south" : "east"}
                            size={14}
                            color={ui.textMuted}
                          />

                          <View
                            className="px-2 py-0.5 rounded-sm bg-surface border border-outline"
                            style={
                              stacked ? { alignSelf: "flex-start" } : undefined
                            }
                          >
                            <Text
                              className={`font-headline text-xs ${
                                next.muted
                                  ? "text-text-tertiary"
                                  : next.priority
                                    ? PRIORITY_TEXT[next.priority]
                                    : "text-on-surface"
                              }`}
                              style={next.color ? { color: next.color } : undefined}
                              numberOfLines={stacked ? 4 : 1}
                            >
                              {next.text}
                            </Text>
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            </View>
          );
        })}
      </View>

      <Text className="text-text-tertiary font-body text-xs">
        {t("history.footnote")}
      </Text>
    </View>
  );
}
