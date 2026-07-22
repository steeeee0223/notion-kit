import type { Locator, Page } from "@playwright/test";

import { TableViewObject } from "./component-objects/table-view";
import { expect, test } from "./fixtures";

async function dragWithPointer(
  page: Page,
  source: Locator,
  target: Locator,
  targetEdge: "center" | "after" = "center",
) {
  const sourceBox = await source.boundingBox();
  const targetBox = await target.boundingBox();
  expect(sourceBox).not.toBeNull();
  expect(targetBox).not.toBeNull();
  const start = {
    x: sourceBox!.x + sourceBox!.width / 2,
    y: sourceBox!.y + sourceBox!.height / 2,
  };
  const end = {
    x:
      targetBox!.x +
      (targetEdge === "after" ? targetBox!.width - 4 : targetBox!.width / 2),
    y:
      targetBox!.y +
      (targetEdge === "after" ? targetBox!.height - 4 : targetBox!.height / 2),
  };

  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await page.mouse.move(start.x + 10, start.y + 6, { steps: 4 });
  await expect
    .poll(() => page.locator("[data-dragging]").count())
    .toBeGreaterThan(0);
  await page.mouse.move(end.x, end.y, { steps: 12 });
  await page.mouse.up();
  await expect(page.locator("[data-dragging]")).toHaveCount(0);
}

test("RowDnD_AlphaAfterOmega_MovesRenderedAndControlledOrder", async ({
  page,
}) => {
  const table = await TableViewObject.open(page, "controlled");
  const alpha = table.row("Alpha");
  await alpha.hover();
  await dragWithPointer(
    page,
    alpha.getByRole("button", { name: "Row actions" }),
    table.row("Omega"),
    "after",
  );

  const rowBoxes = await Promise.all(
    [table.row("Empty"), table.row("Omega"), table.row("Alpha")].map((row) =>
      row.boundingBox(),
    ),
  );
  expect(rowBoxes.every(Boolean)).toBe(true);
  expect(rowBoxes[0]!.y).toBeLessThan(rowBoxes[1]!.y);
  expect(rowBoxes[1]!.y).toBeLessThan(rowBoxes[2]!.y);
  const snapshot = await table.controlledSnapshot();
  expect(snapshot.data.map((row: { id: string }) => row.id)).toEqual([
    "row-empty",
    "row-omega",
    "row-alpha",
  ]);
  await expect(table.controlledState()).toContainText('"type":"data.row.move"');
  await expect(table.controlledState()).toContainText('"rowId":"row-alpha"');
  await expect(table.controlledState()).toContainText('"nextPosition":2');
});

test("HeaderKeyboardDnD_NotesAfterScore_MovesPropertyAndReportsAction", async ({
  page,
}) => {
  const table = await TableViewObject.open(page, "controlled");
  const notesHandle = page.getByRole("button", { name: "Move Notes" });
  await notesHandle.focus();
  await page.keyboard.press("Space");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Space");
  await expect(page.locator("[data-dragging]")).toHaveCount(0);

  const snapshot = await table.controlledSnapshot();
  expect(snapshot.properties.slice(0, 3).map((property: { id: string }) => property.id)).toEqual([
    "title",
    "score",
    "notes",
  ]);
  expect(snapshot.lastPropertiesAction).toMatchObject({
    type: "properties.move",
    payload: { propertyId: "notes", previousPosition: 1, nextPosition: 2 },
  });
});

test("HeaderResize_NotesFortyPixelsWider_ReportsExactWidthChange", async ({
  page,
}) => {
  const table = await TableViewObject.open(page, "controlled");
  const handle = page.getByRole("separator", { name: "Resize Notes" });
  const box = await handle.boundingBox();
  expect(box).not.toBeNull();

  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
  await page.mouse.down();
  await page.mouse.move(box!.x + box!.width / 2 + 40, box!.y + box!.height / 2, {
    steps: 8,
  });
  await page.mouse.up();

  const snapshot = await table.controlledSnapshot();
  const notes = snapshot.properties.find(
    (property: { id: string }) => property.id === "notes",
  );
  expect(Number.parseFloat(notes.width)).toBeGreaterThanOrEqual(219);
  expect(snapshot.lastPropertiesAction).toMatchObject({
    type: "properties.resize",
    payload: { propertyId: "notes" },
  });
});
