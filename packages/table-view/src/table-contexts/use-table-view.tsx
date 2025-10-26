"use client";

import { useCallback, useMemo, useReducer } from "react";
import {
  KeyboardSensor,
  MouseSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";

import {
  ColumnsInfoFeature,
  CountingFeature,
  FreezingFeature,
  OrderingFeature,
  type ColumnsInfoState,
} from "../features";
import type { PluginsMap, Row } from "../lib/types";
import type { Entity } from "../lib/utils";
import type { CellPlugin } from "../plugins";
import { TableRowCell } from "../table-body";
import { TableFooterCell } from "../table-footer";
import { TableHeaderCell } from "../table-header";
import { createTableViewReducer, type TableViewAction } from "./table-reducer";
import type { TableViewCtx } from "./table-view-context";
import type { PartialTableState } from "./types";
import {
  createColumnSortingFn,
  createInitialTable,
  getMinWidth,
  getTableViewAtom,
  toControlledState,
  toDatabaseProperties,
} from "./utils";

interface UseTableViewOptions<TPlugins extends CellPlugin[]> {
  plugins: Entity<TPlugins[number]>;
  defaultState?: PartialTableState<TPlugins>;
  state?: PartialTableState<TPlugins>;
  onStateChange?: (
    newState: PartialTableState<TPlugins>,
    type: TableViewAction<TPlugins>["type"],
  ) => void;
  dispatch?: React.Dispatch<TableViewAction<TPlugins>>;
}

/**
 * useTableView
 * @returns [table context, table dispatcher]
 */
export function useTableView<TPlugins extends CellPlugin[]>({
  plugins,
  ...props
}: UseTableViewOptions<TPlugins>) {
  const pluginsMap = plugins.items as PluginsMap<TPlugins>;
  const tableViewReducer = useMemo(
    () => createTableViewReducer(pluginsMap),
    [pluginsMap],
  );
  /** Internal state management */
  const [_state, _dispatch] = useReducer(
    tableViewReducer,
    getTableViewAtom<TPlugins>(
      pluginsMap,
      props.defaultState ?? createInitialTable(),
    ),
  );

  const dispatch = useCallback(
    (action: TableViewAction<TPlugins>) => {
      if (!props.state) return _dispatch(action);

      const nextState = tableViewReducer(
        getTableViewAtom(pluginsMap, props.state),
        action,
      );
      props.onStateChange?.(toControlledState(nextState), action.type);
      props.dispatch?.(action);
    },
    [pluginsMap, props, tableViewReducer],
  );

  const data = useMemo(
    () => props.state?.data ?? Object.values(_state.data),
    [_state.data, props.state?.data],
  );

  const rowOrder = useMemo(
    () => props.state?.data.map((row) => row.id) ?? _state.dataOrder,
    [_state.dataOrder, props.state?.data],
  );

  const columnsData = useMemo(() => {
    const properties = props.state?.properties
      ? toDatabaseProperties(plugins.items, props.state.properties)
      : Object.values(_state.properties);

    const columns = properties.map<ColumnDef<Row<TPlugins>>>((property) => {
      const plugin = plugins.items[property.type]!;
      const sortingFn = createColumnSortingFn(plugin);
      return {
        id: property.id,
        accessorKey: property.name,
        minSize: getMinWidth(property.type),
        sortingFn,
        header: ({ header }) => <TableHeaderCell header={header} />,
        cell: ({ row, column }) => <TableRowCell column={column} row={row} />,
        footer: ({ column }) => <TableFooterCell column={column} />,
      };
    });

    const columnsInfo = properties.reduce<ColumnsInfoState>(
      (acc, col) => ({ ...acc, [col.id]: col }),
      {},
    );

    return { columns, columnsInfo };
  }, [_state.properties, plugins.items, props.state?.properties]);

  const columnOrder = useMemo(
    () =>
      props.state?.properties.map((prop) => prop.id) ?? _state.propertiesOrder,
    [props.state?.properties, _state.propertiesOrder],
  );

  const table = useReactTable({
    columns: columnsData.columns,
    data,
    defaultColumn: {
      size: 200,
      minSize: 100,
      maxSize: Number.MAX_SAFE_INTEGER,
    },
    columnResizeMode: "onChange",
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting: _state.table.sorting,
      rowOrder,
      columnOrder,
      columnsInfo: columnsData.columnsInfo,
      cellPlugins: pluginsMap,
    },
    onSortingChange: (updater) => dispatch({ type: "update:sorting", updater }),
    onColumnInfoChange: (id, updater) =>
      dispatch({ type: "update:col", payload: { id }, updater }),
    onColumnOrderChange: (updater) =>
      dispatch({ type: "set:col:order", updater }),
    onRowOrderChange: (updater) => dispatch({ type: "set:row:order", updater }),
    onCellChange: (rowId, colId, data) =>
      dispatch({ type: "update:cell", payload: { rowId, colId, data } }),
    onTableDataChange: (data) =>
      dispatch({ type: "set:table:data", payload: data }),
    getRowId: (row) => row.id,
    _features: [
      ColumnsInfoFeature,
      CountingFeature,
      FreezingFeature,
      OrderingFeature,
    ],
  });

  /**
   * Instead of calling `column.getSize()` on every render for every header
   * and especially every data cell (very expensive),
   * we will calculate all column sizes at once at the root table level in a useMemo
   * and pass the column sizes down as CSS variables to the <table> element.
   */
  const columnSizeVars = useMemo(
    () => {
      return table.getFlatHeaders().reduce<Record<string, number>>(
        (sizes, header) => ({
          ...sizes,
          [`--header-${header.id}-size`]: header.getSize(),
          [`--col-${header.column.id}-size`]: header.column.getSize(),
        }),
        {},
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      // eslint-disable-next-line react-hooks/exhaustive-deps
      table.getState().columnSizingInfo,
      // eslint-disable-next-line react-hooks/exhaustive-deps
      table.getState().columnSizing,
    ],
  );

  /** DND */
  const pointer = useSensor(PointerSensor, {
    activationConstraint: { distance: 5 },
  });
  const mouse = useSensor(MouseSensor, {
    activationConstraint: { distance: 5 },
  });
  const touch = useSensor(TouchSensor, {
    activationConstraint: { distance: 5 },
  });
  const keyboard = useSensor(KeyboardSensor, {});
  const sensors = useSensors(pointer, mouse, touch, keyboard);

  const tableViewCtx = useMemo<TableViewCtx>(
    () => ({
      table,
      columnSizeVars,
      sensors,
    }),
    [columnSizeVars, sensors, table],
  );

  return [tableViewCtx, dispatch] as const;
}
