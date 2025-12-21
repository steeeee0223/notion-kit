import type { CellContext } from "@tanstack/react-table";
import { flexRender } from "@tanstack/react-table";

import type { LayoutType } from "../features";
import type { ColumnInfo, Row } from "../lib/types";
import type { CellPlugin, InferCellProps } from "../plugins";

interface TableCellProps<TPlugin extends CellPlugin>
  extends Pick<
    CellContext<Row<TPlugin[]>, unknown>,
    "row" | "column" | "table"
  > {
  view: LayoutType | "row-view";
}

export function TableCell<TPlugin extends CellPlugin>({
  row,
  column,
  table,
  view,
}: TableCellProps<TPlugin>) {
  const { locked } = table.getTableGlobalState();
  const data = row.original.properties[column.id];
  const plugin = column.getPlugin() as TPlugin;
  const info = column.getInfo() as ColumnInfo<TPlugin>;

  if (!data) return null;
  return flexRender<InferCellProps<TPlugin>>(plugin.renderCell, {
    layout: view,
    propId: column.id,
    row: row.original,
    data: data.value,
    config: info.config,
    disabled: locked,
    tooltip:
      view === "board" || view === "list"
        ? {
            title: info.name,
            description: info.description,
          }
        : undefined,
    onChange: (updater) => column.updateCell(row.id, updater, row.parentId),
    onConfigChange: column.updateConfig,
  });
}
