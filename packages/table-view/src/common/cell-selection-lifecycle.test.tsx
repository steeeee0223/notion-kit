import { useEffect } from "react";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it } from "vitest";

import { renderTableView } from "@/__tests__/component-objects/render-table-view";
import { createFullPluginFixture, mockResizeObserver } from "@/__tests__/mock";
import { TableView, useTableViewCtx } from "@/table-contexts";

mockResizeObserver();

it.each([
  "title",
  "notes",
  "score",
  "status",
  "tags",
  "due",
  "email",
  "phone",
  "website",
])("restores selection when the %s editor closes", async (property) => {
  const view = renderTableView(createFullPluginFixture());
  const cell = view.propertyCell("Alpha", property);
  const trigger = within(cell)
    .getAllByRole("button")
    .find((button) => button.hasAttribute("data-cell-trigger"))!;
  await view.user.click(trigger);
  expect(cell).not.toHaveAttribute("data-cell-selected", "true");
  await view.user.keyboard("{Escape}");
  await waitFor(() => expect(cell).toHaveFocus());
  expect(cell).toHaveAttribute("data-cell-selected", "true");
});

it("does not steal focus when switching editors", async () => {
  const view = renderTableView(createFullPluginFixture());
  await view.user.click(view.cellButton("Alpha", "Alpha"));
  await view.user.click(view.cellButton("Alpha", "first note"));
  expect(screen.getByRole("textbox", { name: "" })).toHaveValue("first note");
  await view.user.keyboard("{Escape}");
  await waitFor(() =>
    expect(view.propertyCell("Alpha", "notes")).toHaveFocus(),
  );
});

function Grouping() {
  const { table } = useTableViewCtx();
  useEffect(() => {
    table.setGrouping(["complete"]);
    table.setExpanded(true);
  }, [table]);
  return null;
}

it("navigates displayed data cells across group headings", async () => {
  const view = renderTableView({
    ...createFullPluginFixture(),
    children: <Grouping />,
  });
  const cells = screen
    .getAllByRole("row")
    .flatMap((row) =>
      Array.from(
        row.querySelectorAll<HTMLElement>('[data-property-id="title"]'),
      ),
    );
  const first = cells[0]!;
  const next = cells[1]!;
  const boundary = screen
    .getAllByRole("group")
    .find(
      (group) =>
        Boolean(
          first.compareDocumentPosition(group) &
            Node.DOCUMENT_POSITION_FOLLOWING,
        ) &&
        Boolean(
          group.compareDocumentPosition(next) &
            Node.DOCUMENT_POSITION_FOLLOWING,
        ),
    );
  expect(boundary).toBeDefined();
  fireEvent.mouseDown(first, { button: 0 });
  fireEvent.mouseUp(first);
  await view.user.keyboard("{ArrowDown}");
  expect(next).toHaveFocus();
  await view.user.keyboard("{Control>}a{/Control}");
  for (const cell of cells)
    expect(cell).toHaveAttribute("data-cell-selected", "true");
});

it("isolates selection shortcuts between table instances and unrelated inputs", async () => {
  const fixture = createFullPluginFixture();
  const user = userEvent.setup();
  const { container } = render(
    <>
      <TableView {...fixture} />
      <TableView {...fixture} />
      <input aria-label="Unrelated" defaultValue="hello" />
    </>,
  );
  const frames = container.querySelectorAll<HTMLElement>(
    '[data-property-id="title"]',
  );
  const first = frames[0]!;
  fireEvent.mouseDown(first, { button: 0 });
  fireEvent.mouseUp(first);
  await user.keyboard("{Control>}a{/Control}");
  const tables = container.querySelectorAll(
    '[data-notion-slot="notion-table-view"]',
  );
  expect(
    tables[0]!.querySelectorAll('[data-cell-selected="true"]').length,
  ).toBeGreaterThan(1);
  expect(
    tables[1]!.querySelectorAll('[data-cell-selected="true"]'),
  ).toHaveLength(0);
  await user.click(screen.getByRole("textbox", { name: "Unrelated" }));
  await user.keyboard("{Control>}a{/Control}");
  expect(screen.getByRole("textbox", { name: "Unrelated" })).toHaveFocus();
  expect(
    tables[1]!.querySelectorAll('[data-cell-selected="true"]'),
  ).toHaveLength(0);
});

it("keeps a newly clicked unrelated input focused when dismissing an editor", async () => {
  const view = renderTableView({
    children: <input aria-label="Outside editor" />,
  });
  await view.user.click(view.cellButton("Task 1", "Task 1"));
  await view.user.click(
    screen.getByRole("textbox", { name: "Outside editor" }),
  );
  await waitFor(() =>
    expect(
      screen.getByRole("textbox", { name: "Outside editor" }),
    ).toHaveFocus(),
  );
});

it("outlines each selected region at a non-data group heading", async () => {
  const view = renderTableView({
    ...createFullPluginFixture(),
    children: <Grouping />,
  });
  const rows = screen
    .getAllByRole("row")
    .filter((row) => row.querySelector('[data-property-id="title"]'));
  const first = rows[0]!.querySelector<HTMLElement>(
    '[data-property-id="title"]',
  )!;
  fireEvent.mouseDown(first, { button: 0 });
  fireEvent.mouseUp(first);
  await view.user.keyboard("{Control>}a{/Control}");
  const groupHeadings = screen
    .getAllByRole("group")
    .filter((group) => group.getAttribute("aria-label")?.startsWith("Group "));
  expect(groupHeadings.length).toBeGreaterThan(1);
  // The first data row after every heading starts a new visible selected region.
  for (const heading of groupHeadings) {
    const following = rows.find((row) =>
      Boolean(
        heading.compareDocumentPosition(row) & Node.DOCUMENT_POSITION_FOLLOWING,
      ),
    );
    const overlay = following?.querySelector(
      '[data-property-id="title"] [data-cell-selection-overlay]',
    );
    expect(overlay?.getAttribute("data-selection-edges")?.split(" ")).toContain(
      "top",
    );
  }
});
