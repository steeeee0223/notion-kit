"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  closestCenter,
  getFirstCollision,
  MeasuringStrategy,
  pointerWithin,
  rectIntersection,
  type CollisionDetection,
  type DndContextProps,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";

import { useDndSensors } from "../common";
import { useTableViewCtx } from "../table-contexts";

interface UseBoardDndResult {
  activeId: string | null;
  activeGroupId: string | null;
  props: DndContextProps;
}

export function useBoardDnd(): UseBoardDndResult {
  const { table } = useTableViewCtx();
  const sensors = useDndSensors();

  const { groupOrder } = table.getState().groupingState;
  const rows = table.getRowModel().rowsById;

  const [activeId, setActiveId] = useState<string | null>(null);
  const lastOverId = useRef<string | null>(null);
  const recentlyMovedToNewContainer = useRef(false);

  // Build items map for collision detection
  const items = useMemo(() => {
    return groupOrder.reduce<Record<string, string[]>>((acc, groupId) => {
      const row = rows[groupId];
      acc[groupId] = row?.subRows.map((subRow) => subRow.id) ?? [];
      return acc;
    }, {});
  }, [groupOrder, rows]);
  const activeGroupId = activeId && activeId in items ? activeId : null;

  const findContainer = useCallback(
    (id: UniqueIdentifier) => {
      if (id in items) return id;
      return Object.keys(items).find((key) =>
        items[key]?.includes(id.toString()),
      );
    },
    [items],
  );

  /**
   * Custom collision detection strategy optimized for multiple containers
   * Based on dnd-kit's MultipleContainers example
   */
  const collisionDetectionStrategy: CollisionDetection = useCallback(
    (args) => {
      // If dragging a group, use closestCenter for group containers only
      if (activeGroupId) {
        return closestCenter({
          ...args,
          droppableContainers: args.droppableContainers.filter(
            (container) => container.id in items,
          ),
        });
      }

      // Start by finding any intersecting droppable
      const pointerIntersections = pointerWithin(args);
      const intersections =
        pointerIntersections.length > 0
          ? pointerIntersections
          : rectIntersection(args);
      let overId = getFirstCollision(intersections, "id");

      if (overId !== null) {
        if (overId in items) {
          const containerItems = items[overId];

          // If a container is matched and it contains items
          if (containerItems && containerItems.length > 0) {
            const collisions = closestCenter({
              ...args,
              droppableContainers: args.droppableContainers.filter(
                (container) =>
                  container.id !== overId &&
                  containerItems.includes(String(container.id)),
              ),
            });
            // Return the closest droppable within that container
            overId = collisions[0]?.id ?? null;
          }
        }

        lastOverId.current = overId ? String(overId) : null;
        return overId ? [{ id: overId }] : [];
      }

      // When a draggable item moves to a new container, the layout may shift
      if (recentlyMovedToNewContainer.current) {
        lastOverId.current = activeId;
      }

      // If no droppable is matched, return the last match
      return lastOverId.current ? [{ id: lastOverId.current }] : [];
    },
    [activeGroupId, activeId, items],
  );

  const handleDragStart = useCallback((e: DragStartEvent) => {
    setActiveId(e.active.id.toString());
  }, []);

  const handleDragOver = useCallback(
    (e: DragOverEvent) => {
      const { active, over } = e;
      if (!over || active.id in items) return;
      const overContainer = findContainer(over.id);
      const activeContainer = findContainer(active.id);

      if (
        !overContainer ||
        !activeContainer ||
        activeContainer === overContainer
      )
        return;

      // Handle cross-group dragging
      recentlyMovedToNewContainer.current = true;
    },
    [findContainer, items],
  );

  const handleDragEnd = useCallback(
    (e: DragEndEvent) => {
      const { active, over } = e;
      setActiveId(null);
      if (!over) return;

      const activeData = active.data.current;
      // Handle group reordering
      if (activeData?.type === "board-group") {
        table.handleGroupedRowDragEnd(e);
        return;
      }
      // Handle card reordering
      if (activeData?.type === "board-card") {
        table.handleRowDragEnd(e);
      }
    },
    [table],
  );

  useEffect(() => {
    requestAnimationFrame(() => {
      recentlyMovedToNewContainer.current = false;
    });
  }, [items]);

  return {
    activeId,
    activeGroupId,
    props: {
      sensors,
      measuring: {
        droppable: {
          strategy: MeasuringStrategy.Always,
        },
      },
      collisionDetection: collisionDetectionStrategy,
      onDragStart: handleDragStart,
      onDragOver: handleDragOver,
      onDragEnd: handleDragEnd,
    },
  };
}
