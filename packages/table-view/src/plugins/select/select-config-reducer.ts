import { functionalUpdate, type Updater } from "@tanstack/react-table";
import { v4 } from "uuid";

import type { Color } from "@notion-kit/utils";

import type { SelectConfig, SelectSort } from "./types";

export type SelectConfigAction =
  | "add:option"
  | "update:option"
  | "update:sort"
  | "update:sort:manual"
  | "delete:option";

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
