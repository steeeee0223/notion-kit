import React, { createContext, use } from "react";

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

function Root({
  children,
  ...value
}: React.PropsWithChildren<CellContextValue>) {
  return <CellContext value={value}>{children}</CellContext>;
}

export function useCellContext() {
  const context = use(CellContext);
  if (!context) throw new Error("Cell compound components require Cell.Root");
  return context;
}

function TableFrame({ children }: React.PropsWithChildren) {
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
      {/* <div className="pointer-events-none absolute top-0 left-0 z-(--z-col) size-full rounded-sm bg-blue/5 shadow-cell-focus" /> */}
    </div>
  );
}

function CompactFrame({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex empty:hidden", className)} {...props} />;
}

function Tooltip({ children }: { children: React.ReactElement }) {
  const { cell, surface, table } = useCellContext();
  const info = cell.column.getInfo();
  const uiPlugin = useTableViewCtx().plugins.getUiPlugin(info.type);

  return (
    <TooltipPreset
      disabled={
        table.getTableGlobalState().locked === true ||
        uiPlugin.disablePropertyTooltip === true
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
  const plugin = cell.getPlugin();
  const uiPlugin = plugins.getUiPlugin(plugin.id);
  return uiPlugin.renderCell({ cell });
}

export const Cell = {
  Root,
  TableFrame,
  CompactFrame,
  Tooltip,
  Content,
};
