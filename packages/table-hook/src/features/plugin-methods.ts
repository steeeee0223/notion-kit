export interface PluginMethodState {
  sortingMethodByColumn: Record<string, string | undefined>;
  groupingMethodByColumn: Record<string, string | undefined>;
  groupSort:
    | { mode: "manual" }
    | { mode: "ascending" | "descending"; method: string };
}

export function createPluginMethodState(): PluginMethodState {
  return {
    sortingMethodByColumn: {},
    groupingMethodByColumn: {},
    groupSort: { mode: "manual" },
  };
}
