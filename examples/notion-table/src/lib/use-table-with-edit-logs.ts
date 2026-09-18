import { useRef, useState } from "react";

import {
  DEFAULT_PLUGINS,
  type ColumnDefs,
  type DataResourceAction,
  type EditLogProps,
  type PropertiesResourceAction,
  type ResourceChange,
  type Row,
  type RowEditLog,
  type TableEditLog,
  type TablePluginRegistry,
  type TableViewState,
  type ViewResourceAction,
} from "@notion-kit/table-view";

import { mockData, mockProps } from "./data";

type StoredRowEditLog = RowEditLog & { target: TableEditLog["target"] };
type StoredEditLog = TableEditLog | StoredRowEditLog;

const plugins: TablePluginRegistry = DEFAULT_PLUGINS;
/** This example keeps history in memory for the current page session. */
export function useTableWithEditLogs() {
  const [data, setData] = useState(mockData);
  const [properties, setProperties] = useState(mockProps);
  const [history, setHistory] = useState<StoredEditLog[]>([]);
  const propertyActionId = useRef<string | null>(null);

  function append(records: StoredEditLog[]) {
    const snapshots = structuredClone(records);
    setHistory((previous) => [...snapshots, ...previous]);
  }

  function rowName(row: Row) {
    const title = properties.find((property) => property.type === "title")!;
    const name = String(row.properties[title.id]?.value ?? "");
    return name.length ? name : "Untitled";
  }

  function onDataChange({
    next,
    action,
  }: ResourceChange<Row[], DataResourceAction>) {
    setData(next);
    const editedAt = Date.now();
    if (action.type === "data.cell.update") {
      // Property operations also initialize or convert cells with the same action ID.
      if (action.id === propertyActionId.current) return;
      const property = properties.find(
        (item) => item.id === action.payload.propertyId,
      )!;
      const rowIds = action.payload.rowIds ?? [action.payload.rowId];
      const rows = next.filter((row) => rowIds.includes(row.id));
      const records = rows.map((row): StoredRowEditLog => {
        const value: unknown = row.properties[property.id]?.value ?? null;
        const plugin = plugins.data.find((item) => item.id === property.type)!;
        const textValue = plugin.toTextValue(value, row);
        return {
          id: `${action.id}:${row.id}`,
          editedAt,
          rowId: row.id,
          target: { id: row.id, name: rowName(row) },
          property: {
            id: property.id,
            name: property.name,
            type: property.type,
            icon: property.icon,
            config: property.config as unknown,
          },
          value,
          textValue: textValue === "" ? "Empty" : textValue,
        };
      });
      append(records);
      return;
    }
    const actions = {
      "data.row.create": "create-row",
      "data.row.update": "update-row",
      "data.row.delete": "delete-rows",
      "data.row.duplicate": "duplicate-row",
      "data.rows.duplicate": "duplicate-rows",
      "data.row.move": "move-row",
    } as const;
    const rowId = "rowId" in action.payload ? action.payload.rowId : undefined;
    const row = next.find((item) => item.id === rowId);
    append([
      {
        id: action.id,
        editedAt,
        action: actions[action.type],
        target: { id: rowId, name: row ? rowName(row) : "Rows" },
      },
    ]);
  }

  function onPropertiesChange({
    next,
    action,
  }: ResourceChange<ColumnDefs, PropertiesResourceAction>) {
    setProperties(next);
    propertyActionId.current = action.id;
    const actions = {
      "properties.create": "create",
      "properties.update": "update-config",
      "properties.delete": "delete",
      "properties.restore": "restore",
      "properties.duplicate": "duplicate",
      "properties.move": "move",
      "properties.resize": "resize",
      "properties.visibility.change": "show",
      "properties.type.change": "change-type",
    } as const;
    const propertyIds =
      action.type === "properties.visibility.change"
        ? action.payload.propertyIds
        : [action.payload.propertyId];
    const editedAt = Date.now();
    append(
      propertyIds.map((id): TableEditLog => {
        const property = (next.find((item) => item.id === id) ??
          properties.find((item) => item.id === id))!;
        const tableAction = [
          "properties.create",
          "properties.duplicate",
          "properties.delete",
          "properties.restore",
        ].includes(action.type);
        return {
          id: `${action.id}:${id}`,
          editedAt,
          action:
            action.type === "properties.visibility.change"
              ? property.hidden
                ? "hide"
                : "show"
              : action.type === "properties.update" &&
                  action.payload.previous.name !== property.name
                ? "rename"
                : actions[action.type],
          target: { id, name: property.name },
          property: tableAction
            ? undefined
            : {
                id,
                name: property.name,
                type: property.type,
                icon: property.icon,
              },
        };
      }),
    );
  }

  function onViewChange({
    action,
  }: ResourceChange<TableViewState, ViewResourceAction>) {
    // Opening a row is navigation and does not change the saved table.
    if (action.type === "view.opened_row.change") return;
    if (action.type === "view.plugin_sorting_method.change") {
      const property = properties.find(
        (item) => item.id === action.payload.propertyId,
      )!;
      const defaultMethod = plugins.data.find(
        (plugin) => plugin.id === property.type,
      )!.sorting?.defaultMethod;
      // Adding a sort rule also saves its default method, without changing the method.
      if (
        (action.payload.previousMethodId ?? defaultMethod) ===
        action.payload.nextMethodId
      )
        return;
    }
    const actions = {
      "view.filters.change": "filter",
      "view.layout.change": "change-layout",
      "view.lock.change": "lock",
      "view.row_display.change": "change-row-display",
      "view.date_view_range.change": "change-date-range",
      "view.date_view_property.change": "change-date-property",
      "view.plugin_sorting_method.change": "sort",
      "view.plugin_grouping_method.change": "update-grouping",
      "view.group_sort.change": "sort-groups",
    } as const;
    append([
      {
        id: action.id,
        editedAt: Date.now(),
        action:
          action.type === "view.lock.change"
            ? action.payload.nextLocked
              ? "lock"
              : "unlock"
            : actions[action.type],
        target: { name: "View" },
        layout:
          action.type === "view.layout.change"
            ? action.payload.nextLayout
            : undefined,
      },
    ]);
  }

  function onSortingChange() {
    append([
      {
        id: crypto.randomUUID(),
        editedAt: Date.now(),
        action: "sort",
        target: { name: "View" },
      },
    ]);
  }

  function onGroupingChange(propertyId?: string) {
    append([
      {
        id: crypto.randomUUID(),
        editedAt: Date.now(),
        action: "group",
        target: { name: "View" },
        groupBy: propertyId
          ? properties.find((property) => property.id === propertyId)!
          : undefined,
      },
    ]);
  }

  const editLogs: Required<EditLogProps> = {
    fetchTableEditLogs: () =>
      Promise.resolve({
        items: history.map(
          (record): TableEditLog =>
            "rowId" in record
              ? {
                  id: record.id,
                  editedAt: record.editedAt,
                  action: "update",
                  target: record.target,
                  cell: {
                    property: record.property,
                    value: record.value,
                    textValue: record.textValue,
                  },
                }
              : record,
        ),
        nextCursor: null,
      }),
    fetchRowEditLogs: ({ rowId }) =>
      Promise.resolve({
        items: history.filter(
          (record): record is StoredRowEditLog =>
            "rowId" in record && record.rowId === rowId,
        ),
        nextCursor: null,
      }),
  };

  return {
    data,
    properties,
    onDataChange,
    onPropertiesChange,
    onViewChange,
    onSortingChange,
    onGroupingChange,
    ...editLogs,
  };
}
