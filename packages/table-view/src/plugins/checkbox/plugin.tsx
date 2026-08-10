import { compareBooleans, groupByValue } from "@notion-kit/table-hook/fns";

import { DefaultIcon } from "@/common";

import { createCompareFn } from "../utils";
import { CheckboxCell } from "./checkbox-cell";
import { CheckboxGroupingValue } from "./checkbox-grouping-value";
import type { CheckboxPlugin } from "./types";

export function checkbox(): CheckboxPlugin {
  return {
    id: "checkbox",
    meta: {
      name: "Checkbox",
      icon: <DefaultIcon type="checkbox" className="fill-menu-icon" />,
      desc: "Use a checkbox to indicate whether a condition is true or false. Useful for lightweight task tracking.",
    },
    default: {
      name: "Checkbox",
      icon: <DefaultIcon type="checkbox" />,
      data: false,
      config: undefined,
    },
    fromValue: () => false,
    toValue: (data) => data,
    toTextValue: (data) => (data ? "✅" : ""),
    compare: createCompareFn(compareBooleans),
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
          compare: (a, b) => compareBooleans(Boolean(a), Boolean(b)),
          sortFn: "checkbox",
        },
      ],
    },
    grouping: {
      defaultMethod: "value",
      methods: [{ id: "value", name: "Value", function: groupByValue }],
    },
    renderCell: (props) => <CheckboxCell {...props} />,
    renderGroupingValue: (props) => <CheckboxGroupingValue {...props} />,
  };
}
