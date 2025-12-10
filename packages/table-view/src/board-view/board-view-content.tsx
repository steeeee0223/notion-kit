"use client";

import { Icon } from "@notion-kit/icons";
import { Button } from "@notion-kit/shadcn";

import { VerticalDnd } from "../common";
import { TableViewMenuPage } from "../features";
import { useTableViewCtx } from "../table-contexts";
import { BoardGroup } from "./board-group";

export function BoardViewContent() {
  const { table } = useTableViewCtx();

  const rows = table.getRowModel().rows;
  const { grouping, groupingState } = table.getState();

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
          {/* 跳過中間的那串 div */}
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
            <VerticalDnd
              orientation="horizontal"
              items={groupingState.groupOrder}
              onDragEnd={table.handleGroupedRowDragEnd}
            >
              <div className="flex gap-3">
                {rows.map((row) => {
                  if (!row.getIsGrouped()) return null;
                  return <BoardGroup key={row.id} row={row} />;
                })}
              </div>
            </VerticalDnd>
          </div>
        </div>
      </div>
    </div>
  );
}
