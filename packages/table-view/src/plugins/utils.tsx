import {
  getDefaultGroupingValue,
  type GroupingValueProps,
} from "@notion-kit/table-hook/plugins";

export {
  compareBooleans,
  compareNumbers,
  compareStrings,
  createCompareFn,
  textMethodCapabilities,
} from "@notion-kit/table-hook/plugins";

export function DefaultGroupingValue({ value }: GroupingValueProps) {
  return <span className="truncate">{getDefaultGroupingValue(value)}</span>;
}
