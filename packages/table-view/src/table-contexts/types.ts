import type {
  DatabaseProperty,
  PartialDatabaseProperty,
  PropertyType,
  RowDataType,
} from "../lib/types";
import type { TableViewAction } from "./table-reducer";

export interface AddColumnPayload {
  id: string;
  name: string;
  type: PropertyType;
  at?: {
    id: string;
    side: "left" | "right";
  };
}

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

export interface PartialTableState {
  properties: PartialDatabaseProperty[];
  data: RowDataType[];
}

export interface TableState {
  properties: DatabaseProperty[];
  data: RowDataType[];
}

export interface TableProps {
  defaultState?: PartialTableState;
  state?: PartialTableState;
  onStateChange?: (
    newState: PartialTableState,
    type: TableViewAction["type"],
  ) => void;
  dispatch?: React.Dispatch<TableViewAction>;
}
