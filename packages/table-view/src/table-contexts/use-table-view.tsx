"use client";

import { useCallback, useMemo, useState } from "react";
import {
  functionalUpdate,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type OnChangeFn,
} from "@tanstack/react-table";

import { DEFAULT_FEATURES } from "../features";
import type { ColumnDefs, ColumnInfo, Row } from "../lib/types";
import { type Entity } from "../lib/utils";
import type { CellPlugin } from "../plugins";
import { TableRowCell } from "../table-body";
import { TableFooterCell } from "../table-footer";
import { TableHeaderCell } from "../table-header";
import type { SyncedState, TableState } from "./types";
import { createColumnSortingFn, getMinWidth, toPropertyEntity } from "./utils";

const defaultColumn: Partial<ColumnDef<Row>> = {
  size: 200,
  minSize: 100,
  maxSize: Number.MAX_SAFE_INTEGER,
  header: ({ header }) => <TableHeaderCell header={header} />,
  cell: ({ row, column }) => <TableRowCell column={column} row={row} />,
  footer: ({ column }) => <TableFooterCell column={column} />,
};

interface UseTableViewOptions<TPlugins extends CellPlugin[]>
  extends TableState<TPlugins> {
  plugins: Entity<TPlugins[number]>;
  onDataChange?: OnChangeFn<Row<TPlugins>[]>;
  onPropertiesChange?: OnChangeFn<ColumnDefs<TPlugins>>;
}

/**
 * useTableView
 * @returns [table context, table dispatcher]
 */
export function useTableView<TPlugins extends CellPlugin[]>({
  plugins,
  data,
  properties,
  onDataChange,
  onPropertiesChange,
}: UseTableViewOptions<TPlugins>) {
  const isPropertiesControlled = typeof onPropertiesChange !== "undefined";
  const isDataControlled = typeof onDataChange !== "undefined";
  /** columns states */
  const [_columnEntity, setColumnEntity] = useState(
    toPropertyEntity(plugins.items, properties),
  );
  // Use memoized entity for controlled properties
  const columnEntity = useMemo(
    () =>
      isPropertiesControlled
        ? toPropertyEntity(plugins.items, properties)
        : _columnEntity,
    [isPropertiesControlled, plugins.items, properties, _columnEntity],
  );
  const columns = useMemo(
    () =>
      columnEntity.ids.map<ColumnDef<Row<TPlugins>>>((colId) => {
        const property = columnEntity.items[colId]!;
        const plugin = plugins.items[property.type]!;
        const sortingFn = createColumnSortingFn(plugin);
        return {
          id: property.id,
          accessorKey: property.name,
          minSize: getMinWidth(property.type),
          sortingFn,
        };
      }),
    [columnEntity, plugins.items],
  );
  const handleColumnChange: OnChangeFn<Entity<ColumnInfo>> = useCallback(
    (updater) => {
      if (!onPropertiesChange) {
        setColumnEntity(updater);
        return;
      }
      onPropertiesChange((prev) => {
        const entity = toPropertyEntity(plugins.items, prev);
        const next = functionalUpdate(updater, entity);
        return next.ids.map((id) => next.items[id]!) as ColumnDefs<TPlugins>;
      });
    },
    [onPropertiesChange, plugins.items],
  );

  /** data state */
  const [_dataEntity, setDataEntity] = useState(data);
  // Use memoized entity for controlled data
  const dataEntity = useMemo(
    () => (isDataControlled ? data : _dataEntity),
    [isDataControlled, data, _dataEntity],
  );

  const [synced, setSynced] = useState<SyncedState>({
    header: -1,
    body: -1,
    footer: -1,
  });

  /** table instance */
  const table = useReactTable({
    columns,
    data: dataEntity,
    defaultColumn,
    columnResizeMode: "onChange",
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      rowOrder: dataEntity.map((row) => row.id),
      columnOrder: columnEntity.ids,
      columnsInfo: columnEntity.items,
      cellPlugins: plugins.items,
    },
    onColumnInfoChange: handleColumnChange,
    onTableDataChange: onDataChange ?? setDataEntity,
    sync: (keys) =>
      setSynced((prev) =>
        keys.reduce((acc, key) => ({ ...acc, [key]: Date.now() }), {
          ...prev,
        }),
      ),
    _features: DEFAULT_FEATURES,
  });

  return useMemo(
    () => ({
      table,
      // use synced to force re-render
      __synced: synced,
    }),
    [table, synced],
  );
}
