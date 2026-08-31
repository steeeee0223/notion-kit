import { Icon } from "@notion-kit/icons";
import type { CellInstance, TableInstance } from "@notion-kit/table-hook";
import { Button } from "@notion-kit/ui/primitives";

import { CellEditorHost } from "@/common/cell-editor-host";
import { CellSelectionCell } from "@/common/cell-selection";

type TableGlobalReader = Pick<TableInstance, "getTableGlobalState">;

interface TableRowCellProps {
  cell: CellInstance;
  column: CellInstance["column"];
  row: CellInstance["row"];
  table: TableGlobalReader;
}

export function TableRowCell({ cell, column, row, table }: TableRowCellProps) {
  const { locked } = table.getTableGlobalState();
  const data = row.original.properties[column.id];

  const width = column.getWidth();
  const info = column.getInfo();
  const plugin = column.getPlugin();

  if (!data) return null;
  const cellData: unknown = data.value;
  const cellConfig: unknown = info.config;

  return (
    <CellSelectionCell
      cell={cell}
      id="notion-table-view-cell"
      data-row-index={`${row.depth}:${row.index}`}
      data-col-index={column.getIndex()}
      data-property-id={column.id}
      className="relative flex h-full border-r border-r-border-cell"
      style={{ width }}
    >
      {row.subRows.length > 0 && (
        <div className="mt-1.5 flex">
          <Button
            tabIndex={0}
            variant="hint"
            className="size-6"
            aria-expanded={row.getIsExpanded()}
            aria-label={row.getIsExpanded() ? "Close" : "Open"}
            onPointerDown={row.getToggleExpandedHandler()}
          >
            <Icon.ArrowCaretFillSmall
              className="size-[0.8em] fill-menu-icon transition-[rotate]"
              side={row.getIsExpanded() ? "down" : "right"}
            />
          </Button>
        </div>
      )}
      <div className="flex h-full overflow-x-clip" style={{ width }}>
        <CellEditorHost
          plugin={plugin}
          valueProps={{
            propId: column.id,
            row: row.original,
            data: cellData,
            config: cellConfig,
            wrapped: info.wrapped,
            disabled: locked,
            layout: "table",
          }}
          editorProps={{
            propId: column.id,
            data: cellData,
            config: cellConfig,
            wrapped: info.wrapped,
            disabled: locked,
            layout: "table",
            scope: { kind: "cell", row: row.original },
            onChange: (updater) =>
              column.updateCell(row.id, updater, row.parentId),
            onConfigChange: (updater) => column.updateConfig(updater),
          }}
        />
      </div>
    </CellSelectionCell>
  );
}
