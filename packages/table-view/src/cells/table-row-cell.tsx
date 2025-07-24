"use client";

import { useState } from "react";

import type { IconData } from "@notion-kit/icon-block";

import type { CellType, ConfigMeta, DatabaseProperty } from "../lib/types";
import { SelectCell } from "../plugins/select";
import { CheckboxCell } from "./checkbox-cell";
import { TextCell } from "./text-cell";
import { TitleCell } from "./title-cell";

enum CellMode {
  Normal = "normal",
  Edit = "edit",
  Select = "select",
}

interface TableRowCellProps extends DataCellProps {
  rowIndex: number;
  colIndex: number;
  width?: string;
}

export function TableRowCell({
  data,
  rowIndex,
  colIndex,
  width,
  ...cellProps
}: TableRowCellProps) {
  const [mode] = useState<CellMode>(CellMode.Normal);

  return (
    <div
      id="notion-table-view-cell"
      data-row-index={rowIndex}
      data-col-index={colIndex}
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
  property: DatabaseProperty;
  data: CellType;
  icon?: IconData;
  onChange?: (data: CellType) => void;
}

function DataCell({ property, data, icon, onChange }: DataCellProps) {
  switch (data.type) {
    case "title":
      return (
        <TitleCell
          value={data.value}
          icon={
            property.type === "title" && property.config.showIcon
              ? icon
              : undefined
          }
          wrapped={property.wrapped}
          onUpdate={(value) => onChange?.({ type: "title", value })}
        />
      );
    case "text":
      return (
        <TextCell
          value={data.value}
          wrapped={property.wrapped}
          onUpdate={(value) => onChange?.({ type: "text", value })}
        />
      );
    case "checkbox":
      return (
        <CheckboxCell
          checked={data.checked}
          wrapped={property.wrapped}
          onChange={(checked) => onChange?.({ type: "checkbox", checked })}
        />
      );
    case "select":
      return (
        <SelectCell
          propId={property.id}
          options={data.option ? [data.option] : []}
          meta={
            {
              type: property.type,
              config: property.config,
            } as ConfigMeta<"select">
          }
          wrapped={property.wrapped}
          onChange={(options) =>
            onChange?.({ type: "select", option: options.at(0) ?? null })
          }
        />
      );
    case "multi-select":
      return (
        <SelectCell
          propId={property.id}
          options={data.options}
          meta={
            {
              type: property.type,
              config: property.config,
            } as ConfigMeta<"multi-select">
          }
          wrapped={property.wrapped}
          onChange={(options) => onChange?.({ type: "multi-select", options })}
        />
      );
    default:
      return null;
  }
}
