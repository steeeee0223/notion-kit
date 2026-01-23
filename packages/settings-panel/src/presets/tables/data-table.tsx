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
  type OnChangeFn,
  type Row,
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
  className?: string;
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  emptyResult?: string;
  /** Enable sorting functionality */
  enableSorting?: boolean;
  /** Enable filtering functionality */
  enableFiltering?: boolean;
  /** External column filters state (controlled) */
  columnFilters?: ColumnFiltersState;
  /** Callback when column filters change */
  onColumnFiltersChange?: OnChangeFn<ColumnFiltersState>;
  /** Search configuration - applies filter to a specific column */
  search?:
    | string // Simple string search (assumes column id is "user" for backward compatibility)
    | { colId: string; value: string }; // Specific column search
  /** Row click handler */
  onRowClick?: (row: Row<TData>) => void;
  /**
   * @deprecated
   * Custom cell className function based on column id
   */
  getCellClassName?: (columnId: string) => string;
  /** Custom header className function based on column id */
  getHeaderClassName?: (columnId: string) => string;
}

export function DataTable<TData, TValue>({
  className,
  columns,
  data,
  emptyResult = "No results.",
  enableSorting = true,
  enableFiltering = true,
  columnFilters: externalColumnFilters,
  onColumnFiltersChange,
  search,
  onRowClick,
  getCellClassName,
  getHeaderClassName,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [internalColumnFilters, setInternalColumnFilters] =
    useState<ColumnFiltersState>([]);

  // Use external columnFilters if provided, otherwise use internal state
  const columnFilters = externalColumnFilters ?? internalColumnFilters;
  const handleColumnFiltersChange =
    onColumnFiltersChange ?? setInternalColumnFilters;

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    ...(enableSorting && {
      onSortingChange: setSorting,
      getSortedRowModel: getSortedRowModel(),
    }),
    ...(enableFiltering && {
      onColumnFiltersChange: handleColumnFiltersChange,
      getFilteredRowModel: getFilteredRowModel(),
    }),
    state: {
      ...(enableSorting && { sorting }),
      ...(enableFiltering && { columnFilters }),
    },
  });

  // Handle search prop
  useEffect(() => {
    if (!search || !enableFiltering) return;

    if (typeof search === "string") {
      // Backward compatibility: assume "user" column
      table.getColumn("user")?.setFilterValue(search);
    } else {
      // New approach: specify column id
      table.getColumn(search.colId)?.setFilterValue(search.value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, enableFiltering]);

  return (
    <Table className={cn("border-t-0", className)}>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id} className="border-none">
            {headerGroup.headers.map((header) => (
              <TableHead
                key={header.id}
                className={cn(getHeaderClassName?.(header.id))}
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
              onClick={() => onRowClick?.(row)}
              className={cn(onRowClick && "cursor-pointer hover:bg-default/5")}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell
                  key={cell.id}
                  className={cn(getCellClassName?.(cell.column.id))}
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
              {emptyResult}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
