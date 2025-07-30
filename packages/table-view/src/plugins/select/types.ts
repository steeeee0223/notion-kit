import type { Color } from "@notion-kit/utils";

import type { Cell } from "../../lib/types";
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

export interface SelectMeta {
  type: "select" | "multi-select";
  config: SelectConfig;
}

export type SelectActions = SelectConfigActionPayload & {
  id: string;
};

export type SelectPlugin = CellPlugin<
  "select",
  string | null,
  SelectConfig,
  SelectActions
>;

export type MultiSelectPlugin = CellPlugin<
  "multi-select",
  string[],
  SelectConfig,
  SelectActions
>;

export type SelectCell = Cell<SelectPlugin> | Cell<MultiSelectPlugin>;
