import { v4 } from "uuid";

import type { DatabaseProperty, PropertyType, RowDataType } from "../lib/types";
import { arrayToEntity } from "../lib/utils";
import type { TableViewAtom } from "./table-reducer";
import type { TableState } from "./types";

export const DEFAULT_FREEZED_INDEX = -1;

export function getMinWidth(type: PropertyType) {
  switch (type) {
    case "checkbox":
      return 32;
    default:
      return 100;
  }
}

export function createInitialTable(): TableState {
  const titleId = v4();
  const properties: DatabaseProperty[] = [
    { id: titleId, type: "title", name: "Name" },
  ];
  const data: RowDataType[] = [
    {
      id: v4(),
      properties: { [titleId]: { id: v4(), type: "title", value: "" } },
    },
    {
      id: v4(),
      properties: { [titleId]: { id: v4(), type: "title", value: "" } },
    },
    {
      id: v4(),
      properties: { [titleId]: { id: v4(), type: "title", value: "" } },
    },
  ];

  return { properties, data, freezedIndex: DEFAULT_FREEZED_INDEX };
}

export function getTableViewAtom(state: TableState): TableViewAtom {
  const columnData = arrayToEntity(state.properties);
  const rowData = arrayToEntity(state.data);
  return {
    properties: columnData.items,
    propertiesOrder: columnData.ids,
    data: rowData.items,
    dataOrder: rowData.ids,
    freezedIndex: state.freezedIndex ?? DEFAULT_FREEZED_INDEX,
  };
}

export function toControlledState(atom: TableViewAtom): TableState {
  return {
    properties: atom.propertiesOrder.map((id) => atom.properties[id]!),
    data: atom.dataOrder.map((id) => atom.data[id]!),
    freezedIndex: atom.freezedIndex,
  };
}
