import type { IconData } from "@notion-kit/icon-block";

import { Color } from "./colors";

export interface Option {
  id: string;
  name: string;
}

export type CellType =
  | { type: "title" | "text"; value: string }
  | { type: "checkbox"; checked: boolean }
  | { type: "select"; option: Option | null }
  | { type: "multi-select"; options: Option[] };
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

type SelectSort = "manual" | "alphabetical" | "reverse-alphabetical";

export interface OptionConfig extends Option {
  color: Color;
  description?: string;
}

export type PropertyConfig =
  | { type: "text" | "checkbox" }
  | { type: "title"; config: { showIcon?: boolean } }
  | {
      type: "select" | "multi-select";
      config: {
        /**
         * @prop options: array of options
         * key: option name
         */
        options: Record<string, OptionConfig>;
        sort?: SelectSort;
      };
    };

export type SelectConfig = Extract<
  PropertyConfig,
  { type: "select" | "multi-select" }
>;

export type DatabaseProperty = {
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
} & PropertyConfig;
