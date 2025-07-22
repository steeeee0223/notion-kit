import type { Updater } from "@tanstack/react-table";
import { v4 } from "uuid";

import type { Color } from "@notion-kit/utils";

import { SelectConfig } from "../lib/types";
import { getState } from "./utils";

export type SelectConfigAction =
  | "add"
  | "update:meta"
  | "update:sort:manual"
  | "delete";

export type SelectConfigActionPayload = { action: SelectConfigAction } & (
  | { action: "add"; payload: { name: string; color: Color } }
  | {
      action: "update:meta";
      payload: {
        originalName: string;
        name?: string;
        description?: string;
        color?: Color;
      };
    }
  | { action: "delete"; payload: { name: string } }
  | { action: "update:sort:manual"; updater: Updater<string[]> }
);

interface SelectConfigReducerResult {
  config: SelectConfig["config"];
  nextEvent?:
    | { type: "update:name"; payload: { originalName: string; name: string } }
    | { type: "delete"; payload: { name: string } };
}

export function selectConfigReducer(
  v: SelectConfig["config"],
  a: SelectConfigActionPayload,
): SelectConfigReducerResult {
  switch (a.action) {
    case "add": {
      const options = { ...v.options };
      options.names.push(a.payload.name);
      options.items[a.payload.name] = { id: v4(), ...a.payload };
      return { config: { ...v, options } };
    }
    case "update:meta": {
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
    case "update:sort:manual": {
      const names = getState(a.updater, v.options.names);
      return { config: { sort: "manual", options: { ...v.options, names } } };
    }
    case "delete": {
      const { [a.payload.name]: option, ...rest } = v.options.items;
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
