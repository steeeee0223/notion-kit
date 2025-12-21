"use client";

import { DndContext, DragOverlay } from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import { createPortal } from "react-dom";

import { Icon } from "@notion-kit/icons";
import { Button } from "@notion-kit/shadcn";

import { TableViewMenuPage } from "../features";
import { useTableViewCtx } from "../table-contexts";
import { BoardCard } from "./board-card";
import { BoardGroup } from "./board-group";
import { useBoardDnd } from "./use-board-dnd";

export function BoardViewContent() {
  const { table } = useTableViewCtx();
  const { activeId, activeGroupId, props } = useBoardDnd();

  const groupedRowsById = table.getGroupedRowModel().rowsById;
  const { grouping, groupingState } = table.getState();

  return (
    <div data-slot="notion-board-view" className="relative float-start px-24">
      <div className="contain-layout">
        <div
          data-block-id="1fe35e0f-492c-80fd-8d7c-f7e953641770"
          className="relative flex min-w-full grow py-2"
        >
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
          <DndContext {...props}>
            <SortableContext items={groupingState.groupOrder}>
              <div className="flex gap-3">
                {groupingState.groupOrder.map((groupId) => {
                  const row =
                    groupedRowsById[groupId] ??
                    table.getPlaceholderGroupedRow(groupId);
                  return <BoardGroup key={groupId} row={row} />;
                })}
              </div>
            </SortableContext>
            {createPortal(
              <DragOverlay dropAnimation={null}>
                {activeId && !activeGroupId && (
                  <BoardCard row={table.getRow(activeId)} overlay />
                )}
              </DragOverlay>,
              document.body,
            )}
          </DndContext>
        </div>
      </div>
    </div>
  );
}
