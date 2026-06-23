import { move } from "@dnd-kit/helpers";
import type { DragEndEvent, DragOverEvent } from "@dnd-kit/react";

export type BoardItems = Record<string, string[]>;

interface GroupedRowLike {
  subRows: { id: string }[];
}

export function createBoardItems(
  groupOrder: string[],
  rowsById: Record<string, GroupedRowLike | undefined>,
): BoardItems {
  return Object.fromEntries(
    groupOrder.map((groupId) => [
      groupId,
      rowsById[groupId]?.subRows.map((row) => row.id) ?? [],
    ]),
  );
}

export function findBoardGroup(items: BoardItems, itemId: string) {
  return Object.keys(items).find((groupId) => items[groupId]?.includes(itemId));
}

export function flattenBoardItems(items: BoardItems, groupOrder: string[]) {
  return groupOrder.flatMap((groupId) => items[groupId] ?? []);
}

export function haveSameBoardItems(a: BoardItems, b: BoardItems) {
  const aGroups = Object.keys(a);
  const bGroups = Object.keys(b);

  return (
    aGroups.length === bGroups.length &&
    aGroups.every((groupId) => {
      const aItems = a[groupId];
      const bItems = b[groupId];
      return (
        aItems !== undefined &&
        bItems !== undefined &&
        aItems.length === bItems.length &&
        aItems.every((itemId, index) => itemId === bItems[index])
      );
    })
  );
}

export function haveSameBoardItemSet(a: BoardItems, b: BoardItems) {
  const aItems = Object.values(a).flat();
  const bItems = Object.values(b).flat();
  const aSet = new Set(aItems);
  const bSet = new Set(bItems);

  return (
    aItems.length === aSet.size &&
    bItems.length === bSet.size &&
    aSet.size === bSet.size &&
    [...aSet].every((itemId) => bSet.has(itemId))
  );
}

export function moveBoardItems(
  items: BoardItems,
  event: DragOverEvent | DragEndEvent,
) {
  const { source, target } = event.operation;
  if (!source || !target) return items;

  const sourceId = String(source.id);
  const sourceGroupId = findBoardGroup(items, sourceId);
  if (!sourceGroupId) return items;

  const moved = move(items, event);
  if (moved !== items && haveSameBoardItemSet(items, moved)) return moved;

  const targetGroupId: unknown = target.data.groupId;
  if (
    target.type !== "board-list" ||
    typeof targetGroupId !== "string" ||
    items[targetGroupId] === undefined
  ) {
    return items;
  }

  const sourceItems = items[sourceGroupId];
  if (!sourceItems) return items;

  const next = {
    ...items,
    [sourceGroupId]: sourceItems.filter((itemId) => itemId !== sourceId),
    [targetGroupId]: [
      ...(sourceGroupId === targetGroupId
        ? sourceItems.filter((itemId) => itemId !== sourceId)
        : items[targetGroupId]),
      sourceId,
    ],
  };

  return haveSameBoardItemSet(items, next) ? next : items;
}
