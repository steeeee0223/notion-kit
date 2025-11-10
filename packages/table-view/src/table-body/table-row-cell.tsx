"use client";

import { useState } from "react";
import {
  flexRender,
  functionalUpdate,
  type Column,
  type Row as RowModel,
} from "@tanstack/react-table";

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
}

export function TableRowCell<TPlugin extends CellPlugin>({
  column,
  row,
}: TableRowCellProps<TPlugin>) {
  const [mode] = useState<CellMode>(CellMode.Normal);

  const cell = row.original.properties[column.id];

  const width = column.getWidth();
  const info = column.getInfo() as ColumnInfo<TPlugin>;
  const plugin = column.getPlugin() as TPlugin;

  if (!cell) return null;
  return (
    <div
      id="notion-table-view-cell"
      data-row-index={row.index}
      data-col-index={column.getIndex()}
      className="relative flex h-full border-r border-r-border-cell"
      style={{ width }}
    >
      <div className="flex h-full overflow-x-clip" style={{ width }}>
        {flexRender<InferCellProps<TPlugin>>(plugin.renderCell, {
          propId: column.id,
          row: row.original,
          data: cell.value,
          config: info.config,
          wrapped: info.wrapped,
          onChange: (updater) => column.updateCell(row.id, updater),
          onConfigChange: (updater) =>
            column.setInfo((prev) => ({
              ...prev,
              config: functionalUpdate(updater, prev.config),
            })),
        })}
      </div>
      {mode === CellMode.Select && (
        <div className="pointer-events-none absolute top-0 left-0 z-840 h-full w-full rounded-[3px] bg-blue/5 shadow-cell-focus" />
      )}
    </div>
  );
}
