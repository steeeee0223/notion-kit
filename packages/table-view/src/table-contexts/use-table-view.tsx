"use client";

import { useCallback, useMemo, useReducer } from "react";
import {
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnOrderState,
  type VisibilityState,
} from "@tanstack/react-table";

import {
  ColumnsInfoFeature,
  CountingFeature,
  FreezingFeature,
  OrderingFeature,
} from "../features";
import type { PluginsMap, Row } from "../lib/types";
import { arrayToEntity, getCount, type Entity } from "../lib/utils";
import type { CellPlugin, InferConfig, InferPlugin } from "../plugins";
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

  const controlledProperties = props.state?.properties
    ? toDatabaseProperties(pluginsMap, props.state.properties)
    : undefined;
  const properties = controlledProperties ?? Object.values(_state.properties);

  const data = useMemo(
    () => props.state?.data ?? Object.values(_state.data),
    [_state.data, props.state?.data],
  );

  const rowOrder = useMemo(
    () => props.state?.data.map((row) => row.id) ?? _state.dataOrder,
    [_state.dataOrder, props.state?.data],
  );

  const columns = useMemo(
    () =>
      properties.map<ColumnDef<Row<TPlugins>>>((property) => {
        const plugin = plugins.items[property.type]!;
        const sortingFn = createColumnSortingFn(plugin);
        return {
          id: property.id,
          accessorKey: property.name,
          minSize: getMinWidth(property.type),
          sortingFn,
          header: ({ header }) => <TableHeaderCell header={header} />,
          cell: ({ row, column }) => {
            const cell = row.original.properties[property.id];
            if (!cell) return null;
            return (
              <TableRowCell
                plugin={plugin}
                data={cell.value}
                rowIndex={row.index}
                colIndex={column.getIndex()}
                propId={column.id}
                config={property.config as InferConfig<InferPlugin<TPlugins>>}
                width={column.getWidth()}
                wrapped={column.getInfo().wrapped}
                onChange={(value) =>
                  dispatch({
                    type: "update:cell",
                    payload: {
                      rowId: row.original.id,
                      colId: column.id,
                      data: { id: cell.id, value },
                    },
                  })
                }
              />
            );
          },
          footer: ({ column }) => (
            <TableFooterCell
              id={column.id}
              type={property.type}
              width={column.getWidth()}
            />
          ),
        };
      }),
    [dispatch, plugins.items, properties],
  );

  const columnVisibility = useMemo<VisibilityState>(
    () =>
      properties.reduce(
        (acc, col) => ({ ...acc, [col.id]: !col.hidden && !col.isDeleted }),
        {},
      ),
    [properties],
  );

  const columnOrder = useMemo<ColumnOrderState>(
    () =>
      props.state?.properties.map((prop) => prop.id) ?? _state.propertiesOrder,
    [props.state?.properties, _state.propertiesOrder],
  );

  const table = useReactTable({
    columns,
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
      columnVisibility,
    },
    onSortingChange: (updater) => dispatch({ type: "update:sorting", updater }),
    onColumnOrderChange: (updater) =>
      dispatch({ type: "set:col:order", updater }),
    onRowOrderChange: (updater) => dispatch({ type: "set:row:order", updater }),
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
      table.getFlatHeaders(),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      table.getState().columnSizingInfo,
      // eslint-disable-next-line react-hooks/exhaustive-deps
      table.getState().columnSizing,
    ],
  );

  /** DND */
  const columnSensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {}),
  );
  const rowSensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {}),
  );

  const tableViewCtx = useMemo<TableViewCtx>(() => {
    const uncontrolled: TableViewCtx = {
      plugins,
      table,
      columnSizeVars,
      columnSensors,
      rowSensors,
      properties: _state.properties,
      isPropertyUnique: (name) => properties.every((p) => p.name !== name),
      getColumnCount: (colId, type, method) => {
        const plugin = plugins.items[type]!;
        return getCount(
          { table, properties: _state.properties },
          colId,
          plugin,
          method,
        );
      },
    };
    if (!controlledProperties) return uncontrolled;
    const colData = arrayToEntity(controlledProperties);
    return {
      ...uncontrolled,
      properties: colData.items,
      getColumnCount: (colId, type, method) => {
        const plugin = plugins.items[type]!;
        return getCount(
          { table, properties: colData.items },
          colId,
          plugin,
          method,
        );
      },
    };
  }, [
    _state.properties,
    columnSensors,
    columnSizeVars,
    controlledProperties,
    plugins,
    properties,
    rowSensors,
    table,
  ]);

  return [tableViewCtx, dispatch] as const;
}
