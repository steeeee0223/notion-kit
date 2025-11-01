"use client";

import React, { createContext, use } from "react";
import type { Table } from "@tanstack/react-table";

import { ModalProvider } from "@notion-kit/modal";
import { TooltipProvider } from "@notion-kit/shadcn";

import type { Row } from "../lib/types";
import { arrayToEntity } from "../lib/utils";
import { DEFAULT_PLUGINS, DefaultPlugins, type CellPlugin } from "../plugins";
import type { TableProps } from "./types";
import { useTableView } from "./use-table-view";

interface TableViewCtx<TPlugins extends CellPlugin[] = CellPlugin[]> {
  table: Table<Row<TPlugins>>;
}

const TableViewContext = createContext<TableViewCtx | null>(null);

export const useTableViewCtx = () => {
  const ctx = use(TableViewContext);
  if (!ctx)
    throw new Error(
      "`useTableViewCtx` must be used within `TableViewProvider`",
    );
  return ctx;
};

type TableViewProviderProps<TPlugins extends CellPlugin[]> =
  React.PropsWithChildren<TableProps<TPlugins>>;

export function TableViewProvider<
  TPlugins extends CellPlugin[] = DefaultPlugins,
>({
  children,
  plugins = DEFAULT_PLUGINS as TPlugins,
  ...props
}: TableViewProviderProps<TPlugins>) {
  const ctx = useTableView({
    plugins: arrayToEntity(plugins),
    ...props,
  });

  return (
    <TableViewContext value={ctx}>
      <TooltipProvider delayDuration={500}>
        <ModalProvider>{children}</ModalProvider>
      </TooltipProvider>
    </TableViewContext>
  );
}
