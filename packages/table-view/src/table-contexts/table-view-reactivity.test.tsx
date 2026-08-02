import { Profiler } from "react";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  CountMethod,
  type ResourceChange,
  type TableViewState,
  type ViewResourceAction,
} from "@notion-kit/table-hook";

import { renderTableView } from "../__tests__/component-objects/render-table-view";
import {
  mockData,
  mockProperties,
  mockResizeObserver,
} from "../__tests__/mock";
import { TableView, useTableViewCtx } from "./table-view-provider";

mockResizeObserver();

function DataUpdateControls() {
  const { table } = useTableViewCtx();

  return (
    <>
      <button
        type="button"
        onClick={() =>
          table.setTableData(
            (rows) =>
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
            {
              id: "test-data-cell-action",
              type: "data.cell.update",
              payload: {
                rowId: "row1",
                propertyId: "col1",
                nextValue: "Renamed task",
              },
            },
          )
        }
      >
        Rename first row
      </button>
      <button type="button" onClick={() => table.openRowInFullPage("row1")}>
        Open first row full page
      </button>
      <button type="button" onClick={() => table.openRow("row1")}>
        Open first row side peek
      </button>
      <button type="button" onClick={() => table.setGrouping(["col2"])}>
        Group by done
      </button>
      <button
        type="button"
        onClick={() => table.toggleGroupVisible("col2:true")}
      >
        Hide done group
      </button>
      <button
        type="button"
        onClick={() =>
          table.setTableData(
            (rows) => rows.filter((row) => row.id !== "row1"),
            {
              id: "test-data-row-delete-action",
              type: "data.row.delete",
              payload: {
                rowIds: ["row1"],
                previousPositions: [{ rowId: "row1", index: 0 }],
              },
            },
          )
        }
      >
        Delete first row
      </button>
      <button
        type="button"
        onClick={() =>
          table.setTableGlobalState(
            (view) => ({
              ...view,
              openedRowId: "row1",
              rowView: "center",
            }),
            (previous, next) => ({
              id: "test-view-row-display-action",
              type: "view.row_display.change",
              payload: {
                previousRowView: previous.rowView,
                nextRowView: next.rowView,
              },
            }),
          )
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

    expect(screen.getAllByRole("button", { name: "Name" })).toHaveLength(2);

    const sortedMenu = await tableView.openSortMenu();
    await sortedMenu.deleteAll();
    await tableView.clickOutside();

    await waitFor(() => {
      expect(screen.getAllByRole("button", { name: "Name" })).toHaveLength(1);
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

    expect(screen.getAllByRole("button", { name: "Name" })).toHaveLength(2);
    expect(onProbeRender).toHaveBeenCalledOnce();
  });

  it("TableViewReactivity_ResourceUpdate_BroadcastsLatestTableOnce", async () => {
    const onProbeRender = vi.fn();

    function ContextProbe() {
      useTableViewCtx();
      return null;
    }

    renderTableView({
      children: (
        <>
          <DataUpdateControls />
          <Profiler id="context-probe" onRender={onProbeRender}>
            <ContextProbe />
          </Profiler>
        </>
      ),
    });
    expect(onProbeRender).toHaveBeenCalledOnce();

    fireEvent.click(screen.getByRole("button", { name: "Rename first row" }));

    expect(await screen.findByText("Renamed task")).toBeVisible();
    expect(onProbeRender).toHaveBeenCalledTimes(2);
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

  it("ViewNav_SelectedRowView_DoesNotEmitChange", async () => {
    const onViewChange =
      vi.fn<
        (change: ResourceChange<TableViewState, ViewResourceAction>) => unknown
      >();
    const tableView = renderTableView({
      properties: [
        {
          ...mockProperties[0]!,
          type: "title",
          config: { showIcon: true },
        },
        ...mockProperties.slice(1),
      ],
      onViewChange,
    });
    const rowActions = await tableView.openRowActions("Task 1");
    rowActions.choose("Open in side peek");
    const dialog = await screen.findByRole("dialog", { name: "Task 1" });
    onViewChange.mockClear();

    const trigger = dialog.querySelector<HTMLElement>('[aria-haspopup="menu"]');
    expect(trigger).not.toBeNull();
    fireEvent.click(trigger!);
    fireEvent.click(
      await screen.findByRole("menuitemradio", { name: "Side peek" }),
    );

    expect(onViewChange).not.toHaveBeenCalled();
  });

  it("ViewNav_DifferentPeekMode_EmitsViewChangeAndMovesRow", async () => {
    const onViewChange =
      vi.fn<
        (change: ResourceChange<TableViewState, ViewResourceAction>) => unknown
      >();
    const tableView = renderTableView({
      properties: [
        {
          ...mockProperties[0]!,
          type: "title",
          config: { showIcon: true },
        },
        ...mockProperties.slice(1),
      ],
      onViewChange,
    });
    const rowActions = await tableView.openRowActions("Task 1");
    rowActions.choose("Open in side peek");
    const dialog = await screen.findByRole("dialog", { name: "Task 1" });
    onViewChange.mockClear();

    fireEvent.click(
      dialog.querySelector<HTMLElement>('[aria-haspopup="menu"]')!,
    );
    fireEvent.click(
      await screen.findByRole("menuitemradio", { name: "Center peek" }),
    );

    await waitFor(() => expect(onViewChange).toHaveBeenCalledOnce());
    expect(onViewChange.mock.calls[0]?.[0].action).toMatchObject({
      type: "view.row_display.change",
      payload: {
        previousRowView: "side",
        nextRowView: "center",
      },
    });
    expect(await screen.findByRole("dialog", { name: "Task 1" })).toBeVisible();
  });

  it("ViewNav_EscapeShortcut_ClosesOpenedRow", async () => {
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
    const rowActions = await tableView.openRowActions("Task 1");
    rowActions.choose("Open in side peek");
    expect(await screen.findByRole("dialog", { name: "Task 1" })).toBeVisible();

    fireEvent.keyDown(document, { key: "Escape" });

    await waitFor(() =>
      expect(
        screen.queryByRole("dialog", { name: "Task 1" }),
      ).not.toBeInTheDocument(),
    );
  });

  it("ViewNav_FirstRow_DisablesPreviousAndNavigatesToNextRow", async () => {
    const onViewChange =
      vi.fn<
        (change: ResourceChange<TableViewState, ViewResourceAction>) => unknown
      >();
    const tableView = renderTableView({
      properties: [
        {
          ...mockProperties[0]!,
          type: "title",
          config: { showIcon: true },
        },
        ...mockProperties.slice(1),
      ],
      onViewChange,
    });
    const rowActions = await tableView.openRowActions("Task 1");
    rowActions.choose("Open in side peek");
    const dialog = await screen.findByRole("dialog", { name: "Task 1" });

    expect(
      within(dialog).getByRole("button", { name: "Previous row" }),
    ).toBeDisabled();
    fireEvent.click(within(dialog).getByRole("button", { name: "Next row" }));

    await waitFor(() =>
      expect(document.querySelector('[role="dialog"]#row2')).toBeVisible(),
    );
    await waitFor(() =>
      expect(onViewChange.mock.calls.at(-1)?.[0].action).toMatchObject({
        type: "view.opened_row.change",
        payload: {
          previousRowId: "row1",
          nextRowId: "row2",
        },
      }),
    );
  });

  it("ViewNav_LastRow_DisablesNextAndNavigatesToPreviousRow", async () => {
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
    const rowActions = await tableView.openRowActions("Task 3");
    rowActions.choose("Open in side peek");
    const dialog = await screen.findByRole("dialog", { name: "Task 3" });

    expect(
      within(dialog).getByRole("button", { name: "Next row" }),
    ).toBeDisabled();
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Previous row" }),
    );

    await waitFor(() =>
      expect(document.querySelector('[role="dialog"]#row2')).toBeVisible(),
    );
  });

  it("ViewNav_OpenFullPageButton_OpensCurrentRowFullPage", async () => {
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
    const rowActions = await tableView.openRowActions("Task 1");
    rowActions.choose("Open in side peek");
    expect(await screen.findByRole("dialog", { name: "Task 1" })).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "Open in full page" }));

    await waitFor(() =>
      expect(document.querySelector("section#row1")).toBeInTheDocument(),
    );
  });

  it.each([
    ["Side", "Open first row center peek", "dialog"],
    ["Center", "Open first row center peek", "dialog"],
    ["Full", "Open first row full page", "section"],
  ] as const)(
    "RowView_%sOpenedRowDeleted_ClosesWithoutRenderingStaleData",
    async (mode, openButtonName, containerType) => {
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
      const deleteButton = tableView.button("Delete first row");
      if (mode === "Side") {
        const rowActions = await tableView.openRowActions("Task 1");
        rowActions.choose("Open in side peek");
      } else {
        fireEvent.click(tableView.button(openButtonName));
      }
      if (containerType === "dialog") {
        expect(
          await screen.findByRole("dialog", { name: "Task 1" }),
        ).toBeVisible();
      } else {
        await waitFor(() =>
          expect(document.querySelector("section#row1")).toBeInTheDocument(),
        );
      }

      fireEvent.click(deleteButton);

      await waitFor(() => {
        if (containerType === "dialog") {
          expect(
            screen.queryByRole("dialog", { name: "Task 1" }),
          ).not.toBeInTheDocument();
        } else {
          expect(
            document.querySelector("section#row1"),
          ).not.toBeInTheDocument();
        }
      });
    },
  );

  it.each([
    ["Side", "Open first row side peek", "dialog"],
    ["Center", "Open first row center peek", "dialog"],
    ["Full", "Open first row full page", "section"],
  ] as const)(
    "RowView_%sOpenedRowGroupHidden_RemainsOpenWithCoreRowData",
    async (_mode, openButtonName, containerType) => {
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
      const hideGroupButton = tableView.button("Hide done group");
      const refreshRowViewButton = tableView.button("Hide done column");
      fireEvent.click(tableView.button("Group by done"));
      fireEvent.click(tableView.button(openButtonName));

      fireEvent.click(hideGroupButton);
      fireEvent.click(refreshRowViewButton);

      if (containerType === "dialog") {
        expect(
          await screen.findByRole("dialog", { name: "Task 1" }),
        ).toBeVisible();
      } else {
        await waitFor(() =>
          expect(document.querySelector("section#row1")).toBeInTheDocument(),
        );
      }
    },
  );

  it("RowView_ConfiguredUrl_NavigatesWithoutRenderingInlineFullView", async () => {
    const open = vi.spyOn(window, "open").mockImplementation(() => null);
    const tableView = renderTableView({
      properties: [
        {
          ...mockProperties[0]!,
          type: "title",
          config: { showIcon: true },
        },
        ...mockProperties.slice(1),
      ],
      getRowUrl: (rowId) => `/rows/${rowId}`,
      children: <DataUpdateControls />,
    });

    try {
      fireEvent.click(tableView.button("Open first row full page"));

      await waitFor(() =>
        expect(open).toHaveBeenCalledWith("/rows/row1", "_self"),
      );
      expect(document.querySelector("section#row1")).not.toBeInTheDocument();
    } finally {
      open.mockRestore();
    }
  });

  it("TableViewReactivity_DataChange_RendersAddedRow", async () => {
    const tableView = renderTableView();
    const initialRowCount = tableView.rows().length;

    await tableView.clickButton(/new page/i);

    await waitFor(() => {
      expect(tableView.rows()).toHaveLength(initialRowCount + 1);
    });
  });

  it("TableViewReactivity_UncontrolledDataChange_RendersUpdatedCell", async () => {
    render(
      <TableView defaultData={mockData} defaultProperties={mockProperties}>
        <DataUpdateControls />
      </TableView>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Rename first row" }));

    await waitFor(() => {
      expect(screen.getByText("Renamed task")).toBeVisible();
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
      expect(
        screen.getByRole("button", { name: "Name calculation" }),
      ).toHaveTextContent("count3");
    });
  });
});
