import type { Cell, CellPlugin } from "@notion-kit/table-hook";
import type { Color } from "@notion-kit/utils";

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

export type SelectPlugin = CellPlugin<"select", string | null, SelectConfig>;

export type MultiSelectPlugin = CellPlugin<
  "multi-select",
  string[],
  SelectConfig
>;

export type SelectCell = Cell<SelectPlugin> | Cell<MultiSelectPlugin>;
