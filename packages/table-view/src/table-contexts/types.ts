import type { DatabaseProperty, RowDataType } from "../lib/types";
import type { TableViewAction } from "./table-reducer";

export type AddColumnPayload = Pick<
  DatabaseProperty,
  "id" | "type" | "name"
> & {
  at?: {
    id: string;
    side: "left" | "right";
  };
};

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

export interface TableState {
  properties: DatabaseProperty[];
  data: RowDataType[];
  freezedIndex?: number;
}

export interface TableProps {
  defaultState?: TableState;
  state?: TableState;
  onStateChange?: (newState: TableState, type: TableViewAction["type"]) => void;
  dispatch?: React.Dispatch<TableViewAction>;
}
