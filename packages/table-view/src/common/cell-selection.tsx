import {
  createContext,
  use,
  useCallback,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { cn } from "@notion-kit/cn";
import type { CellInstance } from "@notion-kit/table-hook";

import { useTableViewCtx } from "@/table-contexts";

interface CellSelectionProviderProps {
  children: ReactNode;
}

interface CellSelectionEditorContextValue {
  canOpenEditor: () => boolean;
  onEditorOpenChange: (open: boolean) => void;
}

interface CellSelectionSurfaceContextValue {
  draggedRef: React.RefObject<boolean>;
  originCellIdRef: React.RefObject<string | null>;
}

const CellSelectionSurfaceContext =
  createContext<CellSelectionSurfaceContextValue | null>(null);
const CellSelectionEditorContext =
  createContext<CellSelectionEditorContextValue | null>(null);

export function CellSelectionProvider({
  children,
}: CellSelectionProviderProps) {
  const draggedRef = useRef(false);
  const originCellIdRef = useRef<string | null>(null);
  const value = useMemo(
    () => ({ draggedRef, originCellIdRef }),
    [draggedRef, originCellIdRef],
  );

  return (
    <CellSelectionSurfaceContext value={value}>
      {children}
    </CellSelectionSurfaceContext>
  );
}

export function useCellSelectionEditor() {
  return use(CellSelectionEditorContext);
}

interface CellSelectionCellProps extends React.ComponentProps<"div"> {
  cell: CellInstance;
}

export function CellSelectionCell({
  cell,
  children,
  className,
  onKeyDown,
  onMouseDown,
  onMouseEnter,
  ...props
}: CellSelectionCellProps) {
  const { table: reactTable } = useTableViewCtx();
  const surface = use(CellSelectionSurfaceContext);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const table = cell.table;

  const editorContext = useMemo<CellSelectionEditorContextValue>(
    () => ({
      canOpenEditor: () => !surface?.draggedRef.current,
      onEditorOpenChange: (open) => {
        setIsEditorOpen(open);
      },
    }),
    [cell.column.id, cell.row.id, surface?.draggedRef, table],
  );
  const handleKeyDown = useCallback<React.KeyboardEventHandler<HTMLDivElement>>(
    (event) => {
      onKeyDown?.(event);
      if (event.defaultPrevented || isEditorOpen) return;

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "a") {
        event.preventDefault();
        table.selectAllCells();
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        table.resetCellSelection(true);
        return;
      }

      const direction =
        event.key === "ArrowUp"
          ? "up"
          : event.key === "ArrowDown"
            ? "down"
            : event.key === "ArrowLeft"
              ? "left"
              : event.key === "ArrowRight"
                ? "right"
                : null;
      if (!direction) return;

      event.preventDefault();
      if (event.shiftKey) {
        table.extendCellSelection(direction);
      } else {
        table.moveCellSelection(direction);
      }
    },
    [isEditorOpen, onKeyDown, table],
  );

  return (
    <reactTable.Subscribe selector={(state) => state.cellSelection}>
      {() => {
        const isSelected = cell.getIsSelected();
        const edges = cell.getSelectionEdges();

        return (
          <CellSelectionEditorContext value={editorContext}>
            <div
              {...props}
              ref={ref}
              data-cell-selection
              tabIndex={cell.getTabIndex()}
              className={cn("relative", className)}
              onClickCapture={(event) => {
                if (!surface?.draggedRef.current) return;
                event.preventDefault();
                event.stopPropagation();
              }}
              onKeyDown={handleKeyDown}
              onMouseDown={(event) => {
                onMouseDown?.(event);
                if (event.defaultPrevented || event.button !== 0) return;
                if (surface) {
                  surface.draggedRef.current = false;
                  surface.originCellIdRef.current = cell.id;
                }
                cell.getSelectionStartHandler()(event);
              }}
              onMouseEnter={(event) => {
                onMouseEnter?.(event);
                if (event.defaultPrevented) return;
                if (
                  surface &&
                  table._isSelectingCells &&
                  surface.originCellIdRef.current !== cell.id
                ) {
                  surface.draggedRef.current = true;
                }
                cell.getSelectionExtendHandler()(event);
              }}
            >
              {children}
              {isSelected && !isEditorOpen && (
                <div
                  aria-hidden
                  data-cell-selection-overlay
                  className={cn(
                    "pointer-events-none absolute inset-0 z-(--z-col) bg-blue/5",
                    edges.top && "border-t-2 border-blue",
                    edges.right && "border-r-2 border-blue",
                    edges.bottom && "border-b-2 border-blue",
                    edges.left && "border-l-2 border-blue",
                  )}
                />
              )}
            </div>
          </CellSelectionEditorContext>
        );
      }}
    </reactTable.Subscribe>
  );
}
