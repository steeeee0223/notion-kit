import React from "react";
import { screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type {
  DataResourceAction,
  ResourceChange,
  Row,
} from "@notion-kit/table-hook";

import { renderTableView } from "./component-objects/render-table-view";
import type { TableViewObject } from "./component-objects/table-view";
import { mockResizeObserver } from "./mock";

const timelineProperties = [
  {
    id: "col1",
    name: "Name",
    type: "title" as const,
    width: "200",
    config: { showIcon: false },
  },
  {
    id: "due",
    name: "Due",
    type: "date" as const,
    width: "160",
    config: { dateFormat: "full", timeFormat: "24-hour", tz: "UTC" },
  },
];

vi.mock("@notion-kit/ui/primitives", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@notion-kit/ui/primitives")>();
  const OriginalRoot = actual.Sortable.Root;

  function dragEndEvent(
    props: React.ComponentProps<typeof actual.Sortable.Root>,
    canceled = false,
  ) {
    const selectedIds = props.multiDrag?.selectedIds ?? ["row1"];
    const sourceId = selectedIds[0] ?? "row1";

    return {
      canceled,
      operation: {
        canceled,
        source: {
          id: sourceId,
          initialIndex: 0,
          index: 2,
          data: { notionKitSortable: { selectedIds } },
        },
        target: { id: "row3" },
      },
    };
  }

  function SortableRoot(
    props: React.ComponentProps<typeof actual.Sortable.Root>,
  ) {
    if (!props.multiDrag) return <OriginalRoot {...props} />;
    const selectedCount = props.multiDrag.selectedIds.length;

    return (
      <>
        <OriginalRoot {...props} />
        <button
          type="button"
          onClick={() =>
            props.onDragEnd?.(dragEndEvent(props) as never, {} as never)
          }
        >
          End {selectedCount} selected row drag
        </button>
        <button
          type="button"
          onClick={() =>
            props.onDragEnd?.(dragEndEvent(props, true) as never, {} as never)
          }
        >
          Cancel {selectedCount} selected row drag
        </button>
        <button
          type="button"
          onClick={() =>
            props.onDragEnd?.(
              {
                canceled: false,
                operation: {
                  canceled: false,
                  source: {
                    id: "row1",
                    initialGroup: "col2:true",
                    initialIndex: 0,
                    group: "col2:false",
                    index: 0,
                    data: {
                      groupId: "col2:true",
                      notionKitSortable: {
                        selectedIds: props.multiDrag?.selectedIds ?? [],
                      },
                    },
                  },
                  target: {
                    id: "row1",
                    data: { groupId: "col2:true" },
                  },
                },
              } as never,
              {} as never,
            )
          }
        >
          Move {selectedCount} selected rows to false group
        </button>
      </>
    );
  }

  return { ...actual, Sortable: { ...actual.Sortable, Root: SortableRoot } };
});

mockResizeObserver();
type DataChange = ResourceChange<Row[], DataResourceAction>;

async function useLayout(
  tableView: TableViewObject,
  layout: "table" | "list" | "timeline",
) {
  if (layout === "table") return;
  const settings = await tableView.openViewSettings();
  const layoutMenu = await settings.openLayout();
  await layoutMenu.selectLayout(layout === "list" ? "List" : "Timeline");
  await tableView.clickOutside();
}

describe.each(["table", "list", "timeline"] as const)(
  "%s selected row drag",
  (layout) => {
    it("SelectedRows_EndDragCommitsOneBatchMove", async () => {
      const onDataChange = vi.fn<(change: DataChange) => void>();
      const tableView = renderTableView({
        onDataChange,
        ...(layout === "timeline" ? { properties: timelineProperties } : {}),
      });
      await useLayout(tableView, layout);
      onDataChange.mockClear();
      await tableView.user.click(
        screen.getByRole("checkbox", { name: "Select row row1" }),
      );
      await tableView.user.click(
        screen.getByRole("checkbox", { name: "Select row row3" }),
      );
      expect(
        screen.getByRole("checkbox", { name: "Select row row1" }),
      ).toBeChecked();
      expect(
        screen.getByRole("checkbox", { name: "Select row row3" }),
      ).toBeChecked();
      await tableView.user.click(
        screen.getByRole("button", { name: "End 2 selected row drag" }),
      );
      await waitFor(() => expect(onDataChange).toHaveBeenCalledOnce());
      expect(onDataChange.mock.lastCall?.[0].action).toMatchObject({
        type: "data.rows.move",
        payload: { moves: [{ rowId: "row1" }, { rowId: "row3" }] },
      });
    });
  },
);

describe.each(["table", "list", "timeline"] as const)(
  "%s cancelled sorted selected row drag",
  (layout) => {
    it("SelectedRows_CancelledDrag_DoesNotOfferToRemoveSorting", async () => {
      const onDataChange = vi.fn<(change: DataChange) => void>();
      const tableView = renderTableView({
        onDataChange,
        ...(layout === "timeline" ? { properties: timelineProperties } : {}),
      });
      await useLayout(tableView, layout);
      onDataChange.mockClear();
      const sort = await tableView.openSortMenu();
      await sort.addRule("Name");
      await tableView.clickOutside();

      await tableView.user.click(
        screen.getByRole("button", { name: "Cancel 0 selected row drag" }),
      );

      expect(
        screen.queryByText("Would you like to remove sorting?"),
      ).not.toBeInTheDocument();
      expect(onDataChange).not.toHaveBeenCalled();
    });
  },
);

describe("sorted selected row drag", () => {
  it("SelectedRows_ConfirmRemovingSort_CommitsOneBatchMove", async () => {
    const onDataChange = vi.fn<(change: DataChange) => void>();
    const tableView = renderTableView({ onDataChange });
    const sort = await tableView.openSortMenu();
    await sort.addRule("Name");
    await tableView.clickOutside();
    await tableView.user.click(
      screen.getByRole("checkbox", { name: "Select row row1" }),
    );
    await tableView.user.click(
      screen.getByRole("checkbox", { name: "Select row row3" }),
    );
    await tableView.user.click(
      screen.getByRole("button", { name: "End 2 selected row drag" }),
    );
    expect(
      await screen.findByText("Would you like to remove sorting?"),
    ).toBeVisible();
    expect(onDataChange).not.toHaveBeenCalled();
    await tableView.user.click(screen.getByRole("button", { name: "Remove" }));
    await waitFor(() => expect(onDataChange).toHaveBeenCalledOnce());
    expect(onDataChange.mock.lastCall?.[0].action).toMatchObject({
      type: "data.rows.move",
      payload: { moves: [{ rowId: "row1" }, { rowId: "row3" }] },
    });
  });
});

describe("grouped selected row drag", () => {
  it("SelectedRows_CrossGroupDrop_UpdatesEverySelectedRowInOneBatch", async () => {
    const onDataChange = vi.fn<(change: DataChange) => void>();
    const tableView = renderTableView({ onDataChange });
    const settings = await tableView.openViewSettings();
    const grouping = await settings.openSelectGrouping();
    await grouping.select("Done");
    await tableView.clickOutside();

    const trueGroup = screen.getByRole("group", { name: "Group col2:true" });
    await tableView.user.click(
      within(trueGroup).getByRole("button", { name: "Open" }),
    );
    await tableView.user.click(
      screen.getByRole("checkbox", { name: "Select group col2:true" }),
    );

    await tableView.user.click(
      screen.getByRole("button", {
        name: "Move 2 selected rows to false group",
      }),
    );

    await waitFor(() => expect(onDataChange).toHaveBeenCalledOnce());
    const change = onDataChange.mock.lastCall?.[0];
    expect(change?.action).toMatchObject({
      type: "data.rows.move",
      payload: { moves: [{ rowId: "row1" }, { rowId: "row3" }] },
    });
    expect(
      change?.next
        .filter((row) => row.id === "row1" || row.id === "row3")
        .map((row) => row.properties.col2?.value),
    ).toEqual([false, false]);
  });

  it("SelectedRows_CollapsedGroup_ExcludesHiddenRowsFromTheDragGroup", async () => {
    const onDataChange = vi.fn<(change: DataChange) => void>();
    const tableView = renderTableView({ onDataChange });
    const settings = await tableView.openViewSettings();
    const grouping = await settings.openSelectGrouping();
    await grouping.select("Done");
    await tableView.clickOutside();

    await tableView.user.click(
      screen.getByRole("checkbox", { name: "Select group col2:true" }),
    );
    await tableView.user.click(
      screen.getByRole("checkbox", { name: "Select group col2:false" }),
    );
    const falseGroup = screen.getByRole("group", {
      name: "Group col2:false",
    });
    await tableView.user.click(
      within(falseGroup).getByRole("button", { name: "Open" }),
    );

    await tableView.user.click(
      screen.getByRole("button", { name: "End 1 selected row drag" }),
    );

    await waitFor(() => expect(onDataChange).toHaveBeenCalledOnce());
    expect(onDataChange.mock.lastCall?.[0].action).toMatchObject({
      type: "data.row.move",
      payload: { rowId: "row2" },
    });
  });
});
