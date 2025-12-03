import type { ColumnDef } from "@tanstack/react-table";

import type { Row } from "../lib/types";
import { ListRowCell } from "../list-view";
import { TableRowCell } from "../table-body";
import { TableFooterCell } from "../table-footer";
import { TableHeaderCell } from "../table-header";

export const defaultColumn: Partial<ColumnDef<Row>> = {
  size: 200,
  minSize: 100,
  maxSize: Number.MAX_SAFE_INTEGER,
  header: ({ table, ...props }) => {
    const { layout: viewType } = table.getTableGlobalState();
    if (viewType !== "table") return null;
    return <TableHeaderCell table={table} {...props} />;
  },
  cell: ({ table, ...props }) => {
    const { layout: viewType } = table.getTableGlobalState();
    if (viewType === "list") return <ListRowCell table={table} {...props} />;
    return <TableRowCell table={table} {...props} />;
  },
  footer: ({ table, ...props }) => {
    const { layout: viewType } = table.getTableGlobalState();
    if (viewType !== "table") return null;
    return <TableFooterCell table={table} {...props} />;
  },
};
