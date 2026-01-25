"use client";

import { useEffect, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFilter,
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
  /** External column filters state (controlled) */
  columnFilters?: ColumnFiltersState;
  /** Callback when column filters change */
  onColumnFiltersChange?: OnChangeFn<ColumnFiltersState>;
  /** Initial column pinning state (set once on mount, not controlled) */
  initialColumnPinning?: string[];
  /** Search configuration - applies filter to a specific column */
  search?: ColumnFilter;
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
  columnFilters: externalColumnFilters,
  onColumnFiltersChange,
  initialColumnPinning,
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

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnPinning: { left: initialColumnPinning },
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: handleColumnFiltersChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  // Handle search prop
  useEffect(() => {
    if (!search) return;

    table.getColumn(search.id)?.setFilterValue(search.value);
  }, [search, table]);

  return (
    <Table className={cn("border-t-0", className)}>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id} className="border-none">
            {headerGroup.headers.map((header) => {
              const isPinned = header.column.getIsPinned();
              const pinnedStyles = isPinned
                ? { left: `${header.column.getStart("left")}px` }
                : {};

              return (
                <TableHead
                  key={header.id}
                  style={pinnedStyles}
                  className={cn(
                    isPinned &&
                      "sticky z-40 bg-modal inset-shadow-[-1px_0_0_#e9e9e7] dark:inset-shadow-[-1px_0_0_#2f2f2f]",
                    getHeaderClassName?.(header.id),
                  )}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              );
            })}
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
              {row.getVisibleCells().map((cell) => {
                const isPinned = cell.column.getIsPinned();
                const pinnedStyles = isPinned
                  ? { left: `${cell.column.getStart("left")}px` }
                  : {};

                return (
                  <TableCell
                    key={cell.id}
                    style={pinnedStyles}
                    className={cn(
                      isPinned &&
                        "sticky z-20 bg-modal inset-shadow-[-1px_0_0_#e9e9e7] dark:inset-shadow-[-1px_0_0_#2f2f2f]",
                      getCellClassName?.(cell.column.id),
                    )}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                );
              })}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell
              colSpan={columns.length}
              className="sticky left-0 h-8 text-start text-secondary"
            >
              {emptyResult}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
