import React from "react";

import type { ColumnInfo, Rows } from "../lib/types";

export interface CellProps<Data, Config = undefined> {
  propId: string;
  data: Data;
  config?: Config;
  wrapped?: boolean;
  onChange?: (data: Data) => void;
}

export interface ConfigMenuProps<Config = unknown> {
  propId: string;
  config?: Config;
}

export interface TableDataAtom<TPlugins extends CellPlugin[] = CellPlugin[]> {
  properties: Record<string, ColumnInfo<InferPlugin<TPlugins>>>;
  data: Rows<TPlugins>;
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
  fromReadableValue: (value: string, config: Config) => Data;
  toReadableValue: (data: Data) => string;
  toTextValue: (data: Data) => string;
  transferConfig?: <TPlugin extends CellPlugin>(
    column: ColumnInfo<TPlugin>,
    data: Rows,
  ) => Config;
  reducer: <TPlugins extends CellPlugin[]>(
    v: TableDataAtom<TPlugins>,
    a: Actions,
  ) => TableDataAtom<TPlugins>;
  renderCell: (props: CellProps<Data, Config>) => React.ReactNode;
  renderConfigMenu?: (props: ConfigMenuProps<Config>) => React.ReactNode;
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
