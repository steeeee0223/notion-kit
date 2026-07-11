import { useCallback, useEffect, useMemo, useState } from "react";
import {
  functionalUpdate,
  useTable,
  type ColumnDef,
  type OnChangeFn,
} from "@tanstack/react-table";

import { DEFAULT_FEATURES, type TableFeatures } from "@/features";
import type { ColumnDefs, ColumnInfo, Row } from "@/lib/types";
import { type Entity } from "@/lib/utils";
import { resolveGroupingMethod, resolveSortingMethod } from "@/methods";
import type { CellPlugin } from "@/plugins";
import { defaultColumn } from "@/table-contexts/column";
import type { BaseTableProps } from "@/table-contexts/types";
import { getMinWidth, toPropertyEntity } from "@/table-contexts/utils";

interface UseTableViewOptions<TPlugins extends CellPlugin[]>
  extends BaseTableProps<TPlugins> {
  plugins: Entity<TPlugins[number]>;
}

export function useTableView<TPlugins extends CellPlugin[]>({
  plugins,
  data,
  properties,
  table: tableGlobal,
  getRowUrl,
  onDataChange,
  onPropertiesChange,
  onTableChange,
  defaultColumn: defaultColumnOverride,
}: UseTableViewOptions<TPlugins>) {
  const isPropertiesControlled = typeof onPropertiesChange !== "undefined";
  const isDataControlled = typeof onDataChange !== "undefined";
  const isTableControlled = typeof onTableChange !== "undefined";
  /** columns states */
  const [_columnEntity, setColumnEntity] = useState(
    toPropertyEntity(plugins.items, properties),
  );
  useEffect(() => {
    if (isPropertiesControlled) return;
    setColumnEntity(toPropertyEntity(plugins.items, properties));
  }, [isPropertiesControlled, plugins.items, properties]);
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
      columnEntity.ids.map<ColumnDef<TableFeatures, Row<TPlugins>>>((colId) => {
        const property = columnEntity.items[colId]!;
        const plugin = plugins.items[property.type]!;
        return {
          id: property.id,
          accessorFn: (row) => row.properties[colId]?.value,
          minSize: getMinWidth(property.type),
          sortFn: (rowA, rowB, colId) =>
            resolveSortingMethod(plugin)?.function(
              rowA.original,
              rowB.original,
              colId,
            ) ?? 0,
          getGroupingValue: (row) => {
            const groupingMethod = resolveGroupingMethod(plugin);
            return groupingMethod.function(
              row.properties[colId]?.value,
              row,
              colId,
            );
          },
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

  const resolvedTableGlobal = useMemo(
    () => ({
      locked: false,
      layout: "table" as const,
      rowView: "side" as const,
      openedRowId: null,
      ...tableGlobal,
    }),
    [tableGlobal],
  );
  const [_tableGlobal, setTableGlobal] = useState(resolvedTableGlobal);
  useEffect(() => {
    if (isTableControlled) return;
    setTableGlobal(resolvedTableGlobal);
  }, [isTableControlled, resolvedTableGlobal]);
  const tableGlobalState = useMemo(
    () => (isTableControlled ? resolvedTableGlobal : _tableGlobal),
    [isTableControlled, resolvedTableGlobal, _tableGlobal],
  );

  const tableState = useMemo(
    () => ({
      columnOrder: columnEntity.ids,
      columnsInfo: columnEntity.items,
      columnVisibility: columnEntity.ids.reduce<Record<string, boolean>>(
        (acc, colId) => {
          const info = columnEntity.items[colId];
          acc[colId] = !info?.hidden && !info?.isDeleted;
          return acc;
        },
        {},
      ),
      cellPlugins: plugins.items,
      tableGlobal: tableGlobalState,
    }),
    [columnEntity.ids, columnEntity.items, plugins.items, tableGlobalState],
  );

  /** table instance */
  const table = useTable({
    features: DEFAULT_FEATURES,
    columns,
    data: dataEntity,
    defaultColumn: defaultColumnOverride ?? defaultColumn,
    columnResizeMode: "onChange",
    groupedColumnMode: false,
    autoResetExpanded: false,
    getRowId: (row) => row.id,
    state: tableState,
    onColumnInfoChange: handleColumnChange,
    onTableDataChange: onDataChange ?? setDataEntity,
    onTableGlobalChange: onTableChange ?? setTableGlobal,
    getRowUrl,
  });

  return useMemo(
    () => ({
      table,
    }),
    [table],
  );
}
