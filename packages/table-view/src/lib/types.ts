import type { IconData } from "@notion-kit/icon-block";
import type { Color } from "@notion-kit/utils";

export type CellType =
  | { type: "title" | "text"; value: string }
  | { type: "checkbox"; checked: boolean }
  | { type: "select"; option: string | null }
  | { type: "multi-select"; options: string[] };
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

export type SelectSort = "manual" | "alphabetical" | "reverse-alphabetical";

export interface OptionConfig {
  id: string;
  name: string;
  color: Color;
  description?: string;
}

export interface SelectConfig {
  options: {
    names: string[];
    /**
     * @prop items: map of option name to option config
     */
    items: Record<string, OptionConfig>;
  };
  sort?: SelectSort;
}

export type PropertyConfig =
  | { type: "text"; config: never }
  | { type: "checkbox"; config: never }
  | { type: "title"; config: { showIcon?: boolean } }
  | { type: "select"; config: SelectConfig }
  | { type: "multi-select"; config: SelectConfig };
export type PartialPropertyConfig =
  | { type: "text" | "checkbox"; config?: never }
  | { type: "title"; config?: { showIcon?: boolean } }
  | { type: "select" | "multi-select"; config?: SelectConfig };

export type ConfigMeta<T extends PropertyType> = Extract<
  PropertyConfig,
  { type: T }
>;

interface PropertyBase {
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
export type DatabaseProperty = PropertyBase & PropertyConfig;
export type PartialDatabaseProperty = PropertyBase & Partial<PropertyConfig>;
