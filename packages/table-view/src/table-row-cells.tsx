"use client";

import React, { useState } from "react";

import "./view.css";

import { CheckboxCell, TextCell, TitleCell } from "./cells";
import { CellType } from "./types";

enum CellMode {
  Normal = "normal",
  Edit = "edit",
  Select = "select",
}

interface DataCellProps {
  data: CellType;
  wrapped?: boolean;
  onChange?: (data: CellType) => void;
}

interface TableRowCellProps extends DataCellProps {
  rowId: number;
  colId: number;
  width?: string;
}

export const TableRowCell: React.FC<TableRowCellProps> = ({
  data,
  rowId,
  colId,
  width,
  wrapped,
  onChange,
}) => {
  const [mode] = useState<CellMode>(CellMode.Normal);

  return (
    <div
      key="notion-table-view-cell"
      data-row-index={rowId}
      data-col-index={colId}
      className="relative flex h-full border-r border-r-border-cell"
      style={{ width }}
    >
      <div className="flex h-full overflow-x-clip" style={{ width }}>
        <DataCell data={data} wrapped={wrapped} onChange={onChange} />
      </div>
      {mode === CellMode.Select && (
        <div className="shadow-cell pointer-events-none absolute top-0 left-0 z-[840] h-full w-full rounded-[3px] bg-blue/5" />
      )}
    </div>
  );
};

const DataCell: React.FC<DataCellProps> = ({ data, wrapped, onChange }) => {
  switch (data.type) {
    case "title":
      return (
        <TitleCell
          value={data.value}
          wrapped={wrapped}
          onChange={(value) => onChange?.({ type: "title", value })}
        />
      );
    case "text":
      return (
        <TextCell
          value={data.value}
          wrap={wrapped}
          onChange={(value) => onChange?.({ type: "text", value })}
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
    default:
      return null;
  }
};
