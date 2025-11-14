import { functionalUpdate } from "@tanstack/react-table";
import { v4 } from "uuid";

import { getRandomColor } from "@notion-kit/utils";

import { DefaultIcon } from "../../common";
import type { Cell, ColumnInfo, Row } from "../../lib/types";
import type { CellPlugin, TableDataAtom } from "../types";
import { SelectCell } from "./select-cell";
import { SelectConfigMenu } from "./select-config-menu";
import { selectConfigReducer } from "./select-config-reducer";
import type {
  MultiSelectPlugin,
  SelectActions,
  SelectCell as SelectCellModel,
  SelectConfig,
  SelectPlugin,
} from "./types";

function getDefaultConfig(): SelectConfig {
  return {
    options: { names: [], items: {} },
    sort: "manual",
  };
}

export function selectReducer(
  v: TableDataAtom,
  a: SelectActions,
): TableDataAtom {
  const prop = v.properties[a.id] as ColumnInfo<
    SelectPlugin | MultiSelectPlugin
  >;
  const { config, nextEvent } = selectConfigReducer(prop.config, a);
  const properties = {
    ...v.properties,
    [a.id]: { ...prop, config },
  };
  if (!nextEvent) return { ...v, properties };

  switch (nextEvent.type) {
    case "update:name": {
      const { originalName, name } = nextEvent.payload;
      const data = v.data.map((row) => {
        const cell = { ...row.properties[a.id] } as SelectCellModel;
        if (prop.type === "multi-select") {
          cell.value = (cell.value as string[]).map((option) =>
            option === originalName ? name : option,
          );
        } else if (cell.value === originalName) {
          cell.value = name;
        }
        return { ...row, properties: { ...row.properties, [a.id]: cell } };
      });
      return { properties, data };
    }
    case "delete": {
      const name = nextEvent.payload;
      const data = v.data.map((row) => {
        const cell = { ...row.properties[a.id] } as SelectCellModel;

        if (prop.type === "multi-select") {
          cell.value = (cell.value as string[]).filter(
            (option) => option !== name,
          );
        } else if (cell.value === name) {
          cell.value = null;
        }
        return { ...row, properties: { ...row.properties, [a.id]: cell } };
      });
      return { properties, data };
    }
    default:
      return v as never;
  }
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

function fromReadableValue(
  value: string,
  config: SelectConfig,
  type: "select" | "multi-select",
): string[] {
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
    fromReadableValue: (value, config) => {
      const options = fromReadableValue(value, config, "select");
      return options.at(0) ?? null;
    },
    toReadableValue: (data) => data ?? "",
    toTextValue: (data) => data ?? "",
    transferConfig: toSelectConfig,
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
    reducer: selectReducer,
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
    fromReadableValue: (value, config) =>
      fromReadableValue(value, config, "multi-select"),
    toReadableValue: (data) => data.join(","),
    toTextValue: (data) => data.join(","),
    transferConfig: toSelectConfig,
    renderCell: (props) => <SelectCell {...props} />,
    renderConfigMenu: (props) => <SelectConfigMenu {...props} />,
    reducer: selectReducer,
  };
}
