/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useMemo, useReducer } from "react";
import {
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  ColumnPinningState,
  getCoreRowModel,
  useReactTable,
  VisibilityState,
  type ColumnDef,
} from "@tanstack/react-table";

import { TableRowCell } from "../cells";
import { CountMethod, type RowDataType } from "../lib/types";
import { TableFooterCell } from "../table-footer";
import { TableHeaderCell } from "../table-header";
import { tableViewReducer } from "./table-reducer";
import type { ControlledTableState } from "./types";
import { getTableViewAtom } from "./utils";

/**
 * useTableView
 * @returns Uncontrolled table states
 */
export const useTableView = (initialState: ControlledTableState) => {
  const [
    { properties, propertiesOrder, freezedIndex, data, dataOrder },
    dispatch,
  ] = useReducer(tableViewReducer, getTableViewAtom(initialState));
  const tableData = useMemo(() => Object.values(data), [data]);

  const columns = useMemo(
    () =>
      Object.values(properties).map<ColumnDef<RowDataType>>(
        ({ id, ...property }) => ({
          id,
          accessorKey: property.name,
          minSize: property.type === "checkbox" ? 32 : 100,
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
                icon={cell.type === "title" ? row.original.icon : undefined}
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
        }),
      ),
    [properties],
  );

  const columnVisibility = useMemo<VisibilityState>(
    () =>
      Object.values(properties).reduce(
        (acc, col) => ({ ...acc, [col.id]: !col.hidden && !col.isDeleted }),
        {},
      ),
    [properties],
  );

  const columnPinning = useMemo<ColumnPinningState>(
    () => ({ left: propertiesOrder.slice(0, freezedIndex + 1) }),
    [propertiesOrder, freezedIndex],
  );

  const table = useReactTable({
    columns,
    data: tableData,
    defaultColumn: {
      size: 200,
      minSize: 100,
      maxSize: Number.MAX_SAFE_INTEGER,
    },
    columnResizeMode: "onChange",
    getCoreRowModel: getCoreRowModel(),
    state: {
      columnOrder: propertiesOrder,
      columnVisibility,
      columnPinning,
    },
    getRowId: (row) => row.id,
  });

  /**
   * Instead of calling `column.getSize()` on every render for every header
   * and especially every data cell (very expensive),
   * we will calculate all column sizes at once at the root table level in a useMemo
   * and pass the column sizes down as CSS variables to the <table> element.
   */
  const columnSizeVars = useMemo(() => {
    return table.getFlatHeaders().reduce<Record<string, number>>(
      (sizes, header) => ({
        ...sizes,
        [`--header-${header.id}-size`]: header.getSize(),
        [`--col-${header.column.id}-size`]: header.column.getSize(),
      }),
      {},
    );
  }, [
    table.getFlatHeaders(),
    table.getState().columnSizingInfo,
    table.getState().columnSizing,
  ]);

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

  return {
    table,
    columnSizeVars,
    dataOrder,
    properties,
    dispatch,
    /** DND */
    columnSensors,
    rowSensors,
  };
};
