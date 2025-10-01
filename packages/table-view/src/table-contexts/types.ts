import type { Column, ColumnDefs, PluginsMap, Row } from "../lib/types";
import type { CellPlugin, InferKey, InferPlugin } from "../plugins";
import type { TableViewAction } from "./table-reducer";

export interface AddColumnPayload<TPlugins extends CellPlugin[]> {
  id: string;
  name: string;
  type: InferKey<InferPlugin<TPlugins>>;
  at?: {
    id: string;
    side: "left" | "right";
  };
}

export interface PartialTableState<TPlugins extends CellPlugin[]> {
  properties: ColumnDefs<TPlugins>;
  data: Row<TPlugins>[];
}

export interface TableState<TPlugins extends CellPlugin[]> {
  plugins: PluginsMap<TPlugins>;
  properties: Column<InferPlugin<TPlugins>>[];
  data: Row<TPlugins>[];
}

export interface TableProps<TPlugins extends CellPlugin[]> {
  plugins?: TPlugins;
  defaultState?: PartialTableState<TPlugins>;
  state?: PartialTableState<TPlugins>;
  onStateChange?: (
    newState: PartialTableState<TPlugins>,
    type: TableViewAction<TPlugins>["type"],
  ) => void;
  dispatch?: React.Dispatch<TableViewAction<TPlugins>>;
}
