import { CalendarObject } from "./component-objects/calendar";
import { expect, test } from "./fixtures";

const meeting = { id: "meeting", name: "Design review" };

test("CalendarLayout_AllRanges_KeepStickyHeadersWithinNarrowAndWideContainers", async ({
  page,
}, testInfo) => {
  for (const range of ["Month", "Week", "Day"] as const) {
    const calendar = await CalendarObject.open(page, range);
    if (range !== "Month") {
      const viewport = await calendar.root.boundingBox();
      const eightOClock = await calendar.timePoint("2026-09-16", 480);
      const geometry = await calendar.geometry();
      expect(eightOClock.y).toBeGreaterThanOrEqual(geometry.headerBottom);
      expect(eightOClock.y).toBeLessThan(viewport!.y + viewport!.height);
    }
    for (const width of [1100, 560, 360]) {
      await page.setViewportSize({ width, height: 800 });
      await calendar.scrollBy(180);
      const geometry = await calendar.geometry();
      expect(geometry.scrollWidth).toBeLessThanOrEqual(geometry.clientWidth);
      expect(
        Math.abs(geometry.toolbarTop - geometry.rootTop),
      ).toBeLessThanOrEqual(1);
      expect(
        Math.abs(geometry.headerTop - geometry.toolbarBottom),
      ).toBeLessThanOrEqual(1);
      await calendar.scrollBy(-180);
      await calendar.root.screenshot({
        path: testInfo.outputPath(
          `calendar-${range.toLowerCase()}-${width}.png`,
        ),
      });
    }
    await page.setViewportSize({ width: 1100, height: 800 });
    await calendar.toggleDarkMode();
    await calendar.root.screenshot({
      path: testInfo.outputPath(`calendar-${range.toLowerCase()}-dark.png`),
    });
    await calendar.toggleDarkMode();
  }
});

test("CalendarMonth_CrossWeekSegmentMove_PreservesTheGrabbedDayOffset", async ({
  page,
}) => {
  const calendar = await CalendarObject.open(page);
  const sprint = {
    id: "sprint",
    name: "Project sprint",
    segmentDay: "2026-09-14",
  };
  await expect(calendar.resize(sprint, "start")).toHaveCount(0);
  await expect(
    calendar.resize({ ...sprint, segmentDay: "2026-09-11" }, "end"),
  ).toHaveCount(0);

  await calendar.moveToDay(sprint, "2026-09-15");

  await expect
    .poll(async () => (await calendar.snapshot()).changeCount)
    .toBe(1);
  expect((await calendar.snapshot()).lastChange).toEqual({
    id: "sprint",
    startAt: Date.parse("2026-09-12T00:00Z"),
    endAt: Date.parse("2026-09-17T00:00Z"),
    allDay: true,
    reason: "move",
  });
  expect((await calendar.snapshot()).openCount).toBe(0);
});

test("CalendarTimeGrid_HorizontalDragFromCardMiddle_PreservesStartAndDuration", async ({
  page,
}) => {
  const calendar = await CalendarObject.open(page, "Week");
  await calendar.moveHorizontally(meeting, "2026-09-17");
  await expect
    .poll(async () => (await calendar.snapshot()).lastChange)
    .toEqual({
      id: "meeting",
      startAt: Date.parse("2026-09-17T09:00Z"),
      endAt: Date.parse("2026-09-17T10:00Z"),
      allDay: false,
      reason: "move",
    });
  expect(await calendar.snapshot()).toMatchObject({
    changeCount: 1,
    openCount: 0,
  });
});

test("CalendarTimeGrid_MoveResizeAndConvert_CommitOncePerGesture", async ({
  page,
}) => {
  const calendar = await CalendarObject.open(page);
  await calendar.setRange("Week");
  await calendar.moveToTime(meeting, "2026-09-16", 630);
  await expect
    .poll(async () => (await calendar.snapshot()).lastChange)
    .toEqual({
      id: "meeting",
      startAt: Date.parse("2026-09-16T10:30Z"),
      endAt: Date.parse("2026-09-16T11:30Z"),
      allDay: false,
      reason: "move",
    });

  await calendar.resizeToTime(meeting, "start", "2026-09-16", 600);
  await expect
    .poll(async () => (await calendar.snapshot()).lastChange)
    .toMatchObject({
      startAt: Date.parse("2026-09-16T10:00Z"),
      reason: "resize-start",
    });
  await calendar.resizeToTime(meeting, "end", "2026-09-17", 60);
  await expect
    .poll(async () => (await calendar.snapshot()).lastChange)
    .toMatchObject({
      endAt: Date.parse("2026-09-17T01:00Z"),
      reason: "resize-end",
    });

  await expect(
    calendar.resize({ ...meeting, segmentDay: "2026-09-16" }, "end"),
  ).toHaveCount(0);
  await calendar.moveToDay(
    { ...meeting, segmentDay: "2026-09-16" },
    "2026-09-17",
    "all-day",
  );
  await expect
    .poll(async () => (await calendar.snapshot()).lastChange)
    .toEqual({
      id: "meeting",
      startAt: Date.parse("2026-09-17T00:00Z"),
      endAt: Date.parse("2026-09-19T00:00Z"),
      allDay: true,
      reason: "convert",
    });
  await calendar.moveToTime(meeting, "2026-09-18", 600);
  await expect
    .poll(async () => (await calendar.snapshot()).lastChange)
    .toEqual({
      id: "meeting",
      startAt: Date.parse("2026-09-18T10:00Z"),
      endAt: Date.parse("2026-09-19T11:00Z"),
      allDay: false,
      reason: "convert",
    });
  expect(await calendar.snapshot()).toMatchObject({
    changeCount: 5,
    openCount: 0,
  });
});

test("CalendarGesture_CancelRejectAndKeyboardActions_RespectAuthoritativeState", async ({
  page,
}) => {
  const calendar = await CalendarObject.open(page);
  await calendar.setRange("Day");
  const original = (await calendar.snapshot()).events;
  await calendar.moveToTime(meeting, "2026-09-16", 630, { cancel: true });
  expect(await calendar.snapshot()).toMatchObject({
    events: original,
    changeCount: 0,
    openCount: 0,
  });

  await calendar.toggleRejectedChanges();
  await calendar.moveToTime(meeting, "2026-09-16", 630);
  await expect
    .poll(async () => (await calendar.snapshot()).changeCount)
    .toBe(1);
  expect((await calendar.snapshot()).events).toEqual(original);
  const box = await calendar.event(meeting).boundingBox();
  const start = await calendar.timePoint("2026-09-16", 540);
  expect(Math.abs(box!.y - start.y)).toBeLessThanOrEqual(1);

  await calendar.toggleRejectedChanges();
  await calendar.createOnDay("2026-09-16", "all-day");
  await expect
    .poll(async () => (await calendar.snapshot()).createCount)
    .toBe(1);
  const created = (await calendar.snapshot()).events.find(
    (event) => event.name === "New event",
  )!;
  await calendar.card(created).focus();
  await page.keyboard.press("Enter");
  await expect
    .poll(async () => (await calendar.snapshot()).openedId)
    .toBe(created.id);
  expect((await calendar.snapshot()).openCount).toBe(1);
});

test("CalendarGesture_BothScrollEdges_UseScrolledCoordinatesAndCommitOnceEach", async ({
  page,
}) => {
  const calendar = await CalendarObject.open(page);
  await calendar.setRange("Day");
  await calendar.dragToEdge(meeting, "bottom");
  await expect
    .poll(async () => (await calendar.snapshot()).changeCount)
    .toBe(1);
  expect(
    (await calendar.snapshot()).events.find(({ id }) => id === "meeting")
      ?.startAt,
  ).toBeGreaterThan(Date.parse("2026-09-16T09:00Z"));
  const laterStart = (await calendar.snapshot()).events.find(
    ({ id }) => id === "meeting",
  )!.startAt;
  await calendar.dragToEdge(meeting, "top");
  await expect
    .poll(async () => (await calendar.snapshot()).changeCount)
    .toBe(2);
  expect(
    (await calendar.snapshot()).events.find(({ id }) => id === "meeting")!
      .startAt,
  ).toBeLessThan(laterStart);
  expect((await calendar.snapshot()).openCount).toBe(0);
});

test("CalendarTimeGrid_OverlappingAndRepeatedTimes_KeepEventCardsSeparate", async ({
  page,
}) => {
  const calendar = await CalendarObject.open(page);
  await calendar.setRange("Week");
  let first = await calendar.event(meeting).boundingBox();
  let second = await calendar
    .event({ id: "overlap", name: "Review follow-up" })
    .boundingBox();
  expect(first!.x + first!.width).toBeLessThanOrEqual(second!.x + 1);

  await calendar.showDstWeek();
  await calendar
    .card({ id: "dst-first", name: "First 01:15" })
    .scrollIntoViewIfNeeded();
  first = await calendar
    .event({ id: "dst-first", name: "First 01:15" })
    .boundingBox();
  second = await calendar
    .event({ id: "dst-second", name: "Second 01:15" })
    .boundingBox();
  expect(Math.abs(first!.y - second!.y)).toBeLessThanOrEqual(1);
  expect(first!.x + first!.width).toBeLessThanOrEqual(second!.x + 1);
});
