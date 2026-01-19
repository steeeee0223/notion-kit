"use client";

import { createContext, use } from "react";
import type { Table } from "@tanstack/react-table";

import { Selectable } from "@notion-kit/selectable";
import { TooltipProvider } from "@notion-kit/shadcn";

import { BoardViewContent } from "../board-view";
import { LayoutType } from "../features";
import type { Row } from "../lib/types";
import { arrayToEntity } from "../lib/utils";
import { ListViewContent } from "../list-view";
import { DEFAULT_PLUGINS, DefaultPlugins, type CellPlugin } from "../plugins";
import { RowView } from "../row-view";
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
  children,
  ...props
}: TableProps<TPlugins>) {
  const ctx = useTableView({
    plugins: arrayToEntity(plugins),
    ...props,
  });
  const { layout } = ctx.table.getTableGlobalState();
  const { rowSelection } = ctx.table.getState();
  const selectionSet = new Set(Object.keys(rowSelection));

  return (
    <TableViewContext value={ctx}>
      <TooltipProvider delayDuration={500}>
        <div className="relative flex flex-col gap-4">
          <div className="sticky top-0 z-(--z-row) bg-main px-24 pb-2">
            <Toolbar />
          </div>
          <Selectable
            multiple
            value={selectionSet}
            onValueChange={(selected) => {
              ctx.table.setRowSelection(
                Object.fromEntries(
                  Array.from(selected).map((id) => [id, true]),
                ),
              );
            }}
            className="flex grow flex-col gap-4"
          >
            <Selectable.Overlay className="z-50 border border-blue bg-blue/20" />
            <Content layout={layout} />
          </Selectable>
        </div>
        <RowView />
        {children}
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
