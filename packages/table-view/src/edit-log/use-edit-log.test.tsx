import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type {
  EditLogPage,
  EditLogTarget,
  FetchRowEditLogs,
  FetchTableEditLogs,
  RowEditLog,
  TableEditLog,
} from "./types";
import { useEditLogRequest } from "./use-edit-log";

function record(id: string): TableEditLog {
  return {
    id,
    editedAt: 1_700_000_000_000,
    action: "update",
    target: { name: id },
    summary: `Changed ${id}`,
  };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

describe("useEditLogRequest", () => {
  it("fetches only on opening and manual pagination, deduplicates IDs, and retains first snapshots", async () => {
    const next = deferred<EditLogPage<TableEditLog>>();
    const fetchTableEditLogs = vi
      .fn<FetchTableEditLogs>()
      .mockResolvedValueOnce({ items: [record("1")], nextCursor: "page-2" })
      .mockReturnValueOnce(next.promise);
    const { result } = renderHook(() =>
      useEditLogRequest({ fetchTableEditLogs }),
    );
    expect(fetchTableEditLogs).not.toHaveBeenCalled();
    act(() => {
      result.current.open({ type: "table" });
    });
    await waitFor(() => expect(result.current.state.status).toBe("success"));
    expect(fetchTableEditLogs).toHaveBeenCalledTimes(1);
    act(() => {
      result.current.loadMore();
      result.current.loadMore();
    });
    expect(fetchTableEditLogs).toHaveBeenCalledTimes(2);
    expect(fetchTableEditLogs.mock.calls[1]?.[0].cursor).toBe("page-2");
    expect(result.current.state.items).toEqual([record("1")]);
    await act(async () => {
      next.resolve({
        items: [{ ...record("1"), summary: "overlap" }, record("2")],
        nextCursor: null,
      });
      await next.promise;
    });
    expect(result.current.state.items).toEqual([record("1"), record("2")]);
    act(() => result.current.loadMore());
    expect(fetchTableEditLogs).toHaveBeenCalledTimes(2);
  });

  it("retries the first page and a failed additional page without losing entries", async () => {
    const fetchTableEditLogs = vi
      .fn<FetchTableEditLogs>()
      .mockRejectedValueOnce(new Error("First request"))
      .mockResolvedValueOnce({ items: [record("1")], nextCursor: "next" })
      .mockRejectedValueOnce(new Error("Next request"))
      .mockResolvedValueOnce({ items: [record("2")], nextCursor: null });
    const { result } = renderHook(() =>
      useEditLogRequest({ fetchTableEditLogs }),
    );
    act(() => {
      result.current.open({ type: "table" });
    });
    await waitFor(() => expect(result.current.state.status).toBe("error"));
    act(() => result.current.retry());
    await waitFor(() => expect(result.current.state.status).toBe("success"));
    act(() => result.current.loadMore());
    await waitFor(() => expect(result.current.state.status).toBe("error"));
    expect(result.current.state.items).toEqual([record("1")]);
    act(() => result.current.retry());
    await waitFor(() => expect(result.current.state.items).toHaveLength(2));
    expect(
      fetchTableEditLogs.mock.calls.map(([request]) => request.cursor),
    ).toEqual([undefined, undefined, "next", "next"]);
  });

  it("accepts an empty page with a fresh cursor, and rejects a repeated boundary or malformed page", async () => {
    const fetchTableEditLogs = vi
      .fn<FetchTableEditLogs>()
      .mockResolvedValueOnce({ items: [], nextCursor: "a" })
      .mockResolvedValueOnce({ items: [record("1")], nextCursor: "b" })
      .mockResolvedValueOnce({ items: [record("2")], nextCursor: "a" })
      .mockResolvedValueOnce({
        items: [{ ...record("2"), editedAt: NaN }],
        nextCursor: null,
      });
    const { result } = renderHook(() =>
      useEditLogRequest({ fetchTableEditLogs }),
    );
    act(() => {
      result.current.open({ type: "table" });
    });
    await waitFor(() => expect(result.current.state.nextCursor).toBe("a"));
    act(() => result.current.loadMore());
    await waitFor(() => expect(result.current.state.nextCursor).toBe("b"));
    act(() => result.current.loadMore());
    await waitFor(() => expect(result.current.state.status).toBe("error"));
    expect(result.current.state.items).toEqual([record("1")]);
    act(() => result.current.retry());
    await waitFor(() => expect(fetchTableEditLogs).toHaveBeenCalledTimes(4));
    await waitFor(() => expect(result.current.state.status).toBe("error"));
    expect(result.current.state.items).toEqual([record("1")]);
  });

  it("discards late responses after closing, reopening, switching rows and unmounting", async () => {
    const first = deferred<EditLogPage<TableEditLog>>();
    const fetchTableEditLogs = vi
      .fn<FetchTableEditLogs>()
      .mockReturnValueOnce(first.promise)
      .mockResolvedValue({ items: [record("new")], nextCursor: null });
    const fetchRowEditLogs = vi
      .fn()
      .mockResolvedValue({ items: [], nextCursor: null });
    const { result, unmount } = renderHook(() =>
      useEditLogRequest({ fetchTableEditLogs, fetchRowEditLogs }),
    );
    act(() => {
      result.current.open({ type: "table" });
    });
    act(() => result.current.close());
    expect(fetchTableEditLogs.mock.calls[0]?.[0].signal.aborted).toBe(true);
    act(() => {
      result.current.open({ type: "table" });
    });
    await waitFor(() =>
      expect(result.current.state.items).toEqual([record("new")]),
    );
    await act(async () => {
      first.resolve({ items: [record("old")], nextCursor: null });
      await first.promise;
    });
    expect(result.current.state.items).toEqual([record("new")]);
    const rowTarget: EditLogTarget = { type: "row", rowId: "row-2" };
    act(() => {
      result.current.open(rowTarget);
    });
    await waitFor(() => expect(result.current.state.status).toBe("success"));
    expect(result.current.state.items).toEqual([]);
    expect(fetchRowEditLogs).toHaveBeenCalledWith(
      expect.objectContaining({ rowId: "row-2" }),
    );
    unmount();
  });

  it("uses the newest callback for subsequent operations without reloading, and clears when removed", async () => {
    const original = vi
      .fn<FetchTableEditLogs>()
      .mockResolvedValue({ items: [record("1")], nextCursor: "next" });
    const pending = deferred<EditLogPage<TableEditLog>>();
    const replacement = vi
      .fn<FetchTableEditLogs>()
      .mockReturnValue(pending.promise);
    const initialProps: { fetchTableEditLogs?: FetchTableEditLogs } = {
      fetchTableEditLogs: original,
    };
    const { result, rerender } = renderHook(
      ({ fetchTableEditLogs }: { fetchTableEditLogs?: FetchTableEditLogs }) =>
        useEditLogRequest({ fetchTableEditLogs }),
      { initialProps },
    );
    act(() => {
      result.current.open({ type: "table" });
    });
    await waitFor(() => expect(result.current.state.status).toBe("success"));
    rerender({ fetchTableEditLogs: replacement });
    expect(replacement).not.toHaveBeenCalled();
    act(() => result.current.loadMore());
    expect(replacement).toHaveBeenCalledTimes(1);
    rerender({ fetchTableEditLogs: undefined });
    expect(replacement.mock.calls[0]?.[0].signal.aborted).toBe(true);
    expect(result.current.state.target).toBeNull();
    await act(async () => {
      pending.resolve({ items: [record("late")], nextCursor: null });
      await pending.promise;
    });
    expect(result.current.state.items).toEqual([]);
  });

  it("isolates rows even when the previous row request ignores abort", async () => {
    const old = deferred<EditLogPage<RowEditLog>>();
    const rowRecord = (rowId: string): RowEditLog => ({
      id: `log-${rowId}`,
      rowId,
      editedAt: 1_700_000_000_000,
      property: { id: "removed", name: "Old name", type: "text" },
      value: rowId,
      textValue: rowId,
    });
    const fetchRowEditLogs = vi
      .fn<FetchRowEditLogs>()
      .mockReturnValueOnce(old.promise)
      .mockResolvedValueOnce({
        items: [rowRecord("second")],
        nextCursor: null,
      });
    const { result } = renderHook(() =>
      useEditLogRequest({ fetchRowEditLogs }),
    );
    act(() => {
      result.current.open({ type: "row", rowId: "first" });
    });
    act(() => {
      result.current.open({ type: "row", rowId: "second" });
    });
    expect(fetchRowEditLogs.mock.calls[0]?.[0].signal.aborted).toBe(true);
    await waitFor(() =>
      expect(result.current.state.items).toEqual([rowRecord("second")]),
    );
    await act(async () => {
      old.resolve({ items: [rowRecord("first")], nextCursor: null });
      await old.promise;
    });
    expect(result.current.state.items).toEqual([rowRecord("second")]);
  });

  it("aborts a pending request on unmount and ignores its late rejection", async () => {
    const pending = deferred<EditLogPage<TableEditLog>>();
    const fetchTableEditLogs = vi
      .fn<FetchTableEditLogs>()
      .mockReturnValue(pending.promise);
    const { result, unmount } = renderHook(() =>
      useEditLogRequest({ fetchTableEditLogs }),
    );
    act(() => {
      result.current.open({ type: "table" });
    });
    unmount();
    expect(fetchTableEditLogs.mock.calls[0]?.[0].signal.aborted).toBe(true);
    await act(async () => {
      pending.reject(new Error("Late failure"));
      await pending.promise.catch(() => undefined);
    });
  });
});
