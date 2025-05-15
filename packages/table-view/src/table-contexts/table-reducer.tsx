import type { Updater } from "@tanstack/react-table";
import { v4 } from "uuid";

import type {
  CellDataType,
  DatabaseProperty,
  PropertyType,
  RowDataType,
} from "../types";
import {
  getDefaultCell,
  getUniqueName,
  transferPropertyValues,
} from "../utils";
import type { AddColumnPayload, UpdateColumnPayload } from "./types";

export interface TableViewAtom {
  /**
   * @field property definitions
   * key: property (column) id
   */
  properties: Record<string, DatabaseProperty>;
  /**
   * @field column freezing up to the given `index` in `propertiesOrder`
   * returns -1 if no column is freezing
   */
  freezedIndex: number;
  /**
   * @field array of ordered property (column) ids
   * @note freezed columns: `propertiesOrder.slice(0, freezedIndex + 1)`
   */
  propertiesOrder: string[];
  data: RowDataType[];
}

export type TableViewAction =
  | { type: "add:col"; payload: AddColumnPayload }
  | { type: "update:col"; payload: { id: string; data: UpdateColumnPayload } }
  | { type: "update:col:type"; payload: { id: string; type: PropertyType } }
  | { type: "update:col:visibility"; payload: { hidden: boolean } }
  | { type: "reorder:col"; updater: Updater<string[]> }
  | { type: "freeze:col"; payload: { id: string | null } }
  | { type: "delete:col" | "duplicate:col"; payload: { id: string } }
  | {
      type: "update:cell";
      payload: { rowId: string; colId: string; data: CellDataType };
    }
  | { type: "reset" };

export const tableViewReducer = (
  v: TableViewAtom,
  a: TableViewAction,
): TableViewAtom => {
  switch (a.type) {
    case "add:col": {
      const { id: colId, type, name } = a.payload;
      return {
        properties: {
          ...v.properties,
          [colId]: { id: colId, type, name, icon: null },
        },
        propertiesOrder: [...v.propertiesOrder, colId],
        freezedIndex: v.freezedIndex,
        data: v.data.map(({ id, properties }) => ({
          id,
          properties: { ...properties, [colId]: getDefaultCell(type) },
        })),
      };
    }
    case "update:col": {
      const prop = v.properties[a.payload.id];
      if (!prop) return v;
      return {
        ...v,
        properties: {
          ...v.properties,
          [a.payload.id]: { ...prop, ...a.payload.data },
        },
      };
    }
    case "update:col:type": {
      const prop = v.properties[a.payload.id];
      if (!prop) return v;
      return {
        ...v,
        properties: {
          ...v.properties,
          [a.payload.id]: { ...prop, type: a.payload.type },
        },
        data: v.data.map((row) => {
          if (row.properties[a.payload.id] === undefined) return row;
          return {
            ...row,
            properties: {
              ...row.properties,
              [a.payload.id]: transferPropertyValues(
                row.properties[a.payload.id]!,
                a.payload.type,
              ),
            },
          };
        }),
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
      const propertiesOrder = Array.isArray(a.updater)
        ? a.updater
        : a.updater(v.propertiesOrder);
      return { ...v, propertiesOrder };
    }
    case "duplicate:col": {
      const src = v.properties[a.payload.id];
      const idx = v.propertiesOrder.findIndex(
        (colId) => colId === a.payload.id,
      );
      if (!src || idx < 0) return v;
      const prop = {
        ...src,
        id: v4(),
        name: getUniqueName(
          src.name,
          Object.values(v.properties).map((col) => col.name),
        ),
      };
      return {
        properties: { ...v.properties, [prop.id]: prop },
        propertiesOrder: [
          ...v.propertiesOrder.slice(0, idx + 1),
          prop.id,
          ...v.propertiesOrder.slice(idx + 1),
        ],
        freezedIndex: v.freezedIndex + Number(idx <= v.freezedIndex),
        data: v.data.map(({ id, properties }) => ({
          id,
          properties: { ...properties, [prop.id]: getDefaultCell(src.type) },
        })),
      };
    }
    case "freeze:col": {
      const freezedIndex =
        a.payload.id !== null
          ? v.propertiesOrder.findIndex((colId) => colId === a.payload.id)
          : -1;
      return { ...v, freezedIndex };
    }
    case "delete:col": {
      const idx = v.propertiesOrder.findIndex(
        (colId) => colId === a.payload.id,
      );
      if (idx < 0) return v;

      return {
        get properties() {
          const { [a.payload.id]: _, ...properties } = v.properties;
          return properties;
        },
        propertiesOrder: v.propertiesOrder.filter(
          (colId) => colId !== a.payload.id,
        ),
        freezedIndex: v.freezedIndex - Number(idx <= v.freezedIndex),
        data: v.data.map((row) => {
          const { [a.payload.id]: _, ...rest } = row.properties;
          return { ...row, properties: rest };
        }),
      };
    }
    case "update:cell":
      return {
        ...v,
        data: v.data.map((row) => {
          if (row.id !== a.payload.rowId) return row;
          return {
            ...row,
            properties: {
              ...row.properties,
              [a.payload.colId]: a.payload.data,
            },
          };
        }),
      };
    case "reset":
      return {
        properties: {},
        propertiesOrder: [],
        freezedIndex: -1,
        data: [],
      };
    default:
      return v;
  }
};
