import { flexRender, type CellContext } from "@tanstack/react-table";

import { TooltipPreset } from "@notion-kit/shadcn";

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
  return (
    <TooltipPreset
      description={
        info.description
          ? [
              { type: "default", text: info.name },
              { type: "secondary", text: info.description },
            ]
          : info.name
      }
    >
      {flexRender<InferCellProps<TPlugin>>(plugin.renderCell, {
        layout: "list",
        propId: column.id,
        row: row.original,
        data: data.value,
        config: info.config,
        disabled: locked,
        onChange: (updater) => column.updateCell(row.id, updater, row.parentId),
        onConfigChange: column.updateConfig,
      })}
    </TooltipPreset>
  );
}
