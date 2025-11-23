"use client";

import { useState } from "react";
import {
  flexRender,
  type Cell,
  type Column,
  type Row as RowModel,
} from "@tanstack/react-table";

import { cn } from "@notion-kit/cn";
import { Icon } from "@notion-kit/icons";
import { Button } from "@notion-kit/shadcn";

import type { ColumnInfo, Row } from "../lib/types";
import type { CellPlugin, InferCellProps } from "../plugins";

enum CellMode {
  Normal = "normal",
  Edit = "edit",
  Select = "select",
}

interface TableRowCellProps<TPlugin extends CellPlugin> {
  column: Column<Row<TPlugin[]>>;
  row: RowModel<Row<TPlugin[]>>;
  cell: Cell<Row<TPlugin[]>, unknown>;
}

export function TableRowCell<TPlugin extends CellPlugin>({
  column,
  row,
  cell,
}: TableRowCellProps<TPlugin>) {
  const [mode] = useState<CellMode>(CellMode.Normal);

  const data = row.original.properties[column.id];

  const width = column.getWidth();
  const info = column.getInfo() as ColumnInfo<TPlugin>;
  const plugin = column.getPlugin() as TPlugin;

  if (!data) return;
  return (
    <div
      id="notion-table-view-cell"
      data-row-index={`${row.depth}:${row.index}`}
      data-col-index={column.getIndex()}
      className={cn(
        "relative flex h-full border-r border-r-border-cell",
        (cell.getIsGrouped() || cell.getIsAggregated()) && "border-0",
      )}
      style={{ width }}
    >
      {cell.getIsGrouped() && (
        <div className="mt-1.5 flex">
          <Button
            tabIndex={0}
            variant="hint"
            className="size-6"
            aria-expanded={row.getIsExpanded()}
            aria-label={row.getIsExpanded() ? "Close" : "Open"}
            onPointerDown={row.getToggleExpandedHandler()}
          >
            <Icon.ArrowCaretFillSmall
              className="size-[0.8em] fill-menu-icon transition-[rotate]"
              side={row.getIsExpanded() ? "down" : "right"}
            />
          </Button>
        </div>
      )}
      <div className="flex h-full overflow-x-clip" style={{ width }}>
        {!cell.getIsAggregated() &&
          flexRender<InferCellProps<TPlugin>>(plugin.renderCell, {
            propId: column.id,
            row: row.original,
            data: data.value,
            config: info.config,
            wrapped: info.wrapped,
            onChange: (updater) => column.updateCell(row.id, updater),
            onConfigChange: column.updateConfig,
          })}
      </div>
      {mode === CellMode.Select && (
        <div className="pointer-events-none absolute top-0 left-0 z-840 h-full w-full rounded-[3px] bg-blue/5 shadow-cell-focus" />
      )}
    </div>
  );
}

export function TableAggregatedCell<TPlugin extends CellPlugin>({
  column,
  row,
}: TableRowCellProps<TPlugin>) {
  const width = column.getWidth();
  return (
    <div
      id="notion-table-view-aggregated-cell"
      data-row-index={`${row.depth}:${row.index}`}
      data-col-index={column.getIndex()}
      className="relative flex h-full"
      style={{ width }}
    >
      <div className="flex h-full overflow-x-clip" style={{ width }} />
    </div>
  );
}
