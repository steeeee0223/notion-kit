"use client";

import { useMemo, useState } from "react";

import type { CellPlugin, CellProps, InferConfig, InferData } from "../plugins";

enum CellMode {
  Normal = "normal",
  Edit = "edit",
  Select = "select",
}

interface TableRowCellProps<TPlugin extends CellPlugin>
  extends CellProps<InferData<TPlugin>, InferConfig<TPlugin>> {
  plugin: TPlugin;
  rowIndex: number;
  colIndex: number;
  width?: string;
}

export function TableRowCell<TPlugin extends CellPlugin>({
  plugin,
  rowIndex,
  colIndex,
  width,
  ...cellProps
}: TableRowCellProps<TPlugin>) {
  const [mode] = useState<CellMode>(CellMode.Normal);

  const cell = useMemo(() => plugin.renderCell(cellProps), [cellProps, plugin]);

  return (
    <div
      id="notion-table-view-cell"
      data-row-index={rowIndex}
      data-col-index={colIndex}
      className="relative flex h-full border-r border-r-border-cell"
      style={{ width }}
    >
      <div className="flex h-full overflow-x-clip" style={{ width }}>
        {cell}
      </div>
      {mode === CellMode.Select && (
        <div className="pointer-events-none absolute top-0 left-0 z-[840] h-full w-full rounded-[3px] bg-blue/5 shadow-cell-focus" />
      )}
    </div>
  );
}
