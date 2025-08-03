import { v4 } from "uuid";

import { getRandomColor } from "@notion-kit/utils";

import { DefaultIcon } from "../../common";
import type { Cell, Column, Row } from "../../lib/types";
import type { TableViewAtom } from "../../table-contexts";
import type { CellPlugin } from "../types";
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

function selectReducer(v: TableViewAtom, a: SelectActions): TableViewAtom {
  const prop = v.properties[a.id] as Column<SelectPlugin | MultiSelectPlugin>;
  const { config, nextEvent } = selectConfigReducer(prop.config, a);
  const properties = {
    ...v.properties,
    [a.id]: { ...prop, config },
  };
  if (!nextEvent) return { ...v, properties };

  switch (nextEvent.type) {
    case "update:name": {
      const { originalName, name } = nextEvent.payload;
      const data = { ...v.data };
      v.dataOrder.forEach((rowId) => {
        const cell = data[rowId]?.properties[a.id] as
          | SelectCellModel
          | undefined;
        if (!cell) return;
        if (prop.type === "multi-select") {
          cell.value = (cell.value as string[]).map((option) =>
            option === originalName ? name : option,
          );
        } else if (cell.value === originalName) {
          cell.value = name;
        }
      });
      return { ...v, properties, data };
    }
    case "delete": {
      const name = nextEvent.payload;
      const data = { ...v.data };
      v.dataOrder.forEach((rowId) => {
        const cell = data[rowId]?.properties[a.id] as
          | SelectCellModel
          | undefined;
        if (!cell) return;
        if (prop.type === "multi-select") {
          cell.value = (cell.value as string[]).filter(
            (option) => option !== name,
          );
        } else if (cell.value === name) {
          cell.value = null;
        }
      });
      return { ...v, properties, data };
    }
    default:
      return v as never;
  }
}

/**
 * Transfers the property configuration to "select" or "multi-select"
 */
function toSelectConfig<TPlugin extends CellPlugin>(
  column: Column<TPlugin>,
  data: Record<string, Row<TPlugin[]>>,
): SelectConfig {
  switch (column.type) {
    case "select":
    case "multi-select":
      return (column as Column<SelectPlugin>).config;
    case "text": {
      const options = Object.values(data).reduce<SelectConfig["options"]>(
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
      return { options: { names: [], items: {} }, sort: "manual" };
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
    default: {
      name: "Select",
      icon: <DefaultIcon type="select" />,
      data: null,
      config: {
        options: { names: [], items: {} },
        sort: "manual",
      },
    },
    fromReadableValue: (value, config) => {
      const options = fromReadableValue(value, config, "select");
      return options.at(0) ?? null;
    },
    toReadableValue: (data) => data ?? "",
    toTextValue: (data) => data ?? "",
    transferConfig: toSelectConfig,
    renderCell: ({ propId, data, config, wrapped, onChange }) => (
      <SelectCell
        propId={propId}
        options={data ? [data] : []}
        meta={{ type: "select", config: config! }}
        wrapped={wrapped}
        onChange={(options) => onChange?.(options.at(0) ?? null)}
      />
    ),
    renderConfigMenu: ({ propId, config }) => (
      <SelectConfigMenu
        propId={propId}
        meta={{ type: "multi-select", config: config! }}
      />
    ),
    reducer: selectReducer,
  };
}

export function multiSelect(): MultiSelectPlugin {
  return {
    id: "multi-select",
    default: {
      name: "Multi-Select",
      icon: <DefaultIcon type="multi-select" />,
      data: [],
      config: {
        options: { names: [], items: {} },
        sort: "manual",
      },
    },
    fromReadableValue: (value, config) =>
      fromReadableValue(value, config, "multi-select"),
    toReadableValue: (data) => data.join(","),
    toTextValue: (data) => data.join(","),
    transferConfig: toSelectConfig,
    renderCell: ({ propId, data, config, wrapped, onChange }) => (
      <SelectCell
        propId={propId}
        options={data}
        meta={{ type: "multi-select", config: config! }}
        wrapped={wrapped}
        onChange={(options) => onChange?.(options)}
      />
    ),
    renderConfigMenu: ({ propId, config }) => (
      <SelectConfigMenu
        propId={propId}
        meta={{ type: "multi-select", config: config! }}
      />
    ),
    reducer: selectReducer,
  };
}
