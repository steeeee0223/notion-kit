import type { ColumnInfo, Row } from "@/lib/types";
import type {
  CountingMethodGroup,
  GroupingMethod,
  SortingMethodDescriptor,
} from "@/methods";

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
    data: Data,
    row: Row,
    config: Config,
    operand: FilterValue | undefined,
    context: FilterEvaluationContext,
  ) => boolean;
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
  default: {
    /**
     * @prop Default property config when creating a new property.
     */
    config: Config;
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
  /** Return whether cell data represents an empty value. */
  isEmpty: (data: Data) => boolean;
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
