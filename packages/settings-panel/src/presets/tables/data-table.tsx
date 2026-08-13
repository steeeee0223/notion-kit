"use client";

import { useMemo } from "react";
import {
  flexRender,
  useTable,
  type ColumnFilter,
  type RowData,
} from "@tanstack/react-table";

import { cn } from "@notion-kit/cn";
import {
  Table,
  TableBody,
  TableCell,
  TableEmptyCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@notion-kit/ui/primitives";

import { tableFeatures, type ColumnDef, type Row } from "./table-features";

export interface DataTableProps<TData extends RowData> {
  className?: string;
  columns: ColumnDef<TData>[];
  data: TData[];
  emptyResult?: string;
  /** Initial column pinning state (set once on mount, not controlled) */
  initialColumnPinning?: string[];
  /** Search configuration - applies filter to a specific column */
  search?: ColumnFilter;
  /** Row click handler */
  onRowClick?: (row: Row<TData>) => void;
  /** Custom header className function based on column id */
  getHeaderClassName?: (columnId: string) => string;
}

export function DataTable<TData extends RowData>({
  className,
  columns,
  data,
  emptyResult = "No results.",
  initialColumnPinning,
  search,
  onRowClick,
  getHeaderClassName,
}: DataTableProps<TData>) {
  const searchId = search?.id;
  const searchValue = search?.value;
  const columnFilters = useMemo(() => {
    if (
      searchId === undefined ||
      searchValue === undefined ||
      searchValue === ""
    ) {
      return [];
    }

    return [{ id: searchId, value: searchValue }];
  }, [searchId, searchValue]);

  const table = useTable({
    features: tableFeatures,
    data,
    columns,
    initialState: {
      columnPinning: { start: initialColumnPinning ?? [], end: [] },
    },
    state: {
      columnFilters,
    },
  });

  return (
    <Table className={className}>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id} className="border-none">
            {headerGroup.headers.map((header) => {
              const isPinned = header.column.getIsPinned();
              const pinnedStyles = isPinned
                ? { insetInlineStart: `${header.column.getStart("start")}px` }
                : {};

              return (
                <TableHead
                  key={header.id}
                  data-pinned={isPinned}
                  style={pinnedStyles}
                  className={cn(getHeaderClassName?.(header.id))}
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
              {[
                ...row.getStartVisibleCells(),
                ...row.getCenterVisibleCells(),
                ...row.getEndVisibleCells(),
              ].map((cell) => {
                const isPinned = cell.column.getIsPinned();
                const pinnedStyles = isPinned
                  ? { insetInlineStart: `${cell.column.getStart("start")}px` }
                  : {};

                return (
                  <TableCell
                    key={cell.id}
                    style={pinnedStyles}
                    data-pinned={isPinned}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                );
              })}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableEmptyCell colSpan={columns.length} className="sticky left-0">
              {emptyResult}
            </TableEmptyCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
