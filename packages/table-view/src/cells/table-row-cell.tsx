"use client";

import { useState } from "react";

import type { IconData } from "@notion-kit/icon-block";

import type { CellType, OptionConfig } from "../lib/types";
import { CheckboxCell } from "./checkbox-cell";
import { SelectCell } from "./select-cell";
import { TextCell } from "./text-cell";
import { TitleCell } from "./title-cell";

enum CellMode {
  Normal = "normal",
  Edit = "edit",
  Select = "select",
}

interface TableRowCellProps extends DataCellProps {
  rowId: number;
  colId: number;
  width?: string;
}

export function TableRowCell({
  data,
  rowId,
  colId,
  width,
  ...cellProps
}: TableRowCellProps) {
  const [mode] = useState<CellMode>(CellMode.Normal);

  return (
    <div
      id="notion-table-view-cell"
      data-row-index={rowId}
      data-col-index={colId}
      className="relative flex h-full border-r border-r-border-cell"
      style={{ width }}
    >
      <div className="flex h-full overflow-x-clip" style={{ width }}>
        <DataCell data={data} {...cellProps} />
      </div>
      {mode === CellMode.Select && (
        <div className="pointer-events-none absolute top-0 left-0 z-[840] h-full w-full rounded-[3px] bg-blue/5 shadow-cell-focus" />
      )}
    </div>
  );
}

interface DataCellProps {
  data: CellType;
  icon?: IconData;
  wrapped?: boolean;
  onChange?: (data: CellType) => void;
}

function DataCell({ data, icon, wrapped, onChange }: DataCellProps) {
  switch (data.type) {
    case "title":
      return (
        <TitleCell
          value={data.value}
          icon={icon}
          wrapped={wrapped}
          onUpdate={(value) => onChange?.({ type: "title", value })}
        />
      );
    case "text":
      return (
        <TextCell
          value={data.value}
          wrapped={wrapped}
          onUpdate={(value) => onChange?.({ type: "text", value })}
        />
      );
    case "checkbox":
      return (
        <CheckboxCell
          checked={data.checked}
          wrapped={wrapped}
          onChange={(checked) => onChange?.({ type: "checkbox", checked })}
        />
      );
    case "select":
    case "multi-select": {
      const options: Record<string, OptionConfig> = {
        "Option 1": { id: "1", name: "Option 1", color: "blue" },
        "Option 2": { id: "2", name: "Option 2", color: "green" },
        "Option 3": { id: "3", name: "Option 3", color: "red" },
      };
      return (
        <SelectCell
          config={{
            type: data.type,
            config: { options },
          }}
          wrapped={wrapped}
        />
      );
    }
    default:
      return null;
  }
}
