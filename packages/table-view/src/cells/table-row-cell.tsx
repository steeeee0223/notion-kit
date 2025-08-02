"use client";

import { useMemo, useState } from "react";

import type { Cell } from "../lib/types";
import type { CellPlugin, InferConfig, InferData } from "../plugins";

enum CellMode {
  Normal = "normal",
  Edit = "edit",
  Select = "select",
}

interface TableRowCellProps<TPlugin extends CellPlugin> {
  plugin: TPlugin;
  rowIndex: number;
  colIndex: number;
  width?: string;
  wrapped?: boolean;
  propId: string;
  config?: InferConfig<TPlugin>;
  data: InferData<TPlugin>;
  onChange?: (data: Cell<TPlugin>) => void;
}

export function TableRowCell<TPlugin extends CellPlugin>({
  plugin,
  rowIndex,
  colIndex,
  width,
  wrapped,
  propId,
  config,
  data,
  onChange,
}: TableRowCellProps<TPlugin>) {
  const [mode] = useState<CellMode>(CellMode.Normal);

  const cell = useMemo(
    () =>
      plugin.renderCell({
        propId,
        data,
        config,
        wrapped,
        onChange,
      }),
    [config, data, onChange, plugin, propId, wrapped],
  );

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
