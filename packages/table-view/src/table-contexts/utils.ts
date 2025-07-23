import type { SortingFn } from "@tanstack/react-table";
import { v4 } from "uuid";

import { toReadableValue } from "../lib/data-transfer";
import type {
  DatabaseProperty,
  PartialDatabaseProperty,
  PropertyType,
  RowDataType,
} from "../lib/types";
import { arrayToEntity, getDefaultPropConfig } from "../lib/utils";
import type { TableViewAtom } from "./table-reducer";
import type { PartialTableState, TableState } from "./types";

export const DEFAULT_FREEZED_INDEX = -1;

export function getMinWidth(type: PropertyType) {
  switch (type) {
    case "checkbox":
      return 32;
    default:
      return 100;
  }
}

export function createInitialTable(): PartialTableState {
  const titleId = v4();
  const properties: PartialDatabaseProperty[] = [
    { id: titleId, name: "Name", type: "title" },
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

export function toDatabaseProperties(
  properties: PartialDatabaseProperty[],
): DatabaseProperty[] {
  return properties.map((property) => ({
    ...property,
    ...getDefaultPropConfig(property.type),
  }));
}

/**
 * getTableViewAtom
 * Converts a controlled state `PartialTableState` into a TableViewAtom.
 */
export function getTableViewAtom(state: PartialTableState): TableViewAtom {
  const columnData = arrayToEntity(toDatabaseProperties(state.properties));
  const rowData = arrayToEntity(state.data);
  return {
    table: { sorting: [] },
    properties: columnData.items,
    propertiesOrder: columnData.ids,
    data: rowData.items,
    dataOrder: rowData.ids,
    freezedIndex: DEFAULT_FREEZED_INDEX,
  };
}

export function toControlledState(atom: TableViewAtom): TableState {
  return {
    properties: atom.propertiesOrder.map((id) => atom.properties[id]!),
    data: atom.dataOrder.map((id) => atom.data[id]!),
  };
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
