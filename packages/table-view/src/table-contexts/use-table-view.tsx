"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  functionalUpdate,
  getCoreRowModel,
  getExpandedRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type OnChangeFn,
} from "@tanstack/react-table";

import {
  DEFAULT_FEATURES,
  getExtendedGroupedRowModel,
  type TableGlobalState,
} from "../features";
import type { ColumnDefs, ColumnInfo, Row } from "../lib/types";
import { type Entity } from "../lib/utils";
import type { CellPlugin } from "../plugins";
import { defaultColumn } from "./column";
import type { TableState } from "./types";
import { getMinWidth, toPropertyEntity } from "./utils";

interface UseTableViewOptions<TPlugins extends CellPlugin[]>
  extends TableState<TPlugins> {
  plugins: Entity<TPlugins[number]>;
  table?: TableGlobalState;
  onDataChange?: OnChangeFn<Row<TPlugins>[]>;
  onPropertiesChange?: OnChangeFn<ColumnDefs<TPlugins>>;
  onTableChange?: OnChangeFn<TableGlobalState>;
}

export function useTableView<TPlugins extends CellPlugin[]>({
  plugins,
  data,
  properties,
  table: tableGlobal,
  onDataChange,
  onPropertiesChange,
  onTableChange,
}: UseTableViewOptions<TPlugins>) {
  const [synced, setSynced] = useState(-1);
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
        return {
          id: property.id,
          accessorKey: property.name,
          minSize: getMinWidth(property.type),
          sortingFn: (rowA, rowB, colId) =>
            plugin.compare(rowA.original, rowB.original, colId),
          getGroupingValue: (row) =>
            (plugin.toGroupValue ?? plugin.toValue)(
              row.properties[colId]?.value,
              row,
            ),
        };
      }),
    [columnEntity, plugins.items],
  );
  const handleColumnChange = useCallback<OnChangeFn<Entity<ColumnInfo>>>(
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

  /** table instance */
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    columns,
    data: dataEntity,
    defaultColumn,
    columnResizeMode: "onChange",
    groupedColumnMode: false,
    autoResetExpanded: false,
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getGroupedRowModel: getExtendedGroupedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    state: {
      columnOrder: columnEntity.ids,
      columnsInfo: columnEntity.items,
      cellPlugins: plugins.items,
    },
    onColumnInfoChange: handleColumnChange,
    onTableDataChange: onDataChange ?? setDataEntity,
    sync: (debugValue) => {
      setSynced(Date.now());
      console.log(`[${debugValue}] table synced`);
    },
    _features: DEFAULT_FEATURES,
  });

  if (tableGlobal) {
    table.setOptions((v) => ({
      ...v,
      state: { ...v.state, tableGlobal },
      onTableGlobalChange: onTableChange,
    }));
  }

  useEffect(() => {
    setSynced(Date.now());
  }, [table]);

  if (
    table.getGroupedColumnInfo() &&
    table.getState().groupingState.groupOrder.length === 0
  ) {
    table._setGroupingState((v) =>
      table.getGroupedRowModel().rows.reduce((acc, r) => {
        const colId = r.groupingColumnId!;
        acc.groupOrder.push(r.id);
        acc.groupValues[r.id] = {
          value: r.getGroupingValue(colId),
          original: r.original.properties[colId]?.value as unknown,
        };
        return acc;
      }, v),
    );
  }

  return useMemo(
    () => ({
      table,
      // use synced to force re-render
      __synced: synced,
    }),
    [table, synced],
  );
}
