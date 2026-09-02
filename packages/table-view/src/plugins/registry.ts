import type React from "react";
import type { OnChangeFn } from "@tanstack/react-table";

import type { Row } from "@notion-kit/table-hook";
import type {
  CellPlugin,
  ComparableValue,
  GroupingValueProps as LegacyGroupingValueProps,
  InferConfig,
  InferData,
  InferKey,
} from "@notion-kit/table-hook/plugins";

export type CellSurface =
  | "table"
  | "list"
  | "board"
  | "row-view"
  | "timeline";

export type CellEditorScope<Data> =
  | { kind: "cell"; row: Row }
  | { kind: "bulk"; rowIds: string[]; selectedValues: Data[] };

export type CellValueProps<Data, Config = undefined> = {
  propId: string;
  row: Row;
  data: Data;
  config: Config;
  wrapped?: boolean;
  disabled?: boolean;
};

export type CellEditorPopoverOptions = {
  className?: string;
  align?: "start" | "center" | "end";
  alignOffset?: number;
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number | ((triggerRect: { height: number }) => number);
};

export type CellEditorResult =
  | {
      presentation: "inline";
      content: React.ReactNode;
      closeOnChange?: boolean;
    }
  | {
      presentation: "popover";
      content: React.ReactNode;
      popover?: CellEditorPopoverOptions;
      closeOnChange?: boolean;
    };

export type CellEditorProps<Data, Config = undefined> = {
  propId: string;
  data: Data;
  config: Config;
  wrapped?: boolean;
  disabled?: boolean;
  onChange: OnChangeFn<Data>;
  onCancel?: () => void;
  onConfigChange?: OnChangeFn<Config>;
  scope: CellEditorScope<Data>;
};

export type CellUiProps<Data, Config = undefined> = {
  propId: string;
  row: Row;
  data: Data;
  config: Config;
  surface: CellSurface;
  wrapped?: boolean;
  disabled?: boolean;
  onChange: OnChangeFn<Data>;
  onCancel?: () => void;
  onConfigChange?: OnChangeFn<Config>;
};

export type BulkEditorProps<Data, Config = undefined> = {
  propId: string;
  data: Data;
  config: Config;
  disabled?: boolean;
  onChange: OnChangeFn<Data>;
  onConfigChange?: OnChangeFn<Config>;
  rowIds: string[];
  selectedValues: Data[];
};

export type ConfigMenuProps<Config = unknown> = {
  propId: string;
  config: Config;
  onChange: OnChangeFn<Config>;
  onOpenChange?: (open: boolean) => void;
};

export type GroupingValueProps = LegacyGroupingValueProps;

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
  renderCell: (
    props: CellUiProps<InferData<TPlugin>, InferConfig<TPlugin>>,
  ) => React.ReactNode;
  renderBulkEditor?: (
    props: BulkEditorProps<InferData<TPlugin>, InferConfig<TPlugin>>,
  ) => React.ReactNode;
  renderConfigMenu?: (
    props: ConfigMenuProps<InferConfig<TPlugin>>,
  ) => React.ReactNode;
  renderGroupingValue: (props: GroupingValueProps) => React.ReactNode;
  /** @internal Transitional bridge until direct cell composition lands. */
  renderCellValue?: (
    props: CellUiProps<InferData<TPlugin>, InferConfig<TPlugin>>,
  ) => React.ReactNode;
  /** @internal Transitional bridge until direct cell composition lands. */
  renderCellEditor?: (
    props: CellEditorProps<InferData<TPlugin>, InferConfig<TPlugin>>,
  ) => CellEditorResult;
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
