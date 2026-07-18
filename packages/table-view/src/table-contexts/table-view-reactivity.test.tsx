import { Profiler } from "react";
import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CountMethod } from "@notion-kit/table-hook";

import { renderTableView } from "../__tests__/component-objects/render-table-view";
import { mockProperties, mockResizeObserver } from "../__tests__/mock";
import { useTableViewCtx } from "./table-view-provider";

mockResizeObserver();

function DataUpdateControls() {
  const { table } = useTableViewCtx();

  return (
    <>
      <button
        type="button"
        onClick={() =>
          table.setTableData((rows) =>
            rows.map((row) =>
              row.id === "row1"
                ? {
                    ...row,
                    properties: {
                      ...row.properties,
                      col1: {
                        ...row.properties.col1!,
                        value: "Renamed task",
                      },
                    },
                  }
                : row,
            ),
          )
        }
      >
        Rename first row
      </button>
      <button type="button" onClick={() => table.openRowInFullPage("row1")}>
        Open first row full page
      </button>
      <button
        type="button"
        onClick={() =>
          table.setTableGlobalState((view) => ({
            ...view,
            openedRowId: "row1",
            rowView: "center",
          }))
        }
      >
        Open first row center peek
      </button>
      <button
        type="button"
        onClick={() => table.setColumnInfo("col2", { hidden: true })}
      >
        Hide done column
      </button>
      <button
        type="button"
        onClick={() => table.setColumnPinning({ start: ["col1"], end: [] })}
      >
        Pin name column
      </button>
      <button
        type="button"
        onClick={() => table.setColumnSizing({ col1: 320 })}
      >
        Resize name column
      </button>
      <button
        type="button"
        onClick={() => table.setColumnCountMethod("col1", CountMethod.ALL)}
      >
        Count name column
      </button>
    </>
  );
}

describe("TableViewReactivity", () => {
  it("TableViewReactivity_LayoutSwitch_RendersSelectedLayout", async () => {
    const tableView = renderTableView();
    const settings = await tableView.openViewSettings();
    const layout = await settings.openLayout();

    await layout.selectLayout("List");

    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(screen.getByText("Task 1")).toBeVisible();

    await layout.selectLayout("Board");

    expect(screen.getByText("Select a grouping property")).toBeVisible();
    expect(
      document.querySelector('[data-slot="notion-board-view"]'),
    ).toBeInTheDocument();
  });

  it("TableViewReactivity_LockToggle_HidesTableAddRow", async () => {
    const tableView = renderTableView();
    const settings = await tableView.openViewSettings();

    expect(screen.getByRole("button", { name: /new page/i })).toBeVisible();

    await settings.toggleLock();

    await waitFor(() => {
      expect(
        screen.queryByRole("button", { name: /new page/i }),
      ).not.toBeInTheDocument();
    });
    expect(settings.item("Unlock database")).toBeVisible();
  });

  it("TableViewReactivity_SortingChange_ShowsAndClearsSortSelector", async () => {
    const tableView = renderTableView();
    const sort = await tableView.openSortMenu();

    await sort.addRule("Name");
    await tableView.clickOutside();

    expect(screen.getAllByRole("button", { name: /name/i })).toHaveLength(2);

    const sortedMenu = await tableView.openSortMenu();
    await sortedMenu.deleteAll();
    await tableView.clickOutside();

    await waitFor(() => {
      expect(screen.getAllByRole("button", { name: /name/i })).toHaveLength(1);
    });
  });

  it("TableViewReactivity_InternalStoreUpdate_DoesNotBroadcastContextToChildren", async () => {
    const onProbeRender = vi.fn();

    function ContextProbe() {
      useTableViewCtx();
      return null;
    }

    const tableView = renderTableView({
      children: (
        <Profiler id="context-probe" onRender={onProbeRender}>
          <ContextProbe />
        </Profiler>
      ),
    });
    expect(onProbeRender).toHaveBeenCalledOnce();

    const sort = await tableView.openSortMenu();
    await sort.addRule("Name");
    await tableView.clickOutside();

    expect(screen.getAllByRole("button", { name: /name/i })).toHaveLength(2);
    expect(onProbeRender).toHaveBeenCalledOnce();
  });

  it("TableViewReactivity_RowOpenAndModeChange_RendersSelectedRowView", async () => {
    const tableView = renderTableView({
      properties: [
        {
          ...mockProperties[0]!,
          type: "title",
          config: { showIcon: true },
        },
        ...mockProperties.slice(1),
      ],
      children: <DataUpdateControls />,
    });
    const openCenterPeek = tableView.button("Open first row center peek");
    const rowActions = await tableView.openRowActions("Task 1");

    rowActions.choose("Open in side peek");

    expect(
      await screen.findByRole("heading", { name: "Task 1" }),
    ).toBeVisible();

    fireEvent.click(openCenterPeek);

    expect(await screen.findByRole("dialog", { name: "Task 1" })).toBeVisible();
  });

  it("TableViewReactivity_DataChange_RendersAddedRow", async () => {
    const tableView = renderTableView();
    const initialRowCount = tableView.rows().length;

    await tableView.clickButton(/new page/i);

    await waitFor(() => {
      expect(tableView.rows()).toHaveLength(initialRowCount + 1);
    });
  });

  it.each([
    ["Side", "Open in side peek"],
    ["Full", null],
  ] as const)(
    "TableViewReactivity_DataChange_Refreshes%sRowView",
    async (_view, rowAction) => {
      const tableView = renderTableView({
        properties: [
          {
            ...mockProperties[0]!,
            type: "title",
            config: { showIcon: true },
          },
          ...mockProperties.slice(1),
        ],
        children: <DataUpdateControls />,
      });
      const renameButton = tableView.button("Rename first row");
      let rowView: HTMLElement;

      if (rowAction) {
        const rowActions = await tableView.openRowActions("Task 1");
        rowActions.choose(rowAction);

        rowView = await screen.findByRole("dialog", { name: "Task 1" });
      } else {
        await tableView.clickButton("Open first row full page");
        rowView = await waitFor(() => {
          const section = document.querySelector<HTMLElement>("section#row1");
          expect(section).toBeInTheDocument();
          return section!;
        });
      }
      expect(within(rowView).getByText("Task 1")).toBeVisible();

      fireEvent.click(renameButton);

      await waitFor(() => {
        expect(within(rowView).getByText("Renamed task")).toBeVisible();
      });
    },
  );

  it("TableViewReactivity_ListLock_HidesAddRow", async () => {
    const tableView = renderTableView();
    const settings = await tableView.openViewSettings();
    const layout = await settings.openLayout();
    await layout.selectLayout("List");
    await tableView.clickOutside();

    const listSettings = await tableView.openViewSettings();
    await listSettings.toggleLock();

    await waitFor(() => {
      expect(
        screen.queryByRole("button", { name: /new page/i }),
      ).not.toBeInTheDocument();
    });
  });

  it("TableViewReactivity_BoardLock_DisablesColumns", async () => {
    const tableView = renderTableView({
      properties: [
        {
          ...mockProperties[0]!,
          type: "title",
          config: { showIcon: true },
        },
        ...mockProperties.slice(1),
      ],
    });
    const settings = await tableView.openViewSettings();
    const grouping = await settings.openSelectGrouping();
    await grouping.select("Done");
    await tableView.clickOutside();

    const groupedSettings = await tableView.openViewSettings();
    const layout = await groupedSettings.openLayout();
    await layout.selectLayout("Board");
    await tableView.clickOutside();

    const boardSettings = await tableView.openViewSettings();
    await boardSettings.toggleLock();

    await waitFor(() => {
      const columns = document.querySelectorAll('[data-slot="kanban-column"]');
      expect(columns.length).toBeGreaterThan(0);
      for (const column of columns) {
        expect(column).toHaveAttribute("disabled");
      }
      const addButtons = screen
        .queryAllByRole("button", { name: /new page/i })
        .filter((element) => element.tagName === "BUTTON");
      expect(addButtons).toHaveLength(0);
    });
  });

  it("TableViewReactivity_ColumnVisibility_RefreshesColumnSizeVariables", async () => {
    const tableView = renderTableView({ children: <DataUpdateControls /> });
    const tableLayout = document.querySelector<HTMLElement>(
      '[data-block-id="15f35e0f-492c-8003-9976-f8ae747a6aeb"]',
    );
    expect(tableLayout?.style.getPropertyValue("--col-col2-size")).not.toBe("");

    await tableView.clickButton("Hide done column");

    await waitFor(() => {
      expect(tableLayout?.style.getPropertyValue("--col-col2-size")).toBe("");
    });
  });

  it("TableViewReactivity_ColumnPinning_RefreshesPinnedHeaders", async () => {
    const tableView = renderTableView({ children: <DataUpdateControls /> });
    expect(
      document.querySelector("#draggable-ghost-section-left"),
    ).not.toBeInTheDocument();

    await tableView.clickButton("Pin name column");

    await waitFor(() => {
      const pinned = document.querySelector<HTMLElement>(
        "#draggable-ghost-section-left",
      );
      expect(pinned).toBeInTheDocument();
      expect(pinned).toHaveTextContent("Name");
    });
  });

  it("TableViewReactivity_ColumnSizing_RefreshesColumnSizeVariables", async () => {
    const tableView = renderTableView({ children: <DataUpdateControls /> });
    const tableLayout = document.querySelector<HTMLElement>(
      '[data-block-id="15f35e0f-492c-8003-9976-f8ae747a6aeb"]',
    );

    await tableView.clickButton("Resize name column");

    await waitFor(() => {
      expect(tableLayout?.style.getPropertyValue("--col-col1-size")).toBe(
        "320",
      );
    });
  });

  it("TableViewReactivity_ColumnCounting_RefreshesFooterResult", async () => {
    const tableView = renderTableView({ children: <DataUpdateControls /> });

    await tableView.clickButton("Count name column");

    await waitFor(() => {
      expect(screen.getByText("count")).toBeVisible();
    });
  });
});
