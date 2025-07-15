"use client";

import React, { useMemo } from "react";
import { arrayMove } from "@dnd-kit/sortable";

import { TooltipProvider } from "@notion-kit/shadcn";

import {
  TableActionsContext,
  TableViewContext,
  type TableActions,
} from "./table-view-context";
import type { TableProps } from "./types";
import { useTableView } from "./use-table-view";

type TableViewProviderProps = React.PropsWithChildren<TableProps>;

export function TableViewProvider({
  children,
  ...props
}: TableViewProviderProps) {
  const [tableViewCtx, dispatch] = useTableView(props);

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
      toggleIconVisibility: () =>
        dispatch({ type: "toggle:icon:visibility", updater: (prev) => !prev }),
      addRow: (src) => dispatch({ type: "add:row", payload: src }),
      updateRowIcon: (id, icon) =>
        dispatch({ type: "update:row:icon", payload: { id, icon } }),
      reorder: (e, type) => {
        // reorder after drag & drop
        const { active, over } = e;
        if (!over || active.id === over.id) return;
        dispatch({
          type: `reorder:${type}`,
          updater: (prev: string[]) => {
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
}
