import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { rowEditLogPageSchema, tableEditLogPageSchema } from "./schemas";
import type {
  EditLogProps,
  EditLogTarget,
  RowEditLog,
  TableEditLog,
} from "./types";

export interface EditLogState {
  target: EditLogTarget | null;
  items: (TableEditLog | RowEditLog)[];
  nextCursor: string | null;
  status: "idle" | "loading" | "success" | "error";
}

const emptyState: EditLogState = {
  target: null,
  items: [],
  nextCursor: null,
  status: "idle",
};

/** Request state stays local to the dialog and never enters table resources. */
export function useEditLogRequest(callbacks: EditLogProps) {
  const latestCallbacks = useRef(callbacks);
  latestCallbacks.current = callbacks;
  const [state, setState] = useState(emptyState);
  const currentState = useRef(state);
  const session = useRef(0);
  const activeRequest = useRef<AbortController | null>(null);
  const requestedCursors = useRef(new Set<string>());
  const failedCursor = useRef<string | undefined>(undefined);

  const update = useCallback((next: EditLogState) => {
    currentState.current = next;
    setState(next);
  }, []);

  const cancel = useCallback(() => {
    session.current++;
    activeRequest.current?.abort();
    activeRequest.current = null;
    requestedCursors.current.clear();
  }, []);

  const close = useCallback(() => {
    cancel();
    update(emptyState);
  }, [cancel, update]);

  const request = useCallback(
    (target: EditLogTarget, cursor?: string) => {
      if (activeRequest.current) return;
      const { fetchTableEditLogs, fetchRowEditLogs } = latestCallbacks.current;
      if (target.type === "table" ? !fetchTableEditLogs : !fetchRowEditLogs)
        return;
      const identity = session.current;
      const controller = new AbortController();
      activeRequest.current = controller;
      if (cursor !== undefined) requestedCursors.current.add(cursor);
      failedCursor.current = cursor;
      update({ ...currentState.current, status: "loading" });

      const run = async () => {
        try {
          const input = {
            signal: controller.signal,
            ...(cursor !== undefined && { cursor }),
          };
          const page =
            target.type === "table"
              ? tableEditLogPageSchema.parse(await fetchTableEditLogs!(input))
              : rowEditLogPageSchema(target.rowId).parse(
                  await fetchRowEditLogs!({ ...input, rowId: target.rowId }),
                );
          if (controller.signal.aborted || session.current !== identity) return;
          if (
            page.nextCursor !== null &&
            requestedCursors.current.has(page.nextCursor)
          ) {
            throw new Error("Edit log pagination did not advance");
          }
          const existing = currentState.current.items;
          const ids = new Set(existing.map((item) => item.id));
          const additions = page.items.filter((item) => {
            if (ids.has(item.id)) return false;
            ids.add(item.id);
            return true;
          });
          update({
            target,
            items: [...existing, ...additions],
            nextCursor: page.nextCursor,
            status: "success",
          });
        } catch {
          if (!controller.signal.aborted && session.current === identity) {
            update({ ...currentState.current, status: "error" });
          }
        } finally {
          if (activeRequest.current === controller)
            activeRequest.current = null;
        }
      };
      void run();
    },
    [update],
  );

  const open = useCallback(
    (target: EditLogTarget) => {
      const available =
        target.type === "table"
          ? latestCallbacks.current.fetchTableEditLogs
          : latestCallbacks.current.fetchRowEditLogs;
      if (!available) return false;
      cancel();
      update({ ...emptyState, target });
      request(target);
      return true;
    },
    [cancel, request, update],
  );

  const loadMore = useCallback(() => {
    const current = currentState.current;
    if (
      current.target &&
      current.nextCursor !== null &&
      current.status === "success"
    ) {
      request(current.target, current.nextCursor);
    }
  }, [request]);

  const retry = useCallback(() => {
    const current = currentState.current;
    if (current.target && current.status === "error")
      request(current.target, failedCursor.current);
  }, [request]);

  const hasTableCallback = !!callbacks.fetchTableEditLogs;
  const hasRowCallback = !!callbacks.fetchRowEditLogs;
  useLayoutEffect(() => {
    const target = currentState.current.target;
    if (
      target &&
      !(target.type === "table" ? hasTableCallback : hasRowCallback)
    )
      close();
  }, [hasTableCallback, hasRowCallback, close]);
  useEffect(() => cancel, [cancel]);

  return { state, open, close, loadMore, retry };
}
