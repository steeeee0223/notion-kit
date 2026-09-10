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
import { useCellSelection } from "@/table-contexts/cell-selection-provider";

import { CellSelectionOverlay } from "./cell-selection-overlay";

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

export function useOptionalCellContext() {
  return use(CellContext);
}

export function useCellContext() {
  const context = use(CellContext);
  if (!context) throw new Error("Cell compound components require Cell.Root");
  return context;
}

function TableFrame({ children }: React.PropsWithChildren) {
  const { cell } = useCellContext();
  const selection = useCellSelection();
  const { table } = useTableViewCtx();
  const { column, row } = cell;
  const width = column.getWidth();

  return (
    <table.Subscribe
      selector={(state) => {
        void state.cellSelection;
        const rows = table.getRowsInDisplayOrder();
        const index = row.getDisplayIndex();
        const edges = cell.getSelectionEdges();
        return {
          selected: cell.getIsSelected(),
          focused: cell.getIsFocused(),
          ...edges,
          // Synthetic group headings interrupt the visible selected region.
          top: edges.top || rows[index - 1]?.getIsGrouped() === true,
          bottom: edges.bottom || rows[index + 1]?.getIsGrouped() === true,
        };
      }}
    >
      {(state) => (
        <div
          ref={(element) => {
            selection?.controller.registerFrame(cell.id, element);
          }}
          tabIndex={-1}
          data-cell-selected={Boolean(
            selection && !selection.editing && state.selected,
          )}
          data-cell-focused={Boolean(
            selection && !selection.editing && state.focused,
          )}
          onMouseDownCapture={(event) =>
            selection?.controller.start(cell, event)
          }
          onClickCapture={(event) =>
            selection?.controller.afterClick(cell, event)
          }
          onMouseEnter={(event) => selection?.controller.extend(cell, event)}
          onKeyDownCapture={(event) => selection?.controller.key(cell, event)}
          id="notion-table-view-cell"
          data-row-index={`${row.depth}:${row.index}`}
          data-col-index={column.getIndex()}
          data-property-id={column.id}
          className="relative flex h-full border-r border-r-border-cell outline-none"
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
          {/* Cell focused / selected */}
          {selection &&
            !selection.editing &&
            (state.selected || state.focused) && (
              <CellSelectionOverlay
                edges={
                  state.focused && !state.selected
                    ? { top: true, right: true, bottom: true, left: true }
                    : state
                }
              />
            )}
        </div>
      )}
    </table.Subscribe>
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
