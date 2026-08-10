import type {
  CellPlugin,
  ResolvedSortingMethod,
  SortingMethodDescriptor,
} from "@notion-kit/table-hook";

export function getSortingDirectionLabels(
  method: SortingMethodDescriptor | ResolvedSortingMethod | undefined,
) {
  return {
    ascending:
      method && "ascendingLabel" in method
        ? method.ascendingLabel
        : "Ascending",
    descending:
      method && "descendingLabel" in method
        ? method.descendingLabel
        : "Descending",
  };
}

export function getDefaultSortingMethod(plugin: CellPlugin) {
  const methods = plugin.sorting?.methods ?? [];
  return (
    methods.find((method) => method.id === plugin.sorting?.defaultMethod) ??
    methods[0]
  );
}
