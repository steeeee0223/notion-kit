import type { ColumnDefs, Row } from "../lib/types";
import type { CellPlugin, InferKey } from "../plugins";
import type { TableViewAction } from "./table-reducer";

export interface AddColumnPayload<TPlugin extends CellPlugin> {
  id: string;
  name: string;
  type: InferKey<TPlugin>;
  at?: {
    id: string;
    side: "left" | "right";
  };
}

export interface PartialTableState<TPlugins extends CellPlugin[]> {
  properties: ColumnDefs<TPlugins>;
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
