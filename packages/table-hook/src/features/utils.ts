import type { Updater } from "@tanstack/react-table";

import { insertAt } from "@/lib/utils";
import type { ComparableValue } from "@/plugins";

export function createIdsUpdater(
  targetId: string,
  at?: { id: string; side: "left" | "right" },
): Updater<string[]> {
  return (prev) => {
    if (at === undefined) return [...prev, targetId];
    const idx = prev.indexOf(at.id);
    if (idx < 0) return [...prev, targetId];
    return at.side === "right"
      ? insertAt(prev, targetId, idx + 1)
      : insertAt(prev, targetId, idx);
  };
}

export function createGroupId(colId: string, value: ComparableValue): string {
  return `${colId}:${String(value)}`;
}
