import { TableViewObject } from "./component-objects/table-view";
import { expect, test } from "./fixtures";

test("RowDnD_AlphaAfterOmega_MovesRenderedAndControlledOrder", async ({
  page,
}) => {
  const table = await TableViewObject.open(page, "controlled");
  const alpha = table.row("Alpha");
  await alpha.hover();
  await table.dragPointer(
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

for (const layout of ["table", "list"] as const) {
  test(`GroupedRowDnD_${layout}_CrossGroupUpdatesRenderedMembershipAndControlledValue`, async ({
    page,
  }) => {
    const table = await TableViewObject.open(page, "controlled");
    if (layout === "list") await table.setLayout(layout);
    await table.groupBy("Status");
    await table.expandGroup("status:Active");
    await table.expandGroup("status:Done");

    const alpha = table.rowBlock("row-alpha");
    const omega = table.rowBlock("row-omega");
    await alpha.hover();
    await table.dragPointer(
      alpha.getByRole("button", { name: "Row actions", exact: true }),
      omega,
      "after",
    );

    await expect(table.group("status:Active")).toHaveCount(0);
    await expect(
      table.group("status:Done").getByRole("button", { name: "2" }),
    ).toBeVisible();
    await expect
      .poll(async () => {
        const alphaBox = await alpha.boundingBox();
        const omegaBox = await omega.boundingBox();
        const doneBox = await table.group("status:Done").boundingBox();
        return Boolean(
          alphaBox &&
            omegaBox &&
            doneBox &&
            alphaBox.y > doneBox.y &&
            omegaBox.y < alphaBox.y,
        );
      })
      .toBe(true);

    const snapshot = await table.controlledSnapshot();
    expect(snapshot.data.map((row: { id: string }) => row.id)).toEqual([
      "row-empty",
      "row-omega",
      "row-alpha",
    ]);
    expect(
      snapshot.data.find((row: { id: string }) => row.id === "row-alpha")
        ?.properties.status?.value,
    ).toBe("Done");
    expect(snapshot.dataCount).toBe(1);
    expect(snapshot.lastDataAction).toEqual({
      id: expect.any(String),
      type: "data.row.move",
      payload: {
        rowId: "row-alpha",
        previousPosition: 0,
        nextPosition: 2,
        grouping: {
          propertyId: "status",
          previousValue: "Active",
          nextValue: "Done",
        },
      },
    });
  });
}

for (const layout of ["table", "list", "board"] as const) {
  test(`GroupOrderDnD_${layout}_UpdatesRenderedGroupsImmediately`, async ({
    page,
  }) => {
    const table = await TableViewObject.open(page, "controlled");
    if (layout !== "table") await table.setLayout(layout);
    await table.groupBy("Status");

    const grouping = await (await table.openSettings()).openGrouping();
    await table.dragPointer(
      grouping.moveHandle("status:Active"),
      grouping.moveHandle("status:Done"),
      "after",
    );

    await expect(table.internalState()).toContainText(
      '"groupOrder":["status:null","status:Done","status:Active","status:Backlog"]',
    );
    await expect
      .poll(async () => {
        const boxes = await Promise.all(
          ["status:null", "status:Done", "status:Active"].map((groupId) =>
            table.group(groupId).boundingBox(),
          ),
        );
        if (boxes.some((box) => box === null)) return false;
        const positions = boxes.map((box) =>
          layout === "board" ? box!.x : box!.y,
        );
        return positions[0]! < positions[1]! && positions[1]! < positions[2]!;
      })
      .toBe(true);
  });
}

test("HeaderPointerDnD_SameNotesTriggerOpensMenuAndMovesAfterScore", async ({
  page,
}) => {
  const table = await TableViewObject.open(page, "controlled");
  const notesHeader = table.header("Notes");
  const calculateMenuItem = page.getByRole("menuitem", { name: "Calculate" });

  await notesHeader.click();
  await expect(calculateMenuItem).toBeVisible();
  await notesHeader.click();
  await expect(notesHeader).toHaveAttribute("aria-expanded", "false");
  await expect(calculateMenuItem).toBeHidden();

  await table.dragPointer(notesHeader, table.header("Score"), "after");

  await expect
    .poll(async () => {
      const scoreBox = await table.header("Score").boundingBox();
      const notesBox = await table.header("Notes").boundingBox();
      return Boolean(scoreBox && notesBox && scoreBox.x < notesBox.x);
    })
    .toBe(true);
  await expect
    .poll(async () => {
      const snapshot = await table.controlledSnapshot();
      return snapshot.properties
        .slice(0, 3)
        .map((property: { id: string }) => property.id);
    })
    .toEqual(["title", "score", "notes"]);
  const snapshot = await table.controlledSnapshot();
  expect(snapshot.lastPropertiesAction).toEqual({
    id: expect.any(String),
    type: "properties.move",
    payload: { propertyId: "notes", previousPosition: 1, nextPosition: 2 },
  });
  await expect(notesHeader).toHaveAttribute("aria-expanded", "false");
  await expect(calculateMenuItem).toBeHidden();
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
  await page.mouse.move(
    box!.x + box!.width / 2 + 40,
    box!.y + box!.height / 2,
    {
      steps: 8,
    },
  );
  await page.mouse.up();

  const snapshot = await table.controlledSnapshot();
  const notes = snapshot.properties.find(
    (property: { id: string }) => property.id === "notes",
  );
  expect(notes).toBeDefined();
  if (!notes) throw new Error("Notes property is missing");
  expect(Number.parseFloat(notes.width)).toBeGreaterThanOrEqual(219);
  expect(snapshot.lastPropertiesAction).toMatchObject({
    type: "properties.resize",
    payload: { propertyId: "notes" },
  });
});

for (const mode of ["controlled", "uncontrolled"] as const) {
  test(`BoardDnD_${mode}_TransfersIntoPopulatedAndEmptyColumnsWithoutDomErrors`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const table = await TableViewObject.open(page, mode);
    await table.groupBy("Status");
    await table.setLayout("board");
    await table.showEmptyGroups();
    const alpha = table.rowBlock("row-alpha");

    await table.dragPointer(alpha, table.rowBlock("row-omega"), "after");
    await expect(
      table.group("status:Done").getByText("Alpha", { exact: true }),
    ).toBeVisible();
    await expect(table.boardColumnContent("status:Active")).toBeEmpty();
    await table.dragPointer(alpha, table.boardColumnContent("status:Active"));
    await expect(
      table.group("status:Active").getByText("Alpha", { exact: true }),
    ).toBeVisible();
    await table.dragPointer(alpha, table.rowBlock("row-empty"), "after");
    await expect(
      table.group("status:null").getByText("Alpha", { exact: true }),
    ).toBeVisible();
    await expect(table.rowBlock("row-alpha")).toHaveCount(1);
    await expect(page.locator('[data-slot="kanban-overlay"]')).toHaveCount(0);
    if (mode === "controlled") {
      const snapshot = await table.controlledSnapshot();
      expect(snapshot.dataCount).toBe(3);
      expect(
        snapshot.data.find((row) => row.id === "row-alpha")?.properties.status
          ?.value,
      ).toBeNull();
      expect(
        snapshot.data.find((row) => row.id === "row-omega")?.properties.status
          ?.value,
      ).toBe("Done");
    }
    expect(errors).toEqual([]);
  });
}

test("BoardDnD_HoverEscapeAndOutsideRelease_DoNotProposeMoves", async ({
  page,
}) => {
  const table = await TableViewObject.open(page, "controlled");
  await table.groupBy("Status");
  await table.setLayout("board");
  await table.startPointerDrag(table.rowBlock("row-alpha"));
  await table.movePointerTo(table.rowBlock("row-omega"), "after");
  expect((await table.controlledSnapshot()).dataCount).toBe(0);
  await page.keyboard.press("Escape");
  await table.dropPointerDrag();
  await expect(
    table.group("status:Active").getByText("Alpha", { exact: true }),
  ).toBeVisible();
  expect((await table.controlledSnapshot()).dataCount).toBe(0);

  await table.startPointerDrag(table.rowBlock("row-alpha"));
  await table.movePointerTo(table.rowBlock("row-omega"), "after");
  await page.mouse.move(10, 10, { steps: 12 });
  await table.dropPointerDrag();
  expect((await table.controlledSnapshot()).dataCount).toBe(0);
  await table.rowBlock("row-alpha").getByText("Alpha", { exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Alpha", exact: true }),
  ).toBeVisible();
});

test("BoardDnD_RejectedMove_NextGestureUsesAuthoritativeMembership", async ({
  page,
}) => {
  const table = await TableViewObject.open(page, "controlled");
  await table.groupBy("Status");
  await table.setLayout("board");
  await page.getByRole("button", { name: "Reject data changes" }).click();
  await table.dragPointer(
    table.rowBlock("row-alpha"),
    table.rowBlock("row-omega"),
    "after",
  );
  await expect(
    table.group("status:Active").getByText("Alpha", { exact: true }),
  ).toBeVisible();
  expect((await table.controlledSnapshot()).dataCount).toBe(1);
  await page.getByRole("button", { name: "Reject data changes" }).click();
  await table.dragPointer(
    table.rowBlock("row-alpha"),
    table.rowBlock("row-empty"),
    "after",
  );
  await expect(
    table.group("status:null").getByText("Alpha", { exact: true }),
  ).toBeVisible();
  const snapshot = await table.controlledSnapshot();
  expect(snapshot.dataCount).toBe(2);
  expect(
    snapshot.data.find((row) => row.id === "row-alpha")?.properties.status
      ?.value,
  ).toBeNull();
});

test("BoardColumnDnD_HeaderMovesColumnAndPreservesCards", async ({ page }) => {
  const table = await TableViewObject.open(page, "controlled");
  await table.groupBy("Status");
  await table.setLayout("board");
  await table.dragPointer(
    table.boardColumnHandle("status:Active"),
    table.boardColumnHandle("status:Done"),
    "after",
  );
  await expect
    .poll(async () => {
      const active = await table.group("status:Active").boundingBox();
      const done = await table.group("status:Done").boundingBox();
      return !!active && !!done && done.x < active.x;
    })
    .toBe(true);
  await expect(
    table.group("status:Active").getByText("Alpha", { exact: true }),
  ).toBeVisible();
  await expect(
    table.group("status:Done").getByText("Omega", { exact: true }),
  ).toBeVisible();
  expect((await table.controlledSnapshot()).dataCount).toBe(0);
});

test("BoardKeyboardDnD_EmptyColumnDropAndEscapeRestoreHandleFocus", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const table = await TableViewObject.open(page, "controlled");
  await table.groupBy("Status");
  await table.setLayout("board");
  await table.showEmptyGroups();
  await table.startKeyboardDrag("row-omega");
  await page.keyboard.press("ArrowRight");
  await expect(
    table.group("status:Backlog").locator('[data-placeholder="true"]'),
  ).toHaveCount(1);
  expect((await table.controlledSnapshot()).dataCount).toBe(0);
  await table.finishKeyboardDrag("row-omega", "Space");
  await expect(
    table.group("status:Backlog").getByText("Omega", { exact: true }),
  ).toBeVisible();
  expect((await table.controlledSnapshot()).dataCount).toBe(1);
  await table.startKeyboardDrag("row-omega");
  await page.keyboard.press("ArrowLeft");
  await table.finishKeyboardDrag("row-omega", "Escape");
  await expect(
    table.group("status:Backlog").getByText("Omega", { exact: true }),
  ).toBeVisible();
  expect((await table.controlledSnapshot()).dataCount).toBe(1);
  expect(errors).toEqual([]);
});

test("BoardDnD_SortedDropRequiresConfirmationAndDismissalDoesNotMove", async ({
  page,
}) => {
  const table = await TableViewObject.open(page, "controlled");
  const sort = await table.openSort();
  await sort.add("Name");
  await page.keyboard.press("Escape");
  await table.groupBy("Status");
  await table.setLayout("board");
  await table.dragPointer(
    table.rowBlock("row-alpha"),
    table.rowBlock("row-omega"),
    "after",
  );
  const dialog = page.getByRole("dialog", {
    name: "Would you like to remove sorting?",
  });
  await expect(dialog).toBeVisible();
  expect((await table.controlledSnapshot()).dataCount).toBe(0);
  await dialog
    .getByRole("button", { name: "Don't remove", exact: true })
    .click();
  await expect(dialog).toBeHidden();
  await expect(table.internalState()).toContainText(
    '"sorting":[{"id":"title","desc":false}]',
  );
  await expect(
    table.group("status:Active").getByText("Alpha", { exact: true }),
  ).toBeVisible();
  await table.dragPointer(
    table.rowBlock("row-alpha"),
    table.rowBlock("row-omega"),
    "after",
  );
  await dialog.getByRole("button", { name: "Remove", exact: true }).click();
  await expect(dialog).toBeHidden();
  await expect(table.internalState()).toContainText('"sorting":[]');
  await expect(
    table.group("status:Done").getByText("Alpha", { exact: true }),
  ).toBeVisible();
  expect((await table.controlledSnapshot()).dataCount).toBe(1);
});

test.describe("BoardTouchDnD", () => {
  test.use({ hasTouch: true });
  test("HeldCardTransfersOnceAndLeavesNoOverlay", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const table = await TableViewObject.open(page, "controlled");
    await table.groupBy("Status");
    await table.setLayout("board");
    await table.dragTouch(
      table.rowBlock("row-alpha"),
      table.rowBlock("row-omega"),
    );
    await expect(
      table.group("status:Done").getByText("Alpha", { exact: true }),
    ).toBeVisible();
    expect((await table.controlledSnapshot()).dataCount).toBe(1);
    expect(errors).toEqual([]);
  });
});

test("BoardDnD_NarrowViewportAutoScrollsWhileDraggingAndCanCancel", async ({
  page,
}) => {
  await page.setViewportSize({ width: 600, height: 800 });
  const table = await TableViewObject.open(page, "controlled");
  await table.groupBy("Status");
  await table.setLayout("board");
  await table.showEmptyGroups();
  await table.startPointerDrag(table.rowBlock("row-alpha"));
  const scroll = table.boardScrollContainer();
  const box = await scroll.boundingBox();
  expect(box).not.toBeNull();
  const before = await scroll.evaluate((element) => element.scrollLeft);
  await page.mouse.move(Math.min(box!.x + box!.width - 4, 596), box!.y + 90, {
    steps: 12,
  });
  await expect
    .poll(() => scroll.evaluate((element) => element.scrollLeft))
    .toBeGreaterThan(before);
  await page.keyboard.press("Escape");
  await table.dropPointerDrag();
  expect((await table.controlledSnapshot()).dataCount).toBe(0);
});

test("BoardKeyboardDnD_PopulatedColumnReordersOnce", async ({ page }) => {
  const table = await TableViewObject.open(page, "controlled");
  await table.groupBy("Status");
  await table.setLayout("board");
  await table.dragPointer(
    table.rowBlock("row-alpha"),
    table.rowBlock("row-omega"),
    "after",
  );
  await expect(
    table.group("status:Done").getByText("Alpha", { exact: true }),
  ).toBeVisible();
  await table.startKeyboardDrag("row-alpha");
  await page.keyboard.press("ArrowUp");
  await table.finishKeyboardDrag("row-alpha", "Space");
  await expect
    .poll(async () => {
      const alpha = await table.rowBlock("row-alpha").boundingBox();
      const omega = await table.rowBlock("row-omega").boundingBox();
      return !!alpha && !!omega && alpha.y < omega.y;
    })
    .toBe(true);
  const snapshot = await table.controlledSnapshot();
  expect(snapshot.dataCount).toBe(2);
  expect(snapshot.data.map((row) => row.id)).toEqual([
    "row-empty",
    "row-alpha",
    "row-omega",
  ]);
});
