import { createContext, use, useMemo, useRef } from "react";

import {
  arrayToEntity,
  useTableView,
  type TableProps,
} from "@notion-kit/table-hook";
import type { CellPlugin } from "@notion-kit/table-hook/plugins";
import { TooltipProvider } from "@notion-kit/ui/primitives";

import { BoardViewContent } from "@/board-view";
import { ListViewContent } from "@/list-view";
import { DEFAULT_PLUGINS, type DefaultPlugins } from "@/plugins";
import { RowView } from "@/row-view";
import { TimelineViewContent } from "@/timeline-view";
import { ViewControls } from "@/tools";

import { defaultColumn } from "./default-column";
import { MenuCoordinatorProvider } from "./menu-coordinator-provider";
import { TableViewContent } from "./table-view-content";

type TableViewCtx<TPlugins extends CellPlugin[] = CellPlugin[]> = ReturnType<
  typeof useTableView<TPlugins>
>;

const TableViewContext = createContext<TableViewCtx | null>(null);

export function useTableViewCtx(): TableViewCtx {
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
    () => ({
      get table() {
        return latestCtxRef.current.table;
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ctx.table.options.columns, ctx.table.options.data],
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
      <MenuCoordinatorProvider>
        <div className="relative flex flex-col gap-4">
          <div className="sticky top-0 z-(--z-row) bg-main px-24 pb-2">
            <ViewControls />
          </div>
          <Content />
        </div>
        <RowView />
        {children}
      </MenuCoordinatorProvider>
    </TableViewWrapper>
  );
}

function Content() {
  const { table } = useTableViewCtx();

  return (
    <table.Subscribe
      selector={(state) => ({
        layout: state.tableGlobal.layout,
        globalFilter: state.globalFilter as unknown,
        filters: state.tableGlobal.filters as unknown,
      })}
    >
      {({ layout }) => {
        switch (layout) {
          case "list":
            return <ListViewContent />;
          case "board":
            return <BoardViewContent />;
          case "timeline":
            return <TimelineViewContent />;
          default:
            return <TableViewContent />;
        }
      }}
    </table.Subscribe>
  );
}
