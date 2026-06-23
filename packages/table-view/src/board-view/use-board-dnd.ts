"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type { UniqueIdentifier } from "@dnd-kit/abstract";
import { PointerActivationConstraints, PointerSensor } from "@dnd-kit/dom";
import { move } from "@dnd-kit/helpers";
import {
  DragDropProvider,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/react";

import { useTableViewCtx } from "../table-contexts";
import {
  createBoardItems,
  findBoardGroup,
  flattenBoardItems,
  haveSameBoardItems,
  haveSameBoardItemSet,
  moveBoardItems,
  type BoardItems,
} from "./board-dnd-state";

const boardSensors: React.ComponentProps<typeof DragDropProvider>["sensors"] = (
  defaults,
) => [
  ...defaults.filter((sensor) => sensor !== PointerSensor),
  PointerSensor.configure({
    activationConstraints: [
      new PointerActivationConstraints.Distance({ value: 5 }),
    ],
  }),
];

function haveSameIds(a: UniqueIdentifier[], b: UniqueIdentifier[]) {
  return (
    a.length === b.length &&
    new Set(a).size === a.length &&
    new Set(b).size === b.length &&
    a.every((id) => b.includes(id))
  );
}

interface UseBoardDndResult {
  activeCardId: string | null;
  groupOrder: string[];
  items: BoardItems;
  providerProps: Omit<
    React.ComponentProps<typeof DragDropProvider>,
    "children"
  >;
}

export function useBoardDnd(): UseBoardDndResult {
  const { table } = useTableViewCtx();
  const groupedRowsById = table.getGroupedRowModel().rowsById;
  const groupOrder = table.getState().groupingState.groupOrder;
  const derivedItems = useMemo(
    () => createBoardItems(groupOrder, groupedRowsById),
    [groupOrder, groupedRowsById],
  );

  const [items, setItems] = useState(derivedItems);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const itemsRef = useRef(items);
  const snapshotRef = useRef<BoardItems | null>(null);
  const sourceGroupRef = useRef<string | null>(null);

  const updateItems = useCallback((next: BoardItems) => {
    itemsRef.current = next;
    setItems(next);
  }, []);

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { source } = event.operation;
      if (source?.type !== "board-card") return;

      const sourceId = String(source.id);
      itemsRef.current = derivedItems;
      setItems(derivedItems);
      snapshotRef.current = derivedItems;
      sourceGroupRef.current = findBoardGroup(derivedItems, sourceId) ?? null;
      setActiveCardId(sourceId);
    },
    [derivedItems],
  );

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      if (event.operation.source?.type !== "board-card") return;
      const next = moveBoardItems(itemsRef.current, event);
      if (next !== itemsRef.current) updateItems(next);
    },
    [updateItems],
  );

  const finishCardDrag = useCallback(
    (event: DragEndEvent) => {
      const { canceled, source, target } = event.operation;
      const snapshot = snapshotRef.current;
      const sourceGroupId = sourceGroupRef.current;

      if (!snapshot || !source || !sourceGroupId) {
        updateItems(derivedItems);
        return;
      }

      if (canceled) {
        updateItems(
          haveSameBoardItemSet(snapshot, derivedItems)
            ? snapshot
            : derivedItems,
        );
        return;
      }

      const sourceId = String(source.id);
      const targetId = target ? String(target.id) : null;
      const targetIsCurrent =
        target !== null &&
        (target.type === "board-list"
          ? typeof target.data.groupId === "string" &&
            derivedItems[target.data.groupId] !== undefined
          : targetId !== null &&
            findBoardGroup(derivedItems, targetId) !== undefined);

      if (
        !targetIsCurrent ||
        findBoardGroup(derivedItems, sourceId) === undefined ||
        !haveSameBoardItems(snapshot, derivedItems)
      ) {
        updateItems(derivedItems);
        return;
      }

      const finalItems = moveBoardItems(itemsRef.current, event);
      if (!haveSameBoardItemSet(derivedItems, finalItems)) {
        updateItems(derivedItems);
        return;
      }

      const destinationGroupId = findBoardGroup(finalItems, sourceId);
      if (!destinationGroupId) {
        updateItems(derivedItems);
        return;
      }

      updateItems(finalItems);
      table.handleRowOrderChange(
        flattenBoardItems(finalItems, groupOrder),
        destinationGroupId === sourceGroupId
          ? undefined
          : { rowId: sourceId, groupId: destinationGroupId },
      );
    },
    [derivedItems, groupOrder, table, updateItems],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { source, target } = event.operation;

      if (source?.type === "board-card") {
        finishCardDrag(event);
      } else if (
        !event.canceled &&
        source?.type === "board-group" &&
        target?.type === "board-group"
      ) {
        const nextGroupOrder = move(groupOrder, event).map(String);
        if (haveSameIds(groupOrder, nextGroupOrder)) {
          table.handleGroupedRowOrderChange(nextGroupOrder);
        }
      }

      setActiveCardId(null);
      snapshotRef.current = null;
      sourceGroupRef.current = null;
    },
    [finishCardDrag, groupOrder, table],
  );

  return {
    activeCardId,
    groupOrder,
    items: activeCardId === null ? derivedItems : items,
    providerProps: {
      sensors: boardSensors,
      onDragStart: handleDragStart,
      onDragOver: handleDragOver,
      onDragEnd: handleDragEnd,
    },
  };
}
