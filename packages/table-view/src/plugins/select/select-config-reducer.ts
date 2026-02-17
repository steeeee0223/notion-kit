import { functionalUpdate, type Updater } from "@tanstack/react-table";
import type { Table } from "@tanstack/react-table";
import { v4 } from "uuid";

import type { Color } from "@notion-kit/utils";

import type { ColumnInfo, Row } from "../../lib/types";
import type {
  MultiSelectPlugin,
  SelectCell,
  SelectConfig,
  SelectPlugin,
  SelectSort,
} from "./types";

type SelectConfigActionPayload =
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

function selectConfigReducer(
  v: SelectConfig,
  a: SelectConfigActionPayload,
): SelectConfigReducerResult {
  switch (a.action) {
    case "add:option": {
      const options = { ...v.options };
      options.names.push(a.payload.name);
      options.items[a.payload.name] = { id: v4(), ...a.payload };
      return { config: { ...v, options } };
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
 * Dispatch a select config action directly via table APIs.
 *
 * 1. Runs `selectConfigReducer` to compute new config
 * 2. Updates column info via `table._setColumnInfo`
 * 3. Propagates rename/delete events to cell data via `table.setTableData`
 */
export function dispatchSelectConfig(
  table: Table<Row>,
  propId: string,
  action: SelectConfigActionPayload,
): void {
  const info = table.getColumnInfo(propId) as ColumnInfo<
    SelectPlugin | MultiSelectPlugin
  >;
  const { config, nextEvent } = selectConfigReducer(info.config, action);

  // 1. Update column config
  table._setColumnInfo(propId, { ...info, config });

  // 2. Propagate rename/delete to cell data
  if (!nextEvent) return;

  switch (nextEvent.type) {
    case "update:name": {
      const { originalName, name } = nextEvent.payload;
      table.setTableData((prev) =>
        prev.map((row) => {
          const cell = { ...row.properties[propId] } as SelectCell;
          if (info.type === "multi-select") {
            cell.value = (cell.value as string[]).map((option) =>
              option === originalName ? name : option,
            );
          } else if (cell.value === originalName) {
            cell.value = name;
          }
          return { ...row, properties: { ...row.properties, [propId]: cell } };
        }),
      );
      break;
    }
    case "delete": {
      const name = nextEvent.payload;
      table.setTableData((prev) =>
        prev.map((row) => {
          const cell = { ...row.properties[propId] } as SelectCell;
          if (info.type === "multi-select") {
            cell.value = (cell.value as string[]).filter(
              (option) => option !== name,
            );
          } else if (cell.value === name) {
            cell.value = null;
          }
          return { ...row, properties: { ...row.properties, [propId]: cell } };
        }),
      );
      break;
    }
  }
}
