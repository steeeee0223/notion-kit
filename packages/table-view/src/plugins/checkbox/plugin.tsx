import { DefaultIcon } from "../../common";
import { compareBooleans, createCompareFn } from "../utils";
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
    renderCell: (props) => <CheckboxCell {...props} />,
    renderGroupingValue: (props) => <CheckboxGroupingValue {...props} />,
  };
}
