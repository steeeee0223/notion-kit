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
const propertySummaries = {
  "properties.create": "Created property",
  "properties.update": "Updated property settings",
  "properties.delete": "Deleted property",
  "properties.restore": "Restored property",
  "properties.duplicate": "Duplicated property",
  "properties.move": "Moved property",
  "properties.resize": "Resized property",
  "properties.visibility.change": "Changed property visibility",
  "properties.type.change": "Changed property type",
} satisfies Record<PropertiesResourceAction["type"], string>;

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
          target: { id: row.id, name: `${rowName(row)} · ${property.name}` },
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
    const summaries = {
      "data.row.create": "Created row",
      "data.row.update": "Updated row details",
      "data.row.delete": "Deleted rows",
      "data.row.duplicate": "Duplicated row",
      "data.rows.duplicate": "Duplicated rows",
      "data.row.move": "Moved row",
    };
    const rowId = "rowId" in action.payload ? action.payload.rowId : undefined;
    const row = next.find((item) => item.id === rowId);
    append([
      {
        id: action.id,
        editedAt,
        action: action.type.split(".").at(-1)!,
        target: { id: rowId, name: row ? rowName(row) : "Rows" },
        summary: summaries[action.type],
      },
    ]);
  }

  function onPropertiesChange({
    next,
    action,
  }: ResourceChange<ColumnDefs, PropertiesResourceAction>) {
    setProperties(next);
    propertyActionId.current = action.id;
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
            action.type === "properties.type.change"
              ? "change-type"
              : action.type === "properties.visibility.change"
                ? property.hidden
                  ? "hide"
                  : "show"
                : action.type.split(".").at(-1)!,
          target: { id, name: property.name },
          property: tableAction
            ? undefined
            : {
                id,
                name: property.name,
                type: property.type,
                icon: property.icon,
              },
          summary:
            action.type === "properties.update" &&
            action.payload.next.name !== undefined
              ? `Renamed to ${property.name}`
              : propertySummaries[action.type],
        };
      }),
    );
  }

  function onViewChange({
    action,
  }: ResourceChange<TableViewState, ViewResourceAction>) {
    // Opening a row is navigation and does not change the saved table.
    if (action.type === "view.opened_row.change") return;
    const summaries = {
      "view.filters.change": "Updated filters",
      "view.layout.change": "Changed layout",
      "view.lock.change": "Changed database lock",
      "view.row_display.change": "Changed row display",
      "view.date_view_range.change": "Changed date range",
      "view.date_view_property.change": "Changed date property",
      "view.plugin_sorting_method.change": "Changed sorting method",
      "view.plugin_grouping_method.change": "Changed grouping method",
      "view.group_sort.change": "Changed group order",
    };
    append([
      {
        id: action.id,
        editedAt: Date.now(),
        action:
          action.type === "view.layout.change"
            ? "change-layout"
            : "update-config",
        target: { name: "View" },
        summary:
          action.type === "view.layout.change"
            ? `Changed layout to ${action.payload.nextLayout}`
            : summaries[action.type],
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
                  property: record.property,
                  summary: record.textValue,
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
    ...editLogs,
  };
}
