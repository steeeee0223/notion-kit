import type {
  CellInstance,
  LayoutType,
  TableInstance,
} from "@notion-kit/table-hook";

import { CellEditorHost } from "./cell-editor-host";

type TableGlobalReader = Pick<TableInstance, "getTableGlobalState">;

interface TableCellProps {
  row: CellInstance["row"];
  column: CellInstance["column"];
  table: TableGlobalReader;
  view: LayoutType | "row-view";
  showRowQuickAction?: boolean;
}

export function TableCell({
  row,
  column,
  table,
  view,
  showRowQuickAction,
}: TableCellProps) {
  const { locked } = table.getTableGlobalState();
  const data = row.original.properties[column.id];
  const plugin = column.getPlugin();
  const info = column.getInfo();

  if (!data) return null;
  const cellData: unknown = data.value;
  const cellConfig: unknown = info.config;

  const tooltip =
    view === "board" || view === "list"
      ? { title: info.name, description: info.description }
      : undefined;

  return (
    <CellEditorHost
      plugin={plugin}
      valueProps={{
        layout: view,
        propId: column.id,
        row: row.original,
        data: cellData,
        config: cellConfig,
        disabled: locked,
        showRowQuickAction,
        tooltip,
      }}
      editorProps={{
        layout: view,
        propId: column.id,
        data: cellData,
        config: cellConfig,
        disabled: locked,
        showRowQuickAction,
        tooltip,
        scope: { kind: "cell", row: row.original },
        onChange: (updater) => {
          if (table.getTableGlobalState().locked) return;
          column.updateCell(row.id, updater, row.parentId);
        },
        onConfigChange: (updater) => {
          if (table.getTableGlobalState().locked) return;
          column.updateConfig(updater);
        },
      }}
    />
  );
}
