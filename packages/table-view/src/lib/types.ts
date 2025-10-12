import type { IconData } from "@notion-kit/icon-block";

import type {
  CellPlugin,
  InferConfig,
  InferData,
  InferKey,
  InferPlugin,
} from "../plugins";
import { TableViewMenuPage } from "./utils";

export interface PropertyBase {
  id: string;
  name: string;
  icon?: IconData | null;
  width?: string;
  description?: string;
  wrapped?: boolean;
  hidden?: boolean;
  isDeleted?: boolean;
}

export type PluginType<TPlugins extends CellPlugin[]> = InferKey<
  InferPlugin<TPlugins>
>;

export type PluginsMap<TPlugins extends CellPlugin[]> = Record<
  PluginType<TPlugins>,
  InferPlugin<TPlugins>
>;

export interface ColumnConfig<TPlugin> {
  type: InferKey<TPlugin>;
  config: InferConfig<TPlugin>;
}

export type ColumnInfo<TPlugin = CellPlugin> = PropertyBase &
  ColumnConfig<TPlugin>;

export type ColumnDefs<
  TPlugins extends CellPlugin[] = CellPlugin[],
  TPlugin = InferPlugin<TPlugins>,
> = (PropertyBase & {
  type: InferKey<TPlugin>;
  config?: InferConfig<TPlugin>;
})[];

export interface Cell<TPlugin> {
  id: string;
  value: InferData<TPlugin>;
}

export interface Row<TPlugins extends CellPlugin[] = CellPlugin[]> {
  id: string;
  properties: Record<string, Cell<TPlugins[number]>>;
  icon?: IconData;
}

export type Rows<TPlugins extends CellPlugin[] = CellPlugin[]> = Record<
  string,
  Row<TPlugins>
>;

// Table View Menu
export interface TableMenu {
  page: TableViewMenuPage | null;
  id?: string;
}
