import type { TableInstance } from "@notion-kit/table-hook";

import { Cell } from "@/common";
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

    const info = cell.getInfo();
    const wrapped = layout === "table" && info.wrapped;
    return (
      <Cell.Root cell={cell} table={table} surface={layout} wrapped={wrapped}>
        {layout === "table" ? (
          <Cell.TableFrame>
            <Cell.Content />
          </Cell.TableFrame>
        ) : (
          <Cell.Tooltip>
            <Cell.Content />
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
