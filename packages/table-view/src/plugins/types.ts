import React from "react";

import type { TableViewAtom } from "../table-contexts";

export interface CellProps<Data, Config = undefined> {
  propId: string;
  data: Data;
  config?: Config;
  wrapped?: boolean;
  onChange?: (data: Data) => void;
}

export interface ConfigMenuProps<Config = undefined> {
  propId: string;
  config?: Config;
}

export interface CellPlugin<
  Key extends string = string,
  Data = unknown,
  Config = undefined,
  ActionPayload = undefined,
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
    config?: Config;
    /**
     * @prop Default width when a new property is created.
     */
    width?: number;
    /**
     * @prop Default cell data when a new cell is created.
     */
    data: Data;
  };
  fromReadableValue: (value: string) => Data;
  toReadableValue: (data: Data) => string;
  toTextValue: (data: Data) => string;
  // TODO define reducer type
  reducer: (v: TableViewAtom, a: ActionPayload) => TableViewAtom;
  renderCell: (props: CellProps<Data, Config>) => React.ReactNode;
  renderConfigMenu?: (props: ConfigMenuProps<Config>) => React.ReactNode;
}
