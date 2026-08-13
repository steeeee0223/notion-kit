"use client";

import { flexRender, useTable, type RowData } from "@tanstack/react-table";

import { cn } from "@notion-kit/cn";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@notion-kit/ui/primitives";

import { tableFeatures, type ColumnDef } from "../table-features";

export interface DataTableProps<TData extends RowData> {
  type: "highlight" | "content";
  columns: ColumnDef<TData>[];
  data: TData[];
}

/**
 * Plans DataTable - Uses a unique flexbox layout that differs from other tables
 * This table has a specific design requirement with highlight/content types,
 * so it maintains its own implementation rather than using the base DataTable.
 */
export function DataTable<TData extends RowData>({
  type,
  columns,
  data,
}: DataTableProps<TData>) {
  const table = useTable({
    features: tableFeatures,
    data,
    columns,
  });
  const tableRows = table.getRowModel().rows;

  return (
    <Table variant="striped">
      <TableHeader className={cn(type === "highlight" && "border-none")}>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow
            key={headerGroup.id}
            className={cn(
              "flex",
              type === "highlight" && "bg-main! py-5 shadow-sm dark:bg-main!",
            )}
          >
            {headerGroup.headers.map((header) => (
              <TableHead
                key={header.id}
                className={cn(
                  "h-[unset] w-full max-w-[150px] text-primary",
                  header.id === "title" && "max-w-[118px]",
                )}
              >
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {tableRows.map((row) => (
          <TableRow key={row.id} className="flex">
            {row.getAllCells().map((cell) => (
              <TableCell
                key={cell.id}
                className={cn(
                  "h-[unset] w-[150px]",
                  cell.column.id === "title" && "w-[118px]",
                )}
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
