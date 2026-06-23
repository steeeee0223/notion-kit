import type { Updater } from "@tanstack/react-table";

import { insertAt } from "../lib/utils";
import type { ComparableValue } from "../plugins";

export function createIdsUpdater(
  targetId: string,
  at?: { id: string; side: "left" | "right" },
): Updater<string[]> {
  return (prev) => {
    if (at === undefined) return [...prev, targetId];
    const idx = prev.indexOf(at.id);
    return at.side === "right"
      ? insertAt(prev, targetId, idx + 1)
      : insertAt(prev, targetId, idx);
  };
}

export function reorderByIds<T>(
  items: T[],
  orderedIds: string[],
  selector: (item: T) => string,
): T[] {
  if (new Set(orderedIds).size !== orderedIds.length) return items;

  const itemsById = new Map(items.map((item) => [selector(item), item]));
  if (orderedIds.some((id) => !itemsById.has(id))) return items;

  const ordered = orderedIds.map((id) => itemsById.get(id)!);
  const orderedSet = new Set(orderedIds);
  let index = 0;

  return items.map((item) =>
    orderedSet.has(selector(item)) ? ordered[index++]! : item,
  );
}

export function createGroupId(colId: string, value: ComparableValue): string {
  return `${colId}:${String(value)}`;
}
