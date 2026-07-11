import type { DragEndEvent } from "@dnd-kit/react";
import type { OnChangeFn, TableFeature } from "@tanstack/react-table";
import {
  constructRow,
  flexRender,
  functionalUpdate,
  makeStateUpdater,
} from "@tanstack/react-table";

import { getSortableItemsAfterDrag } from "@notion-kit/ui/primitives";

import type { RowInstance, TableInstance } from "@/features/types";
import { createGroupId } from "@/features/utils";
import type { ColumnInfo, Row as RowModel } from "@/lib/types";
import { resolveGroupingMethod } from "@/methods";
import type { ComparableValue } from "@/plugins";
import { DefaultGroupingValue } from "@/plugins";

interface ExtendedGroupingState {
  groupOrder: string[];
  /**
   * @prop groupVisibility Mapping of group IDs to their visibility status.
   * key: group ID
   * value: boolean (true = visible, false = hidden)
   */
  groupVisibility: Record<string, boolean>;
  /**
   * @prop groupValues Mapping of group IDs to their corresponding grouping values.
   * key: group ID
   * value: grouping value
   */
  groupValues: Record<
    string,
    {
      value: ComparableValue;
      original: unknown;
    }
  >;
  showAggregates: boolean;
  hideEmptyGroups: boolean;
}

export interface ExtendedGroupingTableState {
  groupingState: ExtendedGroupingState;
}

export interface ExtendedGroupingOptions {
  onGroupingStateChange?: OnChangeFn<ExtendedGroupingState>;
}

export interface ExtendedGroupingTableApi {
  getGroupedColumnInfo: () => ColumnInfo | null;
  getIsSomeGroupVisible: () => boolean;
  _setGroupingState: OnChangeFn<ExtendedGroupingState>;
  setGroupingColumn: OnChangeFn<string | null>;
  toggleHideEmptyGroups: () => void;
  toggleGroupVisible: (groupId: string) => void;
  toggleAllGroupsVisible: () => void;
  handleGroupedRowDragEnd: (e: DragEndEvent) => void;
  _resetGroupingState: () => void;
  _syncGroupingState: (options?: { resetOrder?: boolean }) => void;
  _syncGroupingStateFromData: (
    rows: RowModel[],
    options?: { resetOrder?: boolean },
  ) => void;
  getGroupingValueRenderer: (
    groupId: string,
  ) => (props: { className?: string }) => React.ReactNode;
  /**
   * Use this to render the empty group
   */
  getPlaceholderGroupedRow: (groupId: string) => RowInstance;
}

export interface ExtendedGroupingRowApi {
  getShouldShowGroupAggregates: () => boolean;
  toggleGroupAggregates: () => void;
  toggleGroupVisibility: () => void;
  renderGroupingValue: (props: { className?: string }) => React.ReactNode;
}

export const ExtendedGroupingFeature: TableFeature = {
  getInitialState: (state): ExtendedGroupingTableState => {
    return {
      groupingState: {
        groupOrder: [],
        groupVisibility: {},
        groupValues: {},
        showAggregates: true,
        hideEmptyGroups: true,
      },
      ...state,
    };
  },

  getDefaultTableOptions: (table) => {
    return {
      onGroupingStateChange: makeStateUpdater("groupingState", table),
    };
  },

  constructTableAPIs: (_table) => {
    const table = _table as unknown as TableInstance;
    const setGrouping = table.setGrouping.bind(table);
    const resetGrouping = table.resetGrouping.bind(table);

    const applyGroupingEntries = (
      entries: {
        id: string;
        value: ComparableValue;
        original: unknown;
      }[],
      options: { resetOrder?: boolean } = {},
    ) => {
      const nextIds = entries.map((entry) => entry.id);
      const nextIdSet = new Set(nextIds);
      const groupValues: ExtendedGroupingState["groupValues"] =
        Object.fromEntries(
          entries.map((entry) => [
            entry.id,
            { value: entry.value, original: entry.original },
          ]),
        );

      table._setGroupingState((prev) => {
        const groupOrder = options.resetOrder
          ? nextIds
          : [
              ...prev.groupOrder.filter((groupId) => nextIdSet.has(groupId)),
              ...nextIds.filter(
                (groupId) => !prev.groupOrder.includes(groupId),
              ),
            ];

        const groupVisibility = options.resetOrder
          ? {}
          : Object.fromEntries(
              Object.entries(prev.groupVisibility).filter(([groupId]) =>
                nextIdSet.has(groupId),
              ),
            );

        return {
          ...prev,
          groupOrder,
          groupValues,
          groupVisibility,
        };
      });
    };

    const getGroupingEntriesFromData = (rows: RowModel[]) => {
      const info = table.getGroupedColumnInfo();
      if (!info) return [];

      const plugin = table.getColumnPlugin(info.id);
      const groupingMethod = resolveGroupingMethod(plugin);
      const entries = new Map<
        string,
        {
          id: string;
          value: ComparableValue;
          original: unknown;
        }
      >();

      rows.forEach((row) => {
        const original: unknown = row.properties[info.id]?.value;
        const value = groupingMethod.function(original, row, info.id);
        const id = createGroupId(info.id, value);
        if (!entries.has(id)) {
          entries.set(id, { id, value, original });
        }
      });

      return Array.from(entries.values());
    };

    table.getGroupedColumnInfo = () => {
      const { grouping } = table.store.state;
      const groupedColumnId = grouping[0];
      if (!groupedColumnId) return null;
      return table.getColumnInfo(groupedColumnId);
    };
    table.getIsSomeGroupVisible = () => {
      const { groupOrder, groupVisibility } = table.store.state.groupingState;
      return groupOrder.some((groupId) => groupVisibility[groupId] ?? true);
    };
    table._setGroupingState = (updater) => {
      table.options.onGroupingStateChange?.(updater);
    };
    table._syncGroupingState = (options) => {
      applyGroupingEntries(
        getGroupingEntriesFromData(
          table.getPreGroupedRowModel().rows.map((row) => row.original),
        ),
        options,
      );
    };
    table._syncGroupingStateFromData = (rows, options) => {
      applyGroupingEntries(getGroupingEntriesFromData(rows), options);
    };
    table.setGrouping = (updater) => {
      setGrouping(updater);
      table._syncGroupingState({ resetOrder: true });
    };
    table.resetGrouping = (defaultState) => {
      resetGrouping(defaultState);
      table._syncGroupingState({ resetOrder: true });
    };
    table.setGroupingColumn = (updater) => {
      table.setGrouping((v) => {
        const colId = functionalUpdate(updater, v.length > 0 ? v[0]! : null);
        return colId ? [colId] : [];
      });
    };
    table.toggleHideEmptyGroups = () => {
      table._setGroupingState((v) => ({
        ...v,
        hideEmptyGroups: !v.hideEmptyGroups,
      }));
    };
    table.toggleGroupVisible = (groupId) => {
      table._setGroupingState((v) => ({
        ...v,
        groupVisibility: {
          ...v.groupVisibility,
          [groupId]: !(v.groupVisibility[groupId] ?? true),
        },
      }));
    };
    table.toggleAllGroupsVisible = () => {
      const someVisible = table.getIsSomeGroupVisible();
      table._setGroupingState((v) => {
        return {
          ...v,
          groupVisibility: v.groupOrder.reduce<Record<string, boolean>>(
            (acc, groupId) => {
              acc[groupId] = !someVisible;
              return acc;
            },
            {},
          ),
        };
      });
    };
    table.handleGroupedRowDragEnd = (e) => {
      table._setGroupingState((v) => ({
        ...v,
        groupOrder: getSortableItemsAfterDrag(v.groupOrder, e),
      }));
    };
    table._resetGroupingState = () => {
      table._setGroupingState((v) => ({
        ...v,
        groupOrder: [],
        groupVisibility: {},
        groupValues: {},
      }));
    };
    table.getGroupingValueRenderer = (groupId) => {
      return function Renderer(props) {
        const { groupValues } = table.store.state.groupingState;
        const info = table.getGroupedColumnInfo();
        if (!info) {
          console.error(
            `No grouping column id found for the grouped row ${groupId}`,
          );
          return null;
        }
        const plugin = table.getColumnPlugin(info.id);
        const resolvedProps = {
          ...props,
          value: groupValues[groupId]?.value ?? null,
          table,
        };
        if (plugin.renderGroupingValue) {
          return flexRender(plugin.renderGroupingValue, resolvedProps);
        }
        return flexRender(DefaultGroupingValue, resolvedProps);
      };
    };
    table.getPlaceholderGroupedRow = (groupId) => {
      const original: RowModel = {
        id: groupId,
        properties: {},
        createdAt: 0,
        lastEditedAt: 0,
      };
      return constructRow(table, groupId, original, 0, 0, []);
    };
  },

  assignRowPrototype: (prototype, _table) => {
    const table = _table as unknown as TableInstance;

    prototype.getShouldShowGroupAggregates = function () {
      return table.store.state.groupingState.showAggregates;
    };
    prototype.toggleGroupAggregates = function () {
      table._setGroupingState((v) => ({
        ...v,
        showAggregates: !v.showAggregates,
      }));
    };
    prototype.toggleGroupVisibility = function (this: {
      groupingColumnId?: string;
      id: string;
      getIsGrouped: () => boolean;
    }) {
      if (!this.groupingColumnId || !this.getIsGrouped()) return;
      table.toggleGroupVisible(this.id);
    };
    prototype.renderGroupingValue = function (
      this: { id: string },
      props: { className?: string },
    ) {
      return flexRender(table.getGroupingValueRenderer(this.id), props);
    };
  },
};
