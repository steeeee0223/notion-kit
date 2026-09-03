import type React from "react";

import type {
  CellInstance,
  ColumnInstance,
  TableInstance,
} from "@notion-kit/table-hook";
import type {
  CellPlugin,
  ComparableValue,
  InferKey,
} from "@notion-kit/table-hook/plugins";

export type CellSurface = "table" | "list" | "board" | "row-view" | "timeline";

export interface CellProps {
  cell: CellInstance;
}

export interface BulkEditorProps {
  column: ColumnInstance;
}

export interface ConfigMenuProps {
  column: ColumnInstance;
}

export interface GroupingValueProps {
  className?: string;
  value: ComparableValue;
  table: TableInstance;
}

export interface TableUiPlugin<TPlugin extends CellPlugin = CellPlugin> {
  id: InferKey<TPlugin>;
  meta: {
    name: string;
    desc: string;
    icon: React.ReactNode;
  };
  default: {
    name: string;
    icon: React.ReactNode;
    width?: number;
  };
  disablePropertyTooltip?: boolean;
  renderCell: (props: CellProps) => React.ReactNode;
  renderBulkEditor?: (props: BulkEditorProps) => React.ReactNode;
  renderConfigMenu?: (props: ConfigMenuProps) => React.ReactNode;
  renderGroupingValue: (props: GroupingValueProps) => React.ReactNode;
}

export interface TablePluginPair<TData extends CellPlugin[] = CellPlugin[]> {
  data: TData;
  ui: TableUiPlugin[];
}

export interface TablePluginRegistry<TData extends CellPlugin[] = CellPlugin[]>
  extends TablePluginPair<TData> {
  getUiPlugin: (id: InferKey<TData[number]>) => TableUiPlugin;
}

export function createPluginRegistry<TData extends CellPlugin[]>(
  plugins: TablePluginPair<TData>,
): TablePluginRegistry<TData> {
  const dataIds = new Set<string>();
  for (const plugin of plugins.data) {
    if (dataIds.has(plugin.id)) {
      throw new Error(`Duplicate data plugin "${plugin.id}"`);
    }
    dataIds.add(plugin.id);
  }

  const uiById = new Map<string, TableUiPlugin>();
  for (const plugin of plugins.ui) {
    if (uiById.has(plugin.id)) {
      throw new Error(`Duplicate UI plugin adapter "${plugin.id}"`);
    }
    if (!dataIds.has(plugin.id)) {
      throw new Error(
        `UI plugin adapter "${plugin.id}" has no matching data plugin`,
      );
    }
    uiById.set(plugin.id, plugin);
  }

  for (const id of dataIds) {
    if (!uiById.has(id)) {
      throw new Error(`Missing UI plugin adapter for data plugin "${id}"`);
    }
  }

  return {
    ...plugins,
    getUiPlugin: (id) => {
      const plugin = uiById.get(id);
      if (!plugin) throw new Error(`UI plugin adapter not found: "${id}"`);
      return plugin;
    },
  };
}
