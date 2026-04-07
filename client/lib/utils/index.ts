import { TaskPriority } from "../types";

export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  [TaskPriority.CRITICAL]: "#dc2626",
  [TaskPriority.HIGH]: "#f43f5e",
  [TaskPriority.MEDIUM]: "#f59e0b",
  [TaskPriority.LOW]: "#3b82f6",
};

export const PRIORITY_COLORS_DARK: Record<TaskPriority, string> = {
  [TaskPriority.CRITICAL]: "#f87171",
  [TaskPriority.HIGH]: "#fb7185",
  [TaskPriority.MEDIUM]: "#fbbf24",
  [TaskPriority.LOW]: "#60a5fa",
};

export const PRIORITY_BG: Record<TaskPriority, string> = {
  [TaskPriority.CRITICAL]: "bg-red-600",
  [TaskPriority.HIGH]: "bg-rose-500",
  [TaskPriority.MEDIUM]: "bg-amber-500",
  [TaskPriority.LOW]: "bg-blue-500",
};

export const PRIORITY_BORDER: Record<TaskPriority, string> = {
  [TaskPriority.CRITICAL]: "border-l-4 border-red-600",
  [TaskPriority.HIGH]: "border-l-4 border-rose-500",
  [TaskPriority.MEDIUM]: "border-l-4 border-amber-500",
  [TaskPriority.LOW]: "border-l-4 border-blue-500",
};

export const PRIORITY_BADGE_BG: Record<TaskPriority, string> = {
  [TaskPriority.CRITICAL]: "bg-red-600/10 dark:bg-red-600/25",
  [TaskPriority.HIGH]: "bg-rose-500/10 dark:bg-rose-500/25",
  [TaskPriority.MEDIUM]: "bg-amber-500/10 dark:bg-amber-500/25",
  [TaskPriority.LOW]: "bg-blue-500/10 dark:bg-blue-500/25",
};

export const PRIORITY_TEXT: Record<TaskPriority, string> = {
  [TaskPriority.CRITICAL]: "text-red-600 dark:text-red-400",
  [TaskPriority.HIGH]: "text-rose-500 dark:text-rose-400",
  [TaskPriority.MEDIUM]: "text-amber-500 dark:text-amber-400",
  [TaskPriority.LOW]: "text-blue-500 dark:text-blue-400",
};

export const DEFAULT_CATEGORY_COLORS = [
  "#dc2626",
  "#f43f5e",
  "#a855f7",
  "#4d41df",
  "#3b82f6",
  "#06b6d4",
  "#006b58",
  "#10b981",
  "#84cc16",
  "#f59e0b",
  "#f97316",
  "#78716c",
];

const CATEGORY_COLOR_DARK_MAP: Record<string, string> = {
  "#dc2626": "#f87171",
  "#f43f5e": "#fb7185",
  "#a855f7": "#c084fc",
  "#4d41df": "#818cf8",
  "#3b82f6": "#60a5fa",
  "#06b6d4": "#22d3ee",
  "#006b58": "#34d399",
  "#10b981": "#34d399",
  "#84cc16": "#a3e635",
  "#f59e0b": "#fbbf24",
  "#f97316": "#fb923c",
  "#78716c": "#a8a29e",
};

export function getCategoryDisplayColor(
  color: string,
  isDark: boolean,
): string {
  if (!isDark) return color;
  return CATEGORY_COLOR_DARK_MAP[color.toLowerCase()] ?? color;
}

export function formatDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "short",
  });
}

export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

export function isOverdue(dueDateTime: string | null): boolean {
  if (!dueDateTime) return false;
  return new Date(dueDateTime) < new Date();
}

export function isDueToday(dueDateTime: string | null): boolean {
  if (!dueDateTime) return false;
  const due = new Date(dueDateTime);
  const today = new Date();
  return (
    due.getFullYear() === today.getFullYear() &&
    due.getMonth() === today.getMonth() &&
    due.getDate() === today.getDate()
  );
}

export function getInitials(fullName: string): string {
  return fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
