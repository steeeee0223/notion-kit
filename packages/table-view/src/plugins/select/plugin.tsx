import { DefaultIcon } from "../../common";
import type { TableViewAtom } from "../../table-contexts";
import { SelectCell } from "./select-cell";
import { SelectConfigMenu } from "./select-config-menu";
import { selectConfigReducer } from "./select-config-reducer";
import type {
  MultiSelectPlugin,
  SelectActionPayload,
  SelectPlugin,
} from "./types";

export function selectReducer(
  v: TableViewAtom,
  a: SelectActionPayload,
): TableViewAtom {
  const prop = v.properties[a.payload.id];
  if (!prop || (prop.type !== "select" && prop.type !== "multi-select"))
    return v as never;
  const { config, nextEvent } = selectConfigReducer(prop.config, a.payload);
  const properties = {
    ...v.properties,
    [a.payload.id]: { ...prop, config },
  };
  if (!nextEvent) return { ...v, properties };

  switch (nextEvent.type) {
    case "update:name": {
      const { originalName, name } = nextEvent.payload;
      const data = { ...v.data };
      v.dataOrder.forEach((rowId) => {
        const cell = data[rowId]?.properties[a.payload.id];
        if (!cell || cell.type !== prop.type) return;
        if (cell.type === "multi-select") {
          cell.data = cell.data.map((option) =>
            option === originalName ? name : option,
          );
        } else if (cell.data === originalName) {
          cell.data = name;
        }
      });
      return { ...v, properties, data };
    }
    case "delete": {
      const name = nextEvent.payload;
      const data = { ...v.data };
      v.dataOrder.forEach((rowId) => {
        const cell = data[rowId]?.properties[a.payload.id];
        if (!cell || cell.type !== prop.type) return;
        if (cell.type === "multi-select") {
          cell.data = cell.data.filter((option) => option !== name);
        } else if (cell.data === name) {
          cell.data = null;
        }
      });
      return { ...v, properties, data };
    }
    default:
      return v as never;
  }
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
    fromReadableValue: (value) => value,
    toReadableValue: (data) => data ?? "",
    toTextValue: (data) => data ?? "",
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
    fromReadableValue: (value) => value.split(",").map((v) => v.trim()),
    toReadableValue: (data) => data.join(", "),
    toTextValue: (data) => data.join(", "),
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
