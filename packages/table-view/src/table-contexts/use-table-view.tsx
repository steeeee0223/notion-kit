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
  type ColumnPinningState,
  type VisibilityState,
} from "@tanstack/react-table";

import { TableRowCell } from "../cells";
import { CountMethod, type RowDataType } from "../lib/types";
import { arrayToEntity, getCount, isCountMethodSet } from "../lib/utils";
import { TableFooterCell } from "../table-footer";
import { TableHeaderCell } from "../table-header";
import { tableViewReducer, type TableViewAction } from "./table-reducer";
import type { TableViewCtx } from "./table-view-context";
import type { TableProps } from "./types";
import {
  createInitialTable,
  DEFAULT_FREEZED_INDEX,
  getMinWidth,
  getTableViewAtom,
  tableViewSortingFn,
  toControlledState,
} from "./utils";

/**
 * useTableView
 * @returns [table context, table dispatcher]
 */
export function useTableView(props: TableProps) {
  const [_state, _dispatch] = useReducer(
    tableViewReducer,
    getTableViewAtom(props.defaultState ?? createInitialTable()),
  );

  const dispatch = useCallback(
    (action: TableViewAction) => {
      if (!props.state) return _dispatch(action);

      const nextState = tableViewReducer(getTableViewAtom(props.state), action);
      props.onStateChange?.(toControlledState(nextState), action.type);
      props.dispatch?.(action);
    },
    [_dispatch, props],
  );

  const properties =
    props.state?.properties ?? Object.values(_state.properties);

  const data = useMemo(
    () => props.state?.data ?? Object.values(_state.data),
    [_state.data, props.state?.data],
  );

  const dataOrder = useMemo(
    () => props.state?.data.map((row) => row.id) ?? _state.dataOrder,
    [_state.dataOrder, props.state?.data],
  );

  const columns = useMemo(
    () =>
      properties.map<ColumnDef<RowDataType>>(({ id, ...property }) => ({
        id,
        accessorKey: property.name,
        minSize: getMinWidth(property.type),
        sortingFn: tableViewSortingFn,
        header: ({ header }) => (
          <TableHeaderCell
            id={id}
            width={`calc(var(--col-${id}-size) * 1px)`}
            isResizing={header.column.getIsResizing()}
            resizeHandle={{
              onMouseDown: header.getResizeHandler(),
              onMouseUp: () =>
                dispatch({
                  type: "update:col",
                  payload: {
                    id,
                    data: { width: `${header.column.getSize()}px` },
                  },
                }),
              onTouchStart: header.getResizeHandler(),
              onTouchEnd: () =>
                dispatch({
                  type: "update:col",
                  payload: {
                    id,
                    data: { width: `${header.column.getSize()}px` },
                  },
                }),
            }}
          />
        ),
        cell: ({ row, column }) => {
          const cell = row.original.properties[id];
          if (!cell) return null;
          return (
            <TableRowCell
              data={cell}
              rowId={row.index}
              colId={column.getIndex()}
              // width={property.width}
              width={`calc(var(--col-${id}-size) * 1px)`}
              icon={
                _state.table.showPageIcon && cell.type === "title"
                  ? row.original.icon
                  : undefined
              }
              wrapped={property.wrapped}
              onChange={(data) =>
                dispatch({
                  type: "update:cell",
                  payload: {
                    rowId: row.original.id,
                    colId: id,
                    data: { id: cell.id, ...data },
                  },
                })
              }
            />
          );
        },
        footer: () => (
          <TableFooterCell
            id={id}
            type={property.type}
            countMethod={property.countMethod ?? CountMethod.NONE}
            isCountCapped={property.isCountCapped}
            width={`calc(var(--col-${id}-size) * 1px)`}
          />
        ),
      })),
    [_state.table.showPageIcon, dispatch, properties],
  );

  const columnVisibility = useMemo<VisibilityState>(
    () =>
      properties.reduce(
        (acc, col) => ({ ...acc, [col.id]: !col.hidden && !col.isDeleted }),
        {},
      ),
    [properties],
  );

  const columnPinning = useMemo<ColumnPinningState>(() => {
    return {
      left: props.state
        ? props.state.properties
            .slice(0, (props.state.freezedIndex ?? DEFAULT_FREEZED_INDEX) + 1)
            .map((prop) => prop.id)
        : _state.propertiesOrder.slice(0, _state.freezedIndex + 1),
    };
  }, [props.state, _state.propertiesOrder, _state.freezedIndex]);

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
      columnOrder,
      columnVisibility,
      columnPinning,
    },
    onSortingChange: (updater) => dispatch({ type: "update:sorting", updater }),
    getRowId: (row) => row.id,
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
      table,
      columnSizeVars,
      columnSensors,
      rowSensors,
      dataOrder,
      properties: _state.properties,
      showPageIcon: _state.table.showPageIcon,
      isPropertyUnique: (name) => properties.every((p) => p.name !== name),
      canFreezeProperty: (id) => table.getState().columnOrder.at(-1) !== id,
      isSomeCountMethodSet: isCountMethodSet(_state.properties),
      getColumnCount: (...params) =>
        getCount({ table, properties: _state.properties }, ...params),
    };
    if (!props.state?.properties) return uncontrolled;
    const colData = arrayToEntity(props.state.properties);
    return {
      ...uncontrolled,
      properties: colData.items,
      isSomeCountMethodSet: isCountMethodSet(colData.items),
      getColumnCount: (...params) =>
        getCount({ table, properties: colData.items }, ...params),
    };
  }, [
    _state.properties,
    _state.table.showPageIcon,
    columnSensors,
    columnSizeVars,
    dataOrder,
    properties,
    props.state?.properties,
    rowSensors,
    table,
  ]);

  return [tableViewCtx, dispatch] as const;
}
