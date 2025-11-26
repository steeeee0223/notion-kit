"use client";

import { useState } from "react";
import {
  flexRender,
  type Column,
  type Row as RowModel,
  type Table,
} from "@tanstack/react-table";

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
  table: Table<Row<TPlugin[]>>;
}

export function TableRowCell<TPlugin extends CellPlugin>({
  column,
  row,
  table,
}: TableRowCellProps<TPlugin>) {
  const [mode] = useState<CellMode>(CellMode.Normal);

  const { locked } = table.getTableGlobalState();
  const data = row.original.properties[column.id];

  const width = column.getWidth();
  const info = column.getInfo() as ColumnInfo<TPlugin>;
  const plugin = column.getPlugin() as TPlugin;

  if (!data) return null;
  return (
    <div
      id="notion-table-view-cell"
      data-row-index={`${row.depth}:${row.index}`}
      data-col-index={column.getIndex()}
      className="relative flex h-full border-r border-r-border-cell"
      style={{ width }}
    >
      {row.subRows.length > 0 && (
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
        {flexRender<InferCellProps<TPlugin>>(plugin.renderCell, {
          propId: column.id,
          row: row.original,
          data: data.value,
          config: info.config,
          wrapped: info.wrapped,
          disabled: locked,
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
