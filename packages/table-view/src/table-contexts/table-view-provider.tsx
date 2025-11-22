"use client";

import { createContext, use } from "react";
import type { Table } from "@tanstack/react-table";

import { ModalProvider } from "@notion-kit/modal";
import { TooltipProvider } from "@notion-kit/shadcn";

import type { Row } from "../lib/types";
import { arrayToEntity } from "../lib/utils";
import { DEFAULT_PLUGINS, DefaultPlugins, type CellPlugin } from "../plugins";
import { TableViewContent } from "./table-view-content";
import type { SyncedState, TableProps } from "./types";
import { useTableView } from "./use-table-view";

interface TableViewCtx<TPlugins extends CellPlugin[] = CellPlugin[]> {
  table: Table<Row<TPlugins>>;
  __synced: SyncedState;
}

const TableViewContext = createContext<TableViewCtx | null>(null);

export function useTableViewCtx() {
  const ctx = use(TableViewContext);
  if (!ctx)
    throw new Error("`useTableViewCtx` must be used within `TableView`");
  return ctx;
}

export function TableView<TPlugins extends CellPlugin[] = DefaultPlugins>({
  plugins = DEFAULT_PLUGINS as TPlugins,
  ...props
}: TableProps<TPlugins>) {
  const ctx = useTableView({
    plugins: arrayToEntity(plugins),
    ...props,
  });

  return (
    <TableViewContext value={ctx}>
      <TooltipProvider delayDuration={500}>
        <ModalProvider>
          <TableViewContent table={ctx.table} />
        </ModalProvider>
      </TooltipProvider>
    </TableViewContext>
  );
}
