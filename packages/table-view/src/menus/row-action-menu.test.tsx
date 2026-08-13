/**
 * Row Action Menu Tests
 * Tests for the row action menu functionality
 */

import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  renderTableView,
  type TableViewProps,
} from "@/__tests__/component-objects/render-table-view";
import { mockData, mockProperties, mockResizeObserver } from "@/__tests__/mock";

mockResizeObserver();

const anyString: unknown = expect.any(String);
const blobUrl: unknown = expect.stringMatching(/^blob:/);

function lastAction(callback: { mock: { lastCall: unknown[] | undefined } }) {
  return (
    callback.mock.lastCall?.[0] as
      | { action: { id: unknown; payload: Record<string, unknown> } }
      | undefined
  )?.action;
}

const getAnimationsDescriptor = Object.getOwnPropertyDescriptor(
  Element.prototype,
  "getAnimations",
);

beforeAll(() => {
  if (getAnimationsDescriptor) return;
  Object.defineProperty(Element.prototype, "getAnimations", {
    configurable: true,
    value: () => [],
  });
});

afterAll(() => {
  if (getAnimationsDescriptor) return;
  delete (Element.prototype as { getAnimations?: () => Animation[] })
    .getAnimations;
});

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(
      new Response(JSON.stringify({}), {
        headers: { "Content-Type": "application/json" },
      }),
    ),
  );
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

const titleProperties = [
  { ...mockProperties[0]!, type: "title" as const, config: { showIcon: true } },
  mockProperties[1]!,
];

async function openRowActionMenu(props: Partial<TableViewProps> = {}) {
  const tableView = renderTableView({
    getRowUrl: (rowId) => `/${rowId}`,
    ...props,
  });
  const menu = await tableView.openRowActions("Task 1");
  expect(menu.root).toBeInTheDocument();
  return { tableView, menu };
}

describe("RowActionMenu", () => {
  it("RowActionMenu_Search_FiltersActions", async () => {
    // Arrange
    const { menu } = await openRowActionMenu();

    // Act
    await menu.search("duplicate");

    // Assert
    expect(menu.option(/duplicate/i)).toBeInTheDocument();
    expect(menu.queryOption(/copy link/i)).not.toBeInTheDocument();
  });

  it("RowActionMenu_CopyLink_CopiesRowUrl", async () => {
    // Arrange
    const { menu, tableView } = await openRowActionMenu();

    // Act
    await tableView.user.click(menu.option(/copy link/i));

    // Assert
    const url = await navigator.clipboard.readText();
    expect(url.endsWith("/row1")).toBeTruthy();
  });

  it("RowActionMenu_Duplicate_CreatesExactRowResource", async () => {
    // Arrange
    const onDataChange = vi.fn();
    const { menu } = await openRowActionMenu({ onDataChange });

    // Act
    menu.choose(/duplicate/i);

    // Assert
    await menu.waitForRowCount("Task 1", 2);
    const action = lastAction(onDataChange);
    expect(action).toEqual({
      id: anyString,
      type: "data.row.duplicate",
      payload: {
        sourceRowId: "row1",
        rowId: anyString,
        nextPosition: 1,
      },
    });
  });

  it("RowActionMenu_MetaD_DuplicatesExactRowResourceWhileSearching", async () => {
    // Arrange
    const onDataChange = vi.fn();
    const { menu } = await openRowActionMenu({ onDataChange });

    // Act
    menu.searchInput().focus();
    await menu.press("{Meta>}d{/Meta}");

    // Assert
    await menu.waitForRowCount("Task 1", 2);
    expect(lastAction(onDataChange)).toEqual({
      id: anyString,
      type: "data.row.duplicate",
      payload: {
        sourceRowId: "row1",
        rowId: anyString,
        nextPosition: 1,
      },
    });
  });

  it("RowActionMenu_Delete_RemovesExactRowResource", async () => {
    // Arrange
    const onDataChange = vi.fn();
    const { menu } = await openRowActionMenu({ onDataChange });

    // Act
    menu.choose(/delete/i);

    // Assert
    await menu.waitForRowRemoved("Task 1");
    expect(lastAction(onDataChange)).toEqual({
      id: anyString,
      type: "data.row.delete",
      payload: {
        rowIds: ["row1"],
        previousPositions: [{ rowId: "row1", index: 0 }],
      },
    });
  });

  it("RowActionMenu_Backspace_RemovesExactRowResource", async () => {
    // Arrange
    const onDataChange = vi.fn();
    const { menu } = await openRowActionMenu({ onDataChange });

    // Act
    menu.searchInput().focus();
    await menu.press("{Backspace}");

    // Assert
    await menu.waitForRowRemoved("Task 1");
    expect(lastAction(onDataChange)).toEqual({
      id: anyString,
      type: "data.row.delete",
      payload: {
        rowIds: ["row1"],
        previousPositions: [{ rowId: "row1", index: 0 }],
      },
    });
  });

  it("RowActionMenu_MetaShiftEnter_OpensConfiguredRowInNewTab", async () => {
    // Arrange
    const open = vi.spyOn(window, "open").mockImplementation(() => null);
    const { menu } = await openRowActionMenu();

    // Act
    menu.searchInput().focus();
    await menu.press("{Meta>}{Shift>}{Enter}{/Shift}{/Meta}");

    // Assert
    expect(open).toHaveBeenCalledWith("/row1", "_blank", "noopener,noreferrer");
  });

  it("RowActionMenu_UrlIconUpload_UpdatesExactRowIconResource", async () => {
    // Arrange
    const onDataChange = vi.fn();
    const { menu } = await openRowActionMenu({
      properties: titleProperties,
      onDataChange,
    });

    // Act
    menu.choose("Edit icon");
    await screen.findByRole("tab", { name: "Upload" });
    await screen
      .findByRole("tab", { name: "Upload" })
      .then((tab) => fireEvent.click(tab));
    const url = screen.getByPlaceholderText("Paste an image link...");
    fireEvent.change(url, {
      target: { value: "https://example.com/task.png" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));

    // Assert
    await waitFor(() => expect(onDataChange).toHaveBeenCalledOnce());
    expect(lastAction(onDataChange)).toEqual({
      id: anyString,
      type: "data.row.update",
      payload: {
        rowId: "row1",
        previous: { icon: undefined },
        next: { icon: { type: "url", src: "https://example.com/task.png" } },
      },
    });
  });

  it("RowActionMenu_IconMenu_RendersWithoutReactKeyWarning", async () => {
    const error = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const { menu } = await openRowActionMenu({ properties: titleProperties });

    menu.choose("Edit icon");
    await screen.findByRole("tab", { name: "Upload" });

    expect(
      error.mock.calls.some(
        ([message]) =>
          typeof message === "string" && message.includes('unique "key" prop'),
      ),
    ).toBe(false);
  });

  it("RowActionMenu_FileIconUpload_UpdatesRowIconResource", async () => {
    // Arrange
    const onDataChange = vi.fn();
    const { menu, tableView } = await openRowActionMenu({
      properties: titleProperties,
      onDataChange,
    });

    // Act
    menu.choose("Edit icon");
    fireEvent.click(await screen.findByRole("tab", { name: "Upload" }));
    const input =
      document.querySelector<HTMLInputElement>('input[type="file"]');
    await tableView.user.upload(
      input!,
      new File(["image"], "task.png", { type: "image/png" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));

    // Assert
    await waitFor(() => expect(onDataChange).toHaveBeenCalledOnce());
    expect(lastAction(onDataChange)).toEqual({
      id: anyString,
      type: "data.row.update",
      payload: {
        rowId: "row1",
        previous: { icon: undefined },
        next: { icon: { type: "url", src: blobUrl } },
      },
    });
  });

  it("RowActionMenu_RemoveIcon_ClearsExactRowIconResource", async () => {
    // Arrange
    const onDataChange = vi.fn();
    const { menu } = await openRowActionMenu({
      data: [
        {
          ...mockData[0]!,
          icon: { type: "emoji", src: "✅" },
        },
        ...mockData.slice(1),
      ],
      properties: titleProperties,
      onDataChange,
    });

    // Act
    menu.choose("Edit icon");
    fireEvent.click(await screen.findByRole("button", { name: "Remove" }));

    // Assert
    await waitFor(() => expect(onDataChange).toHaveBeenCalledOnce());
    expect(lastAction(onDataChange)).toEqual({
      id: anyString,
      type: "data.row.update",
      payload: {
        rowId: "row1",
        previous: { icon: { type: "emoji", src: "✅" } },
        next: { icon: undefined },
      },
    });
  });

  it("RowActionMenu_LockedView_HidesMutationControlsWithoutDataChange", () => {
    // Arrange
    const onDataChange = vi.fn();
    const tableView = renderTableView({ view: { locked: true }, onDataChange });

    // Act
    const row = tableView.row("Task 1");

    // Assert
    expect(
      within(row).queryByRole("button", { name: "Row actions" }),
    ).not.toBeInTheDocument();
    expect(onDataChange).not.toHaveBeenCalled();
  });
});
