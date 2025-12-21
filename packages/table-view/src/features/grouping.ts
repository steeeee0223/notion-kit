import type { DragEndEvent } from "@dnd-kit/core";
import type {
  OnChangeFn,
  Row,
  Table,
  TableFeature,
} from "@tanstack/react-table";
import {
  createRow,
  flexRender,
  functionalUpdate,
  makeStateUpdater,
} from "@tanstack/react-table";

import type { ColumnInfo, Row as RowModel } from "../lib/types";
import type { CellPlugin, ComparableValue, InferData } from "../plugins";
import { DefaultGroupingValue } from "../plugins";
import { createDragEndUpdater } from "./utils";

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
      original: InferData<CellPlugin>;
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
  getGroupingValueRenderer: (
    groupId: string,
  ) => (props: { className?: string }) => React.ReactNode;
  /**
   * Use this to render the empty group
   */
  getPlaceholderGroupedRow: (groupId: string) => Row<RowModel>;
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

  getDefaultOptions: (table) => {
    return {
      onGroupingStateChange: makeStateUpdater("groupingState", table),
    };
  },

  createTable: (table: Table<RowModel>) => {
    table.getGroupedColumnInfo = () => {
      const { grouping } = table.getState();
      if (grouping.length === 0) return null;
      return table.getColumnInfo(grouping[0]!);
    };
    table.getIsSomeGroupVisible = () => {
      const { groupOrder, groupVisibility } = table.getState().groupingState;
      return groupOrder.some((groupId) => groupVisibility[groupId] ?? true);
    };
    table._setGroupingState = (updater) => {
      table.options.onGroupingStateChange?.(updater);
      table.options.sync?.("table._setGroupingState");
    };
    table.setGroupingColumn = (updater) => {
      table.setGrouping((v) => {
        const colId = functionalUpdate(updater, v.length > 0 ? v[0]! : null);
        return colId ? [colId] : [];
      });
      table._resetGroupingState();
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
      const updater = createDragEndUpdater<string>(e, (v) => v);
      table._setGroupingState((v) => ({
        ...v,
        groupOrder: functionalUpdate(updater, v.groupOrder),
      }));
    };
    table._resetGroupingState = () => {
      table._setGroupingState((v) => ({
        ...v,
        groupOrder: [],
        groupVisibility: {},
      }));
    };
    table.getGroupingValueRenderer = (groupId) => {
      return function Renderer(props) {
        const { groupValues } = table.getState().groupingState;
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
      const { groupValues } = table.getState().groupingState;
      return createRow<RowModel>(
        table,
        groupId,
        groupValues[groupId]?.original as RowModel,
        0,
        0,
        [],
      );
    };
  },

  createRow: (row, table) => {
    row.getShouldShowGroupAggregates = () => {
      return table.getState().groupingState.showAggregates;
    };
    row.toggleGroupAggregates = () => {
      table._setGroupingState((v) => ({
        ...v,
        showAggregates: !v.showAggregates,
      }));
    };
    row.toggleGroupVisibility = () => {
      if (!row.groupingColumnId || !row.getIsGrouped()) return;
      table.toggleGroupVisible(row.id);
    };
    row.renderGroupingValue = (props) => {
      return flexRender(table.getGroupingValueRenderer(row.id), props);
    };
  },
};
