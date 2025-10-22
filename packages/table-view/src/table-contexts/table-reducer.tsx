import type { SortingState, Updater } from "@tanstack/react-table";
import { functionalUpdate } from "@tanstack/react-table";
import { v4 } from "uuid";

import type { IconData } from "@notion-kit/icon-block";

import type { Cell, ColumnInfo, PluginsMap, Row, Rows } from "../lib/types";
import { getDefaultCell, getUniqueName, insertAt, NEVER } from "../lib/utils";
import type { CellPlugin, InferPlugin } from "../plugins";
import type { AddColumnPayload } from "./types";

export interface TableViewAtom<TPlugins extends CellPlugin[] = CellPlugin[]> {
  /**
   * @field global table state
   */
  table: {
    sorting: SortingState;
  };
  /**
   * @field property definitions
   * @param key property (column) id
   */
  properties: Record<string, ColumnInfo<InferPlugin<TPlugins>>>;
  /**
   * @field array of ordered property (column) ids
   * @note freezed columns: `propertiesOrder.slice(0, freezedIndex + 1)`
   */
  propertiesOrder: string[];
  /**
   * @field array of ordered data (row) ids
   */
  dataOrder: string[];
  /**
   * @field data of each row
   * @param key property (column) id
   */
  data: Rows<TPlugins>;
}

export type TableViewAction<TPlugins extends CellPlugin[]> =
  | { type: "add:col"; payload: AddColumnPayload<TPlugins> }
  | {
      type: "update:col";
      payload: { id: string };
      updater: Updater<ColumnInfo<InferPlugin<TPlugins>>>;
    }
  | { type: "set:col:order" | "set:row:order"; updater: Updater<string[]> }
  | {
      type: "delete:col" | "duplicate:col" | "delete:row" | "duplicate:row";
      payload: { id: string };
    }
  | { type: "add:row"; payload?: { id: string; at: "prev" | "next" } }
  | { type: "update:row:icon"; payload: { id: string; icon: IconData | null } }
  | {
      type: "update:cell";
      payload: {
        rowId: string;
        colId: string;
        data: Cell<CellPlugin>;
      };
    }
  | { type: "set:table:data"; payload: Rows<TPlugins> }
  | { type: "update:sorting"; updater: Updater<SortingState> }
  | { type: "reset" };

function tableViewReducer<TPlugins extends CellPlugin[]>(
  p: PluginsMap<TPlugins>,
  v: TableViewAtom<TPlugins>,
  a: TableViewAction<TPlugins>,
): TableViewAtom<TPlugins> {
  switch (a.type) {
    case "add:col": {
      const { id: colId, type, name, at } = a.payload;
      const plugin = p[type];
      const data = { ...v.data };
      v.dataOrder.forEach((rowId) => {
        if (!data[rowId]) return NEVER;
        data[rowId] = {
          ...data[rowId],
          properties: {
            ...data[rowId].properties,
            [colId]: getDefaultCell(plugin),
          },
        };
      });
      const properties = { ...v.properties };
      properties[colId] = {
        id: colId,
        name,
        type: plugin.id,
        config: plugin.default.config,
      };
      return {
        ...v,
        properties,
        get propertiesOrder() {
          if (at === undefined) return [...v.propertiesOrder, colId];
          const idx = v.propertiesOrder.indexOf(at.id);
          return at.side === "right"
            ? insertAt(v.propertiesOrder, colId, idx + 1)
            : insertAt(v.propertiesOrder, colId, idx);
        },
        data,
      };
    }
    case "update:col": {
      const prop = v.properties[a.payload.id];
      if (!prop) return v as never;
      const info = functionalUpdate(a.updater, prop);
      return {
        ...v,
        properties: {
          ...v.properties,
          [a.payload.id]: { ...prop, ...info },
        },
      };
    }
    case "duplicate:col": {
      const src = v.properties[a.payload.id];
      const idx = v.propertiesOrder.indexOf(a.payload.id);
      if (!src || idx < 0) return v as never;
      const prop = {
        ...src,
        id: v4(),
        name: getUniqueName(
          src.name,
          Object.values(v.properties).map((col) => col.name),
        ),
      };
      const data = { ...v.data };
      v.dataOrder.forEach((rowId) => {
        data[rowId]!.properties[prop.id] = getDefaultCell(p[src.type]);
      });
      return {
        ...v,
        properties: { ...v.properties, [prop.id]: prop },
        propertiesOrder: insertAt(v.propertiesOrder, prop.id, idx + 1),
        data,
      };
    }
    case "delete:col": {
      const idx = v.propertiesOrder.indexOf(a.payload.id);
      if (idx < 0) return v as never;
      const { [a.payload.id]: _, ...properties } = v.properties;
      const data = { ...v.data };
      v.dataOrder.forEach((rowId) => {
        delete data[rowId]!.properties[a.payload.id];
      });

      return {
        ...v,
        properties,
        propertiesOrder: v.propertiesOrder.filter(
          (colId) => colId !== a.payload.id,
        ),
        data,
      };
    }
    case "add:row": {
      const row: Row<TPlugins> = { id: v4(), properties: {} };
      v.propertiesOrder.forEach((colId) => {
        const type = v.properties[colId]!.type;
        row.properties[colId] = getDefaultCell(p[type]);
      });
      return {
        ...v,
        get dataOrder() {
          if (a.payload === undefined) return [...v.dataOrder, row.id];
          const idx = v.dataOrder.indexOf(a.payload.id);
          return a.payload.at === "next"
            ? insertAt(v.dataOrder, row.id, idx + 1)
            : insertAt(v.dataOrder, row.id, idx);
        },
        data: { ...v.data, [row.id]: row },
      };
    }
    case "duplicate:row": {
      const row = { ...v.data[a.payload.id]!, id: v4() };
      v.propertiesOrder.forEach((colId) => (row.properties[colId]!.id = v4()));
      return {
        ...v,
        data: { ...v.data, [row.id]: row },
        get dataOrder() {
          const idx = v.dataOrder.indexOf(a.payload.id);
          return insertAt(v.dataOrder, row.id, idx + 1);
        },
      };
    }
    case "update:row:icon": {
      const row = v.data[a.payload.id];
      if (!row) return v as never;
      row.icon = a.payload.icon ?? undefined;
      const colId = v.propertiesOrder.find(
        (propId) => v.properties[propId]?.type === "title",
      )!;
      row.properties[colId]!.value.icon = a.payload.icon ?? undefined;
      return { ...v, data: { ...v.data, [a.payload.id]: row } };
    }
    case "delete:row": {
      const { [a.payload.id]: _, ...data } = v.data;
      return {
        ...v,
        dataOrder: v.dataOrder.filter((rowId) => rowId !== a.payload.id),
        data,
      };
    }
    case "set:table:data": {
      return { ...v, data: a.payload };
    }
    case "update:cell": {
      const data = { ...v.data };
      data[a.payload.rowId]!.properties[a.payload.colId] = a.payload.data;
      return { ...v, data };
    }
    case "update:sorting": {
      const sorting = functionalUpdate(a.updater, v.table.sorting);
      return { ...v, table: { ...v.table, sorting } };
    }
    case "set:col:order": {
      return {
        ...v,
        propertiesOrder: functionalUpdate(a.updater, v.propertiesOrder),
      };
    }
    case "set:row:order": {
      return { ...v, dataOrder: functionalUpdate(a.updater, v.dataOrder) };
    }
    case "reset":
      return {
        table: {
          sorting: [],
        },
        properties: {},
        propertiesOrder: [],
        dataOrder: [],
        data: {},
      };
    default:
      return v;
  }
}

export function createTableViewReducer<TPlugins extends CellPlugin[]>(
  plugins: PluginsMap<TPlugins>,
) {
  return (v: TableViewAtom<TPlugins>, a: TableViewAction<TPlugins>) =>
    tableViewReducer<TPlugins>(plugins, v, a);
}
