import { useState } from "react";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { expect, it, vi } from "vitest";

import type {
  DataResourceAction,
  PropertiesResourceAction,
  ResourceChange,
  Row,
} from "@notion-kit/table-hook";

import { TableView } from "@/table-contexts";

import { renderTableView } from "./component-objects/render-table-view";
import type { TableViewObject } from "./component-objects/table-view";
import { mockData, mockProperties, mockResizeObserver } from "./mock";

mockResizeObserver();

const titleProperties = [
  {
    ...mockProperties[0]!,
    type: "title" as const,
    config: { showIcon: true },
  },
  {
    ...mockProperties[1]!,
    type: "checkbox" as const,
    config: undefined,
  },
];

type DataChange = ResourceChange<Row[], DataResourceAction>;
type PropertiesChange = ResourceChange<
  typeof titleProperties,
  PropertiesResourceAction
>;

function expectCreatedRow(change: DataChange, nextPosition: number) {
  expect(change.action.type).toBe("data.row.create");
  if (change.action.type !== "data.row.create") {
    throw new Error("Expected a data.row.create action");
  }
  const { rowId } = change.action.payload;
  expect(typeof rowId).toBe("string");
  expect(change.action.payload).toEqual({ rowId, nextPosition });
  expect(change.next[nextPosition]!.id).toBe(rowId);
}

async function selectList(tableView: TableViewObject) {
  const settings = await tableView.openViewSettings();
  const layout = await settings.openLayout();
  await layout.selectLayout("List");
  await tableView.clickOutside();
}

async function selectGroupedBoard(tableView: TableViewObject) {
  const settings = await tableView.openViewSettings();
  const grouping = await settings.openSelectGrouping();
  await grouping.select("Done");
  await tableView.clickOutside();

  const groupedSettings = await tableView.openViewSettings();
  const layout = await groupedSettings.openLayout();
  await layout.selectLayout("Board");
  await tableView.clickOutside();
}

async function groupTableByDone(tableView: TableViewObject) {
  const settings = await tableView.openViewSettings();
  const grouping = await settings.openSelectGrouping();
  await grouping.select("Done");
  await tableView.clickOutside();
}

it("TableBody_EmptyData_RendersNoRowsAndCreatesFirstRow", async () => {
  const onDataChange = vi.fn<(change: DataChange) => void>();
  const tableView = renderTableView({
    data: [],
    properties: titleProperties,
    onDataChange,
  });

  expect(screen.queryByRole("row")).not.toBeInTheDocument();

  await tableView.clickButton("New page");

  await waitFor(() => expect(onDataChange).toHaveBeenCalledOnce());
  const change = onDataChange.mock.calls[0]![0];
  expectCreatedRow(change, 0);
  expect(change.next).toHaveLength(1);
});

it.each([
  ["First", 0, true, 0],
  ["Last", 2, false, 3],
] as const)(
  "TableRow_%sBoundaryAdd_CreatesAtExpectedPosition",
  async (_boundary, actionIndex, altKey, expectedPosition) => {
    const onDataChange = vi.fn<(change: DataChange) => void>();
    renderTableView({ properties: titleProperties, onDataChange });

    fireEvent.click(
      screen.getAllByRole("button", { name: "Add row" })[actionIndex]!,
      { altKey },
    );

    await waitFor(() => expect(onDataChange).toHaveBeenCalledOnce());
    expectCreatedRow(onDataChange.mock.calls[0]![0], expectedPosition);
  },
);

it("TableBody_GroupedData_RendersGroupRowsAndExpandedChildren", async () => {
  const tableView = renderTableView({ properties: titleProperties });

  await groupTableByDone(tableView);

  const groups = screen.getAllByRole("group", { name: /^Group / });
  expect(groups).toHaveLength(2);
  expect(screen.queryByRole("row")).not.toBeInTheDocument();

  await tableView.user.click(
    within(groups[0]!).getByRole("button", { name: "Open" }),
  );

  expect(await screen.findAllByRole("row")).toHaveLength(2);
});

it("TableHeader_ResizeStartAndEnd_PersistsExactColumnWidth", async () => {
  const consoleError = vi
    .spyOn(console, "error")
    .mockImplementation(() => undefined);
  try {
    const propertyChanges: PropertiesChange[] = [];
    render(
      <TableView
        data={mockData}
        properties={titleProperties}
        view={{}}
        onPropertiesChange={(change) => {
          propertyChanges.push(change as PropertiesChange);
        }}
      />,
    );
    const resizeHandle = screen.getByRole("separator", {
      name: "Resize Name",
    });

    fireEvent.mouseDown(resizeHandle, { clientX: 200 });
    fireEvent.mouseMove(document, { clientX: 260 });

    expect(propertyChanges).toHaveLength(0);

    fireEvent.mouseUp(resizeHandle, { clientX: 260 });

    await waitFor(() => expect(propertyChanges).toHaveLength(1));
    const change = propertyChanges[0]!;
    expect(change.action.type).toBe("properties.resize");
    if (change.action.type !== "properties.resize") {
      throw new Error("Expected a properties.resize action");
    }
    expect(change.action.payload).toEqual({
      propertyId: "col1",
      previousWidth: "200",
      nextWidth: "260px",
    });
    expect(change.next[0]!.width).toBe("260px");
    expect(consoleError).not.toHaveBeenCalled();
  } finally {
    consoleError.mockRestore();
  }
});

it("ListLayout_EmptyData_RendersNoRowsAndCreatesFirstRow", async () => {
  const onDataChange = vi.fn<(change: DataChange) => void>();
  render(
    <TableView
      data={[]}
      properties={titleProperties}
      view={{ layout: "list" }}
      onDataChange={onDataChange}
    />,
  );

  expect(
    screen.queryByRole("button", { name: /Task \d/ }),
  ).not.toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: "New page" }));

  await waitFor(() => expect(onDataChange).toHaveBeenCalledOnce());
  expectCreatedRow(onDataChange.mock.calls[0]![0], 0);
});

it("ListLayout_ControlledParentRefresh_RendersLatestRows", async () => {
  function ControlledList() {
    const [data, setData] = useState(mockData);
    return (
      <>
        <button
          type="button"
          onClick={() =>
            setData((rows) =>
              rows.map((row) =>
                row.id === "row1"
                  ? {
                      ...row,
                      properties: {
                        ...row.properties,
                        col1: {
                          ...row.properties.col1!,
                          value: "Parent refresh",
                        },
                      },
                    }
                  : row,
              ),
            )
          }
        >
          Refresh controlled rows
        </button>
        <TableView
          data={data}
          properties={titleProperties}
          view={{ layout: "list" }}
        />
      </>
    );
  }

  render(<ControlledList />);
  expect(screen.getByText("Task 1")).toBeVisible();

  fireEvent.click(
    screen.getByRole("button", { name: "Refresh controlled rows" }),
  );

  await waitFor(() => {
    expect(screen.getByText("Parent refresh")).toBeVisible();
  });
  expect(screen.queryByText("Task 1")).not.toBeInTheDocument();
});

it.each([
  ["below", false],
  ["above", true],
] as const)(
  "ListRow_Add%s_CreatesAtExpectedBoundary",
  async (_position, altKey) => {
    const onDataChange = vi.fn<(change: DataChange) => void>();
    render(
      <TableView
        data={mockData}
        properties={titleProperties}
        view={{ layout: "list" }}
        onDataChange={onDataChange}
      />,
    );

    fireEvent.click(screen.getAllByRole("button", { name: "Add row" })[0]!, {
      altKey,
    });

    await waitFor(() => expect(onDataChange).toHaveBeenCalledOnce());
    expectCreatedRow(onDataChange.mock.calls[0]![0], altKey ? 0 : 1);
  },
);

it("ListRow_Click_OpensConfiguredRowView", async () => {
  const tableView = renderTableView({ properties: titleProperties });
  await selectList(tableView);

  await tableView.user.click(
    screen.getAllByRole("button", { name: /Task 1/ })[0]!,
  );

  expect(await screen.findByRole("heading", { name: "Task 1" })).toBeVisible();
});

it("BoardWithoutGrouping_SelectGroupingAction_OpensPropertyPicker", async () => {
  const tableView = renderTableView({ properties: titleProperties });
  const settings = await tableView.openViewSettings();
  const layout = await settings.openLayout();
  await layout.selectLayout("Board");
  await tableView.clickOutside();

  await tableView.user.click(
    screen.getByRole("button", { name: "Select a grouping property" }),
  );

  expect(
    await screen.findByRole("heading", { name: "Group by" }),
  ).toBeVisible();
});

it("BoardCard_EditCommit_UpdatesTitleCellResource", async () => {
  const onDataChange = vi.fn<(change: DataChange) => void>();
  const tableView = renderTableView({
    properties: titleProperties,
    onDataChange,
  });
  await selectGroupedBoard(tableView);
  await tableView.user.click(
    screen.getAllByRole("button", { name: "Edit" })[0]!,
  );
  const input = await screen.findByRole("textbox");

  fireEvent.change(input, { target: { value: "Board task" } });
  fireEvent.keyDown(input, { key: "Enter" });

  await waitFor(() => expect(onDataChange).toHaveBeenCalledOnce());
  expect(screen.getByText("Board task")).toBeVisible();
  expect(onDataChange.mock.calls[0]?.[0].action).toMatchObject({
    type: "data.cell.update",
    payload: {
      rowId: "row1",
      propertyId: "col1",
      nextValue: "Board task",
    },
  });
});

it("BoardGroup_NewPage_CreatesRowInsideSelectedGroup", async () => {
  const onDataChange = vi.fn<(change: DataChange) => void>();
  const tableView = renderTableView({
    properties: titleProperties,
    onDataChange,
  });
  await selectGroupedBoard(tableView);
  const group = screen.getAllByRole("group", { name: /^Group / })[0]!;

  fireEvent.click(within(group).getByRole("button", { name: "New page" }));

  await waitFor(() => expect(onDataChange).toHaveBeenCalledOnce());
  expect(onDataChange.mock.calls[0]?.[0].action).toMatchObject({
    type: "data.row.create",
  });
});

it("BoardCard_Click_OpensConfiguredRowView", async () => {
  const tableView = renderTableView({ properties: titleProperties });
  await selectGroupedBoard(tableView);

  await tableView.user.click(screen.getByRole("button", { name: /Task 1/ }));

  expect(await screen.findByRole("heading", { name: "Task 1" })).toBeVisible();
});
