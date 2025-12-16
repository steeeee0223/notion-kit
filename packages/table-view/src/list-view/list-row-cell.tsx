import { flexRender, type CellContext } from "@tanstack/react-table";

import type { ColumnInfo, Row } from "../lib/types";
import type { CellPlugin, InferCellProps } from "../plugins";

export function ListRowCell<TPlugin extends CellPlugin>({
  row,
  column,
  table,
}: CellContext<Row<TPlugin[]>, unknown>) {
  const { locked } = table.getTableGlobalState();
  const data = row.original.properties[column.id];
  const plugin = column.getPlugin() as TPlugin;
  const info = column.getInfo() as ColumnInfo<TPlugin>;

  if (!data) return null;
  return flexRender<InferCellProps<TPlugin>>(plugin.renderCell, {
    layout: "list",
    propId: column.id,
    row: row.original,
    data: data.value,
    config: info.config,
    disabled: locked,
    tooltip: {
      title: info.name,
      description: info.description,
    },
    onChange: (updater) => column.updateCell(row.id, updater, row.parentId),
    onConfigChange: column.updateConfig,
  });
}
