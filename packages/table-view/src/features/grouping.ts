import type { DragEndEvent } from "@dnd-kit/core";
import type { OnChangeFn, TableFeature } from "@tanstack/react-table";
import { functionalUpdate, makeStateUpdater } from "@tanstack/react-table";

import { createDragEndUpdater } from "./utils";

export interface ExtendedGroupingState {
  groupOrder: string[];
  groupVisibility: Record<string, boolean>;
  showAggregates: boolean;
}

export interface ExtendedGroupingTableState {
  groupingState: ExtendedGroupingState;
}

export interface ExtendedGroupingOptions {
  onGroupingStateChange?: OnChangeFn<ExtendedGroupingState>;
}

export interface ExtendedGroupingTableApi {
  setGroupingState: OnChangeFn<ExtendedGroupingState>;
  handleGroupedRowDragEnd: (e: DragEndEvent) => void;
  resetGroupingState: () => void;
}

export interface ExtendedGroupingRowApi {
  getShouldShowGroupAggregates: () => boolean;
  getIsGroupVisible: () => boolean;
  toggleGroupAggregates: () => void;
  toggleGroupVisibility: () => void;
}

export const ExtendedGroupingFeature: TableFeature = {
  getInitialState: (state): ExtendedGroupingTableState => {
    return {
      groupingState: {
        groupOrder: [],
        groupVisibility: {},
        showAggregates: false,
      },
      ...state,
    };
  },

  getDefaultOptions: (table) => {
    return {
      onGroupingStateChange: makeStateUpdater("groupingState", table),
    };
  },

  createTable: (table) => {
    table.setGroupingState = (updater) => {
      table.options.onGroupingStateChange?.(updater);
      table.options.sync?.("table.setGroupingState");
    };
    table.handleGroupedRowDragEnd = (e) => {
      const updater = createDragEndUpdater<string>(e, (v) => v);
      table.setGroupingState((v) => ({
        ...v,
        groupOrder: functionalUpdate(updater, v.groupOrder),
      }));
    };
    table.resetGroupingState = () => {
      table.setGroupingState({
        groupOrder: [],
        groupVisibility: {},
        showAggregates: false,
      });
    };
  },

  createRow: (row, table) => {
    row.getShouldShowGroupAggregates = () => {
      return table.getState().groupingState.showAggregates;
    };
    row.toggleGroupAggregates = () => {
      table.setGroupingState((v) => ({
        ...v,
        showAggregates: !v.showAggregates,
      }));
    };
    row.getIsGroupVisible = () => {
      if (!row.groupingColumnId || !row.getIsGrouped()) return true;
      const { groupVisibility } = table.getState().groupingState;
      return groupVisibility[row.id] ?? true;
    };
    row.toggleGroupVisibility = () => {
      if (!row.groupingColumnId || !row.getIsGrouped()) return;
      table.setGroupingState((v) => ({
        ...v,
        groupVisibility: {
          ...v.groupVisibility,
          [row.id]: !(v.groupVisibility[row.id] ?? true),
        },
      }));
    };
  },
};
