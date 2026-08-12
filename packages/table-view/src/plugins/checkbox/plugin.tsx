import { compareBooleans, groupByValue } from "@notion-kit/table-hook/fns";

import { DefaultIcon } from "@/common";

import { createCompareFn } from "../utils";
import { CheckboxCell } from "./checkbox-cell";
import { CheckboxGroupingValue } from "./checkbox-grouping-value";
import type { CheckboxPlugin } from "./types";

export function checkbox(): CheckboxPlugin {
  const compareCheckedFirst = (a: unknown, b: unknown) =>
    -compareBooleans(Boolean(a), Boolean(b));

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
    renderCell: (props) => <CheckboxCell {...props} />,
    renderGroupingValue: (props) => <CheckboxGroupingValue {...props} />,
  };
}
