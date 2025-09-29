"use client";

import React, { useMemo } from "react";
import { arrayMove } from "@dnd-kit/sortable";

import { TooltipProvider } from "@notion-kit/shadcn";

import { arrayToEntity } from "../lib/utils";
import { DEFAULT_PLUGINS, DefaultPlugins, type CellPlugin } from "../plugins";
import {
  TableActionsContext,
  TableViewContext,
  type TableActions,
} from "./table-view-context";
import type { TableProps } from "./types";
import { useTableView } from "./use-table-view";

type TableViewProviderProps<TPlugins extends CellPlugin[]> =
  React.PropsWithChildren<TableProps<TPlugins>>;

export function TableViewProvider<
  TPlugins extends CellPlugin[] = DefaultPlugins,
>({
  children,
  plugins = DEFAULT_PLUGINS as TPlugins,
  ...props
}: TableViewProviderProps<TPlugins>) {
  const [tableViewCtx, dispatch] = useTableView({
    plugins: arrayToEntity(plugins),
    ...props,
  });

  const actions = useMemo<TableActions<TPlugins>>(
    () => ({
      dispatch,
      addColumn: (payload) => dispatch({ type: "add:col", payload }),
      updateColumn: (id, data) =>
        dispatch({ type: "update:col", payload: { id, data } }),
      updateColumnType: (id, type) =>
        dispatch({ type: "update:col:type", payload: { id, type } }),
      toggleAllColumns: (hidden) =>
        dispatch({ type: "update:col:visibility", payload: { hidden } }),
      addRow: (src) => dispatch({ type: "add:row", payload: src }),
      updateRowIcon: (id, icon) =>
        dispatch({ type: "update:row:icon", payload: { id, icon } }),
      reorder: (e, type) => {
        const { active, over } = e;
        if (!over || active.id === over.id) return;
        dispatch({
          type: `reorder:${type}`,
          updater: (prev: string[]) => {
            const oldIndex = prev.indexOf(active.id as string);
            const newIndex = prev.indexOf(over.id as string);
            return arrayMove(prev, oldIndex, newIndex);
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
      <TableActionsContext value={actions as unknown as TableActions}>
        <TooltipProvider delayDuration={500}>{children}</TooltipProvider>
      </TableActionsContext>
    </TableViewContext>
  );
}
