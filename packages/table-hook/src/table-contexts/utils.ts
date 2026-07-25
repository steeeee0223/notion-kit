import { v4 } from "uuid";

import type { ColumnDefs, ColumnInfo, PluginType, Row } from "@/lib/types";
import { Entity } from "@/lib/utils";
import type { CellPlugin, TitlePlugin } from "@/plugins";
import type { TableState } from "@/table-contexts/types";

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
      const plugin = plugins[property.type];
      if (!plugin) {
        throw new Error(
          `[TableView] Plugin not found for property "${property.id}" type: ${property.type}`,
        );
      }
      const { config, ...propertyWithoutConfig } = property;
      acc.ids.push(property.id);
      acc.items[property.id] = {
        ...propertyWithoutConfig,
        config: plugin.default.config,
        ...(config === undefined ? {} : { config }),
      };
      return acc;
    },
    { ids: [], items: {} },
  );
}
