import {
  createContext,
  use,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type PropsWithChildren,
} from "react";

import type { CellInstance } from "@notion-kit/table-hook";

import { useTableViewCtx } from "./table-view-provider";

function isCellTarget(target: EventTarget | null, frame: HTMLElement) {
  if (!(target instanceof Element) || !frame.contains(target)) return false;
  return !target.closest(
    'button, a, input, textarea, select, [contenteditable="true"], [data-cell-selection-ignore]',
  );
}

function createController(
  table: ReturnType<typeof useTableViewCtx>["table"],
  setEditing: (editing: boolean) => void,
) {
  const frames = new Map<string, HTMLElement>();
  let revision = 0;
  let editor: {
    token: number;
    cell: CellInstance;
    revision: number;
    dismiss: () => void;
  } | null = null;
  let token = 0;
  let gesture: { id: string; suppress: boolean; active: boolean } | null = null;
  let cleanupGesture: (() => void) | undefined;
  let disposed = false;
  let cleanupOwnership: (() => void) | undefined;

  const focus = (cell: CellInstance) =>
    frames.get(cell.id)?.focus({ preventScroll: true });
  const valid = (cell: CellInstance) =>
    frames.has(cell.id) &&
    table.getRowsInDisplayOrder().some((row) => row.id === cell.row.id) &&
    cell.column.getIsVisible();

  return {
    registerFrame(cellId: string, element: HTMLElement | null) {
      if (element) frames.set(cellId, element);
      else frames.delete(cellId);
    },
    mount(doc: Document) {
      disposed = false;
      const claimInteraction = (event: Event) => {
        if (
          event.target instanceof Element &&
          !event.target.closest(
            '[data-slot="popover-content"], [data-slot="dropdown-menu-content"]',
          )
        )
          revision++;
      };
      doc.addEventListener("pointerdown", claimInteraction, true);
      doc.addEventListener("focusin", claimInteraction, true);
      cleanupOwnership = () => {
        doc.removeEventListener("pointerdown", claimInteraction, true);
        doc.removeEventListener("focusin", claimInteraction, true);
      };
    },
    dispose() {
      disposed = true;
      cleanupGesture?.();
      cleanupOwnership?.();
      gesture = null;
      editor = null;
    },
    open(cell: CellInstance, dismiss: () => void) {
      editor?.dismiss();
      const session = ++token;
      editor = { token: session, cell, revision, dismiss };
      setEditing(true);
      return session;
    },
    close(session: number, restore = true) {
      if (editor?.token !== session) return;
      const previous = editor;
      editor = null;
      setEditing(false);
      queueMicrotask(() => {
        if (
          !restore ||
          disposed ||
          editor ||
          previous.revision !== revision ||
          !valid(previous.cell)
        )
          return;
        table.setFocusedCell(previous.cell.row.id, previous.cell.column.id);
        focus(previous.cell);
      });
    },
    start(cell: CellInstance, event: MouseEvent<HTMLElement>) {
      if (
        event.button !== 0 ||
        !isCellTarget(event.target, event.currentTarget) ||
        !cell.getCanSelect()
      )
        return;
      cleanupGesture?.();
      gesture = {
        id: cell.id,
        active: true,
        suppress: event.shiftKey || event.ctrlKey || event.metaKey,
      };
      const doc = event.currentTarget.ownerDocument;
      cell.getSelectionStartHandler(doc)(event);
      focus(cell);
      let timer: ReturnType<typeof setTimeout> | undefined;
      const end = () => {
        if (gesture) gesture.active = false;
        if (gesture?.suppress) focus(cell);
        timer = setTimeout(() => {
          gesture = null;
        }, 0);
      };
      doc.addEventListener("mouseup", end, { once: true });
      cleanupGesture = () => {
        doc.removeEventListener("mouseup", end);
        clearTimeout(timer);
      };
    },
    extend(cell: CellInstance, event: MouseEvent<HTMLElement>) {
      if (!gesture?.active || !cell.getCanSelect()) return;
      if (cell.id !== gesture.id) gesture.suppress = true;
      cell.getSelectionExtendHandler()(event);
    },
    click(event: MouseEvent<HTMLElement>) {
      if (!gesture?.suppress) return;
      event.preventDefault();
      event.stopPropagation();
      gesture = null;
    },
    afterClick(cell: CellInstance, event: MouseEvent<HTMLElement>) {
      if (!isCellTarget(event.target, event.currentTarget)) return;
      const clickedRevision = revision;
      queueMicrotask(() => {
        if (!disposed && !editor && revision === clickedRevision && valid(cell))
          focus(cell);
      });
    },
    key(cell: CellInstance, event: KeyboardEvent<HTMLElement>) {
      if (
        editor ||
        !isCellTarget(event.target, event.currentTarget) ||
        event.altKey ||
        event.isDefaultPrevented()
      )
        return;
      if (
        event.target === event.currentTarget &&
        (event.key === "Enter" || event.key === " ")
      ) {
        event.currentTarget
          .querySelector<HTMLElement>(
            '[data-cell-trigger]:not([aria-disabled="true"])',
          )
          ?.click();
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      const directions: Partial<
        Record<string, "up" | "down" | "left" | "right">
      > = {
        ArrowUp: "up",
        ArrowDown: "down",
        ArrowLeft: "left",
        ArrowRight: "right",
      };
      const direction = directions[event.key];
      if (direction && !event.ctrlKey && !event.metaKey) {
        const rows = table
          .getRowsInDisplayOrder()
          .filter((row) => !row.getIsGrouped());
        const columns = table
          .getVisibleLeafColumns()
          .slice()
          .sort(
            (a, b) =>
              table.getCellSelectionColumnIndexes()[a.id]! -
              table.getCellSelectionColumnIndexes()[b.id]!,
          );
        const ranges = table.atoms.cellSelection.get();
        const active = ranges.at(-1);
        const rowId = active
          ? event.shiftKey
            ? active.focusRowId
            : active.anchorRowId
          : cell.row.id;
        const columnId = active
          ? event.shiftKey
            ? active.focusColumnId
            : active.anchorColumnId
          : cell.column.id;
        const rowIndex = rows.findIndex((row) => row.id === rowId);
        const columnIndex = columns.findIndex(
          (column) => column.id === columnId,
        );
        const row =
          rows[
            rowIndex + (direction === "up" ? -1 : direction === "down" ? 1 : 0)
          ];
        const column =
          columns[
            columnIndex +
              (direction === "left" ? -1 : direction === "right" ? 1 : 0)
          ];
        const next = row
          ?.getAllCells()
          .find((candidate) => candidate.column.id === column?.id);
        if (next?.getCanSelect()) {
          if (event.shiftKey) {
            const range = active ?? {
              anchorRowId: cell.row.id,
              anchorColumnId: cell.column.id,
            };
            table.setCellSelection([
              ...ranges.slice(0, -1),
              {
                ...range,
                focusRowId: next.row.id,
                focusColumnId: next.column.id,
              },
            ]);
          } else table.setFocusedCell(next.row.id, next.column.id);
          focus(next);
        }
      } else if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "a"
      ) {
        // Group headings can be endpoints of TanStack's select-all rectangle, but cannot be focused.
        const rows = table
          .getRowsInDisplayOrder()
          .filter((row) => !row.getIsGrouped());
        const first = rows[0]
          ?.getVisibleCells()
          .find((candidate) => candidate.getCanSelect());
        const last = rows
          .at(-1)
          ?.getVisibleCells()
          .slice()
          .reverse()
          .find((candidate) => candidate.getCanSelect());
        if (first && last)
          table.selectCellRange({
            anchorRowId: first.row.id,
            anchorColumnId: first.column.id,
            focusRowId: last.row.id,
            focusColumnId: last.column.id,
          });
      } else if (event.key === "Escape") table.resetCellSelection(true);
      else return;
      event.preventDefault();
      event.stopPropagation();
    },
  };
}

type Controller = ReturnType<typeof createController>;
const SelectionContext = createContext<{
  controller: Controller;
  editing: boolean;
} | null>(null);
export function useCellSelection() {
  return use(SelectionContext);
}

export function CellSelectionProvider({ children }: PropsWithChildren) {
  const { table } = useTableViewCtx();
  const [editing, setEditing] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<Controller | null>(null);
  controllerRef.current ??= createController(table, setEditing);
  const controller = controllerRef.current;
  useEffect(() => {
    controller.mount(root.current!.ownerDocument);
    return () => controller.dispose();
  }, [controller]);
  const value = useMemo(() => ({ controller, editing }), [controller, editing]);
  return (
    <SelectionContext value={value}>
      <div
        ref={root}
        className="contents"
        onClickCapture={(event) => controller.click(event)}
      >
        {children}
      </div>
    </SelectionContext>
  );
}
