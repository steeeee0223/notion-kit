import { createContext, use, useCallback, useMemo, useRef } from "react";

import { EditLogDialog } from "./edit-log-dialog";
import type { EditLogProps, EditLogTarget } from "./types";
import { useEditLogRequest } from "./use-edit-log";

interface EditLogActions {
  canViewTableLogs: boolean;
  canViewRowLogs: boolean;
  openTableLog: (returnFocus?: HTMLElement | null) => void;
  openRowLog: (
    rowId: string,
    title?: string,
    returnFocus?: HTMLElement | null,
  ) => void;
  isOpen: () => boolean;
}

const EditLogContext = createContext<EditLogActions | null>(null);

export function useEditLog() {
  const context = use(EditLogContext);
  if (!context) throw new Error("`useEditLog` must be used within `TableView`");
  return context;
}

export function EditLogProvider({
  children,
  ...callbacks
}: React.PropsWithChildren<EditLogProps>) {
  const { state, open, close, loadMore, retry } = useEditLogRequest(callbacks);
  const scope = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const openRef = useRef(false);
  const generation = useRef(0);
  const begin = useCallback(
    (target: EditLogTarget, trigger?: HTMLElement | null) => {
      if (!open(target)) return;
      generation.current++;
      openRef.current = true;
      const focused = document.activeElement;
      returnFocus.current =
        trigger ??
        (focused instanceof HTMLElement && scope.current?.contains(focused)
          ? focused
          : null);
    },
    [open],
  );
  const openTableLog = useCallback(
    (trigger?: HTMLElement | null) => begin({ type: "table" }, trigger),
    [begin],
  );
  const openRowLog = useCallback(
    (rowId: string, title?: string, trigger?: HTMLElement | null) =>
      begin({ type: "row", rowId, title }, trigger),
    [begin],
  );
  const isOpen = useCallback(() => openRef.current, []);
  const canViewTableLogs = !!callbacks.fetchTableEditLogs;
  const canViewRowLogs = !!callbacks.fetchRowEditLogs;
  const actions = useMemo(
    () => ({
      canViewTableLogs,
      canViewRowLogs,
      openTableLog,
      openRowLog,
      isOpen,
    }),
    [canViewTableLogs, canViewRowLogs, openTableLog, openRowLog, isOpen],
  );
  const finalFocus = useCallback(() => {
    if (
      returnFocus.current?.isConnected &&
      !returnFocus.current.matches(":disabled")
    )
      return returnFocus.current;
    return (
      scope.current?.querySelector<HTMLElement>(
        'button:not([disabled]), [tabindex="0"], a[href]',
      ) ?? null
    );
  }, []);
  const onOpenChangeComplete = useCallback((isDialogOpen: boolean) => {
    if (isDialogOpen) return;
    const closingGeneration = generation.current;
    // Keep background shortcuts gated for the entire close event dispatch.
    queueMicrotask(() => {
      if (generation.current === closingGeneration) openRef.current = false;
    });
  }, []);

  return (
    <EditLogContext value={actions}>
      <div ref={scope} data-edit-log-scope="" className="isolate min-w-0">
        {children}
      </div>
      <EditLogDialog
        state={state}
        onClose={close}
        onLoadMore={loadMore}
        onRetry={retry}
        finalFocus={finalFocus}
        onOpenChangeComplete={onOpenChangeComplete}
      />
    </EditLogContext>
  );
}
