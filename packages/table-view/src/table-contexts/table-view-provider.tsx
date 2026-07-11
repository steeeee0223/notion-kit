import { createContext, use } from "react";
import type { Table } from "@tanstack/react-table";

import { arrayToEntity, useTableView, type Row } from "@notion-kit/table-hook";
import { TooltipProvider } from "@notion-kit/ui/primitives";

import { BoardViewContent } from "@/board-view";
import { ListViewContent } from "@/list-view";
import { DEFAULT_PLUGINS, DefaultPlugins, type CellPlugin } from "@/plugins";
import { RowView } from "@/row-view";
import { Toolbar } from "@/tools/toolbar";

import { TableViewContent } from "./table-view-content";
import type { TableProps } from "./types";

interface TableViewCtx<TPlugins extends CellPlugin[] = CellPlugin[]> {
  table: Table<Row<TPlugins>>;
}

const TableViewContext = createContext<TableViewCtx | null>(null);

export function useTableViewCtx() {
  const ctx = use(TableViewContext);
  if (!ctx)
    throw new Error("`useTableViewCtx` must be used within `TableView`");
  return ctx;
}

export function TableViewWrapper<
  TPlugins extends CellPlugin[] = DefaultPlugins,
>({
  plugins = DEFAULT_PLUGINS as TPlugins,
  children,
  ...props
}: TableProps<TPlugins>) {
  const ctx = useTableView({
    plugins: arrayToEntity(plugins),
    ...props,
  });

  return (
    <TableViewContext value={ctx}>
      <TooltipProvider>{children}</TooltipProvider>
    </TableViewContext>
  );
}

export function TableView<TPlugins extends CellPlugin[] = DefaultPlugins>({
  children,
  ...props
}: TableProps<TPlugins>) {
  return (
    <TableViewWrapper {...props}>
      <div className="relative flex flex-col gap-4">
        <div className="sticky top-0 z-(--z-row) bg-main px-24 pb-2">
          <Toolbar />
        </div>
        <Content />
      </div>
      <RowView />
      {children}
    </TableViewWrapper>
  );
}

function Content() {
  const { table } = useTableViewCtx();
  const { layout } = table.getTableGlobalState();

  switch (layout) {
    case "list":
      return <ListViewContent />;
    case "board":
      return <BoardViewContent />;
    default:
      return <TableViewContent />;
  }
}
