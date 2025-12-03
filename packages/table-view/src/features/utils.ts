import type { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import type { Updater } from "@tanstack/react-table";

import { insertAt } from "../lib/utils";

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

export function createDragEndUpdater<T>(
  e: DragEndEvent,
  selector: (item: T) => string,
): Updater<T[]> {
  return (prev) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return prev;
    const indexes = prev.reduce(
      (acc, item, idx) => {
        if (selector(item) === active.id) acc.old = idx;
        if (selector(item) === over.id) acc.new = idx;
        return acc;
      },
      { old: -1, new: -1 },
    );
    return arrayMove(prev, indexes.old, indexes.new);
  };
}
