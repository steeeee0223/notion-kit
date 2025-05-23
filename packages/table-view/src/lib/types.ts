import type { IconData } from "@notion-kit/icon-block";

export interface Option {
  id: string;
  name: string;
  color: string;
}

export type CellType =
  | { type: "title" | "text"; value: string }
  | { type: "checkbox"; checked: boolean }
  | { type: "select"; select: Option | null };
export type PropertyType = CellType["type"];

export type CellDataType = {
  id: string; // cell id
} & CellType;

export interface RowDataType {
  id: string; // row id (page id)
  /**
   * @param key: column id
   * @param value: cell data
   */
  properties: Record<string, CellDataType>;
  icon?: IconData;
}

export type HeaderCellType =
  | { type: "title" | "text" | "checkbox" }
  | { type: "select"; options: Option[] };

export enum CountMethod {
  NONE,
  ALL,
  VALUES,
  UNIQUE,
  EMPTY,
  NONEMPTY,
  CHECKED,
  UNCHECKED,
  PERCENTAGE_CHECKED,
  PERCENTAGE_UNCHECKED,
  PERCENTAGE_EMPTY,
  PERCENTAGE_NONEMPTY,
}

export interface DatabaseProperty {
  id: string;
  type: PropertyType;
  name: string;
  icon?: IconData | null;
  width?: string;
  description?: string;
  wrapped?: boolean;
  hidden?: boolean;
  isDeleted?: boolean;
  isCountCapped?: boolean;
  countMethod?: CountMethod;
}
