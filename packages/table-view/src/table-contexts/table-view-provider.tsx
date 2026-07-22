import { createContext, use, useMemo, useRef } from "react";

import {
  arrayToEntity,
  useTableView,
  type TableProps,
} from "@notion-kit/table-hook";
import { TooltipProvider } from "@notion-kit/ui/primitives";

import { BoardViewContent } from "@/board-view";
import { ListViewContent } from "@/list-view";
import {
  DEFAULT_PLUGINS,
  type CellPlugin,
  type DefaultPlugins,
} from "@/plugins";
import { RowView } from "@/row-view";
import { Toolbar } from "@/tools/toolbar";

import { defaultColumn } from "./default-column";
import { TableViewContent } from "./table-view-content";

type TableViewCtx<TPlugins extends CellPlugin[] = CellPlugin[]> = ReturnType<
  typeof useTableView<TPlugins>
>;

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
  const pluginEntity = useMemo(() => arrayToEntity(plugins), [plugins]);
  const ctx = useTableView<TPlugins>({
    plugins: pluginEntity,
    defaultColumn: defaultColumn as TableProps<TPlugins>["defaultColumn"],
    ...props,
  });
  const latestCtxRef = useRef(ctx);
  latestCtxRef.current = ctx;
  const contextValue = useMemo(
    () =>
      ({
        get table() {
          return latestCtxRef.current.table;
        },
      }) as TableViewCtx<TPlugins>,
    [],
  );

  return (
    <TableViewContext value={contextValue}>
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

  return (
    <table.Subscribe selector={(state) => state.tableGlobal.layout}>
      {(layout) => {
        switch (layout) {
          case "list":
            return <ListViewContent />;
          case "board":
            return <BoardViewContent />;
          default:
            return <TableViewContent />;
        }
      }}
    </table.Subscribe>
  );
}
