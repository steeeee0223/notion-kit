import type { TableInstance } from "@notion-kit/table-hook";

import { Cell } from "@/common";
import { getCellPresentation } from "@/plugins/utils";
import { TableFooterCell } from "@/table-footer/table-footer-cell";
import { TableHeaderCell } from "@/table-header/table-header-cell";

export const defaultColumn: NonNullable<
  TableInstance["options"]["defaultColumn"]
> = {
  size: 200,
  minSize: 100,
  maxSize: Number.MAX_SAFE_INTEGER,
  header: ({ table, ...props }) => {
    const { layout } = table.getTableGlobalState();
    if (layout !== "table") return null;
    return <TableHeaderCell table={table} {...props} />;
  },
  cell: ({ table, cell }) => {
    const { layout } = table.getTableGlobalState();
    if (layout !== "table" && layout !== "list" && layout !== "board") {
      return null;
    }
    if (!cell.row.original.properties[cell.column.id]) return null;

    const info = cell.column.getInfo();
    const wrapped = layout === "table" ? info.wrapped : undefined;
    const presentation = getCellPresentation({
      pluginId: cell.column.getPlugin().id,
      surface: layout,
      wrapped,
    });

    return (
      <Cell.Root
        cell={cell}
        table={table}
        surface={layout}
        presentation={presentation}
        wrapped={wrapped}
      >
        {layout === "table" ? (
          <Cell.TableFrame>
            <Cell.Content />
          </Cell.TableFrame>
        ) : (
          <Cell.Tooltip>
            <Cell.CompactFrame>
              <Cell.Content />
            </Cell.CompactFrame>
          </Cell.Tooltip>
        )}
      </Cell.Root>
    );
  },
  footer: ({ column, table }) => {
    const { layout } = table.getTableGlobalState();
    if (layout !== "table") return null;
    return <TableFooterCell column={column} />;
  },
};
