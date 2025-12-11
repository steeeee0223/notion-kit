"use client";

import { createContext, use } from "react";
import type { Table } from "@tanstack/react-table";

import { ModalProvider } from "@notion-kit/modal";
import { TooltipProvider } from "@notion-kit/shadcn";

import { BoardViewContent } from "../board-view";
import { LayoutType } from "../features";
import type { Row } from "../lib/types";
import { arrayToEntity } from "../lib/utils";
import { ListViewContent } from "../list-view";
import { DEFAULT_PLUGINS, DefaultPlugins, type CellPlugin } from "../plugins";
import { Toolbar } from "../tools/toolbar";
import { TableViewContent } from "./table-view-content";
import type { TableProps } from "./types";
import { useTableView } from "./use-table-view";

interface TableViewCtx<TPlugins extends CellPlugin[] = CellPlugin[]> {
  table: Table<Row<TPlugins>>;
  __synced: number;
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
  const { layout } = ctx.table.getTableGlobalState();

  return (
    <TableViewContext value={ctx}>
      <TooltipProvider delayDuration={500}>
        <ModalProvider>
          <div className="relative mb-4 flex h-7 justify-end px-24">
            <div className="fixed right-24">
              <Toolbar />
            </div>
          </div>
          <Content layout={layout} />
        </ModalProvider>
      </TooltipProvider>
    </TableViewContext>
  );
}

function Content({ layout }: { layout: LayoutType }) {
  switch (layout) {
    case "list":
      return <ListViewContent />;
    case "board":
      return <BoardViewContent />;
    default:
      return <TableViewContent />;
  }
}
