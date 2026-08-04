import { describe, expect, it } from "vitest";

import type { Cell, ColumnInfo, Row } from "@notion-kit/table-hook";

import type { DatePlugin } from "@/plugins";

import {
  createEmptyTrackDate,
  createInitialTimelineDate,
  createTimelineCellUpdater,
  resolveTimelineDateProperty,
  toTimelineFeature,
} from "./timeline-adapter";

const dateProperty = {
  id: "due",
  name: "Due",
  type: "date",
  config: {},
} satisfies ColumnInfo;

const properties = [
  { id: "title", name: "Name", type: "title", config: {} },
  dateProperty,
  { ...dateProperty, id: "later", name: "Later" },
] satisfies ColumnInfo[];

describe("timeline adapter", () => {
  it.each([
    ["null", null],
    ["missing", "missing"],
    ["hidden", "hidden"],
    ["deleted", "deleted"],
    ["wrong type", "title"],
  ])(
    "ResolveTimelineDateProperty_%sPersistedId_ReturnsFirstUsableDate",
    (_scenario, persistedId) => {
      const candidates: ColumnInfo[] = [
        properties[0]!,
        { ...dateProperty, id: "hidden", hidden: true },
        { ...dateProperty, id: "deleted", isDeleted: true },
        ...properties.slice(1),
      ];

      expect(resolveTimelineDateProperty(candidates, persistedId)?.id).toBe(
        "due",
      );
    },
  );

  it("ResolveTimelineDateProperty_UsablePersistedLastProperty_ReturnsPersistedProperty", () => {
    expect(resolveTimelineDateProperty(properties, "later")?.id).toBe("later");
  });

  it("ResolveTimelineDateProperty_NoUsableDate_ReturnsNull", () => {
    expect(
      resolveTimelineDateProperty(
        [properties[0]!, { ...dateProperty, hidden: true }],
        null,
      ),
    ).toBeNull();
  });

  it.each([
    ["zero", { start: 0, end: 0 }, { startAt: 0, endAt: 0 }],
    ["equal", { start: 100, end: 100 }, { startAt: 100, endAt: 100 }],
    [
      "open ended",
      { start: Date.UTC(2026, 0, 1) },
      { startAt: Date.UTC(2026, 0, 1), endAt: Date.UTC(2026, 0, 2) },
    ],
  ])(
    "ToTimelineFeature_%sBoundary_ReturnsNormalizedFeature",
    (_scenario, value, expected) => {
      const row = createRow(value);

      expect(toTimelineFeature(row, "due", "Task")).toEqual({
        id: "row",
        name: "Task",
        ...expected,
      });
      expect(row.properties.due?.value).toEqual(value);
    },
  );

  it.each([
    ["missing start", { end: 200 }],
    ["non-finite start", { start: Number.NaN, end: 200 }],
    ["non-finite end", { start: 100, end: Number.POSITIVE_INFINITY }],
    ["reversed", { start: 200, end: 100 }],
  ])("ToTimelineFeature_%s_ReturnsEmptyTrack", (_scenario, value) => {
    expect(toTimelineFeature(createRow(value), "due", "Task")).toBeNull();
  });

  it("CreateInitialTimelineDate_MultipleRows_ReturnsIndependentClampedValues", () => {
    const first = createInitialTimelineDate(
      createRow({}, { createdAt: 200, lastEditedAt: 100 }),
    );
    const second = createInitialTimelineDate(
      createRow({}, { createdAt: 300, lastEditedAt: 500 }),
    );

    expect(first).toEqual({ start: 200, end: 200, endDate: true });
    expect(second).toEqual({ start: 300, end: 500, endDate: true });
    expect(first).not.toBe(second);
  });

  it("CreateEmptyTrackDate_ClickedDay_ReturnsOneCalendarDayRange", () => {
    const start = new Date(2026, 2, 8, 12).getTime();
    const expectedEnd = new Date(2026, 2, 9, 12).getTime();

    expect(createEmptyTrackDate(start)).toEqual({
      start,
      end: expectedEnd,
      endDate: true,
    });
  });

  it("CreateTimelineCellUpdater_MoveOrResize_PreservesExistingDateMetadata", () => {
    const cell = {
      id: "cell-due",
      value: { start: 1, includeTime: true },
    } satisfies Cell<DatePlugin>;

    const next = createTimelineCellUpdater(10, 20)(cell);

    expect(next).toEqual({
      id: "cell-due",
      value: { start: 10, end: 20, endDate: true, includeTime: true },
    });
    expect(next).not.toBe(cell);
    expect(cell.value).toEqual({ start: 1, includeTime: true });
  });
});

function createRow(value: unknown, overrides: Partial<Row> = {}): Row {
  return {
    id: "row",
    createdAt: 100,
    lastEditedAt: 200,
    properties: {
      due: { id: "cell-due", value },
    },
    ...overrides,
  } as Row;
}
