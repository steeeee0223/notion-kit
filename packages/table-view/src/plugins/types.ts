import React from "react";
import type { OnChangeFn, Table } from "@tanstack/react-table";

import type { ColumnInfo, Row } from "../lib/types";

export interface CellProps<Data, Config = undefined> {
  propId: string;
  row: Row;
  data: Data;
  config: Config;
  wrapped?: boolean;
  disabled?: boolean;
  onChange: OnChangeFn<Data>;
  onConfigChange?: OnChangeFn<Config>;
}

export interface ConfigMenuProps<Config = unknown> {
  propId: string;
  config: Config;
  onChange: OnChangeFn<Config>;
  onOpenChange?: (open: boolean) => void;
}

export type ComparableValue = string | number | boolean | null | undefined;

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Actions extends { id: string } = any,
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
  // getComparableValue: (data: Data, row: Row) => ComparableValue;
  fromReadableValue: (value: string, config: Config) => Data;
  toReadableValue: (data: Data, row: Row) => string;
  toTextValue: (data: Data, row: Row) => string;
  transferConfig?: <TPlugin extends CellPlugin>(
    column: ColumnInfo<TPlugin>,
    data: Row<TPlugin[]>[],
  ) => Config;
  /**
   * @deprecated
   * @prop A reducer to handle actions related to other cells within this table.
   */
  reducer: <TPlugins extends CellPlugin[]>(
    v: TableDataAtom<TPlugins>,
    a: Actions,
  ) => TableDataAtom<TPlugins>;
  renderCell: (props: CellProps<Data, Config>) => React.ReactNode;
  renderConfigMenu?: (props: ConfigMenuProps<Config>) => React.ReactNode;
  renderGroupingValue?: (props: GroupingValueProps) => React.ReactNode;
}

export type InferKey<TPlugin> =
  TPlugin extends CellPlugin<infer Key, infer _D, infer _C, infer _A>
    ? Key
    : never;

export type InferData<TPlugin> =
  TPlugin extends CellPlugin<infer _K, infer Data, infer _C, infer _A>
    ? Data
    : never;

export type InferConfig<TPlugin> =
  TPlugin extends CellPlugin<infer _K, infer _D, infer Config, infer _A>
    ? Config
    : never;

export type InferActions<TPlugin> =
  TPlugin extends CellPlugin<infer _K, infer _D, infer _C, infer Actions>
    ? Actions
    : never;

export type InferPlugin<TPlugins extends CellPlugin[]> = CellPlugin<
  InferKey<TPlugins[number]>,
  InferData<TPlugins[number]>,
  InferConfig<TPlugins[number]>,
  InferActions<TPlugins[number]>
>;

export type InferCellProps<TPlugin> = CellProps<
  InferData<TPlugin>,
  InferConfig<TPlugin>
>;
