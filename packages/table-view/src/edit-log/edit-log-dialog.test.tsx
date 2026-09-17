import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { EditLogDialogObject } from "@/__tests__/component-objects/edit-log-dialog";
import { mockResizeObserver } from "@/__tests__/mock";

import { EditLogDialog } from "./edit-log-dialog";
import type { EditLogState } from "./use-edit-log";

mockResizeObserver();
const initial: EditLogState = {
  target: { type: "table" },
  status: "success",
  nextCursor: "next",
  items: [
    {
      id: "1",
      editedAt: 1_700_000_000_000,
      action: "new-action",
      target: { name: "Deleted property" },
      summary: "A historical summary",
    },
  ],
};

describe("EditLogDialog", () => {
  it("presents semantic history, requests pages only on click, and preserves existing list nodes", async () => {
    const user = userEvent.setup();
    const loadMore = vi.fn();
    const props = {
      state: initial,
      onClose: vi.fn(),
      onLoadMore: loadMore,
      onRetry: vi.fn(),
    };
    const { rerender } = render(<EditLogDialog {...props} />);
    const dialog = await EditLogDialogObject.find(user);
    expect(dialog.text("Deleted property")).toBeVisible();
    expect(dialog.text("A historical summary")).toBeVisible();
    expect(dialog.entries()[0]?.querySelector("time")).toHaveAttribute(
      "datetime",
      new Date(1_700_000_000_000).toISOString(),
    );
    expect(dialog.region()).toBeVisible();
    expect(loadMore).not.toHaveBeenCalled();
    const firstEntry = dialog.entries()[0];
    await dialog.loadMore();
    expect(loadMore).toHaveBeenCalledOnce();
    rerender(
      <EditLogDialog {...props} state={{ ...initial, status: "loading" }} />,
    );
    expect(dialog.loadMoreButton()).toBeDisabled();
    rerender(
      <EditLogDialog
        {...props}
        state={{
          ...initial,
          items: [
            ...initial.items,
            {
              id: "2",
              editedAt: 1_700_000_000_001,
              action: "delete",
              target: { name: "Another" },
              summary: "Deleted",
            },
          ],
          nextCursor: null,
        }}
      />,
    );
    expect(dialog.entries()).toHaveLength(2);
    expect(dialog.entries()[0]).toBe(firstEntry);
    expect(dialog.loadMoreButton()).not.toBeInTheDocument();
  });

  it("announces loading, empty, and failure states and offers Retry", async () => {
    const user = userEvent.setup();
    const retry = vi.fn();
    const props = {
      state: {
        ...initial,
        items: [],
        nextCursor: null,
        status: "loading" as const,
      },
      onClose: vi.fn(),
      onLoadMore: vi.fn(),
      onRetry: retry,
    };
    const { rerender } = render(<EditLogDialog {...props} />);
    const dialog = await EditLogDialogObject.find(user);
    expect(screen.getByRole("status")).toHaveTextContent("Loading edit logs");
    rerender(
      <EditLogDialog
        {...props}
        state={{ ...props.state, status: "success" }}
      />,
    );
    expect(dialog.text("No edit logs yet")).toBeVisible();
    rerender(
      <EditLogDialog {...props} state={{ ...props.state, status: "error" }} />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Could not load edit logs",
    );
    await dialog.retry();
    expect(retry).toHaveBeenCalledOnce();
  });

  it("supports Close, Escape, and an explicit focus return target", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const trigger = document.createElement("button");
    trigger.textContent = "History trigger";
    document.body.append(trigger);
    const { rerender } = render(
      <EditLogDialog
        state={initial}
        onClose={onClose}
        onLoadMore={vi.fn()}
        onRetry={vi.fn()}
        finalFocus={() => trigger}
      />,
    );
    const dialog = await EditLogDialogObject.find(user);
    await dialog.escape();
    expect(onClose).toHaveBeenCalledOnce();
    await dialog.close();
    expect(onClose).toHaveBeenCalledTimes(2);
    rerender(
      <EditLogDialog
        state={{ ...initial, target: null }}
        onClose={onClose}
        onLoadMore={vi.fn()}
        onRetry={vi.fn()}
        finalFocus={() => trigger}
      />,
    );
    await waitFor(() => expect(trigger).toHaveFocus());
    trigger.remove();
  });
});
