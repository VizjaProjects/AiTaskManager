import type { TaskStatus } from "@/lib/types";

/** Canonical default kanban order when user has not reordered columns. */
export function getDefaultStatusSortRank(name: string): number {
  const n = name.trim().toLowerCase();
  if (n === "to do" || n === "todo" || n === "do zrobienia") return 0;
  if (n.includes("progress") || n === "w toku" || n === "in progress") return 1;
  if (n === "cancelled" || n === "canceled" || n === "anulowane") return 2;
  if (
    n === "completed" ||
    n === "complete" ||
    n === "done" ||
    n === "zakończone" ||
    n === "ukończone"
  )
    return 3;
  return 100;
}

export function sortStatusesByDefaultOrder<T extends { name: string; statusId: string }>(
  statuses: T[],
): T[] {
  return [...statuses].sort((a, b) => {
    const rankDiff =
      getDefaultStatusSortRank(a.name) - getDefaultStatusSortRank(b.name);
    if (rankDiff !== 0) return rankDiff;
    return a.name.localeCompare(b.name, "pl");
  });
}
