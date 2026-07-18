import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  mockData,
  mockProperties,
  plugins,
  renderTableHook,
} from "@/__tests__/mock";
import type { ColumnInfo, Row } from "@/lib/types";
import { arrayToEntity } from "@/lib/utils";
import type { CellPlugin } from "@/plugins";
import { useTableView } from "@/table-contexts/use-table-view";

describe("useTableView resource API", () => {
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

    const nextData = onDataChange.mock.lastCall?.[0] as Row[];
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

    const nextProperties = onPropertiesChange.mock.lastCall?.[0] as
      | ColumnInfo[]
      | undefined;
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

    const nextView = onViewChange.mock.lastCall?.[0] as {
      layout: "list";
      rowView: "side";
      openedRowId: null;
    };
    expect(nextView.layout).toBe("list");
    expect(result.current.table.getTableGlobalState().layout).toBe("table");

    rerender({ view: nextView });

    expect(result.current.table.getTableGlobalState().layout).toBe("list");
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
    expect(onDataChange.mock.lastCall?.[0]).toHaveLength(mockData.length + 1);
    expect(onViewChange.mock.lastCall?.[0].layout).toBe("list");

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

    expect(onDataChange.mock.lastCall?.[0]).toHaveLength(mockData.length);
    expect(result.current.table.getRowModel().rows).toHaveLength(
      mockData.length,
    );
    expect(result.current.table.store.state.columnOrder).toEqual([
      "col1",
      "col2",
      "col3",
    ]);
    expect(onPropertiesChange.mock.lastCall?.[0]).toHaveLength(3);
  });

  it("ResourceApi_OwnershipSwitch_WarnsInDevelopment", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
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

    expect(warn).toHaveBeenCalledWith(
      "[TableView] `data` changed from uncontrolled to controlled during one mount. This is unsupported.",
    );
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

    const nextProperties = onPropertiesChange.mock.lastCall?.[0] as
      | ColumnInfo[]
      | undefined;
    expect(nextProperties).toMatchObject([
      { id: "col1", hidden: false },
      { id: "col2", hidden: true },
    ]);
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
