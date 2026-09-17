import { useRef, useState } from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { EditLogDialogObject } from "@/__tests__/component-objects/edit-log-dialog";
import { mockData, mockProperties, mockResizeObserver } from "@/__tests__/mock";
import { TableViewWrapper } from "@/table-contexts";

import { useEditLog } from "./edit-log-provider";
import type {
  EditLogProps,
  FetchRowEditLogs,
  FetchTableEditLogs,
  RowEditLog,
} from "./types";

mockResizeObserver();

function OpenControls({ onRender }: { onRender?: () => void }) {
  onRender?.();
  const logs = useEditLog();
  const button = useRef<HTMLButtonElement>(null);
  return (
    <>
      <button
        ref={button}
        disabled={!logs.canViewTableLogs}
        onClick={() => logs.openTableLog(button.current)}
      >
        Table history
      </button>
      <button
        disabled={!logs.canViewRowLogs}
        onClick={(event) =>
          logs.openRowLog("row1", "Captured title", event.currentTarget)
        }
      >
        Row history
      </button>
    </>
  );
}

function Wrapper({
  children,
  ...props
}: React.PropsWithChildren<EditLogProps>) {
  return (
    <TableViewWrapper
      defaultData={mockData}
      defaultProperties={mockProperties}
      {...props}
    >
      {children}
    </TableViewWrapper>
  );
}

function DisappearingControl() {
  const [visible, setVisible] = useState(true);
  const { openTableLog } = useEditLog();
  return visible ? (
    <button
      onClick={(event) => {
        openTableLog(event.currentTarget);
        setVisible(false);
      }}
    >
      Open history
    </button>
  ) : (
    <p>Custom table content</p>
  );
}

describe("EditLogProvider", () => {
  it("temporarily focuses its scope when no table controls remain", async () => {
    const user = userEvent.setup();
    const fetchTableEditLogs = vi
      .fn<FetchTableEditLogs>()
      .mockResolvedValue({ items: [], nextCursor: null });
    render(
      <>
        <Wrapper fetchTableEditLogs={fetchTableEditLogs}>
          <DisappearingControl />
        </Wrapper>
        <button>Outside table</button>
      </>,
    );
    await user.click(screen.getByRole("button", { name: "Open history" }));
    const dialog = await EditLogDialogObject.find(user);
    const content = screen.getByText("Custom table content");
    const scope = content.closest("[data-edit-log-scope]");
    await dialog.close();
    await waitFor(() => expect(scope).toHaveFocus());
    await user.click(screen.getByRole("button", { name: "Outside table" }));
    await user.click(content);
    expect(scope).not.toHaveFocus();
  });

  it("is inert outside the provider and enables each callback independently", () => {
    const { rerender } = render(<OpenControls />);
    expect(
      screen.getByRole("button", { name: "Table history" }),
    ).toBeDisabled();
    expect(screen.getByRole("button", { name: "Row history" })).toBeDisabled();
    const fetchTableEditLogs = vi
      .fn()
      .mockResolvedValue({ items: [], nextCursor: null });
    rerender(
      <Wrapper fetchTableEditLogs={fetchTableEditLogs}>
        <OpenControls />
      </Wrapper>,
    );
    expect(screen.getByRole("button", { name: "Table history" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Row history" })).toBeDisabled();
    expect(fetchTableEditLogs).not.toHaveBeenCalled();
  });

  it("keeps children and the actions context stable during pagination and restores trigger focus", async () => {
    const user = userEvent.setup();
    const onRender = vi.fn();
    const fetchTableEditLogs = vi
      .fn<FetchTableEditLogs>()
      .mockResolvedValueOnce({ items: [], nextCursor: "next" })
      .mockResolvedValue({ items: [], nextCursor: null });
    render(
      <Wrapper fetchTableEditLogs={fetchTableEditLogs}>
        <OpenControls onRender={onRender} />
      </Wrapper>,
    );
    const renders = onRender.mock.calls.length;
    const trigger = screen.getByRole("button", { name: "Table history" });
    await user.click(trigger);
    const dialog = await EditLogDialogObject.find(user);
    await waitFor(() => expect(dialog.loadMoreButton()).toBeEnabled());
    await dialog.loadMore();
    await waitFor(() =>
      expect(dialog.loadMoreButton()).not.toBeInTheDocument(),
    );
    expect(onRender).toHaveBeenCalledTimes(renders);
    await dialog.close();
    await waitFor(() => expect(trigger).toHaveFocus());
    await user.click(trigger);
    expect(fetchTableEditLogs.mock.calls[2]?.[0].cursor).toBeUndefined();
  });

  it("captures the row title and discards requests when its callback is removed", async () => {
    const user = userEvent.setup();
    let resolve!: (page: { items: []; nextCursor: null }) => void;
    const fetchRowEditLogs = vi.fn<FetchRowEditLogs>().mockImplementation(
      () =>
        new Promise<{ items: []; nextCursor: null }>((done) => {
          resolve = done;
        }),
    );
    const { rerender } = render(
      <Wrapper fetchRowEditLogs={fetchRowEditLogs}>
        <OpenControls />
      </Wrapper>,
    );
    await user.click(screen.getByRole("button", { name: "Row history" }));
    const dialog = await EditLogDialogObject.find(user);
    expect(dialog.text("Captured title")).toBeVisible();
    rerender(
      <Wrapper>
        <OpenControls />
      </Wrapper>,
    );
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    expect(fetchRowEditLogs.mock.calls[0]?.[0].signal.aborted).toBe(true);
    act(() => resolve({ items: [], nextCursor: null }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("paginates historical row values independently of table history", async () => {
    const user = userEvent.setup();
    const snapshot: RowEditLog = {
      id: "historical-1",
      rowId: "row1",
      editedAt: 1_700_000_000_000,
      property: { id: "removed", name: "Removed property", type: "text" },
      value: "Original value",
      textValue: "Original value",
    };
    const fetchTableEditLogs = vi.fn<FetchTableEditLogs>();
    const fetchRowEditLogs = vi
      .fn<FetchRowEditLogs>()
      .mockResolvedValueOnce({ items: [snapshot], nextCursor: "next" })
      .mockResolvedValueOnce({
        items: [{ ...snapshot, id: "historical-2", value: "Earlier value" }],
        nextCursor: null,
      });
    render(
      <Wrapper
        fetchRowEditLogs={fetchRowEditLogs}
        fetchTableEditLogs={fetchTableEditLogs}
      >
        <OpenControls />
      </Wrapper>,
    );
    await user.click(screen.getByRole("button", { name: "Row history" }));
    const dialog = await EditLogDialogObject.find(user);
    expect(await dialog.findText("Original value")).toBeVisible();
    expect(dialog.text("Removed property")).toBeVisible();
    await dialog.loadMore();
    expect(await dialog.findText("Earlier value")).toBeVisible();
    expect(dialog.entries()).toHaveLength(2);
    expect(
      fetchRowEditLogs.mock.calls.map(([request]) => ({
        rowId: request.rowId,
        cursor: request.cursor,
      })),
    ).toEqual([
      { rowId: "row1", cursor: undefined },
      { rowId: "row1", cursor: "next" },
    ]);
    expect(fetchTableEditLogs).not.toHaveBeenCalled();
  });
});
