import {
  columnFilteringFeature,
  columnPinningFeature,
  columnSizingFeature,
  createFilteredRowModel,
  createSortedRowModel,
  tableFeatures as createTableFeatures,
  rowSelectionFeature,
  rowSortingFeature,
  type CellData,
  type RowData,
  type ColumnDef as TanStackColumnDef,
  type Row as TanStackRow,
} from "@tanstack/react-table";

export const tableFeatures = createTableFeatures({
  columnFilteringFeature,
  columnPinningFeature,
  columnSizingFeature,
  rowSelectionFeature,
  rowSortingFeature,
  filteredRowModel: createFilteredRowModel(),
  sortedRowModel: createSortedRowModel(),
});

export type ColumnDef<
  TData extends RowData,
  TValue extends CellData = CellData,
> = TanStackColumnDef<typeof tableFeatures, TData, TValue>;

export type Row<TData extends RowData> = TanStackRow<
  typeof tableFeatures,
  TData
>;
