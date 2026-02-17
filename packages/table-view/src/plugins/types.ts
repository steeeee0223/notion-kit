import React from "react";
import type { OnChangeFn, Table } from "@tanstack/react-table";

import type { LayoutType } from "../features";
import type { ColumnInfo, Row } from "../lib/types";

export interface CellProps<Data, Config = undefined> {
  propId: string;
  row: Row;
  data: Data;
  config: Config;
  wrapped?: boolean;
  disabled?: boolean;
  layout?: LayoutType | "row-view";
  tooltip?: {
    title: string;
    description?: string;
  };
  onChange: OnChangeFn<Data>;
  onConfigChange?: OnChangeFn<Config>;
}

export interface ConfigMenuProps<Config = unknown> {
  propId: string;
  config: Config;
  onChange: OnChangeFn<Config>;
  onOpenChange?: (open: boolean) => void;
}

export type CompareFn<T> = (a: T, b: T) => number;
export type ComparableValue = string | number | boolean | null;

export interface GroupingValueProps {
  className?: string;
  value: ComparableValue;
  table: Table<Row>;
}

export interface TableDataAtom<TPlugins extends CellPlugin[] = CellPlugin[]> {
  properties: Record<string, ColumnInfo<InferPlugin<TPlugins>>>;
  data: Row<TPlugins>[];
}

export interface CellPlugin<
  Key extends string = string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Data = any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Config = any,
> {
  id: Key;
  /**
   * @prop Metadata about the plugin. Displayed in <TypesMenu />.
   */
  meta: {
    /**
     * @prop Name of the plugin.
     */
    name: string;
    /**
     * @prop Description of the plugin.
     */
    desc: string;
    /**
     * @prop Icon representing the plugin in the UI.
     */
    icon: React.ReactNode;
  };
  default: {
    /**
     * @prop Default property name when a new property is created.
     */
    name: string;
    /**
     * @prop Default property icon when a new property is created.
     */
    icon: React.ReactNode;
    /**
     * @prop Default property config when creating a new property.
     */
    config: Config;
    /**
     * @prop Default width when a new property is created.
     */
    width?: number;
    /**
     * @prop Default cell data when a new cell is created.
     */
    data: Data;
  };
  /**
   * @prop Convert a primitive value to cell data.
   */
  fromValue: (value: ComparableValue, config: Config) => Data;
  /**
   * @prop Convert cell data to a primitive value.
   */
  toValue: (data: Data, row: Row) => ComparableValue;
  /**
   * @prop Convert cell data to a primitive value used for grouping.
   * If not provided, `toValue` will be used instead.
   */
  toGroupValue?: (data: Data, row: Row) => ComparableValue;
  toTextValue: (data: Data, row: Row) => string;
  compare: (rowA: Row, rowB: Row, colId: string) => number;
  transferConfig?: <TPlugin extends CellPlugin>(
    column: ColumnInfo<TPlugin>,
    data: Row<TPlugin[]>[],
  ) => Config;
  renderCell: (props: CellProps<Data, Config>) => React.ReactNode;
  renderConfigMenu?: (props: ConfigMenuProps<Config>) => React.ReactNode;
  renderGroupingValue?: (props: GroupingValueProps) => React.ReactNode;
}

export type InferKey<TPlugin> =
  TPlugin extends CellPlugin<infer Key, infer _D, infer _C> ? Key : never;

export type InferData<TPlugin> =
  TPlugin extends CellPlugin<infer _K, infer Data, infer _C> ? Data : never;

export type InferConfig<TPlugin> =
  TPlugin extends CellPlugin<infer _K, infer _D, infer Config> ? Config : never;

export type InferPlugin<TPlugins extends CellPlugin[]> = CellPlugin<
  InferKey<TPlugins[number]>,
  InferData<TPlugins[number]>,
  InferConfig<TPlugins[number]>
>;

export type InferCellProps<TPlugin> = CellProps<
  InferData<TPlugin>,
  InferConfig<TPlugin>
>;
