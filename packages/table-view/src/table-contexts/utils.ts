import type { SortingFn, Updater } from "@tanstack/react-table";
import { v4 } from "uuid";

import { toReadableValue } from "../lib/data-transfer";
import type { DatabaseProperty, PropertyType, RowDataType } from "../lib/types";
import { arrayToEntity, getDefaultPropConfig } from "../lib/utils";
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
    { id: titleId, name: "Name", ...getDefaultPropConfig("title") },
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
    table: { sorting: [] },
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

export function getState<T>(updater: Updater<T>, snapshot: T) {
  return typeof updater === "function"
    ? (updater as (old: T) => T)(snapshot)
    : updater;
}

export const tableViewSortingFn: SortingFn<RowDataType> = (
  rowA,
  rowB,
  colId,
) => {
  const dataA = toReadableValue(rowA.original.properties[colId]);
  const dataB = toReadableValue(rowB.original.properties[colId]);
  return dataA.localeCompare(dataB);
};
