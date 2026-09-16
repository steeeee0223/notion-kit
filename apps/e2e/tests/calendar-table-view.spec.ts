import { TableViewObject } from "./component-objects/table-view";
import { expect, test } from "./fixtures";

test.beforeEach(async ({ page }) => {
  await page.addInitScript((now) => {
    const original = Date.now;
    const offset = now - original();
    Date.now = () => original() + offset;
  }, Date.parse("2026-09-16T12:00:00Z"));
});

for (const range of ["Month", "Week", "Day"] as const) {
  test(`CalendarTable_${range}Creation_WritesInitialDateOnceAndOpensAcceptedRow`, async ({
    page,
  }, testInfo) => {
    const table = await TableViewObject.open(page, "controlled");
    await table.applyCalendarScenario();
    const calendar = table.calendar();
    await calendar.setRange(range);
    await calendar.root.screenshot({
      path: testInfo.outputPath(`table-calendar-${range.toLowerCase()}.png`),
    });
    await page.setViewportSize({ width: 360, height: 800 });
    const geometry = await calendar.geometry();
    expect(geometry.scrollWidth).toBeLessThanOrEqual(geometry.clientWidth);
    await calendar.root.screenshot({
      path: testInfo.outputPath(
        `table-calendar-${range.toLowerCase()}-360.png`,
      ),
    });
    await page.setViewportSize({ width: 1280, height: 800 });
    await calendar.toggleDarkMode();
    await calendar.root.screenshot({
      path: testInfo.outputPath(
        `table-calendar-${range.toLowerCase()}-dark.png`,
      ),
    });
    await calendar.toggleDarkMode();
    const before = await table.controlledSnapshot();

    if (range === "Month") await calendar.createOnDay("2026-09-18");
    else await calendar.createAtTime("2026-09-16", 795);

    await expect
      .poll(async () => (await table.controlledSnapshot()).dataCount)
      .toBe(before.dataCount + 1);
    const snapshot = await table.controlledSnapshot();
    const added = snapshot.data.find(
      (row) => !before.data.some((previous) => previous.id === row.id),
    )!;
    expect(snapshot.lastDataAction).toEqual({
      id: snapshot.lastDataAction!.id,
      type: "data.row.create",
      payload: { rowId: added.id, nextPosition: before.data.length },
    });
    expect(added.properties.due?.value).toEqual(
      range === "Month"
        ? {
            start: Date.parse("2026-09-18T00:00Z"),
            endDate: false,
            includeTime: false,
          }
        : {
            start: Date.parse("2026-09-16T13:15Z"),
            end: Date.parse("2026-09-16T14:15Z"),
            endDate: true,
            includeTime: true,
          },
    );
    await expect
      .poll(async () => (await table.controlledSnapshot()).view.openedRowId)
      .toBe(added.id);
    await expect(table.rowDialog()).toBeVisible();
  });
}

test("CalendarTable_RejectedCreateAndMove_DoNotOpenOrChangeTheAuthoritativeRows", async ({
  page,
}) => {
  const table = await TableViewObject.open(page, "controlled");
  await table.applyCalendarScenario();
  const calendar = table.calendar();
  await table.toggleRejectedData();
  const before = await table.controlledSnapshot();

  await calendar.createOnDay("2026-09-18");
  await expect
    .poll(async () => (await table.controlledSnapshot()).dataCount)
    .toBe(before.dataCount + 1);
  expect((await table.controlledSnapshot()).data).toEqual(before.data);
  expect((await table.controlledSnapshot()).view.openedRowId).toBeNull();
  await expect(table.rowDialog()).toHaveCount(0);

  await calendar.moveToDay(
    { id: "meeting", name: "Design review" },
    "2026-09-17",
  );
  await expect
    .poll(async () => (await table.controlledSnapshot()).dataCount)
    .toBe(before.dataCount + 2);
  expect((await table.controlledSnapshot()).data).toEqual(before.data);
  expect((await table.renderedResourceSnapshot()).data).toEqual(before.data);
  await expect(
    calendar.card({ id: "meeting", name: "Design review" }),
  ).toBeVisible();
});

test("CalendarTable_LayoutSwitches_ShareNavigationAndApplyOneRangeFallback", async ({
  page,
}) => {
  const table = await TableViewObject.open(page, "controlled");
  await table.applyCalendarScenario();
  const calendar = table.calendar();
  const before = await table.controlledSnapshot();
  await calendar.next();
  await calendar.next();
  await calendar.next();
  await expect(calendar.toolbar()).toContainText("December 2026");
  expect((await table.controlledSnapshot()).viewCount).toBe(before.viewCount);

  await table.setLayout("timeline");
  await table.setTimelineRange("Quarter");
  const timeline = await table.controlledSnapshot();
  await table.setLayout("calendar");
  await expect(calendar.toolbar()).toContainText("December 2026");
  const next = await table.controlledSnapshot();
  expect(next.viewCount).toBe(timeline.viewCount + 1);
  expect(next.view.dateView).toEqual({
    range: "monthly",
    datePropertyId: "due",
  });
  expect(next.lastViewAction).toEqual({
    id: next.lastViewAction!.id,
    type: "view.layout.change",
    payload: {
      previousLayout: "timeline",
      nextLayout: "calendar",
      previousRange: "quarterly",
      nextRange: "monthly",
    },
  });
  await table.setLayout("table");
  await table.setLayout("calendar");
  await expect(calendar.toolbar()).toContainText("December 2026");
});

test("CalendarTable_SortedRowGestures_PreserveIdentityAndWriteEachDateChangeOnce", async ({
  page,
}) => {
  const table = await TableViewObject.open(page, "controlled");
  await table.applyCalendarScenario();
  const sort = await table.openSort();
  await sort.add("Name");
  await page.keyboard.press("Escape");
  await expect(sort.root).toBeHidden();
  const calendar = table.calendar();
  await calendar.setRange("Week");
  const before = await table.controlledSnapshot();
  const focus = { id: "open-end", name: "Focus time" };
  const original = before.data.find((row) => row.id === focus.id)!;

  await calendar.moveToTime(focus, "2026-09-17", 900);
  await expect
    .poll(async () => (await table.controlledSnapshot()).dataCount)
    .toBe(before.dataCount + 1);
  let state = await table.controlledSnapshot();
  expect(state.lastDataAction).toMatchObject({
    type: "data.cell.update",
    payload: {
      rowId: focus.id,
      propertyId: "due",
      previousValue: original.properties.due!.value,
      nextValue: {
        start: Date.parse("2026-09-17T15:00Z"),
        endDate: false,
        includeTime: true,
      },
    },
  });

  await calendar.resizeToTime(focus, "end", "2026-09-17", 990);
  await expect
    .poll(async () => (await table.controlledSnapshot()).dataCount)
    .toBe(before.dataCount + 2);
  state = await table.controlledSnapshot();
  expect(
    state.data.find((row) => row.id === focus.id)?.properties.due?.value,
  ).toEqual({
    start: Date.parse("2026-09-17T15:00Z"),
    end: Date.parse("2026-09-17T16:30Z"),
    endDate: true,
    includeTime: true,
  });

  await calendar.moveToDay(focus, "2026-09-17", "all-day");
  await expect
    .poll(async () => (await table.controlledSnapshot()).dataCount)
    .toBe(before.dataCount + 3);
  state = await table.controlledSnapshot();
  expect(state.data.find((row) => row.id === focus.id)?.properties.due).toEqual(
    {
      id: original.properties.due!.id,
      value: {
        start: Date.parse("2026-09-17T00:00Z"),
        end: Date.parse("2026-09-17T00:00Z"),
        endDate: true,
        includeTime: false,
      },
    },
  );
  expect(state.data.map((row) => row.id)).toEqual(
    before.data.map((row) => row.id),
  );
  await expect(table.internalState()).toContainText(
    '"sorting":[{"id":"title","desc":false}]',
  );
  expect(state.view.openedRowId).toBeNull();
});
