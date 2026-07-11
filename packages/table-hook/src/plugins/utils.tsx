import type { Row } from "@/lib/types";
import type {
  CellPlugin,
  CompareFn,
  GroupingValueProps,
  InferData,
} from "@/plugins/types";

export function DefaultGroupingValue({ value }: GroupingValueProps) {
  if (typeof value === "string")
    return <span className="truncate">{value || "(Empty)"}</span>;
  if (typeof value === "boolean")
    return <span className="truncate">{value ? "True" : "False"}</span>;
  if (value === null) return <span className="truncate">(Empty)</span>;
  return <span className="truncate">{value}</span>;
}

export function createCompareFn<TPlugin extends CellPlugin>(
  compareFn: CompareFn<InferData<TPlugin>>,
): (rowA: Row, rowB: Row, colId: string) => number {
  return (rowA, rowB, colId) => {
    const dataA = rowA.properties[colId]?.value as
      | InferData<TPlugin>
      | undefined;
    const dataB = rowB.properties[colId]?.value as
      | InferData<TPlugin>
      | undefined;
    if (dataA === null || typeof dataA === "undefined")
      return dataB === null || typeof dataB === "undefined" ? 0 : -1;
    if (dataB === null || typeof dataB === "undefined") return 1;
    return compareFn(dataA, dataB);
  };
}
