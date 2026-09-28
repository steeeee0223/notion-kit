import { createContext, use, useCallback, useMemo, useRef } from "react";

import {
  arrayToEntity,
  useTableView,
  type RowInstance,
  type TableInstance,
  type TableProps,
} from "@notion-kit/table-hook";
import type { CellPlugin } from "@notion-kit/table-hook/plugins";
import { TooltipProvider } from "@notion-kit/ui/primitives";

import { BoardViewContent } from "@/board-view";
import { CalendarViewContent } from "@/calendar-view";
import { Table } from "@/common";
import { DateViewNavigationProvider } from "@/date-view/date-view-navigation-provider";
import { EditLogProvider } from "@/edit-log/edit-log-provider";
import type { EditLogProps } from "@/edit-log/types";
import { ListViewContent } from "@/list-view";
import { TableViewMessagesProvider } from "@/messages";
import type { DeepPartial, TableViewMessages } from "@/messages";
import {
  createPluginRegistry,
  DEFAULT_PLUGINS,
  type DefaultPlugins,
  type TablePluginPair,
  type TablePluginRegistry,
} from "@/plugins";
import {
  resolveTableViewReadOnly,
  type ResolvedTableViewReadOnly,
  type TableViewReadOnly,
} from "@/read-only";
import { RowView } from "@/row-view";
import { TimelineViewContent } from "@/timeline-view";
import { ViewControls } from "@/tools";

import { defaultColumn } from "./default-column";
import { MenuCoordinatorProvider } from "./menu-coordinator-provider";
import { TableViewContent } from "./table-view-content";

/** Renders extra content below the property list in a row peek/dialog/full view. */
export type RenderRowView = (
  row: RowInstance,
  table: TableInstance,
) => React.ReactNode;

interface TableViewCtx<TPlugins extends CellPlugin[] = CellPlugin[]> {
  table: ReturnType<typeof useTableView<TPlugins>>["table"];
  plugins: TablePluginRegistry<TPlugins>;
  readOnly: ResolvedTableViewReadOnly;
  renderRowView?: RenderRowView;
  openRowOnClick: boolean;
  onNewRow?: (table: TableInstance) => void;
}

const TableViewContext = createContext<TableViewCtx | null>(null);

export function useTableViewCtx(): TableViewCtx {
  const ctx = use(TableViewContext);
  if (!ctx)
    throw new Error("`useTableViewCtx` must be used within `TableView`");
  return ctx;
}

export interface TableViewLocalizationProps {
  /** Deep-partial override of `defaultTableViewMessages`. Unset keys fall back to English. */
  messages?: DeepPartial<TableViewMessages>;
}

export interface TableViewReadOnlyProps {
  /**
   * Presents the table as read-only: no edits, no drag, no row selection
   * (the table behaves as `locked`). Pass `true` to hide every optional
   * affordance, or an options object to hide a subset. See
   * `TableViewReadOnlyOptions` for the individual flags.
   */
  readOnly?: TableViewReadOnly;
  /**
   * Content rendered below the property list in the row peek (side/center/
   * full) view. Receives the opened row and the table instance.
   */
  renderRowView?: RenderRowView;
  /** Called whenever the opened row changes, including when it closes (`null`). */
  onRowOpen?: (rowId: string | null) => void;
  /**
   * Makes the primary "table" and "list" layout rows open the row peek when
   * clicked anywhere on the row (not just the title cell's hover affordance),
   * and when `Enter` is pressed on a focused row.
   */
  openRowOnClick?: boolean;
  /**
   * Called when the toolbar "New" button is clicked. When omitted, "New"
   * calls `table.addRow()`. The button is hidden entirely in read-only mode
   * (or when `readOnly.hideNewButton` is set).
   */
  onNewRow?: (table: TableInstance) => void;
}

export function TableViewWrapper<
  TPlugins extends CellPlugin[] = DefaultPlugins,
>({
  plugins = DEFAULT_PLUGINS as unknown as TablePluginPair<TPlugins>,
  children,
  fetchTableEditLogs,
  fetchRowEditLogs,
  messages,
  readOnly,
  renderRowView,
  onRowOpen,
  openRowOnClick = false,
  onNewRow,
  view,
  defaultView,
  onViewChange,
  ...props
}: Omit<TableProps<TPlugins>, "plugins"> &
  EditLogProps &
  TableViewLocalizationProps &
  TableViewReadOnlyProps & {
    plugins?: TablePluginPair<TPlugins>;
  }) {
  const registry = useMemo(() => createPluginRegistry(plugins), [plugins]);
  const pluginEntity = useMemo(
    () => arrayToEntity(registry.data),
    [registry.data],
  );
  const resolvedReadOnly = useMemo(
    () => resolveTableViewReadOnly(readOnly),
    [readOnly],
  );
  const onRowOpenRef = useRef(onRowOpen);
  onRowOpenRef.current = onRowOpen;
  const handleViewChange = useCallback<
    NonNullable<TableProps<TPlugins>["onViewChange"]>
  >(
    (change) => {
      onViewChange?.(change);
      if (
        onRowOpenRef.current &&
        change.action.type === "view.opened_row.change"
      ) {
        onRowOpenRef.current(change.action.payload.nextRowId);
      }
    },
    [onViewChange],
  );
  const viewProps = useMemo(() => {
    if (!resolvedReadOnly.locked) return { view, defaultView };
    if (view) return { view: { ...view, locked: true }, defaultView };
    return { view, defaultView: { ...defaultView, locked: true } };
  }, [view, defaultView, resolvedReadOnly.locked]);
  const tableOptions = {
    plugins: pluginEntity,
    defaultColumn: defaultColumn as TableProps<TPlugins>["defaultColumn"],
    ...props,
    ...viewProps,
    onViewChange: handleViewChange,
  } as Parameters<typeof useTableView<TPlugins>>[0];
  const ctx = useTableView<TPlugins>(tableOptions);
  const latestCtxRef = useRef(ctx);
  latestCtxRef.current = ctx;
  const contextValue = useMemo(
    () => ({
      get table() {
        return latestCtxRef.current.table;
      },
      plugins: registry,
      readOnly: resolvedReadOnly,
      renderRowView,
      openRowOnClick,
      onNewRow,
    }),
    // Track columns/data deliberately to force recompute on structural changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      ctx.table.options.columns,
      ctx.table.options.data,
      registry,
      resolvedReadOnly,
      renderRowView,
      openRowOnClick,
      onNewRow,
    ],
  );

  return (
    <TableViewMessagesProvider messages={messages}>
      <TableViewContext value={contextValue as unknown as TableViewCtx}>
        <DateViewNavigationProvider>
          <TooltipProvider>
            <EditLogProvider
              fetchTableEditLogs={fetchTableEditLogs}
              fetchRowEditLogs={fetchRowEditLogs}
            >
              {children}
            </EditLogProvider>
          </TooltipProvider>
        </DateViewNavigationProvider>
      </TableViewContext>
    </TableViewMessagesProvider>
  );
}

export function TableView<TPlugins extends CellPlugin[] = DefaultPlugins>({
  children,
  ...props
}: Omit<TableProps<TPlugins>, "plugins"> &
  EditLogProps &
  TableViewLocalizationProps &
  TableViewReadOnlyProps & {
    plugins?: TablePluginPair<TPlugins>;
  }) {
  return (
    <TableViewWrapper {...props}>
      <MenuCoordinatorProvider>
        <Table.Root className="flex flex-col gap-4">
          <Table.Content
            data-slot="table-view-toolbar-container"
            className="sticky top-0 z-(--z-row) w-full min-w-0 overflow-x-clip bg-main pb-2"
          >
            <ViewControls />
          </Table.Content>
          <Content />
          {children}
        </Table.Root>
        <RowView />
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
            return (
              <ScrollableContent>
                <BoardViewContent />
              </ScrollableContent>
            );
          case "calendar":
            return <CalendarViewContent />;
          case "timeline":
            return (
              <ScrollableContent>
                <TimelineViewContent />
              </ScrollableContent>
            );
          default:
            return (
              <ScrollableContent>
                <TableViewContent />
              </ScrollableContent>
            );
        }
      }}
    </table.Subscribe>
  );
}

function ScrollableContent({ children }: React.PropsWithChildren) {
  return (
    <div
      data-slot="table-view-scroll-container"
      className="w-full min-w-0 overflow-x-auto"
    >
      {children}
    </div>
  );
}
