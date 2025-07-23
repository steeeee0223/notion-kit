import type { Updater } from "@tanstack/react-table";
import { v4 } from "uuid";

import type { Color } from "@notion-kit/utils";

import type { SelectConfig } from "../../lib/types";
import { getState } from "../../lib/utils";

export type SelectConfigAction =
  | "add:option"
  | "update:option"
  | "update:sort:manual"
  | "delete:option";

export type SelectConfigActionPayload = { action: SelectConfigAction } & (
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
  | { action: "delete:option"; payload: { name: string } }
  | { action: "update:sort:manual"; updater: Updater<string[]> }
);

interface SelectConfigReducerResult {
  config: SelectConfig;
  nextEvent?:
    | { type: "update:name"; payload: { originalName: string; name: string } }
    | { type: "delete"; payload: { name: string } };
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
    case "update:sort:manual": {
      const names = getState(a.updater, v.options.names);
      return { config: { sort: "manual", options: { ...v.options, names } } };
    }
    case "delete:option": {
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
