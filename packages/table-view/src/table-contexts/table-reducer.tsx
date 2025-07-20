import type { SortingState, Updater } from "@tanstack/react-table";
import { v4 } from "uuid";

import type { IconData } from "@notion-kit/icon-block";

import {
  transferPropertyConfig,
  transferPropertyValues,
} from "../lib/data-transfer";
import type {
  CellDataType,
  DatabaseProperty,
  PropertyType,
  RowDataType,
} from "../lib/types";
import {
  getDefaultCell,
  getDefaultPropConfig,
  getUniqueName,
  insertAt,
} from "../lib/utils";
import {
  SelectConfigActionPayload,
  selectConfigReducer,
} from "./select-config-reducer";
import type { AddColumnPayload, UpdateColumnPayload } from "./types";
import { getState } from "./utils";

const NEVER = undefined as never;

export interface TableViewAtom {
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
  properties: Record<string, DatabaseProperty>;
  /**
   * @field column freezing up to the given `index` in `propertiesOrder`
   * @note returns -1 if no column is freezing
   */
  freezedIndex: number;
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
  data: Record<string, RowDataType>;
}

export type TableViewAction =
  | { type: "add:col"; payload: AddColumnPayload }
  | { type: "update:col"; payload: { id: string; data: UpdateColumnPayload } }
  | { type: "update:col:type"; payload: { id: string; type: PropertyType } }
  | {
      type: "update:col:meta:title";
      payload: { id: string; updater: Updater<boolean> };
    }
  | {
      type: "update:col:meta:select" | "update:col:meta:multi-select";
      payload: { id: string } & SelectConfigActionPayload;
    }
  | { type: "update:col:visibility"; payload: { hidden: boolean } }
  | { type: "reorder:col" | "reorder:row"; updater: Updater<string[]> }
  | { type: "freeze:col"; payload: { id: string | null } }
  | {
      type: "delete:col" | "duplicate:col" | "delete:row" | "duplicate:row";
      payload: { id: string };
    }
  | {
      type: "update:count:cap";
      payload: { id: string; updater: Updater<boolean> };
    }
  | { type: "add:row"; payload?: { id: string; at: "prev" | "next" } }
  | { type: "update:row:icon"; payload: { id: string; icon: IconData | null } }
  | {
      type: "update:cell";
      payload: { rowId: string; colId: string; data: CellDataType };
    }
  | { type: "update:sorting"; updater: Updater<SortingState> }
  | { type: "reset" };

export const tableViewReducer = (
  v: TableViewAtom,
  a: TableViewAction,
): TableViewAtom => {
  switch (a.type) {
    case "add:col": {
      const { id: colId, type, name, at } = a.payload;
      const data = { ...v.data };
      v.dataOrder.forEach((rowId) => {
        if (!data[rowId]) return NEVER;
        data[rowId] = {
          ...data[rowId],
          properties: {
            ...data[rowId].properties,
            [colId]: getDefaultCell(type),
          },
        };
      });
      const properties = { ...v.properties };
      properties[colId] = {
        id: colId,
        name,
        icon: null,
        ...getDefaultPropConfig(type),
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
      return {
        ...v,
        properties: {
          ...v.properties,
          [a.payload.id]: { ...prop, ...a.payload.data },
        },
      };
    }
    case "update:col:type": {
      const property = v.properties[a.payload.id];
      if (!property) return v as never;
      const config = transferPropertyConfig(
        { data: v.data, property },
        a.payload.type,
      );
      const data = { ...v.data };
      v.dataOrder.forEach((rowId) => {
        if (!data[rowId]) return;
        data[rowId] = {
          ...data[rowId],
          properties: {
            ...data[rowId].properties,
            [a.payload.id]: transferPropertyValues(
              data[rowId].properties[a.payload.id]!,
              config,
            ),
          },
        };
      });
      return {
        ...v,
        properties: {
          ...v.properties,
          [a.payload.id]: { ...property, ...config },
        },
        data,
      };
    }
    case "update:col:visibility": {
      const properties = { ...v.properties };
      v.propertiesOrder.forEach((propId) => {
        const property = properties[propId]!;
        property.hidden = property.type === "title" ? false : a.payload.hidden;
      });
      return { ...v, properties };
    }
    case "reorder:col": {
      const propertiesOrder = getState(a.updater, v.propertiesOrder);
      return { ...v, propertiesOrder };
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
        data[rowId]!.properties[prop.id] = getDefaultCell(src.type);
      });
      return {
        ...v,
        properties: { ...v.properties, [prop.id]: prop },
        propertiesOrder: insertAt(v.propertiesOrder, prop.id, idx + 1),
        freezedIndex: v.freezedIndex + Number(idx <= v.freezedIndex),
        data,
      };
    }
    case "freeze:col": {
      const freezedIndex =
        a.payload.id !== null ? v.propertiesOrder.indexOf(a.payload.id) : -1;
      return { ...v, freezedIndex };
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
        freezedIndex: v.freezedIndex - Number(idx <= v.freezedIndex),
        data,
      };
    }
    case "update:count:cap": {
      const prop = v.properties[a.payload.id];
      if (!prop) return v;
      prop.isCountCapped = getState(
        a.payload.updater,
        prop.isCountCapped ?? false,
      );
      return { ...v, properties: { ...v.properties, [a.payload.id]: prop } };
    }
    case "update:col:meta:title": {
      const prop = v.properties[a.payload.id];
      if (!prop || prop.type !== "title") return v as never;
      prop.config.showIcon = getState(
        a.payload.updater,
        prop.config.showIcon ?? true,
      );
      return { ...v, properties: { ...v.properties, [a.payload.id]: prop } };
    }
    case "update:col:meta:select":
    case "update:col:meta:multi-select": {
      const prop = v.properties[a.payload.id];
      if (!prop || (prop.type !== "select" && prop.type !== "multi-select"))
        return v as never;
      const config = selectConfigReducer(prop.config, a.payload);
      return {
        ...v,
        properties: { ...v.properties, [a.payload.id]: { ...prop, config } },
      };
    }
    case "add:row": {
      const row: RowDataType = { id: v4(), properties: {} };
      v.propertiesOrder.forEach((colId) => {
        row.properties[colId] = getDefaultCell(v.properties[colId]!.type);
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
      const row: RowDataType = { ...v.data[a.payload.id]!, id: v4() };
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
    case "reorder:row": {
      const dataOrder = getState(a.updater, v.dataOrder);
      // TODO select row after reorder
      return { ...v, dataOrder, table: { ...v.table, sorting: [] } };
    }
    case "update:row:icon": {
      const data = { ...v.data };
      data[a.payload.id]!.icon = a.payload.icon ?? undefined;
      return { ...v, data };
    }
    case "delete:row": {
      const { [a.payload.id]: _, ...data } = v.data;
      return {
        ...v,
        dataOrder: v.dataOrder.filter((rowId) => rowId !== a.payload.id),
        data,
      };
    }
    case "update:cell": {
      const data = { ...v.data };
      data[a.payload.rowId]!.properties[a.payload.colId] = a.payload.data;
      return { ...v, data };
    }
    case "update:sorting": {
      const sorting = getState(a.updater, v.table.sorting);
      return { ...v, table: { ...v.table, sorting } };
    }
    case "reset":
      return {
        table: {
          sorting: [],
        },
        properties: {},
        propertiesOrder: [],
        freezedIndex: -1,
        dataOrder: [],
        data: {},
      };
    default:
      return v;
  }
};
