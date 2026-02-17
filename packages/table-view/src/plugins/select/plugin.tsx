import { functionalUpdate } from "@tanstack/react-table";
import { v4 } from "uuid";

import { getRandomColor } from "@notion-kit/utils";

import { DefaultIcon } from "../../common";
import type { Cell, ColumnInfo, Row } from "../../lib/types";
import type { CellPlugin, ComparableValue } from "../types";
import { compareStrings, createCompareFn } from "../utils";
import { SelectCell } from "./select-cell";
import { SelectConfigMenu } from "./select-config-menu";
import { SelectGroupingValue } from "./select-grouping-value";
import type { MultiSelectPlugin, SelectConfig, SelectPlugin } from "./types";

function getDefaultConfig(): SelectConfig {
  return {
    options: { names: [], items: {} },
    sort: "manual",
  };
}

/**
 * Transfers the property configuration to "select" or "multi-select"
 */
function toSelectConfig<TPlugin extends CellPlugin>(
  column: ColumnInfo<TPlugin>,
  data: Row<TPlugin[]>[],
): SelectConfig {
  switch (column.type) {
    case "select":
    case "multi-select":
      return (column as ColumnInfo<SelectPlugin>).config;
    case "text": {
      const options = data.reduce<SelectConfig["options"]>(
        (acc, row) => {
          const cell = row.properties[column.id]! as Cell<
            CellPlugin<string, string>
          >;
          cell.value.split(",").forEach((v) => {
            const name = v.trim();
            if (!name || acc.items[name]) return;
            acc.names.push(name);
            acc.items[name] = { id: v4(), name, color: getRandomColor() };
          });
          return acc;
        },
        { names: [], items: {} },
      );
      return { sort: "manual", options };
    }
    default:
      return getDefaultConfig();
  }
}

function fromValue(
  value: ComparableValue,
  config: SelectConfig,
  type: "select" | "multi-select",
): string[] {
  if (typeof value !== "string") return [];
  const values = value.split(",").reduce((acc, v) => {
    if (type === "select" && acc.size > 0) return acc;
    const name = v.trim();
    if (!name) return acc;
    const option = config.options.items[name];
    if (!option) return acc;
    acc.add(option.name);
    return acc;
  }, new Set<string>());
  return Array.from(values);
}

export function select(): SelectPlugin {
  return {
    id: "select",
    meta: {
      name: "Select",
      icon: <DefaultIcon type="select" className="fill-menu-icon" />,
      desc: "Use a select property to choose one option from a predefined list. Great for categorization.",
    },
    default: {
      name: "Select",
      icon: <DefaultIcon type="select" />,
      data: null,
      config: getDefaultConfig(),
    },
    fromValue: (value, config) => {
      const options = fromValue(value, config, "select");
      return options.at(0) ?? null;
    },
    toValue: (data) => data,
    toTextValue: (data) => data ?? "",
    transferConfig: toSelectConfig,
    compare: createCompareFn<SelectPlugin>((a, b) => {
      if (a === null && b === null) return 0;
      // undefined sorts after defined values
      if (a === null) return 1;
      if (b === null) return -1;
      return compareStrings(a, b);
    }),
    renderCell: ({ data, onChange, ...props }) => (
      <SelectCell
        data={data ? [data] : []}
        onChange={(updater) =>
          onChange((prev) => {
            const res = functionalUpdate(updater, prev ? [prev] : []);
            return res.at(0) ?? null;
          })
        }
        {...props}
      />
    ),
    renderConfigMenu: (props) => <SelectConfigMenu {...props} />,
    renderGroupingValue: (props) => <SelectGroupingValue {...props} />,
  };
}

export function multiSelect(): MultiSelectPlugin {
  return {
    id: "multi-select",
    meta: {
      name: "Multi-Select",
      icon: <DefaultIcon type="multi-select" className="fill-menu-icon" />,
      desc: "Use a multi-select property to choose multiple options from a predefined list. Useful for tagging or categorization.",
    },
    default: {
      name: "Multi-Select",
      icon: <DefaultIcon type="multi-select" />,
      data: [],
      config: getDefaultConfig(),
    },
    fromValue: (value, config) => fromValue(value, config, "multi-select"),
    toValue: (data) => data.join(","),
    toGroupValue: (data) => data[0] ?? null,
    toTextValue: (data) => data.join(","),
    compare: createCompareFn<MultiSelectPlugin>((a, b) => {
      if (a.length === 0 && b.length === 0) return 0;
      // empty sorts after defined values
      if (a.length === 0) return 1;
      if (b.length === 0) return -1;
      return compareStrings(a[0]!, b[0]!);
    }),
    transferConfig: toSelectConfig,
    renderCell: (props) => <SelectCell multi {...props} />,
    renderConfigMenu: (props) => <SelectConfigMenu multi {...props} />,
    renderGroupingValue: (props) => <SelectGroupingValue {...props} />,
  };
}
