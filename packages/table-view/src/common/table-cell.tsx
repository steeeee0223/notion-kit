import { flexRender } from "@tanstack/react-table";

import type {
  CellInstance,
  ColumnInfo,
  LayoutType,
  TableInstance,
} from "@notion-kit/table-hook";

import type { CellPlugin, InferCellProps } from "@/plugins";

type TableGlobalReader = Pick<TableInstance, "getTableGlobalState">;
type UnknownCellPlugin = CellPlugin<string, unknown, unknown>;

interface TableCellProps {
  row: CellInstance["row"];
  column: CellInstance["column"];
  table: TableGlobalReader;
  view: LayoutType | "row-view";
}

export function TableCell({ row, column, table, view }: TableCellProps) {
  const { locked } = table.getTableGlobalState();
  const data = row.original.properties[column.id];
  const plugin = column.getPlugin() as UnknownCellPlugin;
  const info = column.getInfo() as ColumnInfo<UnknownCellPlugin>;

  if (!data) return null;
  const cellData: unknown = data.value;
  const cellConfig: unknown = info.config;

  return flexRender<InferCellProps<UnknownCellPlugin>>(plugin.renderCell, {
    layout: view,
    propId: column.id,
    row: row.original,
    data: cellData,
    config: cellConfig,
    disabled: locked,
    tooltip:
      view === "board" || view === "list"
        ? {
            title: info.name,
            description: info.description,
          }
        : undefined,
    onChange: (updater) => column.updateCell(row.id, updater, row.parentId),
    onConfigChange: (updater) => column.updateConfig(updater),
  });
}
