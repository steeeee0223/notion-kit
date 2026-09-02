import {
  createContext,
  use,
  type ComponentProps,
  type ReactElement,
  type ReactNode,
} from "react";

import { cn } from "@notion-kit/cn";
import { Icon } from "@notion-kit/icons";
import {
  type TableInstance as _TableInstance,
  type CellInstance,
} from "@notion-kit/table-hook";
import {
  Button,
  TooltipDescription,
  TooltipPreset,
} from "@notion-kit/ui/primitives";

import type { CellSurface } from "@/plugins/registry";
import { useTableViewCtx } from "@/table-contexts";

interface CellContextValue {
  cell: CellInstance;
  table: _TableInstance;
  surface: CellSurface;
  wrapped?: boolean;
}

const CellContext = createContext<CellContextValue | null>(null);

interface CellRootProps extends CellContextValue {
  children: ReactNode;
}

function Root({ children, ...value }: CellRootProps) {
  return <CellContext value={value}>{children}</CellContext>;
}

export function useCellContext() {
  const context = use(CellContext);
  if (!context) throw new Error("Cell compound components require Cell.Root");
  return context;
}

function TableFrame({ children }: { children: ReactNode }) {
  const { cell } = useCellContext();
  const { column, row } = cell;
  const width = column.getWidth();

  return (
    <div
      id="notion-table-view-cell"
      data-row-index={`${row.depth}:${row.index}`}
      data-col-index={column.getIndex()}
      data-property-id={column.id}
      className="relative flex h-full border-r border-r-border-cell"
      style={{ width }}
    >
      {row.subRows.length > 0 && (
        <div className="mt-1.5 flex">
          <Button
            tabIndex={0}
            variant="hint"
            className="size-6"
            aria-expanded={row.getIsExpanded()}
            aria-label={row.getIsExpanded() ? "Close" : "Open"}
            onPointerDown={row.getToggleExpandedHandler()}
          >
            <Icon.ArrowCaretFillSmall
              className="size-[0.8em] fill-menu-icon transition-[rotate]"
              side={row.getIsExpanded() ? "down" : "right"}
            />
          </Button>
        </div>
      )}
      <div className="flex h-full overflow-x-clip" style={{ width }}>
        {children}
      </div>
      {/* Cell focused */}
      <div className="pointer-events-none absolute top-0 left-0 z-(--z-col) size-full rounded-sm bg-blue/5 shadow-cell-focus" />
    </div>
  );
}

function CompactFrame({
  children,
  className,
  ref,
  ...props
}: ComponentProps<"div">) {
  return (
    <div {...props} ref={ref} className={cn("flex empty:hidden", className)}>
      {children}
    </div>
  );
}

function Tooltip({ children }: { children: ReactElement }) {
  const { cell, surface, table } = useCellContext();
  const info = cell.column.getInfo();
  const uiPlugin = useTableViewCtx().plugins.getUiPlugin(
    cell.column.getPlugin().id,
  );

  return (
    <TooltipPreset
      // Both conditions independently disable the tooltip; `??` is not equivalent.

      disabled={
        table.getTableGlobalState().locked === true ||
        uiPlugin.disablePropertyTooltip
      }
      side={surface === "board" ? "left" : "top"}
      description={
        info.description ? (
          <>
            <TooltipDescription text={info.name} />
            <TooltipDescription type="secondary" text={info.description} />
          </>
        ) : (
          info.name
        )
      }
    >
      {children}
    </TooltipPreset>
  );
}

function Content() {
  const { cell } = useCellContext();
  const { plugins } = useTableViewCtx();
  const { column, row } = cell;
  const data = row.original.properties[column.id];
  const plugin = column.getPlugin();
  const uiPlugin = plugins.getUiPlugin(plugin.id);
  if (!data) return null;
  return uiPlugin.renderCell({ cell });
}

export const Cell = {
  Root,
  TableFrame,
  CompactFrame,
  Tooltip,
  Content,
};
