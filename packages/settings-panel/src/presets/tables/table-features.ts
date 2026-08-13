import {
  columnFilteringFeature,
  columnPinningFeature,
  columnSizingFeature,
  createFilteredRowModel,
  createSortedRowModel,
  rowSelectionFeature,
  rowSortingFeature,
  tableFeatures,
  type CellData,
  type ColumnDef,
  type Row,
  type RowData,
} from "@tanstack/react-table";

export const settingsTableFeatures = tableFeatures({
  columnFilteringFeature,
  columnPinningFeature,
  columnSizingFeature,
  rowSelectionFeature,
  rowSortingFeature,
  filteredRowModel: createFilteredRowModel(),
  sortedRowModel: createSortedRowModel(),
});

export const plansTableFeatures = tableFeatures({});

export type SettingsColumnDef<
  TData extends RowData,
  TValue extends CellData = CellData,
> = ColumnDef<typeof settingsTableFeatures, TData, TValue>;

export type SettingsRow<TData extends RowData> = Row<
  typeof settingsTableFeatures,
  TData
>;

export type PlansColumnDef<
  TData extends RowData,
  TValue extends CellData = CellData,
> = ColumnDef<typeof plansTableFeatures, TData, TValue>;
