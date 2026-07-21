import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  mockData,
  mockProperties,
  plugins,
  renderTableHook,
} from "@/__tests__/mock";
import type { TableViewState } from "@/features/menu";
import type { ColumnInfo, Row } from "@/lib/types";
import { arrayToEntity } from "@/lib/utils";
import type { CellPlugin } from "@/plugins";
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

describe("useTableView resource API", () => {
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
    expect(result.current.table.store.state.columnOrder).toEqual([
      "col1",
      "col2",
    ]);

    rerender({ properties: nextProperties! });

    expect(result.current.table.store.state.columnOrder).toEqual([
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

  it("ResourceApi_ControlledViewPendingUpdate_SurvivesParentRerender", () => {
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
      layout: "list",
      openedRowId: "row1",
    });
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
    expect(result.current.table.store.state.columnOrder).toEqual([
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
    expect(result.current.table.store.state.columnOrder).toEqual([
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
    expect(result.current.table.store.state.columnOrder).toEqual([
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
    expect(result.current.table.store.state.columnOrder).toEqual([
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
