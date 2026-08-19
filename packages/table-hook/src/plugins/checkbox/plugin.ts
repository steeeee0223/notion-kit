import { groupByValue } from "@/fns";
import type { CellPlugin, PluginFactoryConfig } from "@/plugins";
import {
  checkboxCounting,
  compareBooleans,
  createCompareFn,
} from "@/plugins/utils";

export type CheckboxPlugin = CellPlugin<"checkbox", boolean, undefined>;
export type CheckboxPluginConfig = PluginFactoryConfig<CheckboxPlugin>;

export function checkbox(config: CheckboxPluginConfig): CheckboxPlugin {
  const compareCheckedFirst = (a: unknown, b: unknown) =>
    -compareBooleans(Boolean(a), Boolean(b));

  return {
    id: "checkbox",
    meta: {
      name: "Checkbox",
      icon: config.icon,
      desc: "Use a checkbox to indicate whether a condition is true or false. Useful for lightweight task tracking.",
    },
    default: {
      name: "Checkbox",
      icon: config.defaultIcon ?? config.icon,
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
    counting: checkboxCounting,
    renderCellValue: config.renderCellValue,
    renderCellEditor: config.renderCellEditor,
    renderConfigMenu: config.renderConfigMenu,
    renderGroupingValue: config.renderGroupingValue,
  };
}
