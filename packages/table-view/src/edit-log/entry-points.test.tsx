import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { ColumnDefs } from "@notion-kit/table-hook";
import { Button } from "@notion-kit/ui/primitives";

import { EditLogDialogObject } from "@/__tests__/component-objects/edit-log-dialog";
import { renderTableView } from "@/__tests__/component-objects/render-table-view";
import { RowActionsObject } from "@/__tests__/component-objects/row-actions";
import { mockData, mockProperties, mockResizeObserver } from "@/__tests__/mock";
import type { DefaultPlugins } from "@/plugins";
import { TableView, useTableViewCtx } from "@/table-contexts";

import { useEditLog } from "./edit-log-provider";

mockResizeObserver();

const properties: ColumnDefs<DefaultPlugins> = [
  { ...mockProperties[0]!, type: "title", config: { showIcon: false } },
  mockProperties[1]!,
];

function HistoryControls() {
  const { table } = useTableViewCtx();
  const { openRowLog } = useEditLog();
  return (
    <>
      <Button onClick={() => table.openRow("row1")}>Open row</Button>
      <Button
        onClick={(event) => openRowLog("row1", "Task 1", event.currentTarget)}
      >
        Open history
      </Button>
    </>
  );
}

describe("EditLogEntryPoints", () => {
  it("TestEditLog_TimelineContextMenu_ReturnsFocusToEvent", async () => {
    const fetchRowEditLogs = vi
      .fn()
      .mockResolvedValue({ items: [], nextCursor: null });
    const now = Date.now();
    const tableView = renderTableView({
      properties: [
        ...properties,
        {
          id: "due",
          name: "Due",
          type: "date",
          config: { dateFormat: "full", timeFormat: "24-hour", tz: "UTC" },
        },
      ],
      data: mockData.map((row) => ({
        ...row,
        properties: {
          ...row.properties,
          due: { id: `due-${row.id}`, value: { start: now } },
        },
      })),
      view: {
        layout: "timeline",
        dateView: { datePropertyId: "due", range: "monthly" },
      },
      fetchRowEditLogs,
    });
    const trigger = tableView.timeline.itemTitle("row1", "Task 1");
    const menu = await RowActionsObject.openFromTrigger(
      tableView,
      trigger,
      true,
    );

    await menu.openEditLog();

    await menu.waitUntilClosed();
    const dialog = await EditLogDialogObject.find(tableView.user);
    expect(fetchRowEditLogs).toHaveBeenCalledWith(
      expect.objectContaining({ rowId: "row1" }),
    );
    await dialog.close();
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it("BoardPopover_ClosesAndReturnsFocusToCardActions", async () => {
    const fetchRowEditLogs = vi
      .fn()
      .mockResolvedValue({ items: [], nextCursor: null });
    const tableView = renderTableView({
      properties,
      view: { layout: "board" },
      fetchRowEditLogs,
    });
    const settings = await tableView.openViewSettings();
    const grouping = await settings.openSelectGrouping();
    await grouping.select("Done");
    await tableView.clickOutside();
    const card = screen.getByRole("button", { name: /Task 1/ });
    const trigger = RowActionsObject.boardTrigger(card);
    const menu = await RowActionsObject.openFromTrigger(tableView, trigger);

    await menu.openEditLog();

    await menu.waitUntilClosed();
    const dialog = await EditLogDialogObject.find(tableView.user);
    await dialog.close();
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it.each(["side", "center"] as const)(
    "Escape_ClosesHistoryAndPreserves%sRowView",
    async (rowView) => {
      const tableView = renderTableView({
        properties,
        view: { rowView },
        children: <HistoryControls />,
        fetchRowEditLogs: () =>
          Promise.resolve({ items: [], nextCursor: null }),
      });
      const openHistory = tableView.button("Open history");
      await tableView.clickButton("Open row");
      await screen.findByRole("dialog", { name: "Task 1" });
      fireEvent.click(openHistory);
      const history = await EditLogDialogObject.find(tableView.user);
      history.closeButton().focus();

      await history.escape();

      await waitFor(() => expect(history.root).not.toBeInTheDocument());
      expect(screen.getByRole("dialog", { name: "Task 1" })).toBeVisible();
    },
  );

  it("RemovedTrigger_ReturnsFocusWithinTheSameTableInstance", async () => {
    const user = userEvent.setup();
    const fetchRowEditLogs = vi
      .fn()
      .mockResolvedValue({ items: [], nextCursor: null });
    function Tables({ firstData = mockData }) {
      return (
        <>
          <section aria-label="First table">
            <TableView
              data={firstData}
              properties={properties}
              fetchRowEditLogs={fetchRowEditLogs}
            />
          </section>
          <section aria-label="Second table">
            <TableView
              data={mockData}
              properties={properties}
              fetchRowEditLogs={fetchRowEditLogs}
            />
          </section>
        </>
      );
    }
    const { rerender } = render(<Tables />);
    const first = screen.getByRole("region", { name: "First table" });
    const second = screen.getByRole("region", { name: "Second table" });
    const row = within(first).getByRole("row", { name: /Task 1/ });
    await user.click(RowActionsObject.trigger(row));
    await user.click(screen.getByRole("option", { name: "Edit log" }));
    const dialog = await EditLogDialogObject.find(user);
    rerender(
      <Tables
        firstData={mockData.filter((candidate) => candidate.id !== "row1")}
      />,
    );

    await dialog.close();

    await waitFor(() =>
      expect(first.contains(document.activeElement)).toBe(true),
    );
    expect(second.contains(document.activeElement)).toBe(false);
    expect(fetchRowEditLogs).toHaveBeenCalledOnce();
  });
});
