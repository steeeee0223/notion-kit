import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { EditLogDialogObject } from "@/__tests__/component-objects/edit-log-dialog";
import { mockData, mockProperties, mockResizeObserver } from "@/__tests__/mock";
import { DEFAULT_PLUGINS } from "@/plugins";
import { TableViewWrapper } from "@/table-contexts";

import { useEditLog } from "./edit-log-provider";
import type {
  EditLogProps,
  FetchRowEditLogs,
  FetchTableEditLogs,
  RowEditLog,
} from "./types";

mockResizeObserver();

function OpenControls() {
  const logs = useEditLog();
  return (
    <>
      <button
        disabled={!logs.canViewTableLogs}
        onClick={(event) => logs.openTableLog(event.currentTarget)}
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

describe("EditLogFlows", () => {
  it("TestEditLog_FailedPages_RetryKeepsLoadedEntries", async () => {
    const user = userEvent.setup();
    const record = {
      id: "first",
      editedAt: 1_700_000_000_000,
      action: "create",
      target: { name: "Notes" },
      summary: "Created property",
    };
    const fetchTableEditLogs = vi
      .fn<FetchTableEditLogs>()
      .mockRejectedValueOnce(new Error("Offline"))
      .mockResolvedValueOnce({ items: [record], nextCursor: "next" })
      .mockRejectedValueOnce(new Error("Offline"))
      .mockResolvedValueOnce({
        items: [{ ...record, id: "second", summary: "Earlier edit" }],
        nextCursor: null,
      });
    render(
      <Wrapper fetchTableEditLogs={fetchTableEditLogs}>
        <OpenControls />
      </Wrapper>,
    );
    await user.click(screen.getByRole("button", { name: "Table history" }));
    const dialog = await EditLogDialogObject.find(user);
    expect(await dialog.findText("Could not load edit logs.")).toBeVisible();
    await dialog.retry();
    expect(await dialog.findText("Created property")).toBeVisible();
    const firstEntry = dialog.entries()[0];
    await dialog.loadMore();
    expect(await dialog.findText("Could not load edit logs.")).toBeVisible();
    expect(dialog.text("Created property")).toBeVisible();
    await dialog.retry();
    expect(await dialog.findText("Earlier edit")).toBeVisible();
    expect(dialog.entries()[0]).toBe(firstEntry);
    expect(dialog.loadMoreButton()).not.toBeInTheDocument();
    expect(
      fetchTableEditLogs.mock.calls.map(([request]) => request.cursor),
    ).toEqual([undefined, undefined, "next", "next"]);
  });

  it("TestEditLog_UnrenderableSnapshots_OnlyAffectedValuesFallBack", async () => {
    const user = userEvent.setup();
    const error = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const records: RowEditLog[] = [
      {
        id: "broken",
        rowId: "row1",
        editedAt: 1_700_000_000_000,
        property: { id: "removed", name: "Old text", type: "text" },
        value: "broken",
        textValue: "Recovered text",
      },
      {
        id: "unknown",
        rowId: "row1",
        editedAt: 1_700_000_000_000,
        property: { id: "future", name: "Future property", type: "future" },
        value: {},
        textValue: "Future type text",
      },
      {
        id: "healthy",
        rowId: "row1",
        editedAt: 1_700_000_000_000,
        property: {
          id: "score",
          name: "Score",
          type: "number",
          config: {
            format: "number",
            round: "default",
            showAs: "number",
            options: { color: "blue", divideBy: 100, showNumber: true },
          },
        },
        value: "0",
        textValue: "Zero fallback",
      },
    ];
    try {
      render(
        <TableViewWrapper
          defaultData={mockData}
          defaultProperties={mockProperties}
          plugins={{
            ...DEFAULT_PLUGINS,
            ui: DEFAULT_PLUGINS.ui.map((plugin) =>
              plugin.id === "text"
                ? {
                    ...plugin,
                    renderReadOnlyValue: () => {
                      throw new Error("Broken renderer");
                    },
                  }
                : plugin,
            ),
          }}
          fetchRowEditLogs={() =>
            Promise.resolve({ items: records, nextCursor: null })
          }
        >
          <OpenControls />
        </TableViewWrapper>,
      );
      await user.click(screen.getByRole("button", { name: "Row history" }));
      const dialog = await EditLogDialogObject.find(user);
      expect(await dialog.findText("Recovered text")).toBeVisible();
      expect(dialog.text("Future type text")).toBeVisible();
      expect(dialog.text("0")).toBeVisible();
      expect(dialog.entries()).toHaveLength(3);
      expect(dialog.root.querySelector("input")).not.toBeInTheDocument();
    } finally {
      error.mockRestore();
    }
  });

  it("TestEditLog_TableHistory_PreservesPropertyIconsAfterColumnRemoval", async () => {
    const user = userEvent.setup();
    render(
      <Wrapper
        fetchTableEditLogs={() =>
          Promise.resolve({
            items: [
              {
                id: "property-edit",
                editedAt: 1_700_000_000_000,
                action: "update",
                target: { name: "Historical score" },
                property: {
                  id: "removed",
                  name: "Historical score",
                  type: "number",
                  icon: { type: "emoji", src: "🎯" },
                },
                summary: "Changed to 10",
              },
              {
                id: "layout-edit",
                editedAt: 1_700_000_000_001,
                action: "change-layout",
                target: { name: "Layout" },
                summary: "Changed to Board",
              },
            ],
            nextCursor: null,
          })
        }
      >
        <OpenControls />
      </Wrapper>,
    );
    await user.click(screen.getByRole("button", { name: "Table history" }));
    const dialog = await EditLogDialogObject.find(user);
    expect(await dialog.findText("🎯")).toBeVisible();
    expect(dialog.text("Historical score")).toBeVisible();
    expect(dialog.text("Changed to 10")).toBeVisible();
    expect(dialog.text("Changed to Board")).toBeVisible();
    expect(dialog.entries()).toHaveLength(2);
  });

  it("TestEditLog_RowPagination_KeepsRemovedPropertySnapshots", async () => {
    const user = userEvent.setup();
    const snapshot: RowEditLog = {
      id: "historical-1",
      rowId: "row1",
      editedAt: 1_700_000_000_000,
      property: {
        id: "removed",
        name: "Removed property",
        type: "text",
        icon: { type: "emoji", src: "📚" },
      },
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
    expect(dialog.text("📚")).toBeVisible();
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
