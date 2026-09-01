import type React from "react";
import type { OnChangeFn } from "@tanstack/react-table";

import type { _TableInstance } from "@/features/types";
import type { ColumnInfo, Row } from "@/lib/types";
import type {
  CountingMethodGroup,
  GroupingMethod,
  SortingMethodDescriptor,
} from "@/methods";

export type CellEditorScope<Data> =
  | { kind: "cell"; row: Row }
  | { kind: "bulk"; rowIds: string[]; selectedValues: Data[] };

export interface CellValueProps<Data, Config = undefined> {
  propId: string;
  row: Row;
  data: Data;
  config: Config;
  wrapped?: boolean;
  disabled?: boolean;
}

export interface CellEditorProps<Data, Config = undefined> {
  propId: string;
  data: Data;
  config: Config;
  wrapped?: boolean;
  disabled?: boolean;
  onChange: OnChangeFn<Data>;
  onCancel?: () => void;
  onConfigChange?: OnChangeFn<Config>;
  scope: CellEditorScope<Data>;
}

export interface CellEditorPopoverOptions {
  className?: string;
  align?: "start" | "center" | "end";
  alignOffset?: number;
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number | ((triggerRect: { height: number }) => number);
}

export type CellEditorResult =
  | {
      presentation: "inline";
      content: React.ReactNode;
      closeOnChange?: boolean;
    }
  | {
      presentation: "popover";
      content: React.ReactNode;
      popover?: CellEditorPopoverOptions;
      closeOnChange?: boolean;
    };

export interface ConfigMenuProps<Config = unknown> {
  propId: string;
  config: Config;
  onChange: OnChangeFn<Config>;
  onOpenChange?: (open: boolean) => void;
}

export type CompareFn<T> = (a: T, b: T) => number;
export type ComparableValue = string | number | boolean | null;

export type FilterValue =
  | null
  | boolean
  | number
  | string
  | FilterValue[]
  | { [key: string]: FilterValue };

export type FilterOperandMetadata =
  | { kind: "none" }
  | { kind: "text" }
  | { kind: "number" }
  | { kind: "option"; multiple?: boolean }
  | { kind: "date" }
  | { kind: "date-range" }
  | { kind: "relative-date" };

export interface FilterEvaluationContext {
  /** Clock captured once for the complete filter evaluation pass. */
  now: number;
}

export interface FilterOperatorDescriptor<Data = unknown, Config = unknown> {
  /** Stable identifier stored in a persisted filter rule. */
  id: string;
  name: string;
  operand: FilterOperandMetadata;
  matches: (
    data: Data | undefined,
    row: Row,
    config: Config,
    operand: FilterValue | undefined,
    context: FilterEvaluationContext,
  ) => boolean;
}

export interface GroupingValueProps {
  className?: string;
  value: ComparableValue;
  table: _TableInstance;
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
   * @prop Prevent this property type from appearing in bulk edit controls.
   */
  disableBulkEdit?: boolean;
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
  sorting?: {
    defaultMethod?: string;
    enableGroupSort?: boolean;
    methods: SortingMethodDescriptor<Data, Config>[];
  };
  grouping?: {
    defaultMethod?: string;
    methods: GroupingMethod<Data, Config>[];
  };
  counting?: CountingMethodGroup[];
  /** Pure, UI-neutral filtering capabilities. Omit when filtering is unsupported. */
  filtering?: {
    operators: FilterOperatorDescriptor<Data, Config>[];
  };
  compare?: (rowA: Row, rowB: Row, colId: string) => number;
  transferConfig?: (column: ColumnInfo, data: Row[]) => Config;
  renderCellValue: (props: CellValueProps<Data, Config>) => React.ReactNode;
  renderCellEditor?: (props: CellEditorProps<Data, Config>) => CellEditorResult;
  renderConfigMenu?: (props: ConfigMenuProps<Config>) => React.ReactNode;
  renderGroupingValue?: (props: GroupingValueProps) => React.ReactNode;
}

export type UnknownCellPlugin = CellPlugin<string, unknown, unknown>;

export type InferKey<TPlugin> = TPlugin extends { id: infer Key extends string }
  ? Key
  : never;

export type InferData<TPlugin> = TPlugin extends {
  default: { data: infer Data };
}
  ? Data
  : never;

export type InferConfig<TPlugin> = TPlugin extends {
  default: { config: infer Config };
}
  ? Config
  : never;

export type InferPlugin<TPlugins extends CellPlugin[]> = CellPlugin<
  InferKey<TPlugins[number]>,
  InferData<TPlugins[number]>,
  InferConfig<TPlugins[number]>
>;

export type InferCellValueProps<TPlugin> = CellValueProps<
  InferData<TPlugin>,
  InferConfig<TPlugin>
>;

export type InferCellEditorProps<TPlugin> = CellEditorProps<
  InferData<TPlugin>,
  InferConfig<TPlugin>
>;

/** UI configuration injected when constructing a built-in plugin. */
export interface PluginFactoryConfig<TPlugin extends CellPlugin> {
  icon: React.ReactNode;
  defaultIcon?: React.ReactNode;
  renderCellValue: TPlugin["renderCellValue"];
  renderCellEditor?: TPlugin["renderCellEditor"];
  renderConfigMenu?: TPlugin["renderConfigMenu"];
  renderGroupingValue?: TPlugin["renderGroupingValue"];
}
