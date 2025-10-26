"use client";

import React from "react";

import { TooltipProvider } from "@notion-kit/shadcn";

import { arrayToEntity } from "../lib/utils";
import { DEFAULT_PLUGINS, DefaultPlugins, type CellPlugin } from "../plugins";
import { TableViewContext } from "./table-view-context";
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
  const tableViewCtx = useTableView({
    plugins: arrayToEntity(plugins),
    ...props,
  });

  return (
    <TableViewContext value={tableViewCtx}>
      <TooltipProvider delayDuration={500}>{children}</TooltipProvider>
    </TableViewContext>
  );
}
