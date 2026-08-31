import type { Locator } from "@playwright/test";

import { TableViewObject } from "./component-objects/table-view";
import { expect, test } from "./fixtures";

const DAY = 86_400_000;

test("TimelineInitialization_NoDateProperty_CreatesAndSeedsExactlyOneProperty", async ({
  page,
}) => {
  const table = await TableViewObject.open(page, "controlled");
  await (await table.openHeader("Due")).delete();
  const before = await table.controlledSnapshot();
  expect(usableDateProperties(before.properties)).toHaveLength(0);

  await table.setLayout("timeline");
  await expect(table.timelineContent()).toBeVisible();
  await expect
    .poll(async () => (await table.controlledSnapshot()).propertiesCount)
    .toBe(before.propertiesCount + 1);

  const controlled = await table.controlledSnapshot();
  const rendered = await table.renderedResourceSnapshot();
  const createdProperties = controlled.properties.filter(
    (property) => !before.properties.some(({ id }) => id === property.id),
  );
  expect(createdProperties).toHaveLength(1);
  const created = createdProperties[0]!;
  expect(created).toMatchObject({ name: "Timeline", type: "date" });
  expect(
    usableDateProperties(controlled.properties).map(({ id }) => id),
  ).toEqual([created.id]);
  expect(controlled.dataCount).toBe(before.dataCount + 1);
  expect(controlled.viewCount).toBe(before.viewCount + 2);
  const initializationOperationId = controlled.lastPropertiesAction?.id;
  expect(typeof initializationOperationId).toBe("string");
  expect(initializationOperationId).not.toBe("");
  if (
    typeof initializationOperationId !== "string" ||
    initializationOperationId.length === 0
  ) {
    throw new Error("Timeline initialization must emit a nonempty action id");
  }
  expect(controlled.lastPropertiesAction).toMatchObject({
    id: initializationOperationId,
    type: "properties.create",
    payload: {
      propertyId: created.id,
      nextPosition: 12,
      property: { id: created.id, name: "Timeline", type: "date" },
    },
  });
  expect(controlled.lastDataAction).toEqual({
    id: initializationOperationId,
    type: "data.cell.update",
    payload: {
      rowIds: ["row-alpha", "row-empty", "row-omega"],
      propertyId: created.id,
    },
  });
  expect(controlled.lastViewAction).toEqual({
    id: initializationOperationId,
    type: "view.timeline_property.change",
    payload: {
      previousDatePropertyId: null,
      nextDatePropertyId: created.id,
    },
  });
  expect(seededValues(controlled.data, created.id)).toEqual({
    "row-alpha": {
      start: 1_735_689_600_000,
      end: 1_735_689_600_000,
      endDate: true,
    },
    "row-empty": {
      start: 1_735_776_000_000,
      end: 1_735_776_000_000,
      endDate: true,
    },
    "row-omega": {
      start: 1_735_862_400_000,
      end: 1_735_862_400_000,
      endDate: true,
    },
  });
  expect(rendered.properties).toEqual(controlled.properties);
  expect(rendered.data).toEqual(controlled.data);
  expect(rendered.view).toEqual(controlled.view);
});

test("TimelineDragResize_ControlledResource_PersistsExactDateCellChanges", async ({
  page,
}) => {
  const table = await TableViewObject.open(page, "controlled");
  await table.setLayout("timeline");
  await expect(table.timelineContent()).toBeVisible();
  await table.setTimelineRange("Day");

  const originalStart = 1_735_689_600_000;
  await table.dragPointerBy(table.timelineItemCard("row-alpha"), 100);
  await expect
    .poll(async () => (await table.controlledSnapshot()).dataCount)
    .toBe(1);
  let snapshot = await table.controlledSnapshot();
  expect(snapshot.lastDataAction).toEqual({
    id: snapshot.lastDataAction!.id,
    type: "data.cell.update",
    payload: {
      rowId: "row-alpha",
      propertyId: "due",
      previousValue: { start: originalStart },
      nextValue: {
        start: originalStart + 2 * DAY,
        end: originalStart + 3 * DAY,
        endDate: true,
      },
    },
  });
  expect(snapshot.data[0]!.properties.due!.value).toEqual(
    snapshot.lastDataAction!.payload.nextValue,
  );

  await table.resizeTimelineToNextDay("row-alpha");
  await expect
    .poll(async () => (await table.controlledSnapshot()).dataCount)
    .toBe(2);
  snapshot = await table.controlledSnapshot();
  expect(snapshot.lastDataAction).toEqual({
    id: snapshot.lastDataAction!.id,
    type: "data.cell.update",
    payload: {
      rowId: "row-alpha",
      propertyId: "due",
      previousValue: {
        start: originalStart + 2 * DAY,
        end: originalStart + 3 * DAY,
        endDate: true,
      },
      nextValue: {
        start: originalStart + 2 * DAY,
        end: new Date(2025, 0, 5).getTime(),
        endDate: true,
      },
    },
  });
  expect(snapshot.data[0]!.properties.due!.value).toEqual(
    snapshot.lastDataAction!.payload.nextValue,
  );
});

test("TimelineGrouping_ExpandCollapse_KeepsSidebarAndTracksVerticallyAligned", async ({
  page,
}) => {
  const table = await TableViewObject.open(page, "controlled");
  await table.groupBy("Status");
  await page.keyboard.press("Escape");
  await table.setLayout("timeline");
  await expect(table.timelineContent()).toBeVisible();

  const groupIds = ["status:Active", "status:null", "status:Done"];
  await expect(table.timelineSidebarRow("row-alpha")).toHaveCount(0);
  await expectAlignedProjection(
    groupIds.map((id) => [
      table.timelineSidebarGroup(id),
      table.timelineGroupTrack(id),
    ]),
  );

  await table.toggleTimelineGroup("status:Active", false);
  await expect(table.timelineSidebarRow("row-alpha")).toBeVisible();
  await expectAlignedProjection([
    ...groupIds.map(
      (id) =>
        [table.timelineSidebarGroup(id), table.timelineGroupTrack(id)] as const,
    ),
    [
      table.timelineSidebarRow("row-alpha"),
      table.timelineTrackRow("row-alpha"),
    ],
  ]);

  await table.toggleTimelineGroup("status:Active", true);
  await expect(table.timelineSidebarRow("row-alpha")).toHaveCount(0);
  await expectAlignedProjection(
    groupIds.map((id) => [
      table.timelineSidebarGroup(id),
      table.timelineGroupTrack(id),
    ]),
  );
});

test("TimelineSidebarTitle_EditCloseSelectsCellWhileCardOpensRow", async ({
  page,
}) => {
  const table = await TableViewObject.open(page, "controlled");
  await table.setLayout("timeline");
  const sidebarRow = table.timelineSidebarRow("row-alpha");
  const selection = sidebarRow.locator("[data-cell-selection]");
  const title = selection.getByText("Alpha", { exact: true });

  await title.click();
  await expect(page.getByRole("textbox")).toBeVisible();
  expect((await table.controlledSnapshot()).view.openedRowId).toBeNull();

  await page.keyboard.press("Escape");
  await expect(
    selection.locator("[data-cell-selection-overlay]"),
  ).toBeVisible();
  expect((await table.controlledSnapshot()).view.openedRowId).toBeNull();

  await table.timelineItemCard("row-alpha").dispatchEvent("click");
  await expect
    .poll(async () => (await table.controlledSnapshot()).view.openedRowId)
    .toBe("row-alpha");
});

function usableDateProperties<
  T extends { type: string; hidden?: boolean; isDeleted?: boolean },
>(properties: T[]) {
  return properties.filter(
    (property) =>
      property.type === "date" && !property.hidden && !property.isDeleted,
  );
}

function seededValues(
  data: { id: string; properties: Record<string, { value: unknown }> }[],
  propertyId: string,
) {
  return Object.fromEntries(
    data.map((row) => [row.id, row.properties[propertyId]?.value]),
  );
}

async function expectAlignedProjection(
  pairs: readonly (readonly [Locator, Locator])[],
) {
  for (const [sidebar, track] of pairs) {
    const [sidebarBox, trackBox] = await Promise.all([
      sidebar.boundingBox(),
      track.boundingBox(),
    ]);
    expect(sidebarBox).not.toBeNull();
    expect(trackBox).not.toBeNull();
    expect(sidebarBox!.y).toBe(trackBox!.y);
    expect(sidebarBox!.height).toBe(trackBox!.height);
  }
}
