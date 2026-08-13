import {
  makeStateUpdater,
  type TableFeature,
  type Updater,
} from "@tanstack/react-table";
import { v4 } from "uuid";

import type { PluginMethodState } from "@/features/plugin-methods";
import type { _TableInstance } from "@/features/types";
import {
  resolveGroupingMethod,
  resolveSortingMethod,
  type GroupingMethod,
} from "@/methods";
import type { ResourceChangeFn, ViewResourceAction } from "@/table-contexts";

export enum TableViewMenuPage {
  Layout,
  Sort,
  Visibility,
  Props,
  DeletedProps,
  CreateProp,
  EditProp,
  ChangePropType,
  EditGroupBy,
  SelectGroupBy,
}

export interface TableMenuState {
  open: boolean;
  page: TableViewMenuPage | null;
  id?: string;
  data?: Record<string, unknown>;
}

export type LayoutType =
  | "table"
  | "board"
  | "timeline"
  | "calendar"
  | "list"
  | "gallery"
  | "chart";

export const LAYOUT_OPTIONS: {
  label: string;
  value: LayoutType;
}[] = [
  { label: "Table", value: "table" },
  { label: "Board", value: "board" },
  { label: "Timeline", value: "timeline" },
  { label: "Calendar", value: "calendar" },
  { label: "List", value: "list" },
  { label: "Gallery", value: "gallery" },
  { label: "Chart", value: "chart" },
];

export type RowViewType = "center" | "side" | "full";

export interface TimelineViewState {
  range: "daily" | "monthly" | "quarterly";
  datePropertyId: string | null;
}

export interface TableViewState {
  locked?: boolean;
  layout: LayoutType;
  rowView: RowViewType;
  openedRowId: string | null;
  timeline?: TimelineViewState;
  pluginMethods?: Partial<PluginMethodState>;
}

export type TableGlobalState = TableViewState;

export interface TableMenuTableState {
  menu: TableMenuState;
  tableGlobal: TableViewState;
}

export interface TableMenuOptions {
  getRowUrl?: (rowId: string) => string;
  onTableMenuChange?: (updater: Updater<TableMenuState>) => void;
  onTableGlobalChange?: ResourceChangeFn<TableViewState, ViewResourceAction>;
}

export interface TableMenuTableApi {
  getRowUrl: (rowId: string) => string;
  getTableMenuState: () => TableMenuState;
  setTableMenuState: (state: TableMenuState) => void;
  getTableGlobalState: () => TableViewState;
  setTableGlobalState: ResourceChangeFn<TableViewState, ViewResourceAction>;
  getSelectedSortingMethod: (
    colId: string,
  ) => ReturnType<typeof resolveSortingMethod>;
  setColumnSortingMethod: (colId: string, methodId: string) => void;
  getColumnGroupingMethods: (colId: string) => GroupingMethod[];
  getSelectedGroupingMethod: (
    colId: string,
  ) => ReturnType<typeof resolveGroupingMethod>;
  setColumnGroupingMethod: (colId: string, methodId: string) => void;
  getGroupSort: () => PluginMethodState["groupSort"];
  setGroupSort: (groupSort: PluginMethodState["groupSort"]) => void;
  toggleTableLocked: () => void;
  setTableLayout: (layout: LayoutType) => void;
  setTimelineRange: (range: TimelineViewState["range"]) => void;
  setTimelineDateProperty: (
    datePropertyId: string | null,
    operationId?: string,
  ) => void;
  openRow: (id: string | null) => void;
  openRowInFullPage: (id: string) => void;
  openRowInTab: (id: string) => void;
}

export const TableMenuFeature: TableFeature = {
  getInitialState: (state): TableMenuTableState => {
    return {
      menu: { open: false, page: null },
      tableGlobal: {
        locked: false,
        layout: "table",
        rowView: "side",
        openedRowId: null,
        timeline: { range: "monthly", datePropertyId: null },
      },
      ...state,
    };
  },

  getDefaultTableOptions: (table) => {
    return {
      onTableMenuChange: makeStateUpdater("menu", table),
      onTableGlobalChange: (updater) =>
        makeStateUpdater("tableGlobal", table)(updater),
    };
  },

  constructTableAPIs: (table) => {
    const instance = table as unknown as _TableInstance;

    instance.getRowUrl = (rowId: string) =>
      instance.options.getRowUrl?.(rowId) ?? "";
    instance.getTableMenuState = () => instance.atoms.menu.get();
    instance.setTableMenuState = (menu) => {
      instance.options.onTableMenuChange?.(menu);
    };
    instance.getTableGlobalState = () => instance.atoms.tableGlobal.get();
    instance.setTableGlobalState = (updater, action) => {
      instance.options.onTableGlobalChange?.(updater, action);
    };
    instance.getSelectedSortingMethod = (colId) => {
      const pluginMethods = instance.getTableGlobalState().pluginMethods;
      return resolveSortingMethod(
        instance.getColumnPlugin(colId),
        pluginMethods?.sortingMethodByColumn?.[colId],
      );
    };
    instance.setColumnSortingMethod = (colId, methodId) => {
      const actionId = v4();
      instance.setTableGlobalState(
        (view) => {
          if (view.pluginMethods?.sortingMethodByColumn?.[colId] === methodId) {
            return view;
          }
          return {
            ...view,
            pluginMethods: {
              ...view.pluginMethods,
              sortingMethodByColumn: {
                ...view.pluginMethods?.sortingMethodByColumn,
                [colId]: methodId,
              },
            },
          };
        },
        (previous, next) => ({
          id: actionId,
          type: "view.plugin_sorting_method.change",
          payload: {
            propertyId: colId,
            previousMethodId:
              previous.pluginMethods?.sortingMethodByColumn?.[colId],
            nextMethodId: next.pluginMethods?.sortingMethodByColumn?.[colId],
          },
        }),
      );
    };
    instance.getColumnGroupingMethods = (colId) =>
      instance.getColumnPlugin(colId).grouping?.methods ?? [];
    instance.getSelectedGroupingMethod = (colId) => {
      const pluginMethods = instance.getTableGlobalState().pluginMethods;
      return resolveGroupingMethod(
        instance.getColumnPlugin(colId),
        pluginMethods?.groupingMethodByColumn?.[colId],
      );
    };
    instance.setColumnGroupingMethod = (colId, methodId) => {
      const actionId = v4();
      instance.setTableGlobalState(
        (view) => {
          if (
            view.pluginMethods?.groupingMethodByColumn?.[colId] === methodId
          ) {
            return view;
          }
          return {
            ...view,
            pluginMethods: {
              ...view.pluginMethods,
              groupingMethodByColumn: {
                ...view.pluginMethods?.groupingMethodByColumn,
                [colId]: methodId,
              },
            },
          };
        },
        (previous, next) => ({
          id: actionId,
          type: "view.plugin_grouping_method.change",
          payload: {
            propertyId: colId,
            previousMethodId:
              previous.pluginMethods?.groupingMethodByColumn?.[colId],
            nextMethodId: next.pluginMethods?.groupingMethodByColumn?.[colId],
          },
        }),
      );
    };
    instance.getGroupSort = () =>
      instance.getTableGlobalState().pluginMethods?.groupSort ?? {
        mode: "manual",
      };
    instance.setGroupSort = (groupSort) => {
      const actionId = v4();
      instance.setTableGlobalState(
        (view) => {
          const previousGroupSort = view.pluginMethods?.groupSort ?? {
            mode: "manual" as const,
          };
          if (isSameGroupSort(previousGroupSort, groupSort)) {
            return view;
          }
          return {
            ...view,
            pluginMethods: { ...view.pluginMethods, groupSort },
          };
        },
        (previous, next) => ({
          id: actionId,
          type: "view.group_sort.change",
          payload: {
            previousGroupSort: previous.pluginMethods?.groupSort ?? {
              mode: "manual",
            },
            nextGroupSort: next.pluginMethods?.groupSort ?? { mode: "manual" },
          },
        }),
      );
    };
    instance.toggleTableLocked = () => {
      const actionId = v4();
      instance.baseAtoms.rowSelection.set({});
      instance.setTableGlobalState(
        (v) => ({ ...v, locked: !v.locked }),
        (previous, next) => ({
          id: actionId,
          type: "view.lock.change",
          payload: {
            previousLocked: previous.locked,
            nextLocked: next.locked,
          },
        }),
      );
    };
    instance.setTableLayout = (layout) => {
      const actionId = v4();
      instance.setTableGlobalState(
        (v) => ({ ...v, layout }),
        (previous, next) => ({
          id: actionId,
          type: "view.layout.change",
          payload: {
            previousLayout: previous.layout,
            nextLayout: next.layout,
          },
        }),
      );
    };
    instance.setTimelineRange = (range) => {
      const actionId = v4();
      instance.setTableGlobalState(
        (view) => {
          if (view.timeline!.range === range) return view;
          return {
            ...view,
            timeline: { ...view.timeline!, range },
          };
        },
        (previous, next) => ({
          id: actionId,
          type: "view.timeline_range.change",
          payload: {
            previousRange: previous.timeline!.range,
            nextRange: next.timeline!.range,
          },
        }),
      );
    };
    instance.setTimelineDateProperty = (datePropertyId, operationId) => {
      const actionId = operationId ?? v4();
      instance.setTableGlobalState(
        (view) => ({
          ...view,
          timeline: { ...view.timeline!, datePropertyId },
        }),
        (previous, next) => ({
          id: actionId,
          type: "view.timeline_property.change",
          payload: {
            previousDatePropertyId: previous.timeline!.datePropertyId,
            nextDatePropertyId: next.timeline!.datePropertyId,
          },
        }),
      );
    };
    /** Row view */
    instance.openRow = (id) => {
      const { rowView } = instance.getTableGlobalState();
      if (id && rowView === "full") {
        instance.openRowInFullPage(id);
        return;
      }
      const actionId = v4();
      instance.setTableGlobalState(
        (v) => ({ ...v, openedRowId: id }),
        (previous, next) => ({
          id: actionId,
          type: "view.opened_row.change",
          payload: {
            previousRowId: previous.openedRowId,
            nextRowId: next.openedRowId,
            previousRowView: previous.rowView,
            nextRowView: next.rowView,
          },
        }),
      );
    };
    instance.openRowInFullPage = (id) => {
      const actionId = v4();
      instance.setTableGlobalState(
        (v) => ({
          ...v,
          openedRowId: id,
          rowView: "full",
        }),
        (previous, next) => ({
          id: actionId,
          type: "view.opened_row.change",
          payload: {
            previousRowId: previous.openedRowId,
            nextRowId: next.openedRowId,
            previousRowView: previous.rowView,
            nextRowView: next.rowView,
          },
        }),
      );
      const url = instance.getRowUrl(id);
      if (!url || typeof window === "undefined") return;
      window.open(url, "_self");
    };
    instance.openRowInTab = (id) => {
      const url = instance.getRowUrl(id);
      if (typeof window === "undefined") return;
      window.open(url, "_blank", "noopener,noreferrer");
    };
  },
};

function isSameGroupSort(
  left: PluginMethodState["groupSort"],
  right: PluginMethodState["groupSort"],
) {
  if (left.mode !== right.mode) return false;
  if (left.mode === "manual") return true;
  return right.mode !== "manual" && left.method === right.method;
}
