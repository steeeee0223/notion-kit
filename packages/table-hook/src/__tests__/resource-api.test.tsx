import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { CellPlugin } from "@notion-kit/table-hook/plugins";

import {
  mockData,
  mockProperties,
  plugins,
  renderTableHook,
} from "@/__tests__/mock";
import type { TableFilterState } from "@/features/filtering";
import { TableViewMenuPage, type TableViewState } from "@/features/menu";
import type { ColumnInfo, Row } from "@/lib/types";
import { arrayToEntity } from "@/lib/utils";
import {
  serializeResourceAction,
  type DataResourceAction,
  type PropertiesResourceAction,
  type ResourceChange,
  type ViewResourceAction,
} from "@/table-contexts";
import { useTableView } from "@/table-contexts/use-table-view";

interface MockWithLastCall {
  mock: {
    lastCall?: readonly unknown[];
  };
}

function getLastResourceChange<TResource, TAction>(mock: MockWithLastCall) {
  return mock.mock.lastCall?.[0] as
    | ResourceChange<TResource, TAction>
    | undefined;
}

const methodPlugin = {
  id: "method-text",
  meta: { name: "Method text", desc: "Method text", icon: null },
  default: { name: "Method text", icon: null, config: undefined, data: "" },
  fromValue: (value) => value?.toString() ?? "",
  toValue: (data) => data,
  isEmpty: (data) => data.trim() === "",
  toTextValue: (data) => data,
  sorting: {
    defaultMethod: "text",
    methods: [
      { id: "text", name: "Text", function: () => 0 },
      { id: "alternate", name: "Alternate", function: () => 0 },
    ],
  },
  grouping: {
    defaultMethod: "value",
    methods: [
      { id: "value", name: "Value", function: (data) => data },
      { id: "text", name: "Text", function: (data) => String(data) },
    ],
  },
  compare: () => 0,
  renderCellValue: () => null,
} satisfies CellPlugin<"method-text", string, undefined>;

const methodPlugins = arrayToEntity([methodPlugin]);
const methodProperties: ColumnInfo[] = [
  { ...mockProperties[0]!, type: "method-text", config: undefined },
];
const noMethodsPlugin = {
  ...methodPlugin,
  id: "no-methods",
  sorting: undefined,
  grouping: undefined,
} satisfies CellPlugin<"no-methods", string, undefined>;

function createWeekContextPlugin(receivedWeekStartsOn: number[]) {
  return {
    ...methodPlugin,
    id: "week-context",
    sorting: {
      defaultMethod: "week-context",
      methods: [
        {
          id: "week-context",
          name: "Week context",
          ascendingLabel: "Ascending",
          descendingLabel: "Descending",
          toComparable: (
            data: string,
            _row: Row,
            context: { weekStartsOn: number },
          ) => {
            receivedWeekStartsOn.push(context.weekStartsOn);
            return data;
          },
          compare: (left, right) => String(left).localeCompare(String(right)),
        },
      ],
    },
  } satisfies CellPlugin<"week-context", string, undefined>;
}

describe("useTableView resource API", () => {
  it.each([
    { weekStartsOn: undefined, expectedWeekStartsOn: 1 },
    { weekStartsOn: 0, expectedWeekStartsOn: 0 },
    { weekStartsOn: 1, expectedWeekStartsOn: 1 },
  ] as const)(
    "ResourceApi_WeekStartsOn_PassesRuntimeValueToSortingMethods ($expectedWeekStartsOn)",
    ({ weekStartsOn, expectedWeekStartsOn }) => {
      const receivedWeekStartsOn: number[] = [];
      const weekContextPlugin = createWeekContextPlugin(receivedWeekStartsOn);
      const { result } = renderHook(() =>
        useTableView({
          plugins: arrayToEntity([weekContextPlugin]),
          defaultData: mockData,
          defaultProperties: [
            { ...mockProperties[0]!, type: "week-context", config: undefined },
          ],
          weekStartsOn,
        }),
      );

      act(() => {
        result.current.table.setSorting([{ id: "col1", desc: false }]);
      });
      result.current.table.getSortedRowModel();

      expect(receivedWeekStartsOn).toEqual(
        expect.arrayContaining([expectedWeekStartsOn]),
      );
    },
  );

  it("ResourceActions_TimelineRange_NormalizesDefaultsAndEmitsPreviousAndNextRanges", () => {
    const onViewChange = vi.fn();
    const { result } = renderHook(() =>
      useTableView({
        plugins,
        defaultData: mockData,
        defaultProperties: mockProperties,
        onViewChange,
      }),
    );

    expect(result.current.table.getTableGlobalState().timeline).toEqual({
      range: "monthly",
      datePropertyId: null,
    });

    act(() => {
      result.current.table.setTimelineRange("quarterly");
    });

    const change = getLastResourceChange<TableViewState, ViewResourceAction>(
      onViewChange,
    );
    expect(change?.next.timeline).toEqual({
      range: "quarterly",
      datePropertyId: null,
    });
    expect(change?.action.type).toBe("view.timeline_range.change");
    expect(change?.action.payload).toEqual({
      previousRange: "monthly",
      nextRange: "quarterly",
    });
    expect(typeof change?.action.id).toBe("string");
  });

  it("ResourceActions_SelectedTimelineRange_DoesNotEmitViewChange", () => {
    const onViewChange = vi.fn();
    const { result } = renderHook(() =>
      useTableView({
        plugins,
        defaultData: mockData,
        defaultProperties: mockProperties,
        onViewChange,
      }),
    );

    act(() => {
      result.current.table.setTimelineRange("monthly");
    });

    expect(onViewChange).not.toHaveBeenCalled();
  });

  it("ResourceActions_ControlledTimelineProperty_ComposesPendingRangeAndUsesProvidedOperationId", () => {
    const onViewChange = vi.fn();
    const { result } = renderHook(() =>
      useTableView({
        plugins,
        defaultData: mockData,
        defaultProperties: mockProperties,
        view: { layout: "timeline", rowView: "side", openedRowId: null },
        onViewChange,
      }),
    );

    act(() => {
      result.current.table.setTimelineRange("daily");
      result.current.table.setTimelineDateProperty(
        "date-property",
        "timeline-operation",
      );
    });

    const change = getLastResourceChange<TableViewState, ViewResourceAction>(
      onViewChange,
    );
    expect(change?.next.timeline).toEqual({
      range: "daily",
      datePropertyId: "date-property",
    });
    expect(change?.action).toEqual({
      id: "timeline-operation",
      type: "view.timeline_property.change",
      payload: {
        previousDatePropertyId: null,
        nextDatePropertyId: "date-property",
      },
    });
  });

  it("ResourceActions_TimelineProperty_GeneratesAnOperationIdWhenOmitted", () => {
    const onViewChange = vi.fn();
    const { result } = renderHook(() =>
      useTableView({
        plugins,
        defaultData: mockData,
        defaultProperties: mockProperties,
        onViewChange,
      }),
    );

    act(() => result.current.table.setTimelineDateProperty("date-property"));

    expect(
      getLastResourceChange<TableViewState, ViewResourceAction>(onViewChange)
        ?.action,
    ).toMatchObject({
      id: expect.any(String) as unknown as string,
      type: "view.timeline_property.change",
    });
  });

  it("ResourceActions_CallbacksReceiveCompleteReplacementEnvelope", () => {
    const onDataChange = vi.fn();
    const { result } = renderHook(() =>
      useTableView({
        plugins,
        defaultData: mockData,
        defaultProperties: mockProperties,
        onDataChange,
      }),
    );

    act(() => {
      result.current.table.addRow();
    });

    const change = getLastResourceChange<Row[], DataResourceAction>(
      onDataChange,
    );
    expect(change?.next).toHaveLength(mockData.length + 1);
    expect(change?.action.type).toBe("data.row.create");
    const action = change?.action as Extract<
      DataResourceAction,
      { type: "data.row.create" }
    >;
    expect(typeof action.id).toBe("string");
    expect(typeof action.payload.rowId).toBe("string");
    expect(action.payload.nextPosition).toBe(mockData.length);
  });

  it("ResourceActions_CrossResourceColumnOperationSharesActionId", () => {
    const onDataChange = vi.fn();
    const onPropertiesChange = vi.fn();
    const { result } = renderHook(() =>
      useTableView({
        plugins,
        defaultData: mockData,
        defaultProperties: mockProperties,
        onDataChange,
        onPropertiesChange,
      }),
    );

    act(() => {
      result.current.table.addColumnInfo({
        id: "col3",
        name: "Estimate",
        type: "text",
      });
    });

    const propertiesChange = getLastResourceChange<
      ColumnInfo[],
      PropertiesResourceAction
    >(onPropertiesChange);
    const dataChange = getLastResourceChange<Row[], DataResourceAction>(
      onDataChange,
    );
    expect(propertiesChange?.next.map((property) => property.id)).toEqual([
      "col1",
      "col2",
      "col3",
    ]);
    expect(propertiesChange?.action).toMatchObject({
      type: "properties.create",
      payload: {
        propertyId: "col3",
        nextPosition: 2,
        property: {
          id: "col3",
          name: "Estimate",
          type: "text",
        },
      },
    });
    expect(dataChange?.action).toMatchObject({
      type: "data.cell.update",
      payload: {
        rowIds: ["row1", "row2", "row3"],
        propertyId: "col3",
      },
    });
    expect(dataChange?.action.id).toBe(propertiesChange?.action.id);
  });

  it("ResourceApi_NoOpDataUpdater_DoesNotEmitChange", () => {
    const onDataChange = vi.fn();
    const { result } = renderHook(() =>
      useTableView({
        plugins,
        defaultData: mockData,
        defaultProperties: mockProperties,
        onDataChange,
      }),
    );

    act(() => {
      result.current.table.setTableData((previous) => previous, {
        id: "no-op-row-move",
        type: "data.row.move",
        payload: {
          rowId: "row1",
          previousPosition: 0,
          nextPosition: 0,
        },
      });
    });

    expect(onDataChange).not.toHaveBeenCalled();
  });

  it("ResourceActions_BulkTypeConversion_OmitsScalarCellValues", () => {
    const onDataChange = vi.fn();
    const { result } = renderHook(() =>
      useTableView({
        plugins,
        defaultData: mockData,
        defaultProperties: mockProperties,
        onDataChange,
      }),
    );

    act(() => {
      result.current.table.setColumnType("col2", "number");
    });

    const change = getLastResourceChange<Row[], DataResourceAction>(
      onDataChange,
    );
    expect(change?.action).toMatchObject({
      type: "data.cell.update",
      payload: {
        rowIds: ["row1", "row2", "row3"],
        propertyId: "col2",
      },
    });
    expect(change?.action.payload).not.toHaveProperty("previousValue");
    expect(change?.action.payload).not.toHaveProperty("nextValue");
  });

  it("ResourceActions_OpenRowInExistingFullMode_EmitsOneCompleteAction", () => {
    const onViewChange = vi.fn();
    const { result } = renderHook(() =>
      useTableView({
        plugins,
        defaultData: mockData,
        defaultProperties: mockProperties,
        defaultView: { rowView: "full" },
        onViewChange,
      }),
    );

    act(() => {
      result.current.table.openRow("row1");
    });

    expect(onViewChange).toHaveBeenCalledOnce();
    const change = getLastResourceChange<TableViewState, ViewResourceAction>(
      onViewChange,
    );
    expect(change?.next).toMatchObject({
      openedRowId: "row1",
      rowView: "full",
    });
    expect(change?.action).toMatchObject({
      type: "view.opened_row.change",
      payload: {
        previousRowId: null,
        nextRowId: "row1",
        previousRowView: "full",
        nextRowView: "full",
      },
    });
  });

  it("ResourceActions_OpenRowInFullPage_ReportsRowAndDisplayTransitions", () => {
    const onViewChange = vi.fn();
    const { result } = renderHook(() =>
      useTableView({
        plugins,
        defaultData: mockData,
        defaultProperties: mockProperties,
        defaultView: { rowView: "side" },
        onViewChange,
      }),
    );

    act(() => {
      result.current.table.openRowInFullPage("row1");
    });

    const change = getLastResourceChange<TableViewState, ViewResourceAction>(
      onViewChange,
    );
    expect(change?.next).toMatchObject({
      openedRowId: "row1",
      rowView: "full",
    });
    expect(change?.action).toMatchObject({
      type: "view.opened_row.change",
      payload: {
        previousRowId: null,
        nextRowId: "row1",
        previousRowView: "side",
        nextRowView: "full",
      },
    });
  });

  it("ResourceActions_OpenRowInFullPageWithoutWindow_StillCommitsState", () => {
    const onViewChange = vi.fn();
    const { result } = renderHook(() =>
      useTableView({
        plugins,
        defaultData: mockData,
        defaultProperties: mockProperties,
        view: {
          layout: "table",
          rowView: "side",
          openedRowId: null,
        },
        getRowUrl: (rowId) => `/rows/${rowId}`,
        onViewChange,
      }),
    );
    const browserWindow = globalThis.window;

    try {
      vi.stubGlobal("window", undefined);

      act(() => result.current.table.openRowInFullPage("row1"));
      expect(() => result.current.table.openRowInTab("row1")).not.toThrow();

      expect(
        getLastResourceChange<TableViewState, ViewResourceAction>(onViewChange)
          ?.next,
      ).toMatchObject({ openedRowId: "row1", rowView: "full" });
    } finally {
      vi.stubGlobal("window", browserWindow);
    }
  });

  it("ResourceActions_RowUrls_OpenFullPageAndNewTabWithBrowserTargets", () => {
    const open = vi.spyOn(window, "open").mockImplementation(() => null);
    const { result } = renderHook(() =>
      useTableView({
        plugins,
        defaultData: mockData,
        defaultProperties: mockProperties,
        getRowUrl: (rowId) => `/rows/${rowId}`,
      }),
    );

    act(() => {
      result.current.table.openRowInFullPage("row1");
      result.current.table.openRowInTab("row2");
    });

    expect(open).toHaveBeenNthCalledWith(1, "/rows/row1", "_self");
    expect(open).toHaveBeenNthCalledWith(
      2,
      "/rows/row2",
      "_blank",
      "noopener,noreferrer",
    );
  });

  it("ResourceActions_SerializationExcludesCompleteNextResource", () => {
    const onPropertiesChange = vi.fn();
    const { result } = renderHook(() =>
      useTableView({
        plugins,
        defaultData: mockData,
        defaultProperties: mockProperties,
        onPropertiesChange,
      }),
    );

    act(() => {
      result.current.table.setColumnInfo("col2", { hidden: true });
    });

    const change = getLastResourceChange<
      ColumnInfo[],
      PropertiesResourceAction
    >(onPropertiesChange);
    const serialized = serializeResourceAction(change!);
    expect(serialized).toEqual(change?.action);
    expect(JSON.stringify(serialized)).not.toContain("Task 1");
    expect(JSON.stringify(serialized)).not.toContain('"next"');
  });

  it("ResourceApi_ControlledData_EmitsReplacementWithoutCommittingUntilPropsChange", () => {
    const onDataChange = vi.fn();
    const { result, rerender } = renderHook(
      ({ data }: { data: Row[] }) =>
        useTableView({
          plugins,
          data,
          defaultProperties: mockProperties,
          onDataChange,
        }),
      { initialProps: { data: mockData } },
    );

    act(() => {
      result.current.table.addRow();
    });

    const dataChange = getLastResourceChange<Row[], DataResourceAction>(
      onDataChange,
    );
    expect(dataChange).toBeDefined();
    const nextData = dataChange!.next;
    expect(nextData).toHaveLength(mockData.length + 1);
    expect(result.current.table.getRowModel().rows).toHaveLength(
      mockData.length,
    );

    rerender({ data: nextData });

    expect(result.current.table.getRowModel().rows).toHaveLength(
      mockData.length + 1,
    );
  });

  it("ResourceApi_ControlledProperties_EmitsReplacementWithoutCommittingUntilPropsChange", () => {
    const onPropertiesChange = vi.fn();
    const { result, rerender } = renderHook(
      ({ properties }: { properties: ColumnInfo[] }) =>
        useTableView({
          plugins,
          defaultData: mockData,
          properties,
          onPropertiesChange,
        }),
      { initialProps: { properties: mockProperties } },
    );

    act(() => {
      result.current.table.addColumnInfo({
        id: "col3",
        name: "Email",
        type: "text",
      });
    });

    const nextProperties = getLastResourceChange<
      ColumnInfo[],
      PropertiesResourceAction
    >(onPropertiesChange)?.next;
    expect(nextProperties?.map((property) => property.id)).toEqual([
      "col1",
      "col2",
      "col3",
    ]);
    expect(result.current.table.atoms.columnOrder.get()).toEqual([
      "col1",
      "col2",
    ]);

    rerender({ properties: nextProperties! });

    expect(result.current.table.atoms.columnOrder.get()).toEqual([
      "col1",
      "col2",
      "col3",
    ]);
  });

  it("ResourceApi_ControlledView_EmitsReplacementWithoutCommittingUntilPropsChange", () => {
    const onViewChange = vi.fn();
    const { result, rerender } = renderHook(
      ({
        view,
      }: {
        view: { layout: "table" | "list"; rowView: "side"; openedRowId: null };
      }) =>
        useTableView({
          plugins,
          defaultData: mockData,
          defaultProperties: mockProperties,
          view,
          onViewChange,
        }),
      {
        initialProps: {
          view: { layout: "table", rowView: "side", openedRowId: null },
        },
      },
    );

    act(() => {
      result.current.table.setTableLayout("list");
    });

    const nextView = getLastResourceChange<TableViewState, ViewResourceAction>(
      onViewChange,
    )?.next as {
      layout: "list";
      rowView: "side";
      openedRowId: null;
    };
    expect(nextView.layout).toBe("list");
    expect(result.current.table.getTableGlobalState().layout).toBe("table");

    rerender({ view: nextView });

    expect(result.current.table.getTableGlobalState().layout).toBe("list");
  });

  it("ResourceApi_ControlledViewRejectedUpdate_RebasesBeforeDifferentMethod", () => {
    const onViewChange = vi.fn();
    const view = {
      layout: "table",
      rowView: "side",
      openedRowId: null,
    } as const;
    const { result, rerender } = renderHook(
      ({ renderCount }: { renderCount: number }) => {
        void renderCount;
        return useTableView({
          plugins,
          defaultData: mockData,
          defaultProperties: mockProperties,
          view,
          onViewChange,
        });
      },
      { initialProps: { renderCount: 0 } },
    );

    act(() => {
      result.current.table.setTableLayout("list");
    });
    rerender({ renderCount: 1 });
    act(() => {
      result.current.table.openRow("row1");
    });

    expect(
      getLastResourceChange<TableViewState, ViewResourceAction>(onViewChange)
        ?.next,
    ).toMatchObject({
      layout: "table",
      openedRowId: "row1",
    });
  });

  it("ResourceApi_ControlledViewSameRenderUpdates_ComposeBeforeCommit", () => {
    const onViewChange = vi.fn();
    const view = {
      layout: "table",
      rowView: "side",
      openedRowId: null,
    } as const;
    const { result } = renderHook(() =>
      useTableView({
        plugins,
        defaultData: mockData,
        defaultProperties: mockProperties,
        view,
        onViewChange,
      }),
    );

    act(() => {
      result.current.table.setTableLayout("list");
      result.current.table.openRow("row1");
    });

    expect(
      getLastResourceChange<TableViewState, ViewResourceAction>(onViewChange)
        ?.next,
    ).toMatchObject({
      layout: "list",
      openedRowId: "row1",
    });
  });

  it("ResourceApi_PluginMethods_ControlledAcceptsSelectionsWithSerializableActions", () => {
    const onViewChange = vi.fn();
    const initialView = {
      layout: "table",
      rowView: "side",
      openedRowId: null,
      pluginMethods: {
        sortingMethodByColumn: { col1: "text" },
        groupingMethodByColumn: { col1: "value" },
        groupSort: { mode: "manual" as const },
      },
    } as const satisfies Partial<TableViewState>;
    const initialProps: { view: Partial<TableViewState> } = {
      view: initialView,
    };
    const { result, rerender } = renderHook(
      ({ view }: { view: Partial<TableViewState> }) =>
        useTableView({
          plugins: methodPlugins,
          defaultData: mockData,
          defaultProperties: methodProperties,
          view,
          onViewChange,
        }),
      { initialProps },
    );

    act(() => {
      result.current.table.setColumnSortingMethod("col1", "alternate");
    });

    const sortingChange = getLastResourceChange<
      TableViewState,
      ViewResourceAction
    >(onViewChange)!;
    expect(sortingChange).toEqual({
      next: {
        ...initialView,
        locked: false,
        timeline: { range: "monthly", datePropertyId: null },
        pluginMethods: {
          ...initialView.pluginMethods,
          sortingMethodByColumn: { col1: "alternate" },
        },
      },
      action: {
        id: expect.any(String) as unknown as string,
        type: "view.plugin_sorting_method.change",
        payload: {
          propertyId: "col1",
          previousMethodId: "text",
          nextMethodId: "alternate",
        },
      },
    });
    expect(result.current.table.getSelectedSortingMethod("col1")?.id).toBe(
      "text",
    );

    rerender({ view: sortingChange.next });

    expect(result.current.table.getSelectedSortingMethod("col1")?.id).toBe(
      "alternate",
    );

    act(() => {
      result.current.table.setColumnGroupingMethod("col1", "text");
    });

    expect(
      getLastResourceChange<TableViewState, ViewResourceAction>(onViewChange)
        ?.action,
    ).toEqual({
      id: expect.any(String) as unknown as string,
      type: "view.plugin_grouping_method.change",
      payload: {
        propertyId: "col1",
        previousMethodId: "value",
        nextMethodId: "text",
      },
    });

    act(() => {
      result.current.table.setGroupSort({
        mode: "ascending",
        method: "text",
      });
    });

    expect(
      getLastResourceChange<TableViewState, ViewResourceAction>(onViewChange)
        ?.action,
    ).toEqual({
      id: expect.any(String) as unknown as string,
      type: "view.group_sort.change",
      payload: {
        previousGroupSort: { mode: "manual" },
        nextGroupSort: { mode: "ascending", method: "text" },
      },
    });
  });

  it("ResourceApi_PluginMethods_DiscoversGroupingCapabilitiesAndSkipsSelectedMethods", () => {
    const onViewChange = vi.fn();
    const { result } = renderHook(() =>
      useTableView({
        plugins: methodPlugins,
        defaultData: mockData,
        defaultProperties: methodProperties,
        defaultView: {
          pluginMethods: {
            sortingMethodByColumn: { col1: "text" },
            groupingMethodByColumn: { col1: "value" },
          },
        },
        onViewChange,
      }),
    );

    expect(
      result.current.table
        .getColumnGroupingMethods("col1")
        .map((method) => method.id),
    ).toEqual(["value", "text"]);

    act(() => {
      result.current.table.setColumnSortingMethod("col1", "text");
      result.current.table.setColumnGroupingMethod("col1", "value");
    });

    expect(onViewChange).not.toHaveBeenCalled();
  });

  it("ResourceApi_PluginMethods_ReportsNoGroupingCapabilitiesForPlainPlugins", () => {
    const { result } = renderHook(() =>
      useTableView({
        plugins: arrayToEntity([noMethodsPlugin]),
        defaultData: mockData,
        defaultProperties: [
          { ...mockProperties[0]!, type: "no-methods", config: undefined },
        ],
      }),
    );

    expect(result.current.table.getColumnGroupingMethods("col1")).toEqual([]);
  });

  it("ResourceApi_TableMenuState_UsesTheDefaultFeatureUpdater", () => {
    const { result } = renderHook(() =>
      useTableView({
        plugins,
        defaultData: mockData,
        defaultProperties: mockProperties,
      }),
    );

    expect(result.current.table.getTableMenuState()).toEqual({
      open: false,
      page: null,
    });
    act(() =>
      result.current.table.setTableMenuState({
        open: true,
        page: TableViewMenuPage.Sort,
      }),
    );
    expect(result.current.table.getTableMenuState()).toEqual({
      open: true,
      page: TableViewMenuPage.Sort,
    });
  });

  it("ResourceApi_PluginMethods_UnknownSelectionsFallBackWithoutWriting", () => {
    const onViewChange = vi.fn();
    const { result } = renderHook(() =>
      useTableView({
        plugins: methodPlugins,
        defaultData: mockData,
        defaultProperties: methodProperties,
        view: {
          layout: "table",
          rowView: "side",
          openedRowId: null,
          pluginMethods: { sortingMethodByColumn: { col1: "missing" } },
        },
        onViewChange,
      }),
    );

    expect(result.current.table.getSelectedSortingMethod("col1")?.id).toBe(
      "text",
    );
    expect(onViewChange).not.toHaveBeenCalled();
  });

  it("ResourceApi_PluginMethods_ControlledRejectsSelectionUntilParentAcceptsIt", () => {
    const onViewChange = vi.fn();
    const view = {
      layout: "table" as const,
      rowView: "side" as const,
      openedRowId: null,
      pluginMethods: { sortingMethodByColumn: { col1: "text" } },
    };
    const { result, rerender } = renderHook(
      ({ renderCount }: { renderCount: number }) => {
        void renderCount;
        return useTableView({
          plugins: methodPlugins,
          defaultData: mockData,
          defaultProperties: methodProperties,
          view,
          onViewChange,
        });
      },
      { initialProps: { renderCount: 0 } },
    );

    act(() => {
      result.current.table.setColumnSortingMethod("col1", "alternate");
    });
    rerender({ renderCount: 1 });

    expect(result.current.table.getSelectedSortingMethod("col1")?.id).toBe(
      "text",
    );
    expect(
      getLastResourceChange<TableViewState, ViewResourceAction>(onViewChange)
        ?.next.pluginMethods?.sortingMethodByColumn,
    ).toEqual({ col1: "alternate" });
  });

  it("ResourceApi_PluginMethods_UncontrolledSelectionsSurviveRerenders", () => {
    const { result, rerender } = renderHook(
      ({ renderCount }: { renderCount: number }) => {
        void renderCount;
        return useTableView({
          plugins: methodPlugins,
          defaultData: mockData,
          defaultProperties: methodProperties,
          defaultView: {
            pluginMethods: {
              sortingMethodByColumn: { col1: "text" },
              groupingMethodByColumn: { col1: "value" },
            },
          },
        });
      },
      { initialProps: { renderCount: 0 } },
    );

    act(() => {
      result.current.table.setColumnSortingMethod("col1", "alternate");
      result.current.table.setColumnGroupingMethod("col1", "text");
      result.current.table.setGroupSort({
        mode: "descending",
        method: "text",
      });
    });
    rerender({ renderCount: 1 });

    expect(result.current.table.getSelectedSortingMethod("col1")?.id).toBe(
      "alternate",
    );
    expect(result.current.table.getSelectedGroupingMethod("col1").id).toBe(
      "text",
    );
    expect(result.current.table.getGroupSort()).toEqual({
      mode: "descending",
      method: "text",
    });
  });

  it("ResourceApi_PartialNestedViews_KeepTimelineAndPluginMethodDefaults", () => {
    const { result } = renderHook(() =>
      useTableView({
        plugins: methodPlugins,
        defaultData: mockData,
        defaultProperties: methodProperties,
        defaultView: {
          timeline: { datePropertyId: "date-property" },
          pluginMethods: { sortingMethodByColumn: { col1: "text" } },
        },
      }),
    );

    expect(result.current.table.getTableGlobalState()).toMatchObject({
      timeline: { range: "monthly", datePropertyId: "date-property" },
      pluginMethods: {
        sortingMethodByColumn: { col1: "text" },
        groupingMethodByColumn: {},
        groupSort: { mode: "manual" },
      },
    });
  });

  it("ResourceApi_OldViewsWithoutPluginMethods_DoNotEmitFallbackWrites", () => {
    const onViewChange = vi.fn();
    const { result } = renderHook(() =>
      useTableView({
        plugins: methodPlugins,
        defaultData: mockData,
        defaultProperties: methodProperties,
        view: { layout: "table", rowView: "side", openedRowId: null },
        onViewChange,
      }),
    );

    expect(result.current.table.getSelectedSortingMethod("col1")?.id).toBe(
      "text",
    );
    expect(result.current.table.getSelectedGroupingMethod("col1").id).toBe(
      "value",
    );
    act(() => result.current.table.setGroupSort({ mode: "manual" }));
    expect(onViewChange).not.toHaveBeenCalled();
  });

  it("ResourceApi_UncontrolledDefaults_InitializeCommitAndIgnoreLaterDefaultChanges", () => {
    const onDataChange = vi.fn();
    const onPropertiesChange = vi.fn();
    const onViewChange = vi.fn();
    const { result, rerender } = renderHook(
      ({
        defaultData,
        defaultProperties,
      }: {
        defaultData: Row[];
        defaultProperties: ColumnInfo[];
      }) =>
        useTableView({
          plugins,
          defaultData,
          defaultProperties,
          defaultView: { layout: "table", rowView: "side", openedRowId: null },
          onDataChange,
          onPropertiesChange,
          onViewChange,
        }),
      {
        initialProps: {
          defaultData: mockData,
          defaultProperties: mockProperties,
        },
      },
    );

    act(() => {
      result.current.table.addRow();
      result.current.table.setTableLayout("list");
    });

    expect(result.current.table.getRowModel().rows).toHaveLength(
      mockData.length + 1,
    );
    expect(result.current.table.getTableGlobalState().layout).toBe("list");
    expect(
      getLastResourceChange<Row[], DataResourceAction>(onDataChange)?.next,
    ).toHaveLength(mockData.length + 1);
    expect(
      getLastResourceChange<TableViewState, ViewResourceAction>(onViewChange)
        ?.next.layout,
    ).toBe("list");

    rerender({
      defaultData: [
        {
          ...mockData[0]!,
          id: "replacement-row",
        },
      ],
      defaultProperties: [
        {
          ...mockProperties[0]!,
          id: "replacement-column",
        },
      ],
    });

    expect(result.current.table.getRowModel().rows).toHaveLength(
      mockData.length + 1,
    );
    expect(result.current.table.atoms.columnOrder.get()).toEqual([
      "col1",
      "col2",
    ]);
    expect(onPropertiesChange).not.toHaveBeenCalled();
  });

  it("ResourceApi_MixedOwnership_PreservesIndependentResourceModes", () => {
    const onDataChange = vi.fn();
    const onPropertiesChange = vi.fn();
    const onViewChange = vi.fn();
    const { result } = renderHook(() =>
      useTableView({
        plugins,
        data: mockData,
        onDataChange,
        defaultProperties: mockProperties,
        defaultView: { layout: "table", rowView: "side", openedRowId: null },
        onPropertiesChange,
        onViewChange,
      }),
    );

    act(() => {
      result.current.table.addColumnInfo({
        id: "col3",
        name: "Email",
        type: "text",
      });
    });

    expect(
      getLastResourceChange<Row[], DataResourceAction>(onDataChange)?.next,
    ).toHaveLength(mockData.length);
    expect(result.current.table.getRowModel().rows).toHaveLength(
      mockData.length,
    );
    expect(result.current.table.atoms.columnOrder.get()).toEqual([
      "col1",
      "col2",
      "col3",
    ]);
    expect(
      getLastResourceChange<ColumnInfo[], PropertiesResourceAction>(
        onPropertiesChange,
      )?.next,
    ).toHaveLength(3);
  });

  it("ResourceApi_OwnershipSwitch_WarnsOncePerTransitionInDevelopment", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const { rerender } = renderHook(
      (props: {
        data?: Row[];
        defaultData?: Row[];
        defaultProperties: ColumnInfo[];
      }) => useTableView({ plugins, ...props } as never),
      {
        initialProps: {
          defaultData: mockData,
          defaultProperties: mockProperties,
        },
      },
    );

    rerender({
      data: mockData,
      defaultProperties: mockProperties,
    } as never);

    rerender({
      data: mockData,
      defaultProperties: mockProperties,
    } as never);

    expect(warn).toHaveBeenCalledWith(
      "[TableView] `data` changed from uncontrolled to controlled during one mount. This is unsupported.",
    );
    expect(warn).toHaveBeenCalledOnce();
    warn.mockRestore();
  });

  it("ResourceApi_ControlledFunctionalUpdaters_ComposeAgainstLatestPendingResource", () => {
    const onPropertiesChange = vi.fn();
    const { result } = renderHook(() =>
      useTableView({
        plugins,
        defaultData: mockData,
        properties: [
          {
            ...mockProperties[0]!,
            type: "title",
            config: { showIcon: true },
          },
          mockProperties[1]!,
        ],
        onPropertiesChange,
      }),
    );

    act(() => {
      result.current.table.toggleAllColumnsVisible();
    });

    const nextProperties = getLastResourceChange<
      ColumnInfo[],
      PropertiesResourceAction
    >(onPropertiesChange)?.next;
    expect(nextProperties).toMatchObject([
      { id: "col1", hidden: false },
      { id: "col2", hidden: true },
    ]);
  });

  it("ResourceApi_ControlledColumnLifecycle_EmitsCompletePropertyAndDataResources", () => {
    const onDataChange = vi.fn();
    const onPropertiesChange = vi.fn();
    const { result, rerender } = renderHook(
      ({ data, properties }: { data: Row[]; properties: ColumnInfo[] }) =>
        useTableView({
          plugins,
          data,
          properties,
          onDataChange,
          onPropertiesChange,
        }),
      { initialProps: { data: mockData, properties: mockProperties } },
    );

    act(() => {
      result.current.table.addColumnInfo({
        id: "col3",
        name: "Estimate",
        type: "text",
      });
    });
    const addedProperties = getLastResourceChange<
      ColumnInfo[],
      PropertiesResourceAction
    >(onPropertiesChange)?.next;
    const addedData = getLastResourceChange<Row[], DataResourceAction>(
      onDataChange,
    )?.next;
    expect(addedProperties?.map((property) => property.id)).toEqual([
      "col1",
      "col2",
      "col3",
    ]);
    expect(addedData?.every((row) => row.properties.col3 !== undefined)).toBe(
      true,
    );

    rerender({ properties: addedProperties!, data: addedData! });
    act(() => {
      result.current.table.setColumnType("col3", "number");
    });
    const typedProperties = getLastResourceChange<
      ColumnInfo[],
      PropertiesResourceAction
    >(onPropertiesChange)?.next;
    const typedData = getLastResourceChange<Row[], DataResourceAction>(
      onDataChange,
    )?.next;
    expect(
      typedProperties?.find((property) => property.id === "col3")?.type,
    ).toBe("number");
    expect(typedData?.every((row) => row.properties.col3?.value === 0)).toBe(
      true,
    );

    rerender({ properties: typedProperties!, data: typedData! });
    act(() => {
      result.current.table.removeColumnInfo("col3");
    });
    const removedProperties = getLastResourceChange<
      ColumnInfo[],
      PropertiesResourceAction
    >(onPropertiesChange)?.next;
    const removedData = getLastResourceChange<Row[], DataResourceAction>(
      onDataChange,
    )?.next;
    expect(removedProperties?.map((property) => property.id)).toEqual([
      "col1",
      "col2",
    ]);
    expect(removedData?.every((row) => row.properties.col3 === undefined)).toBe(
      true,
    );
  });

  it("ResourceApi_UncontrolledColumnLifecycle_CommitsAndEmitsCompleteResources", () => {
    const onDataChange = vi.fn();
    const onPropertiesChange = vi.fn();
    const { result } = renderHook(() =>
      useTableView({
        plugins,
        defaultData: mockData,
        defaultProperties: mockProperties,
        onDataChange,
        onPropertiesChange,
      }),
    );

    act(() => {
      result.current.table.addColumnInfo({
        id: "col3",
        name: "Estimate",
        type: "text",
      });
    });
    expect(result.current.table.atoms.columnOrder.get()).toEqual([
      "col1",
      "col2",
      "col3",
    ]);
    expect(
      result.current.table
        .getRowModel()
        .rows.every((row) => row.original.properties.col3 !== undefined),
    ).toBe(true);
    expect(
      getLastResourceChange<ColumnInfo[], PropertiesResourceAction>(
        onPropertiesChange,
      )?.next,
    ).toHaveLength(3);
    expect(
      getLastResourceChange<Row[], DataResourceAction>(onDataChange)?.next,
    ).toHaveLength(mockData.length);

    act(() => {
      result.current.table.setColumnType("col3", "number");
    });
    expect(result.current.table.getColumnInfo("col3").type).toBe("number");
    expect(
      result.current.table
        .getRowModel()
        .rows.every((row) => row.original.properties.col3?.value === 0),
    ).toBe(true);
    const typedPropertiesChange = getLastResourceChange<
      ColumnInfo[],
      PropertiesResourceAction
    >(onPropertiesChange);
    const typedDataChange = getLastResourceChange<Row[], DataResourceAction>(
      onDataChange,
    );
    expect(typedPropertiesChange).toBeDefined();
    expect(typedDataChange).toBeDefined();
    expect(
      typedPropertiesChange!.next.find((property) => property.id === "col3")
        ?.type,
    ).toBe("number");
    expect(
      typedDataChange!.next.every((row) => row.properties.col3?.value === 0),
    ).toBe(true);

    act(() => {
      result.current.table.removeColumnInfo("col3");
    });
    expect(result.current.table.atoms.columnOrder.get()).toEqual([
      "col1",
      "col2",
    ]);
    expect(
      result.current.table
        .getRowModel()
        .rows.every((row) => row.original.properties.col3 === undefined),
    ).toBe(true);
    expect(
      getLastResourceChange<ColumnInfo[], PropertiesResourceAction>(
        onPropertiesChange,
      )?.next,
    ).toHaveLength(2);
    const removedDataChange = getLastResourceChange<Row[], DataResourceAction>(
      onDataChange,
    );
    expect(removedDataChange).toBeDefined();
    expect(
      removedDataChange!.next.every((row) => row.properties.col3 === undefined),
    ).toBe(true);
  });

  it("ResourceApi_PluginRegistryChange_RenormalizesPropertiesWithNewPluginDefaults", () => {
    const textWithConfig = {
      ...plugins.items.text!,
      default: {
        ...plugins.items.text!.default,
        config: { placeholder: "first" },
      },
    } satisfies CellPlugin;
    const textWithNewConfig = {
      ...textWithConfig,
      default: {
        ...textWithConfig.default,
        config: { placeholder: "second" },
      },
    } satisfies CellPlugin;
    const { result, rerender } = renderHook(
      ({ plugin }: { plugin: CellPlugin }) =>
        useTableView({
          plugins: arrayToEntity([plugin]),
          defaultData: mockData,
          defaultProperties: [
            {
              id: "col1",
              name: "Name",
              type: "text",
            },
          ],
        }),
      { initialProps: { plugin: textWithConfig } },
    );

    expect(result.current.table.getColumnInfo("col1").config).toEqual({
      placeholder: "first",
    });

    rerender({ plugin: textWithNewConfig });

    expect(result.current.table.getColumnInfo("col1").config).toEqual({
      placeholder: "second",
    });
  });

  it("ResourceApi_MissingPlugin_ThrowsAtTableViewBoundary", () => {
    expect(() => {
      renderTableHook({
        defaultData: mockData,
        defaultProperties: [
          {
            id: "col1",
            name: "Missing",
            type: "missing",
          },
        ],
      });
    }).toThrow(
      '[TableView] Plugin not found for property "col1" type: missing',
    );
  });
});

describe("useTableView filter resource API", () => {
  const initialFilters = {
    kind: "group",
    id: "initial",
    logic: "and",
    children: [
      {
        kind: "rule",
        id: "initial-rule",
        propertyId: "col1",
        operator: "contains",
        value: "Task",
      },
    ],
  } as const satisfies TableFilterState;
  const nextFilters = {
    kind: "group",
    id: "next",
    logic: "or",
    children: [
      {
        kind: "rule",
        id: "next-rule",
        propertyId: "col2",
        operator: "is-checked",
      },
    ],
  } as const satisfies TableFilterState;

  it("FilterResource_Uncontrolled_ReplacesAndClearsThroughViewActions", () => {
    const onViewChange = vi.fn();
    const { result } = renderHook(() =>
      useTableView({
        plugins,
        defaultData: mockData,
        defaultProperties: mockProperties,
        defaultView: { filters: initialFilters },
        onViewChange,
      }),
    );

    expect(result.current.table.getFilters()).toBe(initialFilters);

    act(() => result.current.table.setFilters(nextFilters));

    expect(result.current.table.getFilters()).toBe(nextFilters);
    expect(result.current.table.atoms.columnFilters.get()).toEqual([]);
    const change = getLastResourceChange<TableViewState, ViewResourceAction>(
      onViewChange,
    );
    expect(change?.next.filters).toBe(nextFilters);
    expect(change?.action).toEqual({
      id: expect.any(String) as unknown as string,
      type: "view.filters.change",
      payload: {
        previousFilters: initialFilters,
        nextFilters,
      },
    });

    act(() => result.current.table.clearFilters());

    expect(result.current.table.getFilters()).toBeNull();
    expect(
      getLastResourceChange<TableViewState, ViewResourceAction>(onViewChange)
        ?.action,
    ).toMatchObject({
      type: "view.filters.change",
      payload: { previousFilters: nextFilters, nextFilters: null },
    });
  });

  it("FilterResource_Controlled_RemainsOwnerAuthoritativeUntilRerender", () => {
    const onViewChange = vi.fn();
    const { result, rerender } = renderHook(
      ({ filters }: { filters: TableFilterState }) =>
        useTableView({
          plugins,
          defaultData: mockData,
          defaultProperties: mockProperties,
          view: { filters },
          onViewChange,
        }),
      { initialProps: { filters: initialFilters as TableFilterState } },
    );

    act(() => result.current.table.setFilters(nextFilters));

    expect(result.current.table.getFilters()).toBe(initialFilters);
    expect(
      getLastResourceChange<TableViewState, ViewResourceAction>(onViewChange),
    ).toMatchObject({
      next: { filters: nextFilters },
      action: {
        type: "view.filters.change",
        payload: { previousFilters: initialFilters, nextFilters },
      },
    });

    rerender({ filters: initialFilters });
    expect(result.current.table.getFilters()).toBe(initialFilters);
    expect(result.current.table.atoms.columnFilters.get()).toEqual([]);

    act(() => result.current.table.setFilters(nextFilters));
    expect(result.current.table.getFilters()).toBe(initialFilters);

    rerender({ filters: nextFilters });
    expect(result.current.table.getFilters()).toBe(nextFilters);
  });

  it("FilterResource_IgnoresInvalidRuntimeSetterValues", () => {
    const onViewChange = vi.fn();
    const { result } = renderHook(() =>
      useTableView({
        plugins,
        defaultData: mockData,
        defaultProperties: mockProperties,
        onViewChange,
      }),
    );
    const cyclic = {
      kind: "group",
      id: "cyclic",
      logic: "and",
      children: [] as unknown[],
    };
    cyclic.children.push(cyclic);
    const nonJson = {
      ...nextFilters,
      children: [
        {
          ...nextFilters.children[0],
          value: () => true,
        },
      ],
    };

    act(() => {
      result.current.table.setFilters(cyclic as never);
      result.current.table.setFilters(nonJson as never);
    });

    expect(result.current.table.getFilters()).toBeUndefined();
    expect(onViewChange).not.toHaveBeenCalled();
  });
});
