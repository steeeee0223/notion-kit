import type { SortingFn } from "@tanstack/react-table";
import { v4 } from "uuid";

import type { ColumnDefs, ColumnInfo, PluginType, Row } from "../lib/types";
import { Entity } from "../lib/utils";
import type { CellPlugin } from "../plugins";
import type { TitlePlugin } from "../plugins/title";
import type { TableState } from "./types";

export function getMinWidth(type: PluginType<CellPlugin[]>) {
  switch (type) {
    case "checkbox":
      return 32;
    default:
      return 100;
  }
}

export function createInitialTable(): TableState<CellPlugin[]> {
  const titleId = v4();
  const columns: ColumnInfo<TitlePlugin>[] = [
    { id: titleId, name: "Name", type: "title", config: { showIcon: true } },
  ];
  const now = Date.now();
  const timeData = { createdAt: now, lastEditedAt: now };
  const data: Row<TitlePlugin[]>[] = [
    {
      id: v4(),
      properties: {
        [titleId]: { id: v4(), value: "" },
      },
      ...timeData,
    },
    {
      id: v4(),
      properties: {
        [titleId]: { id: v4(), value: "" },
      },
      ...timeData,
    },
    {
      id: v4(),
      properties: {
        [titleId]: { id: v4(), value: "" },
      },
      ...timeData,
    },
  ];

  return { properties: columns, data };
}

export function toPropertyEntity<TPlugins extends CellPlugin[]>(
  plugins: Record<string, TPlugins[number]>,
  properties: ColumnDefs<TPlugins>,
) {
  return properties.reduce<Entity<ColumnInfo>>(
    (acc, property) => {
      acc.ids.push(property.id);
      acc.items[property.id] = {
        config: plugins[property.type]!.default.config,
        ...property,
      };
      return acc;
    },
    { ids: [], items: {} },
  );
}

export function createColumnSortingFn(plugin: CellPlugin): SortingFn<Row> {
  return (rowA, rowB, colId) => {
    // TODO handle grouped rows sorting

    const dataA = plugin.toReadableValue(
      rowA.original.properties[colId]?.value,
      rowA.original,
    );
    const dataB = plugin.toReadableValue(
      rowB.original.properties[colId]?.value,
      rowB.original,
    );
    return dataA.localeCompare(dataB);
  };
}
