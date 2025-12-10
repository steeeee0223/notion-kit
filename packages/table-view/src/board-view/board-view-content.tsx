"use client";

import React from "react";
import {
  closestCorners,
  DndContext,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { Icon } from "@notion-kit/icons";
import { Button } from "@notion-kit/shadcn";

import { TableViewMenuPage } from "../features";
import { useTableViewCtx } from "../table-contexts";
import { BoardGroup } from "./board-group";

export function BoardViewContent() {
  const { table } = useTableViewCtx();

  const [_draggedRowId, setDraggedRowId] = React.useState<string | null>(null);

  const rows = table.getRowModel().rows;
  const { grouping, groupingState } = table.getState();

  const handleDragStart = (e: DragStartEvent) => {
    const { data } = e.active;
    if (data.current?.type === "board-card") {
      setDraggedRowId(e.active.id.toString());
    }
  };

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;

    setDraggedRowId(null);
    if (over) {
      const activeData = active.data.current;
      // Handle group reordering
      if (activeData?.type === "board-group") {
        table.handleGroupedRowDragEnd(e);
        return;
      }
      // Handle card reordering
      if (activeData?.type === "board-card") {
        table.handleRowDragEnd(e);
        return;
      }
    }
  };

  const groupedRows = rows.filter((row) => row.getIsGrouped());

  return (
    <div data-slot="notion-board-view" className="relative float-start px-24">
      <div className="absolute z-999 w-full" />
      <div className="pointer-events-none mt-0 h-0" />
      <div className="contain-layout">
        <div
          data-block-id="1fe35e0f-492c-80fd-8d7c-f7e953641770"
          key="notion-selectable notion-collection_view-block"
          className="relative flex grow pb-0"
        >
          <div className="absolute z-850 flex min-w-full bg-main pt-2 shadow-md">
            {grouping.length === 0 && (
              <div className="flex justify-center">
                <Button
                  size="sm"
                  className="text-secondary"
                  onClick={() =>
                    table.setTableMenuState({
                      open: true,
                      page: TableViewMenuPage.SelectGroupBy,
                    })
                  }
                >
                  <Icon.SquareGridBelowLines />
                  Select a grouping property
                </Button>
              </div>
            )}
            <DndContext
              collisionDetection={closestCorners}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={groupingState.groupOrder}
                strategy={verticalListSortingStrategy}
              >
                <div className="flex gap-3">
                  {groupedRows.map((row) => (
                    <BoardGroup key={row.id} row={row} />
                  ))}
                </div>
                {/* <DragOverlay>
                  {draggedRowId && (
                    <BoardCard row={table.getRow(draggedRowId)} />
                  )}
                </DragOverlay> */}
              </SortableContext>
            </DndContext>
          </div>
        </div>
      </div>
    </div>
  );
}
