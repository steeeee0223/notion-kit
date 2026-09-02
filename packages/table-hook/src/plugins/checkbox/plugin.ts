import { groupByValue } from "@/fns";
import type { CellPlugin } from "@/plugins";
import {
  checkboxCounting,
  compareBooleans,
  createCompareFn,
} from "@/plugins/utils";

export type CheckboxPlugin = CellPlugin<"checkbox", boolean, undefined>;
export function checkbox(): CheckboxPlugin {
  const compareCheckedFirst = (a: unknown, b: unknown) =>
    -compareBooleans(Boolean(a), Boolean(b));
  const isEmpty = (data: boolean) => data === false;

  return {
    id: "checkbox",
    default: {
      data: false,
      config: undefined,
    },
    fromValue: () => false,
    toValue: (data) => data,
    isEmpty,
    toTextValue: (data) => (data ? "✅" : ""),
    compare: createCompareFn(compareCheckedFirst),
    sorting: {
      defaultMethod: "checkbox",
      enableGroupSort: false,
      methods: [
        {
          id: "checkbox",
          name: "Checkbox",
          ascendingLabel: "Checked → unchecked",
          descendingLabel: "Unchecked → checked",
          toComparable: (data) => data,
          compare: compareCheckedFirst,
        },
      ],
    },
    grouping: {
      defaultMethod: "value",
      methods: [{ id: "value", name: "Value", function: groupByValue }],
    },
    counting: checkboxCounting(isEmpty),
    filtering: {
      operators: [
        {
          id: "is-checked",
          name: "Is checked",
          operand: { kind: "none" },
          matches: (data) => data === true,
        },
        {
          id: "is-unchecked",
          name: "Is unchecked",
          operand: { kind: "none" },
          matches: (data) => data === false,
        },
      ],
    },
  };
}
