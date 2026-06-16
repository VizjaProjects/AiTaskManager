import { EventStatus, type CalendarEvent } from "@/lib/types";

/** Default color for newly created events (same for every event until changed). */
export const DEFAULT_EVENT_COLOR = "#4d41df";

export const EVENT_COLOR_OPTIONS = [
  "#4d41df",
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#dc2626",
  "#a855f7",
  "#006b58",
  "#e11d48",
] as const;

const PROPOSED_EVENT_COLOR = "#f59e0b";

export function resolveEventColor(event: CalendarEvent): string {
  if (event.status === EventStatus.PROPOSED) return PROPOSED_EVENT_COLOR;
  const c = event.color?.trim();
  if (c && /^#[0-9a-fA-F]{6}$/.test(c)) return c;
  return DEFAULT_EVENT_COLOR;
}

export function eventColorWithAlpha(hex: string, alpha: number): string {
  const normalized = hex.replace("#", "");
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function eventPillStyle(hex: string, isDark: boolean) {
  return {
    bg: eventColorWithAlpha(hex, isDark ? 0.28 : 0.14),
    border: eventColorWithAlpha(hex, isDark ? 0.55 : 0.32),
    text: isDark ? "#f3f4f6" : hex,
  };
}
