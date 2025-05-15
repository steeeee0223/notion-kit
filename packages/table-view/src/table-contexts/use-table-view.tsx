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

import { TableHeaderCell } from "../table-header-cells";
import { TableRowCell } from "../table-row-cells";
import type { DatabaseProperty, RowDataType } from "../types";
import { TableViewAtom, tableViewReducer } from "./table-reducer";

export const useTableView = (initial: {
  properties: DatabaseProperty[];
  data: RowDataType[];
}) => {
  const [{ properties, propertiesOrder, freezedIndex, data }, dispatch] =
    useReducer(tableViewReducer, {
      ...initial.properties.reduce<
        Omit<TableViewAtom, "data" | "freezedIndex">
      >(
        (acc, col) => ({
          properties: { ...acc.properties, [col.id]: col },
          propertiesOrder: [...acc.propertiesOrder, col.id],
        }),
        { properties: {}, propertiesOrder: [] },
      ),
      freezedIndex: -1,
      data: initial.data,
    });

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
    data,
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
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {}),
  );

  return {
    table,
    columnSizeVars,
    data,
    properties,
    dispatch,
    /** DND */
    columnSensors,
  };
};
