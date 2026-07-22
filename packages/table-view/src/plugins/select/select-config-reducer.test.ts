import { describe, expect, it } from "vitest";

import type { Row, TableInstance } from "@notion-kit/table-hook";

import {
  propagateSelectEvent,
  selectConfigReducer,
} from "./select-config-reducer";
import type { SelectConfig } from "./types";

const config: SelectConfig = {
  sort: "manual",
  options: {
    names: ["Beta", "Alpha"],
    items: {
      Beta: { id: "beta", name: "Beta", color: "blue" },
      Alpha: { id: "alpha", name: "Alpha", color: "green" },
    },
  },
};

describe("selectConfigReducer", () => {
  it("SelectConfig_AddOption_AppendsMetadataWithoutChangingExistingOptions", () => {
    const result = selectConfigReducer(config, {
      action: "add:option",
      payload: { name: "Done", color: "gray" },
    });

    expect(result.config.options.names).toEqual(["Beta", "Alpha", "Done"]);
    expect(result.config.options.items.Done).toMatchObject({
      name: "Done",
      color: "gray",
    });
    expect(result.config.options.items.Done?.id).toEqual(expect.any(String));
    expect(result.config.options.items.Beta).toBe(config.options.items.Beta);
  });

  it("SelectConfig_UpdateMetadata_PreservesNameAndReportsNoCellEvent", () => {
    const result = selectConfigReducer(config, {
      action: "update:option",
      payload: {
        originalName: "Beta",
        description: "Ready",
        color: "red",
      },
    });

    expect(result.config.options.items.Beta).toEqual({
      ...config.options.items.Beta,
      description: "Ready",
      color: "red",
    });
    expect(result.nextEvent).toBeUndefined();
  });

  it("SelectConfig_RenameOption_RekeysOrderAndReportsPropagationEvent", () => {
    const result = selectConfigReducer(config, {
      action: "update:option",
      payload: { originalName: "Beta", name: "Ready" },
    });

    expect(result.config.options.names).toEqual(["Ready", "Alpha"]);
    expect(result.config.options.items.Beta).toBeUndefined();
    expect(result.config.options.items.Ready).toEqual({
      ...config.options.items.Beta,
      name: "Ready",
    });
    expect(result.nextEvent).toEqual({
      type: "update:name",
      payload: { originalName: "Beta", name: "Ready" },
    });
  });

  it("SelectConfig_UpdateMissingOption_ReturnsOriginalConfig", () => {
    const result = selectConfigReducer(config, {
      action: "update:option",
      payload: { originalName: "Missing", color: "red" },
    });

    expect(result).toBe(config);
  });

  it.each([
    ["manual", ["Beta", "Alpha"]],
    ["alphabetical", ["Alpha", "Beta"]],
    ["reverse-alphabetical", ["Beta", "Alpha"]],
  ] as const)("SelectConfig_%sSort_ProducesExpectedOrder", (sort, names) => {
    const result = selectConfigReducer(config, {
      action: "update:sort",
      payload: sort,
    });

    expect(result.config.sort).toBe(sort);
    expect(result.config.options.names).toEqual(names);
  });

  it("SelectConfig_ManualUpdater_AcceptsFunctionalReordering", () => {
    const result = selectConfigReducer(config, {
      action: "update:sort:manual",
      updater: (names) => [...names].reverse(),
    });

    expect(result.config.sort).toBe("manual");
    expect(result.config.options.names).toEqual(["Alpha", "Beta"]);
  });

  it.each(["Beta", "Missing"])(
    "SelectConfig_Delete%s_RemovesMatchingMetadataAndReportsEvent",
    (name) => {
      const result = selectConfigReducer(config, {
        action: "delete:option",
        payload: name,
      });

      expect(result.config.options.names).toEqual(
        name === "Beta" ? ["Alpha"] : ["Beta", "Alpha"],
      );
      expect(result.config.options.items[name]).toBeUndefined();
      expect(result.nextEvent).toEqual({ type: "delete", payload: name });
    },
  );
});

function propagate(
  type: "select" | "multi-select",
  values: (string | string[] | null)[],
  event:
    | { type: "update:name"; payload: { originalName: string; name: string } }
    | { type: "delete"; payload: string },
) {
  const previous: Row[] = values.map((value, index) => ({
    id: `row${index + 1}`,
    createdAt: 0,
    lastEditedAt: 0,
    properties: { status: { id: `cell${index + 1}`, value } },
  }));
  let next: Row[] = [];
  let action: unknown;
  const table = {
    setTableData(
      updater: (rows: Row[]) => Row[],
      createAction: (previous: Row[], next: Row[]) => unknown,
    ) {
      next = updater(previous);
      action = createAction(previous, next);
    },
  } as unknown as TableInstance;

  propagateSelectEvent(table, "status", type, event);
  return { previous, next, action };
}

describe("propagateSelectEvent", () => {
  it("SelectRename_UpdatesOnlyMatchingRowsAndReportsChangedIds", () => {
    const result = propagate("select", ["Beta", "Alpha", null], {
      type: "update:name",
      payload: { originalName: "Beta", name: "Ready" },
    });

    expect(result.next.map((row) => row.properties.status?.value)).toEqual([
      "Ready",
      "Alpha",
      null,
    ]);
    expect(result.next[0]).not.toBe(result.previous[0]);
    expect(result.next[1]).toBe(result.previous[1]);
    expect(result.action).toMatchObject({
      type: "data.cell.update",
      payload: {
        rowIds: ["row1"],
        propertyId: "status",
        previousValue: "Beta",
        nextValue: "Ready",
      },
    });
  });

  it("MultiSelectRename_ReplacesEveryMatchingOccurrence", () => {
    const result = propagate(
      "multi-select",
      [["Beta", "Alpha", "Beta"], ["Alpha"]],
      {
        type: "update:name",
        payload: { originalName: "Beta", name: "Ready" },
      },
    );

    expect(result.next.map((row) => row.properties.status?.value)).toEqual([
      ["Ready", "Alpha", "Ready"],
      ["Alpha"],
    ]);
    expect(result.action).toMatchObject({
      payload: { rowIds: ["row1"], nextValue: "Ready" },
    });
  });

  it("SelectDelete_ClearsMatchingValueAndLeavesOtherRowsStable", () => {
    const result = propagate("select", ["Beta", "Alpha"], {
      type: "delete",
      payload: "Beta",
    });

    expect(result.next.map((row) => row.properties.status?.value)).toEqual([
      null,
      "Alpha",
    ]);
    expect(result.next[1]).toBe(result.previous[1]);
    expect(result.action).toMatchObject({
      payload: { rowIds: ["row1"], previousValue: "Beta", nextValue: null },
    });
  });

  it("MultiSelectDelete_RemovesMatchingTagsAndUsesRemovedSentinel", () => {
    const result = propagate("multi-select", [["Beta", "Alpha"], ["Alpha"]], {
      type: "delete",
      payload: "Beta",
    });

    expect(result.next.map((row) => row.properties.status?.value)).toEqual([
      ["Alpha"],
      ["Alpha"],
    ]);
    expect(result.action).toMatchObject({
      payload: { rowIds: ["row1"], nextValue: "removed" },
    });
  });
});
