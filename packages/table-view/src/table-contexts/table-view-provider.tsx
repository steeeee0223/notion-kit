"use client";

import React, { useMemo } from "react";
import { arrayMove } from "@dnd-kit/sortable";

import { TooltipProvider } from "@notion-kit/shadcn";

import type { DatabaseProperty, RowDataType } from "../types";
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
      reorderColumns: (e) => {
        // reorder columns after drag & drop
        const { active, over } = e;
        if (!over || active.id === over.id) return;
        dispatch({
          type: "reorder:col",
          updater: (prev) => {
            const oldIndex = prev.indexOf(active.id as string);
            const newIndex = prev.indexOf(over.id as string);
            return arrayMove(prev, oldIndex, newIndex); //this is just a splice util
          },
        });
      },
      duplicateColumn: (id) =>
        dispatch({ type: "duplicate:col", payload: { id } }),
      freezeColumns: (id) => dispatch({ type: "freeze:col", payload: { id } }),
      deleteColumn: (id) => dispatch({ type: "delete:col", payload: { id } }),
    }),
    [dispatch],
  );

  return (
    <TableViewContext.Provider value={tableViewCtx}>
      <TableActionsContext.Provider value={actions}>
        <TooltipProvider delayDuration={500}>{children}</TooltipProvider>
      </TableActionsContext.Provider>
    </TableViewContext.Provider>
  );
};
