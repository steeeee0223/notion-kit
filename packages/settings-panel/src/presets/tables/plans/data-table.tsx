"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";

import { cn } from "@notion-kit/cn";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@notion-kit/shadcn";

export interface DataTableProps<TData, TValue> {
  type: "highlight" | "content";
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

/**
 * Plans DataTable - Uses a unique flexbox layout that differs from other tables
 * This table has a specific design requirement with highlight/content types,
 * so it maintains its own implementation rather than using the base DataTable.
 */
export function DataTable<TData, TValue>({
  type,
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
  const tableRows = table.getRowModel().rows;

  return (
    <Table className="border-y-0">
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow
            key={headerGroup.id}
            variant="striped"
            className={cn(
              "flex",
              type === "highlight" && "bg-main! py-5 shadow-sm dark:bg-main!",
              type === "content" && "border-b border-border",
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
          <TableRow
            key={row.id}
            data-state={row.getIsSelected() && "selected"}
            variant="striped"
            className="flex"
          >
            {row.getVisibleCells().map((cell) => (
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
