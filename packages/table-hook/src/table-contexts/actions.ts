import type { TableViewState } from "@/features/menu";
import type { ColumnInfo, Row } from "@/lib/types";

export interface TableAction<TType extends string, TPayload> {
  id: string;
  type: TType;
  payload: TPayload;
}

export interface ResourceChange<TResource, TAction> {
  next: TResource;
  action: TAction;
}

export type ResourceChangeHandler<TResource, TAction> = (
  change: ResourceChange<TResource, TAction>,
) => unknown;

export type ResourceActionFactory<TResource, TAction> = (
  previous: TResource,
  next: TResource,
) => TAction;

export type ResourceChangeFn<TResource, TAction> = (
  updater: TResource | ((previous: TResource) => TResource),
  action: TAction | ResourceActionFactory<TResource, TAction>,
) => void;

type CellUpdateTarget =
  | { rowId: string; rowIds?: never }
  | { rowId?: never; rowIds: string[] };

export type DataResourceAction =
  | TableAction<
      "data.cell.update",
      CellUpdateTarget & {
        propertyId: string;
        previousValue?: unknown;
        nextValue?: unknown;
      }
    >
  | TableAction<
      "data.row.create",
      { rowId: string; nextPosition: number; groupId?: string }
    >
  | TableAction<
      "data.row.update",
      { rowId: string; previous: Partial<Row>; next: Partial<Row> }
    >
  | TableAction<
      "data.row.delete",
      {
        rowIds: string[];
        previousPositions: { rowId: string; index: number }[];
      }
    >
  | TableAction<
      "data.row.duplicate",
      { sourceRowId: string; rowId: string; nextPosition: number }
    >
  | TableAction<
      "data.row.move",
      { rowId: string; previousPosition: number; nextPosition: number }
    >;

export type PropertiesResourceAction =
  | TableAction<
      "properties.create",
      { propertyId: string; nextPosition: number; property: ColumnInfo }
    >
  | TableAction<
      "properties.update",
      {
        propertyId: string;
        previous: Partial<ColumnInfo>;
        next: Partial<ColumnInfo>;
      }
    >
  | TableAction<
      "properties.delete",
      { propertyId: string; previousPosition: number }
    >
  | TableAction<"properties.restore", { propertyId: string }>
  | TableAction<
      "properties.duplicate",
      { sourcePropertyId: string; propertyId: string; nextPosition: number }
    >
  | TableAction<
      "properties.move",
      { propertyId: string; previousPosition: number; nextPosition: number }
    >
  | TableAction<
      "properties.resize",
      { propertyId: string; previousWidth?: string; nextWidth?: string }
    >
  | TableAction<
      "properties.visibility.change",
      {
        propertyIds: string[];
        previousHidden: Record<string, boolean>;
        nextHidden: Record<string, boolean>;
      }
    >
  | TableAction<
      "properties.type.change",
      { propertyId: string; previousType: string; nextType: string }
    >;

export type ViewResourceAction =
  | TableAction<
      "view.layout.change",
      {
        previousLayout: TableViewState["layout"];
        nextLayout: TableViewState["layout"];
      }
    >
  | TableAction<
      "view.lock.change",
      { previousLocked?: boolean; nextLocked?: boolean }
    >
  | TableAction<
      "view.row_display.change",
      {
        previousRowView: TableViewState["rowView"];
        nextRowView: TableViewState["rowView"];
      }
    >
  | TableAction<
      "view.opened_row.change",
      {
        previousRowId: string | null;
        nextRowId: string | null;
        previousRowView: TableViewState["rowView"];
        nextRowView: TableViewState["rowView"];
      }
    >;

export function serializeResourceAction<TResource, TAction>(
  change: ResourceChange<TResource, TAction>,
) {
  return change.action;
}
