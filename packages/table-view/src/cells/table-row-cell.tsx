"use client";

import { useMemo, useState } from "react";

import type { CellType, PropertyConfig } from "../lib/types";
import { defaultPlugins } from "../plugins";

enum CellMode {
  Normal = "normal",
  Edit = "edit",
  Select = "select",
}

interface TableRowCellProps {
  rowIndex: number;
  colIndex: number;
  width?: string;
  wrapped?: boolean;
  propId: string;
  config?: PropertyConfig["config"];
  data: CellType;
  onChange?: (data: CellType) => void;
}

export function TableRowCell({
  rowIndex,
  colIndex,
  width,
  ...props
}: TableRowCellProps) {
  const [mode] = useState<CellMode>(CellMode.Normal);

  const cell = useMemo(
    () => defaultPlugins.items[props.data.type].renderCell(props),
    [props],
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
