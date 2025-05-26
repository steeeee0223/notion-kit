import type { DatabaseProperty, RowDataType } from "../lib/types";
import type { TableViewAction } from "./table-reducer";

export type AddColumnPayload = Pick<DatabaseProperty, "id" | "type" | "name">;

export type UpdateColumnPayload = Partial<
  Pick<
    DatabaseProperty,
    | "name"
    | "icon"
    | "description"
    | "width"
    | "wrapped"
    | "hidden"
    | "isDeleted"
    | "countMethod"
  >
>;

export interface ControlledTableState {
  properties: DatabaseProperty[];
  data: RowDataType[];
  freezedIndex: number;
}

export interface ControlledTableProps {
  state?: ControlledTableState;
  dispatch?: React.Dispatch<TableViewAction>;
  onStateChange?: (
    newState: ControlledTableState,
    type: TableViewAction["type"],
  ) => void;
}
