import { v4 } from "uuid";

import type { DatabaseProperty, RowDataType } from "../lib/types";
import { arrayToEntity } from "../lib/utils";
import type { TableViewAtom } from "./table-reducer";
import type { ControlledTableState } from "./types";

export function createInitialTable() {
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

  return { properties, data };
}

export function getTableViewAtom(state: ControlledTableState): TableViewAtom {
  const columnData = arrayToEntity(state.properties);
  const rowData = arrayToEntity(state.data);
  return {
    properties: columnData.items,
    propertiesOrder: columnData.ids,
    data: rowData.items,
    dataOrder: rowData.ids,
    freezedIndex: state.freezedIndex,
  };
}

export function toControlledState(atom: TableViewAtom): ControlledTableState {
  return {
    properties: atom.propertiesOrder.map((id) => atom.properties[id]!),
    data: atom.dataOrder.map((id) => atom.data[id]!),
    freezedIndex: atom.freezedIndex,
  };
}
