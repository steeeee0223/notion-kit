import { checkbox } from "./checkbox";
import { multiSelect, select } from "./select";
import { text } from "./text";
import { title } from "./title";
import type { CellPlugin } from "./types";

/**
 * @deprecated
 */
export interface Plugins<T extends string[]> {
  names: T;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  items: Record<T[number], CellPlugin<string, any, any, any>>;
}

export const defaultPlugins: Plugins<
  ["title", "text", "checkbox", "select", "multi-select"]
> = {
  names: ["title", "text", "checkbox", "select", "multi-select"],
  items: {
    title: title(),
    text: text(),
    checkbox: checkbox(),
    select: select(),
    "multi-select": multiSelect(),
  },
} as const;
