import { DatabaseProperty } from "../types";

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
  >
>;
