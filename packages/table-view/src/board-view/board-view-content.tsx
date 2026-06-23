"use client";

import { DragDropProvider, DragOverlay } from "@dnd-kit/react";
import { createPortal } from "react-dom";

import { Icon } from "@notion-kit/icons";
import { Button } from "@notion-kit/ui/primitives";

import { TableViewMenuPage } from "../features";
import { useTableViewCtx } from "../table-contexts";
import { BoardCardContent } from "./board-card";
import { BoardGroup } from "./board-group";
import { useBoardDnd } from "./use-board-dnd";

export function BoardViewContent() {
  const { table } = useTableViewCtx();
  const { activeCardId, groupOrder, items, providerProps } = useBoardDnd();
  const groupedRowsById = table.getGroupedRowModel().rowsById;
  const { grouping } = table.getState();
  const activeRow = activeCardId ? groupedRowsById[activeCardId] : undefined;

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
          <DragDropProvider {...providerProps}>
            <div className="flex gap-3">
              {groupOrder.map((groupId, index) => {
                const row =
                  groupedRowsById[groupId] ??
                  table.getPlaceholderGroupedRow(groupId);
                return (
                  <BoardGroup
                    key={groupId}
                    row={row}
                    index={index}
                    itemIds={items[groupId] ?? []}
                  />
                );
              })}
            </div>
            {typeof document !== "undefined" &&
              createPortal(
                <DragOverlay dropAnimation={null}>
                  {activeRow && <BoardCardContent row={activeRow} overlay />}
                </DragOverlay>,
                document.body,
              )}
          </DragDropProvider>
        </div>
      </div>
    </div>
  );
}
