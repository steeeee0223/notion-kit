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

export function selectConfigReducer(
  v: SelectConfig["config"],
  a: SelectConfigActionPayload,
): SelectConfig["config"] {
  switch (a.action) {
    case "add": {
      const options = { ...v.options };
      options.names.push(a.payload.name);
      options.items[a.payload.name] = { id: v4(), ...a.payload };
      return { ...v, options };
    }
    case "update:meta": {
      const { originalName, name, ...payload } = a.payload;
      const { [originalName]: option, ...items } = v.options.items;
      if (!option) return v as never;
      items[originalName] = { ...option, ...payload };
      if (!name) return { ...v, options: { ...v.options, items } };
      // Update the name in the names array
      const names = v.options.names.map((n) => (n === originalName ? name : n));
      return { ...v, options: { names, items } };
    }
    case "update:sort:manual": {
      const names = getState(a.updater, v.options.names);
      return { sort: "manual", options: { ...v.options, names } };
    }
    case "delete": {
      const { [a.payload.name]: option, ...rest } = v.options.items;
      return {
        ...v,
        options: {
          names: v.options.names.filter((name) => name !== option?.name),
          items: rest,
        },
      };
    }
  }
}
