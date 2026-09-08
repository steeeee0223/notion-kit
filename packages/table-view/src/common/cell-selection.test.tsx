import { fireEvent, screen, waitFor } from "@testing-library/react";
import { expect, it } from "vitest";

import { renderTableView } from "@/__tests__/component-objects/render-table-view";
import { mockResizeObserver } from "@/__tests__/mock";

mockResizeObserver();

it("focuses the edited cell after Escape, then navigates and clears selection", async () => {
  const view = renderTableView();
  const first = view.propertyCell("Task 1", "col1");
  await view.user.click(view.cellButton("Task 1", "Task 1"));
  const input = screen.getByRole("textbox", { name: "" });
  expect(first).not.toHaveAttribute("data-cell-selected", "true");
  await view.user.type(input, " edited");
  await view.user.keyboard("{Escape}");
  await waitFor(() => expect(first).toHaveFocus());
  expect(first).toHaveAttribute("data-cell-selected", "true");
  await view.user.keyboard("{ArrowRight}");
  expect(view.propertyCell("Task 1", "col2")).toHaveFocus();
  await view.user.keyboard("{Escape}");
  expect(view.propertyCell("Task 1", "col2")).not.toHaveAttribute(
    "data-cell-selected",
    "true",
  );
});

it("selects a drag rectangle without toggling checkbox or opening an editor", () => {
  const view = renderTableView();
  const start = view.propertyCell("Task 1", "col1");
  const end = view.propertyCell("Task 3", "col2");
  fireEvent.mouseDown(start, { button: 0 });
  fireEvent.mouseEnter(end, { buttons: 1 });
  fireEvent.mouseUp(end);
  fireEvent.click(end);
  expect(screen.queryByRole("textbox", { name: "" })).not.toBeInTheDocument();
  expect(start).toHaveAttribute("data-cell-selected", "true");
  expect(end).toHaveAttribute("data-cell-selected", "true");
});

it("supports Shift-click and modifier subtraction without editing", () => {
  const view = renderTableView();
  const first = view.propertyCell("Task 1", "col1");
  const last = view.propertyCell("Task 3", "col2");
  fireEvent.mouseDown(first, { button: 0 });
  fireEvent.mouseUp(first);
  fireEvent.mouseDown(last, { button: 0, shiftKey: true });
  fireEvent.mouseUp(last);
  fireEvent.click(last);
  expect(last).toHaveAttribute("data-cell-selected", "true");
  fireEvent.mouseDown(first, { button: 0, ctrlKey: true });
  fireEvent.mouseUp(first);
  fireEvent.click(first);
  expect(first).toHaveAttribute("data-cell-selected", "false");
  expect(last).toHaveAttribute("data-cell-selected", "true");
  expect(screen.queryByRole("textbox", { name: "" })).not.toBeInTheDocument();
});

it("extends with Shift arrows, selects all, and clamps at boundaries", async () => {
  const view = renderTableView();
  const first = view.propertyCell("Task 1", "col1");
  fireEvent.mouseDown(first, { button: 0 });
  fireEvent.mouseUp(first);
  await view.user.keyboard("{ArrowLeft}");
  expect(first).toHaveFocus();
  await view.user.keyboard("{Shift>}{ArrowRight}{/Shift}");
  expect(first).toHaveAttribute("data-cell-selected", "true");
  expect(view.propertyCell("Task 1", "col2")).toHaveAttribute(
    "data-cell-selected",
    "true",
  );
  await view.user.keyboard("{Control>}a{/Control}");
  expect(view.propertyCell("Task 3", "col2")).toHaveAttribute(
    "data-cell-selected",
    "true",
  );
});

it("keeps direct checkbox click behavior but suppresses drag-generated clicks", async () => {
  const view = renderTableView();
  const first = view.propertyCell("Task 1", "col2");
  const button = first.querySelector<HTMLElement>('[role="button"]')!;
  const checked = () =>
    first.querySelector('[role="checkbox"]')?.getAttribute("aria-checked");
  expect(checked()).toBe("true");
  await view.user.click(button);
  expect(checked()).toBe("false");
  expect(first).toHaveFocus();
  fireEvent.mouseDown(first, { button: 0 });
  fireEvent.mouseEnter(view.propertyCell("Task 3", "col2"), { buttons: 1 });
  fireEvent.mouseEnter(first, { buttons: 1 });
  fireEvent.mouseUp(first);
  fireEvent.click(button);
  expect(checked()).toBe("false");
});

it("does not select through copy controls and permits locked-table selection", async () => {
  const view = renderTableView({ defaultView: { locked: true } });
  const first = view.propertyCell("Task 1", "col1");
  fireEvent.mouseDown(first, { button: 0 });
  fireEvent.mouseUp(first);
  expect(first).toHaveAttribute("data-cell-selected", "true");
  await view.user.keyboard("{ArrowRight}");
  expect(view.propertyCell("Task 1", "col2")).toHaveFocus();
  expect(screen.queryByRole("textbox", { name: "" })).not.toBeInTheDocument();
});

it("shows only the outside selection edges and keeps the fill behind the content", () => {
  const view = renderTableView();
  const first = view.propertyCell("Task 1", "col1");
  const second = view.propertyCell("Task 1", "col2");
  fireEvent.mouseDown(first, { button: 0 });
  fireEvent.mouseEnter(second);
  fireEvent.mouseUp(second);
  const left = first.querySelector("[data-cell-selection-overlay]");
  const right = second.querySelector("[data-cell-selection-overlay]");
  expect(first).not.toHaveClass("bg-blue-hover");
  expect(left).toHaveClass("bg-blue/5", "pointer-events-none", "z-(--z-col)");
  expect(left).toHaveAttribute("data-selection-edges", "top bottom left");
  expect(right).toHaveAttribute("data-selection-edges", "top right bottom");
  expect(left?.querySelector("[data-cell-selection-outline]")).toHaveClass(
    "shadow-cell-focus",
  );
});

it("preserves Enter activation after keyboard navigation focuses a cell frame", async () => {
  const view = renderTableView();
  const first = view.propertyCell("Task 1", "col1");
  fireEvent.mouseDown(first, { button: 0 });
  fireEvent.mouseUp(first);
  await view.user.keyboard("{Enter}");
  expect(screen.getByRole("textbox", { name: "" })).toHaveFocus();
});
