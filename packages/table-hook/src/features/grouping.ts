import type { DragEndEvent } from "@dnd-kit/react";
import type { OnChangeFn, TableFeature } from "@tanstack/react-table";
import {
  constructRow,
  flexRender,
  functionalUpdate,
  makeStateUpdater,
} from "@tanstack/react-table";

import { getSortableItemsAfterDrag } from "@notion-kit/ui/primitives";

import type { _RowInstance, _TableInstance } from "@/features/types";
import { createGroupId } from "@/features/utils";
import type { ColumnInfo, Row as RowModel } from "@/lib/types";
import {
  getGroupSortableSortingMethods,
  resolveGroupSortingMethod,
  type Weekday,
} from "@/methods";
import type { ComparableValue } from "@/plugins";
import { DefaultGroupingValue } from "@/plugins";
import { createRuntimePluginMethodContext } from "@/table-contexts/plugin-method-context";

import type { PluginMethodState } from "./plugin-methods";

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
      sortValue: ComparableValue;
      original: unknown;
    }
  >;
  showAggregates: boolean;
  hideEmptyGroups: boolean;
}

interface SyncGroupingStateOptions {
  resetOrder?: boolean;
  groupSort?: PluginMethodState["groupSort"];
}

export interface ExtendedGroupingTableState {
  groupingState: ExtendedGroupingState;
}

export interface ExtendedGroupingOptions {
  onGroupingStateChange?: OnChangeFn<ExtendedGroupingState>;
  weekStartsOn?: Weekday;
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
  _syncGroupingState: (options?: SyncGroupingStateOptions) => void;
  _syncGroupingStateFromData: (
    rows: RowModel[],
    options?: { resetOrder?: boolean },
  ) => void;
  _settlePendingGroupedRowDrag: (
    groupSort: PluginMethodState["groupSort"],
  ) => void;
  getGroupingValueRenderer: (
    groupId: string,
  ) => (props: { className?: string }) => React.ReactNode;
  /**
   * Use this to render the empty group
   */
  getPlaceholderGroupedRow: (groupId: string) => _RowInstance;
}

export interface ExtendedGroupingRowApi {
  getShouldShowGroupAggregates: () => boolean;
  toggleGroupAggregates: () => void;
  toggleGroupVisibility: () => void;
  getGroupSelectionState: () => "checked" | "indeterminate" | "unchecked";
  toggleGroupSelection: () => void;
  renderGroupingValue: (props: { className?: string }) => React.ReactNode;
}

interface GroupSelectionRow {
  id: string;
  subRows: GroupSelectionRow[];
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
    const table = _table as unknown as _TableInstance;
    const setGrouping = table.setGrouping.bind(table);
    const resetGrouping = table.resetGrouping.bind(table);
    let pendingDraggedGroupOrder: string[] | undefined;

    interface GroupingEntry {
      id: string;
      value: ComparableValue;
      sortValue: ComparableValue;
      original: unknown;
    }

    const applyGroupingEntries = (
      entries: GroupingEntry[],
      options: {
        resetOrder?: boolean;
        groupSort?: PluginMethodState["groupSort"];
        groupOrder?: string[];
      } = {},
    ) => {
      const nextIds = entries.map((entry) => entry.id);
      const nextIdSet = new Set(nextIds);
      const groupValues: ExtendedGroupingState["groupValues"] =
        Object.fromEntries(
          entries.map((entry) => [
            entry.id,
            {
              value: entry.value,
              sortValue: entry.sortValue,
              original: entry.original,
            },
          ]),
        );
      const groupSort = options.groupSort ?? table.getGroupSort();
      const automaticGroupOrder = getAutomaticGroupOrder(entries, groupSort);

      table._setGroupingState((prev) => {
        const groupOrder =
          options.groupOrder ??
          automaticGroupOrder ??
          (options.resetOrder
            ? nextIds
            : [
                ...prev.groupOrder.filter((groupId) => nextIdSet.has(groupId)),
                ...nextIds.filter(
                  (groupId) => !prev.groupOrder.includes(groupId),
                ),
              ]);

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

    const getAutomaticGroupOrder = (
      entries: GroupingEntry[],
      groupSort: PluginMethodState["groupSort"],
    ) => {
      if (groupSort.mode === "manual") return undefined;

      const info = table.getGroupedColumnInfo();
      if (!info) return entries.map((entry) => entry.id);
      const context = createRuntimePluginMethodContext(
        table,
        info.id,
        info.config,
        table.options.weekStartsOn ?? 1,
      );

      const sortingMethod = resolveGroupSortingMethod(
        table.getColumnPlugin(info.id),
        groupSort.method,
        context,
      );
      if (!sortingMethod) {
        return entries.map((entry) => entry.id);
      }

      return entries
        .slice()
        .sort((left, right) => {
          const leftIsEmpty = left.sortValue === null;
          const rightIsEmpty = right.sortValue === null;
          if (leftIsEmpty || rightIsEmpty) {
            if (leftIsEmpty && rightIsEmpty)
              return left.id.localeCompare(right.id);
            return leftIsEmpty ? 1 : -1;
          }

          const comparison = sortingMethod.compare(
            left.sortValue,
            right.sortValue,
          );
          return comparison === 0
            ? left.id.localeCompare(right.id)
            : groupSort.mode === "descending"
              ? -comparison
              : comparison;
        })
        .map((entry) => entry.id);
    };

    const getGroupingEntriesFromData = (rows: RowModel[]) => {
      const info = table.getGroupedColumnInfo();
      if (!info) return [];

      const groupingMethod = table.getSelectedGroupingMethod(info.id);
      const context = createRuntimePluginMethodContext(
        table,
        info.id,
        info.config,
        table.options.weekStartsOn ?? 1,
      );
      const entries = new Map<string, GroupingEntry>();

      rows.forEach((row) => {
        const original: unknown = row.properties[info.id]?.value;
        const value = groupingMethod.function(original, row, info.id, context);
        const id = createGroupId(info.id, value);
        if (!entries.has(id)) {
          entries.set(id, {
            id,
            value,
            sortValue: groupingMethod.toSortValue?.(value, context) ?? value,
            original,
          });
        }
      });

      if (table._isKanbanDragActive()) {
        const previous = table.atoms.groupingState.get();
        previous.groupOrder.forEach((id) => {
          const entry = previous.groupValues[id];
          if (entry && !entries.has(id)) entries.set(id, { id, ...entry });
        });
      }

      return Array.from(entries.values());
    };

    table.getGroupedColumnInfo = () => {
      const grouping = table.atoms.grouping.get();
      const groupedColumnId = grouping[0];
      if (!groupedColumnId) return null;
      return table.getColumnInfo(groupedColumnId);
    };
    table.getIsSomeGroupVisible = () => {
      const { groupOrder, groupVisibility } = table.atoms.groupingState.get();
      return groupOrder.some((groupId) => groupVisibility[groupId] ?? true);
    };
    table._setGroupingState = (updater) => {
      table.options.onGroupingStateChange?.(updater);
    };
    table._syncGroupingState = (options) => {
      const syncOptions = options ?? {};
      const entries = getGroupingEntriesFromData(
        table.getPreGroupedRowModel().rows.map((row) => row.original),
      );
      const draggedGroupOrder = pendingDraggedGroupOrder;
      if (draggedGroupOrder) {
        const groupSort = syncOptions.groupSort ?? table.getGroupSort();
        if (groupSort.mode !== "manual") {
          applyGroupingEntries(entries, syncOptions);
          return;
        }
        pendingDraggedGroupOrder = undefined;
        const nextIdSet = new Set(entries.map((entry) => entry.id));
        const groupOrder = [
          ...draggedGroupOrder.filter((groupId) => nextIdSet.has(groupId)),
          ...entries
            .map((entry) => entry.id)
            .filter((groupId) => !draggedGroupOrder.includes(groupId)),
        ];
        applyGroupingEntries(entries, { ...syncOptions, groupOrder });
        return;
      }
      applyGroupingEntries(entries, syncOptions);
    };
    table._syncGroupingStateFromData = (rows, options) => {
      applyGroupingEntries(getGroupingEntriesFromData(rows), options);
    };
    table._settlePendingGroupedRowDrag = (groupSort) => {
      if (!pendingDraggedGroupOrder) return;
      if (groupSort.mode !== "manual") {
        pendingDraggedGroupOrder = undefined;
      }
      table._syncGroupingState({ groupSort });
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
      const grouping = table.atoms.grouping.get();
      const colId = functionalUpdate(
        updater,
        grouping.length > 0 ? grouping[0]! : null,
      );
      table.setGrouping(colId ? [colId] : []);
      const groupSort = table.getGroupSort();
      if (groupSort.mode === "manual") return;
      if (!colId) {
        table.setGroupSort({ mode: "manual" });
        return;
      }
      const plugin = table.getColumnPlugin(colId);
      const methods = getGroupSortableSortingMethods(plugin);
      if (methods.some((method) => method.id === groupSort.method)) return;
      const defaultMethod =
        methods.find((method) => method.id === plugin.sorting?.defaultMethod) ??
        methods[0];
      table.setGroupSort(
        defaultMethod
          ? { ...groupSort, method: defaultMethod.id }
          : { mode: "manual" },
      );
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
      const currentOrder = table.atoms.groupingState.get().groupOrder;
      const groupOrder = getSortableItemsAfterDrag(currentOrder, e);
      if (groupOrder === currentOrder) return;

      pendingDraggedGroupOrder = groupOrder;
      if (table.getGroupSort().mode === "manual") {
        table._syncGroupingState();
        return;
      }
      table.setGroupSort({ mode: "manual" });
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
        const { groupValues } = table.atoms.groupingState.get();
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
    const table = _table as unknown as _TableInstance;

    prototype.getShouldShowGroupAggregates = function () {
      return table.atoms.groupingState.get().showAggregates;
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
    prototype.getGroupSelectionState = function (this: {
      id: string;
      getIsGrouped: () => boolean;
      subRows: GroupSelectionRow[];
    }) {
      if (!this.getIsGrouped()) return "unchecked";
      return getLeafSelectionState(table, getDescendantLeafIds(this));
    };
    prototype.toggleGroupSelection = function (this: {
      id: string;
      getIsGrouped: () => boolean;
      subRows: GroupSelectionRow[];
    }) {
      if (!this.getIsGrouped()) return;
      const leafIds = getDescendantLeafIds(this);
      const select = getLeafSelectionState(table, leafIds) !== "checked";
      table.setRowSelection((previous) => {
        const next = { ...previous };
        let changed = false;
        for (const rowId of leafIds) {
          if (select && !next[rowId]) {
            next[rowId] = true;
            changed = true;
          }
          if (!select && next[rowId]) {
            delete next[rowId];
            changed = true;
          }
        }
        return changed ? next : previous;
      });
    };
    prototype.renderGroupingValue = function (
      this: { id: string },
      props: { className?: string },
    ) {
      return flexRender(table.getGroupingValueRenderer(this.id), props);
    };
  },
};

function getDescendantLeafIds(row: GroupSelectionRow): string[] {
  return row.subRows.flatMap((subRow) =>
    subRow.subRows.length > 0 ? getDescendantLeafIds(subRow) : [subRow.id],
  );
}

function getLeafSelectionState(
  table: _TableInstance,
  leafIds: string[],
): "checked" | "indeterminate" | "unchecked" {
  if (leafIds.length === 0) return "unchecked";
  const selectedRowIds = new Set(table.getSelectedRowIds());
  const selectedLeafCount = leafIds.filter((rowId) =>
    selectedRowIds.has(rowId),
  ).length;
  if (selectedLeafCount === leafIds.length) return "checked";
  return selectedLeafCount > 0 ? "indeterminate" : "unchecked";
}
