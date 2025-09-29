import type { SortingFn } from "@tanstack/react-table";
import { v4 } from "uuid";

import type {
  Column,
  ColumnDefs,
  PluginsMap,
  PluginType,
  Row,
} from "../lib/types";
import { arrayToEntity } from "../lib/utils";
import type { CellPlugin, InferConfig } from "../plugins";
import type { TitlePlugin } from "../plugins/title";
import type { TableViewAtom } from "./table-reducer";
import type { PartialTableState } from "./types";

export function getMinWidth(type: PluginType<CellPlugin[]>) {
  switch (type) {
    case "checkbox":
      return 32;
    default:
      return 100;
  }
}

export function createInitialTable(): PartialTableState<CellPlugin[]> {
  const titleId = v4();
  const columns: Column<TitlePlugin>[] = [
    { id: titleId, name: "Name", type: "title", config: { showIcon: true } },
  ];
  const data: Row<TitlePlugin[]>[] = [
    {
      id: v4(),
      properties: {
        [titleId]: { id: v4(), value: { value: "" } },
      },
    },
    {
      id: v4(),
      properties: {
        [titleId]: { id: v4(), value: { value: "" } },
      },
    },
    {
      id: v4(),
      properties: {
        [titleId]: { id: v4(), value: { value: "" } },
      },
    },
  ];

  return { properties: columns, data };
}

export function toDatabaseProperties<TPlugins extends CellPlugin[]>(
  plugins: Record<string, TPlugins[number]>,
  properties: ColumnDefs<TPlugins>,
): Column<CellPlugin>[] {
  return properties.map((property) => ({
    config: plugins[property.type]!.default.config as InferConfig<
      TPlugins[number]
    >,
    ...property,
  }));
}

/**
 * getTableViewAtom
 * Converts a controlled state `PartialTableState` into a TableViewAtom.
 */
export function getTableViewAtom<TPlugins extends CellPlugin[]>(
  plugins: PluginsMap<TPlugins>,
  state: PartialTableState<TPlugins>,
): TableViewAtom<TPlugins> {
  const columnData = arrayToEntity(
    toDatabaseProperties(plugins, state.properties),
  );
  const rowData = arrayToEntity(state.data);
  return {
    table: { sorting: [] },
    properties: columnData.items as Record<string, Column<TPlugins[number]>>,
    propertiesOrder: columnData.ids,
    data: rowData.items,
    dataOrder: rowData.ids,
  };
}

export function toControlledState<TPlugins extends CellPlugin[]>(
  atom: TableViewAtom<TPlugins>,
): PartialTableState<TPlugins> {
  return {
    properties: atom.propertiesOrder.map((id) => atom.properties[id]!),
    data: atom.dataOrder.map((id) => atom.data[id]!),
  };
}

export function createColumnSortingFn(plugin: CellPlugin): SortingFn<Row> {
  return (rowA, rowB, colId) => {
    const dataA = plugin.toReadableValue(rowA.original.properties[colId]);
    const dataB = plugin.toReadableValue(rowB.original.properties[colId]);
    return dataA.localeCompare(dataB);
  };
}
