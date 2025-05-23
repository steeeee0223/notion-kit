"use client";

import React, { useMemo } from "react";
import { arrayMove } from "@dnd-kit/sortable";

import { TooltipProvider } from "@notion-kit/shadcn";

import type { DatabaseProperty, RowDataType } from "../lib/types";
import { getCount, isCountMethodSet } from "../lib/utils";
import {
  TableActionsContext,
  TableViewContext,
  type TableActions,
  type TableViewCtx,
} from "./table-view-context";
import { useTableView } from "./use-table-view";

interface TableViewProviderProps extends React.PropsWithChildren {
  initialData: {
    properties: DatabaseProperty[];
    data: RowDataType[];
  };
}

export const TableViewProvider: React.FC<TableViewProviderProps> = ({
  children,
  initialData,
}) => {
  const { dispatch, ...ctx } = useTableView(initialData);

  const tableViewCtx = useMemo<TableViewCtx>(
    () => ({
      ...ctx,
      getColumn: (id: string) => ctx.properties[id] ?? null,
      isPropertyUnique: (name: string) =>
        Object.values(ctx.properties).every((p) => p.name !== name),
      canFreezeProperty: (id: string) =>
        ctx.table.getState().columnOrder.at(-1) !== id,
      isSomeCountMethodSet: isCountMethodSet(ctx.properties),
      getColumnCount: (...params) => getCount(ctx, ...params),
    }),
    [ctx],
  );

  const actions = useMemo<TableActions>(
    () => ({
      dispatch,
      addColumn: (payload) => dispatch({ type: "add:col", payload }),
      updateColumn: (id, data) =>
        dispatch({ type: "update:col", payload: { id, data } }),
      updateColumnType: (id, type) =>
        dispatch({ type: "update:col:type", payload: { id, type } }),
      toggleAllColumns: (hidden) =>
        dispatch({ type: "update:col:visibility", payload: { hidden } }),
      freezeColumns: (id) => dispatch({ type: "freeze:col", payload: { id } }),
      toggleCountCap: (id) =>
        dispatch({
          type: "update:count:cap",
          payload: { id, updater: (prev) => !prev },
        }),
      addRow: (src) => dispatch({ type: "add:row", payload: src }),
      reorder: (e, type) => {
        // reorder after drag & drop
        const { active, over } = e;
        if (!over || active.id === over.id) return;
        dispatch({
          type: `reorder:${type}`,
          updater: (prev) => {
            const oldIndex = prev.indexOf(active.id as string);
            const newIndex = prev.indexOf(over.id as string);
            return arrayMove(prev, oldIndex, newIndex); //this is just a splice util
          },
        });
      },
      duplicate: (id, type) =>
        dispatch({ type: `duplicate:${type}`, payload: { id } }),
      remove: (id, type) =>
        dispatch({ type: `delete:${type}`, payload: { id } }),
    }),
    [dispatch],
  );

  return (
    <TableViewContext value={tableViewCtx}>
      <TableActionsContext value={actions}>
        <TooltipProvider delayDuration={500}>{children}</TooltipProvider>
      </TableActionsContext>
    </TableViewContext>
  );
};
