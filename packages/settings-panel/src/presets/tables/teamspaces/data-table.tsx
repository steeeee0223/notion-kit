"use client";

import { useEffect, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
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
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  search?: string;
  emptyResult?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  search,
  emptyResult,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: { sorting, columnFilters },
  });

  useEffect(() => {
    table.getColumn("user")?.setFilterValue(search);
  }, [table, search]);

  return (
    <Table className="border-t-0">
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id} className="border-none">
            {headerGroup.headers.map((header) => (
              <TableHead
                key={header.id}
                className={cn(
                  "sticky top-0 h-8 bg-transparent py-0",
                  header.id === "teamspace" &&
                    "left-0 z-40 min-w-[220px] bg-modal inset-shadow-[-1px_0_0_#e9e9e7] dark:inset-shadow-[-1px_0_0_#2f2f2f]",
                  // header.id === "teamspaces" && "z-30 w-[175px] pr-1 pl-3",
                  // header.id === "access" && "z-30 w-[180px] pr-1 pl-4",
                  // header.id === "groups" && "w-[120px] px-1",
                  // header.id === "role" && "min-w-[120px] px-1",
                  // header.id === "actions" && "w-[52px] px-1",
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
        {table.getRowModel().rows.length > 0 ? (
          table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              data-state={row.getIsSelected() && "selected"}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell
                  key={cell.id}
                  className={cn(
                    "h-[42px] bg-transparent py-0",
                    cell.column.id === "teamspace" &&
                      "sticky left-0 z-20 w-[220px] bg-modal inset-shadow-[-1px_0_0_#e9e9e7] dark:inset-shadow-[-1px_0_0_#2f2f2f]",
                    // cell.column.id === "teamspaces" && "w-[175px] pr-1 pl-3",
                    // cell.column.id === "access" && "z-30 w-[180px] pr-1 pl-4",
                    // cell.column.id === "groups" && "w-[120px] px-1",
                    // cell.column.id === "role" && "w-[120px] px-1",
                    // cell.column.id === "actions" && "w-[52px] px-1",
                  )}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell
              colSpan={columns.length}
              className="sticky left-0 h-6 text-start text-secondary"
            >
              {emptyResult ?? "No results."}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
