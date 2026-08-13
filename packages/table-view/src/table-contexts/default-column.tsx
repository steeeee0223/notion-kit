import type { TableInstance } from "@notion-kit/table-hook";

import { TableCell } from "@/common/table-cell";
import { TableRowCell } from "@/table-body/table-row-cell";
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
  cell: ({ table, ...props }) => {
    const { layout } = table.getTableGlobalState();
    switch (layout) {
      case "list":
      case "board":
        return <TableCell view={layout} table={table} {...props} />;
      default:
        return <TableRowCell table={table} {...props} />;
    }
  },
  footer: ({ column, table }) => {
    const { layout } = table.getTableGlobalState();
    if (layout !== "table") return null;
    return <TableFooterCell column={column} />;
  },
};
