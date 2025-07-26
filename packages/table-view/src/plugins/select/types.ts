import type { Color } from "@notion-kit/utils";

import type { CellPlugin } from "../types";
import type { SelectConfigActionPayload } from "./select-config-reducer";

export type SelectSort = "manual" | "alphabetical" | "reverse-alphabetical";

export interface OptionConfig {
  id: string;
  name: string;
  color: Color;
  description?: string;
}

export interface SelectConfig {
  options: {
    names: string[];
    /**
     * @prop items: map of option name to option config
     */
    items: Record<string, OptionConfig>;
  };
  sort: SelectSort;
}

export interface SelectActionPayload {
  type: "update:col:meta:select" | "update:col:meta:multi-select";
  payload: { id: string } & SelectConfigActionPayload;
}

export type SelectPlugin = CellPlugin<
  "select",
  string | null,
  SelectConfig,
  SelectActionPayload
>;

export type MultiSelectPlugin = CellPlugin<
  "multi-select",
  string[],
  SelectConfig,
  SelectActionPayload
>;
