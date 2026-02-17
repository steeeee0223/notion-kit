import {
  functionalUpdate,
  type Table,
  type Updater,
} from "@tanstack/react-table";
import { v4 } from "uuid";

import type { Color } from "@notion-kit/utils";

import type { Row } from "../../lib/types";
import type { SelectCell, SelectConfig, SelectSort } from "./types";

export type SelectConfigActionPayload =
  | { action: "add:option"; payload: { name: string; color: Color } }
  | {
      action: "update:option";
      payload: {
        originalName: string;
        name?: string;
        description?: string;
        color?: Color;
      };
    }
  | { action: "delete:option"; payload: string }
  | { action: "update:sort"; payload: SelectSort }
  | { action: "update:sort:manual"; updater: Updater<string[]> };

interface SelectConfigReducerResult {
  config: SelectConfig;
  nextEvent?:
    | { type: "update:name"; payload: { originalName: string; name: string } }
    | { type: "delete"; payload: string };
}

export function selectConfigReducer(
  v: SelectConfig,
  a: SelectConfigActionPayload,
): SelectConfigReducerResult {
  switch (a.action) {
    case "add:option": {
      return {
        config: {
          ...v,
          options: {
            names: [...v.options.names, a.payload.name],
            items: {
              ...v.options.items,
              [a.payload.name]: { id: v4(), ...a.payload },
            },
          },
        },
      };
    }
    case "update:option": {
      const { originalName, name, ...payload } = a.payload;
      const { [originalName]: option, ...items } = v.options.items;
      if (!option) return v as never;
      if (!name) {
        items[originalName] = { ...option, ...payload };
        return { config: { ...v, options: { ...v.options, items } } };
      }
      items[name] = { ...option, name };
      const names = v.options.names.map((n) => (n === originalName ? name : n));
      return {
        config: { ...v, options: { names, items } },
        nextEvent: { type: "update:name", payload: { originalName, name } },
      };
    }
    case "update:sort": {
      const meta = { config: { ...v, sort: a.payload } };
      if (a.payload === "manual") return meta;
      meta.config.options.names = meta.config.options.names
        .slice()
        .sort(
          (name1, name2) =>
            name1.localeCompare(name2) *
            (a.payload === "alphabetical" ? 1 : -1),
        );
      return meta;
    }
    case "update:sort:manual": {
      const names = functionalUpdate(a.updater, v.options.names);
      return { config: { sort: "manual", options: { ...v.options, names } } };
    }
    case "delete:option": {
      const { [a.payload]: option, ...rest } = v.options.items;
      return {
        config: {
          ...v,
          options: {
            names: v.options.names.filter((name) => name !== option?.name),
            items: rest,
          },
        },
        nextEvent: { type: "delete", payload: a.payload },
      };
    }
  }
}

/**
 * Propagate a select config event (rename/delete) to cell data.
 *
 * Call this after `selectConfigReducer` returns a `nextEvent` to update
 * all rows that reference the renamed/deleted option.
 */
export function propagateSelectEvent(
  table: Table<Row>,
  propId: string,
  type: "select" | "multi-select",
  event: NonNullable<SelectConfigReducerResult["nextEvent"]>,
): void {
  switch (event.type) {
    case "update:name": {
      const { originalName, name } = event.payload;
      table.setTableData((prev) =>
        prev.map((row) => {
          const cell = row.properties[propId] as SelectCell;
          if (type === "multi-select") {
            const arr = cell.value as string[];
            if (!arr.includes(originalName)) return row;
            return {
              ...row,
              properties: {
                ...row.properties,
                [propId]: {
                  ...cell,
                  value: arr.map((o) => (o === originalName ? name : o)),
                },
              },
            };
          }
          if (cell.value !== originalName) return row;
          return {
            ...row,
            properties: {
              ...row.properties,
              [propId]: { ...cell, value: name },
            },
          };
        }),
      );
      break;
    }
    case "delete": {
      const name = event.payload;
      table.setTableData((prev) =>
        prev.map((row) => {
          const cell = row.properties[propId] as SelectCell;
          if (type === "multi-select") {
            const arr = cell.value as string[];
            if (!arr.includes(name)) return row;
            return {
              ...row,
              properties: {
                ...row.properties,
                [propId]: {
                  ...cell,
                  value: arr.filter((o) => o !== name),
                },
              },
            };
          }
          if (cell.value !== name) return row;
          return {
            ...row,
            properties: {
              ...row.properties,
              [propId]: { ...cell, value: null },
            },
          };
        }),
      );
      break;
    }
  }
}
