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
