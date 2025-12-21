import type { ColumnDef } from "@tanstack/react-table";

import { TableCell } from "../common";
import type { Row } from "../lib/types";
import { TableRowCell } from "../table-body";
import { TableFooterCell } from "../table-footer";
import { TableHeaderCell } from "../table-header";

export const defaultColumn: Partial<ColumnDef<Row>> = {
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
  footer: ({ table, ...props }) => {
    const { layout } = table.getTableGlobalState();
    if (layout !== "table") return null;
    return <TableFooterCell table={table} {...props} />;
  },
};
